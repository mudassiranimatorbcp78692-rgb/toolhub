import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDb } from '../server/db';
import { ordersTable } from '../shared/schema';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { planName, price, email, name, paymentMethod } = req.body;

    if (!planName || !price || !email || !name || !paymentMethod) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Generate unique invoice ID
    const invoiceId = `INV-${Date.now()}`;

    const db = getDb();
    if (!db) {
      return res.status(500).json({ error: 'Database not initialized' });
    }

    // Create order in database with pending status
    const order = await db.insert(ordersTable).values({
      planName,
      price,
      customerEmail: email,
      customerName: name,
      paymentMethod,
      status: 'pending_manual',
      referenceId: invoiceId,
    }).returning();

    // Payment instructions based on method
    const paymentInstructions = getPaymentInstructions(paymentMethod, {
      planName,
      price,
      invoiceId,
      email,
      name,
    });

    // In production, send email with payment instructions
    // For now, log it
    console.log(`[PAYMENT] Invoice ${invoiceId} created for ${email}`);
    console.log(`[PAYMENT] Payment Method: ${paymentMethod}`);
    console.log(`[PAYMENT] Instructions:`, paymentInstructions);

    return res.status(200).json({
      success: true,
      invoiceId,
      message: 'Payment order created. Instructions sent to email.',
      paymentInstructions,
    });
  } catch (error) {
    console.error('Custom payment error:', error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to process custom payment',
    });
  }
}

function getPaymentInstructions(method: string, details: any) {
  const { planName, price, invoiceId, email, name } = details;

  const instructions: Record<string, string> = {
    payoneer_direct: `
Send payment of $${price} USD to our Payoneer account.
Invoice: ${invoiceId}
Amount: $${price}
Plan: ${planName}

After payment, reply to this email with:
- Screenshot of payment
- Invoice ID: ${invoiceId}
- Email: ${email}

We'll activate your ${planName} plan within 2 hours.
    `,
    bank_transfer: `
Bank Transfer Details:
Invoice: ${invoiceId}
Amount: $${price}
Plan: ${planName}

Please provide bank transfer details on request.
Reply to this email to request account information.

Amount: $${price} USD
Recipient: Office Tools Hub
Reference: ${invoiceId}

After transfer, reply with transaction ID.
    `,
    easypaisa: `
EasyPaisa Payment:
Invoice: ${invoiceId}
Amount: $${price} USD (equivalent in PKR)
Plan: ${planName}

Send payment to: [Your EasyPaisa Account]
Reference: ${invoiceId}

After payment:
1. Screenshot the transaction
2. Reply with transaction ID
3. Provide your email: ${email}

Plan will be activated within 2 hours.
    `,
    jazzcash: `
JazzCash Payment:
Invoice: ${invoiceId}
Amount: $${price} USD (equivalent in PKR)
Plan: ${planName}

Send payment to: [Your JazzCash Account]
Reference: ${invoiceId}

After payment:
1. Screenshot the transaction
2. Reply with transaction ID
3. Confirm your email: ${email}

Plan will be activated within 2 hours.
    `,
  };

  return instructions[method] || 'Please contact support for payment instructions.';
}
