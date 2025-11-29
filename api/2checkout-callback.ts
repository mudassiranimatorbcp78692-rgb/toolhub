import type { VercelRequest, VercelResponse } from '@vercel/node';
import postgres from 'postgres';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const { order_number, status, email, ref } = req.query;

    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      return res.status(500).json({ error: "Database not configured" });
    }

    const client = postgres(databaseUrl);

    if (status === 'complete' || status === 'approved') {
      await client`
        UPDATE orders 
        SET status = 'completed', reference_id = ${String(order_number) || ref}
        WHERE checkout_session_id = ${String(ref)}
      `;
    } else if (status === 'failed' || status === 'expired') {
      await client`
        UPDATE orders 
        SET status = 'failed'
        WHERE checkout_session_id = ${String(ref)}
      `;
    }

    res.status(200).json({ success: true, message: "Payment callback processed" });
  } catch (error) {
    console.error("Callback error:", error);
    res.status(200).json({ success: true }); // 2Checkout expects 200 always
  }
}
