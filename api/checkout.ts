import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).json({ success: true });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { planName, price, email, name, paymentMethod } = req.body;

    if (!planName || !price || !email || !name) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const checkoutId = `CHK_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Try to save to database, but don't fail if unavailable
    try {
      if (process.env.DATABASE_URL) {
        const postgres = (await import('postgres')).default;
        const { drizzle } = await import('drizzle-orm/postgres-js');
        const { pgTable, text, varchar, timestamp, serial } = await import('drizzle-orm/pg-core');

        // Use exact schema from shared/schema.ts
        const ordersTable = pgTable('orders', {
          id: serial('id').primaryKey(),
          planName: varchar('plan_name').notNull(),
          price: text('price').notNull(),
          customerEmail: text('customer_email').notNull(),
          customerName: text('customer_name'),
          paymentMethod: varchar('payment_method').notNull(),
          status: varchar('status').default('pending').notNull(),
          checkoutSessionId: text('checkout_session_id'),
          referenceId: text('reference_id'),
          createdAt: timestamp('created_at').defaultNow().notNull(),
        });

        const client = postgres(process.env.DATABASE_URL);
        const db = drizzle(client, { schema: { ordersTable } });

        await db.insert(ordersTable).values({
          planName,
          price: String(price),
          customerEmail: email,
          customerName: name || null,
          paymentMethod,
          status: 'pending_manual',
          checkoutSessionId: checkoutId,
        });

        await client.end();
      }
    } catch (dbError) {
      console.warn('Note: Could not save checkout to database:', dbError);
    }

    const merchantId = process.env.CHECKOUT_MERCHANT_ID || 'test';
    const checkoutUrl = `https://2checkout.com/checkout/purchase?merchant=${merchantId}&ref=${checkoutId}&email=${encodeURIComponent(email)}&name=${encodeURIComponent(name)}`;

    console.log(`[CHECKOUT] Session ${checkoutId} initiated for ${email}`);

    return res.status(200).json({
      success: true,
      checkoutUrl,
      checkoutId,
      message: 'Checkout initiated',
    });
  } catch (error) {
    console.error('Checkout error:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to initiate checkout',
    });
  }
}
