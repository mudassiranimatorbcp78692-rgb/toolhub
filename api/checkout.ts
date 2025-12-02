import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set JSON header immediately to prevent HTML responses
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { planName, price, email, name, paymentMethod } = req.body;

    if (!planName || !price || !email || !name) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Generate checkout ID
    const checkoutId = `CHK_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // For 2Checkout, create checkout URL
    const merchantId = process.env.CHECKOUT_MERCHANT_ID || 'test';
    
    const checkoutUrl = `https://2checkout.com/checkout/purchase?merchant=${merchantId}&ref=${checkoutId}&email=${encodeURIComponent(email)}&name=${encodeURIComponent(name)}`;

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
