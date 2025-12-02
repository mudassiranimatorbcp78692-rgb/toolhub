import type { VercelRequest, VercelResponse } from '@vercel/node';

async function sendPaymentEmail(email: string, name: string, instructions: string, invoiceId: string) {
  try {
    const gmailUser = process.env.GMAIL_USER;
    const gmailPassword = process.env.GMAIL_APP_PASSWORD;
    
    if (!gmailUser || !gmailPassword) {
      console.error('❌ Gmail credentials not configured!');
      console.error('Required environment variables: GMAIL_USER, GMAIL_APP_PASSWORD');
      console.error('Set these in your Vercel project settings under Environment Variables');
      return false;
    }

    const nodemailer = await import('nodemailer');
    const transporter = nodemailer.default.createTransport({
      service: 'gmail',
      auth: {
        user: gmailUser,
        pass: gmailPassword,
      },
    });

    await transporter.sendMail({
      from: gmailUser,
      to: email,
      subject: `Payment Instructions - Invoice #${invoiceId}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Payment Instructions</h2>
          <p>Hello ${name},</p>
          <p>Thank you for choosing our service! Below are your payment instructions:</p>
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 8px; white-space: pre-wrap; font-family: monospace; margin: 20px 0;">
${instructions}
          </div>
          <p style="color: #666; font-size: 12px;">Invoice ID: <strong>${invoiceId}</strong></p>
          <p style="color: #666; font-size: 12px;">If you have any questions, please contact our support team.</p>
        </div>
      `,
    });

    console.log(`✉️  Payment instructions sent to ${email}`);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
}

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

    if (!planName || !price || !email || !name || !paymentMethod) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const invoiceId = `INV-${Date.now()}`;

    // Try to save to database if available, but don't fail if it doesn't work
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
          referenceId: invoiceId,
        });

        await client.end();
      }
    } catch (dbError) {
      console.warn('Note: Could not save order to database:', dbError);
    }

    const paymentInstructions = getPaymentInstructions(paymentMethod, {
      planName,
      price,
      invoiceId,
      email,
      name,
    });

    // Send email with payment instructions
    const emailSent = await sendPaymentEmail(email, name, paymentInstructions, invoiceId);

    // Convert instructions to HTML for display
    const instructionsHtml = `<pre style="background-color: #f5f5f5; padding: 15px; border-radius: 8px; white-space: pre-wrap; word-wrap: break-word; font-family: monospace;">${paymentInstructions}</pre>`;

    console.log(`[PAYMENT] Invoice ${invoiceId} created for ${email}${emailSent ? ' (email sent)' : ''}`);

    return res.status(200).json({
      success: true,
      invoiceId,
      message: emailSent ? '✅ Payment instructions sent to your email!' : '📋 Please follow the payment instructions below:',
      paymentInstructions: instructionsHtml,
      emailSent,
    });
  } catch (error) {
    console.error('Payment error:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to process payment',
    });
  }
}

function getPaymentInstructions(method: string, details: any) {
  const { planName, price, invoiceId, email, name } = details;
  const payoneerEmail = process.env.PAYONEER_EMAIL || 'your-payoneer@email.com';
  const bankAccountInfo = process.env.BANK_ACCOUNT_INFO || 'Contact support for bank details';
  const easyPaisaNumber = process.env.EASYPAISA_NUMBER || 'XXX-XXXXXXX';
  const jazzCashNumber = process.env.JAZZCASH_NUMBER || 'XXX-XXXXXXX';

  // Log for debugging
  console.log('[PAYMENT] Environment variables status:', {
    hasPayoneer: !!process.env.PAYONEER_EMAIL,
    hasBank: !!process.env.BANK_ACCOUNT_INFO,
    hasEasypaisa: !!process.env.EASYPAISA_NUMBER,
    hasJazzcash: !!process.env.JAZZCASH_NUMBER,
    payoneerValue: payoneerEmail === 'your-payoneer@email.com' ? 'USING DEFAULT' : 'SET',
    easyPaisaValue: easyPaisaNumber === 'XXX-XXXXXXX' ? 'USING DEFAULT' : 'SET',
  });

  const instructions: Record<string, string> = {
    payoneer_direct: `PAYONEER PAYMENT INSTRUCTIONS\n================================\nInvoice: ${invoiceId}\nAmount: $${price} USD\nPlan: ${planName} Subscription\n\nSEND TO: ${payoneerEmail}\n\nAfter payment, reply with:\n✓ Screenshot of payment\n✓ Invoice ID: ${invoiceId}\n\nYour plan will be activated within 2 hours.`,
    bank_transfer: `BANK TRANSFER INSTRUCTIONS\n============================\nInvoice: ${invoiceId}\nAmount: $${price} USD\nReference: ${invoiceId}\n\nBANK DETAILS:\n${bankAccountInfo}\n\nAfter transfer, reply with transaction ID and screenshot.`,
    easypaisa: `EASYPAISA PAYMENT\n=================\nInvoice: ${invoiceId}\nAmount: $${price} USD (PKR equivalent)\n\nSend to: ${easyPaisaNumber}\nReference: ${invoiceId}\n\nReply with screenshot after payment.`,
    jazzcash: `JAZZCASH PAYMENT\n================\nInvoice: ${invoiceId}\nAmount: $${price} USD (PKR equivalent)\n\nSend to: ${jazzCashNumber}\nReference: ${invoiceId}\n\nReply with screenshot after payment.`,
  };

  return instructions[method] || 'Contact support for payment instructions.';
}
