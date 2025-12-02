import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDb } from '../server/db';
import { ordersTable } from '../shared/schema';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set JSON header immediately to prevent HTML responses
  res.setHeader('Content-Type', 'application/json');
  
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

    // Try to save to database, but don't fail if it's not available
    try {
      const db = getDb();
      if (db) {
        await db.insert(ordersTable).values({
          planName,
          price: String(price),
          customerEmail: email,
          customerName: name,
          paymentMethod,
          status: 'pending_manual',
          referenceId: invoiceId,
        });
      }
    } catch (dbError) {
      console.warn('Could not save order to database:', dbError);
      // Continue - database is optional for this endpoint
    }

    // Payment instructions based on method
    const paymentInstructions = getPaymentInstructions(paymentMethod, {
      planName,
      price,
      invoiceId,
      email,
      name,
    });

    console.log(`[PAYMENT] Invoice ${invoiceId} created for ${email}`);
    console.log(`[PAYMENT] Payment Method: ${paymentMethod}`);

    return res.status(200).json({
      success: true,
      invoiceId,
      message: 'Payment order created successfully.',
      paymentInstructions,
      emailSent: false,
    });
  } catch (error) {
    console.error('Custom payment error:', error);
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

  const instructions: Record<string, string> = {
    payoneer_direct: `
PAYONEER PAYMENT INSTRUCTIONS
================================
Invoice: ${invoiceId}
Amount: $${price} USD
Plan: ${planName} Subscription
Customer: ${name} (${email})

SEND PAYMENT TO:
Email: ${payoneerEmail}

After payment, reply to this email with:
✓ Screenshot/proof of payment
✓ Invoice ID: ${invoiceId}
✓ Your email: ${email}

Your ${planName} plan will be activated within 2 hours of confirmation.
    `,
    bank_transfer: `
BANK TRANSFER INSTRUCTIONS
============================
Invoice: ${invoiceId}
Amount: $${price} USD
Plan: ${planName} Subscription
Customer: ${name} (${email})

BANK DETAILS:
${bankAccountInfo}

Reference: ${invoiceId}

After transfer, reply with:
✓ Transaction ID
✓ Screenshot of receipt
✓ Invoice ID: ${invoiceId}

Your ${planName} plan will be activated within 2 hours of confirmation.
    `,
    easypaisa: `
EASYPAISA PAYMENT INSTRUCTIONS
================================
Invoice: ${invoiceId}
Amount: $${price} USD (equivalent PKR)
Plan: ${planName} Subscription
Customer: ${name} (${email})

SEND PAYMENT TO:
Account Number: ${easyPaisaNumber}

STEPS:
1. Send $${price} equivalent (PKR) to: ${easyPaisaNumber}
2. Reference: ${invoiceId}
3. Reply to this email with:
   - Screenshot of transaction
   - Transaction reference
   - Your email: ${email}

Your ${planName} plan will be activated within 2 hours of confirmation.
    `,
    jazzcash: `
JAZZCASH PAYMENT INSTRUCTIONS
==============================
Invoice: ${invoiceId}
Amount: $${price} USD (equivalent PKR)
Plan: ${planName} Subscription
Customer: ${name} (${email})

SEND PAYMENT TO:
Account Number: ${jazzCashNumber}

STEPS:
1. Send $${price} equivalent (PKR) to: ${jazzCashNumber}
2. Reference: ${invoiceId}
3. Reply to this email with:
   - Screenshot of transaction
   - Transaction reference
   - Your email: ${email}

Your ${planName} plan will be activated within 2 hours of confirmation.
    `,
  };

  return instructions[method] || 'Please contact support for payment instructions.';
}
