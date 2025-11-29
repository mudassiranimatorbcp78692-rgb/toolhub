# 2Checkout Payment Integration Setup

## What We've Done

Your Office Tools Hub now has 2Checkout payment integration for the Pro and Enterprise plans. Users can pay using:
- **Visa/MasterCard** (credit/debit cards)
- **Payoneer** (digital wallet)

## Configuration

### Environment Variables (Already Set)
- `CHECKOUT_MERCHANT_ID`: Your 2Checkout merchant account ID (255801704351)
- `DATABASE_URL`: Neon PostgreSQL database connection

### Database Setup Required

Run this SQL in your Neon dashboard to create the orders table:

```sql
CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  plan_name VARCHAR(255) NOT NULL,
  price TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_name TEXT,
  payment_method VARCHAR(255) NOT NULL,
  status VARCHAR(255) DEFAULT 'pending' NOT NULL,
  checkout_session_id TEXT,
  reference_id TEXT,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);
```

## How It Works

### User Flow
1. User visits `/pricing` page
2. Clicks on "Go Pro" or "Go Enterprise" button
3. Enters name and email in the dialog
4. Selects payment method (Visa Card or Payoneer)
5. Clicks "Proceed to Payment"
6. Gets redirected to 2Checkout payment page
7. After payment, returns to your site

### API Endpoints

#### POST `/api/checkout`
**Request:**
```json
{
  "planName": "Pro",
  "price": "2",
  "email": "user@example.com",
  "name": "John Doe",
  "paymentMethod": "visa"
}
```

**Response:**
```json
{
  "success": true,
  "checkoutUrl": "https://2checkout.com/checkout/purchase?merchant=YOUR_ID&ref=CHK_...",
  "checkoutId": "CHK_..."
}
```

#### POST `/api/webhook/2checkout`
Handles payment confirmation callbacks from 2Checkout.

#### GET `/api/2checkout-callback`
Verifies and processes payment status updates.

## 2Checkout Account Setup (Next Steps)

1. **Log in to 2Checkout**: https://www.2checkout.com
2. **Configure Webhook**:
   - Go to Settings → Advanced → Webhooks
   - Add webhook URL: `https://yourdomain.com/api/2checkout-callback`
   - Select events: Order Complete, Order Approved, Order Failed
3. **Set Payout Method**:
   - Go to Settings → Payout Details
   - Select **Payoneer** as your payout method
   - Enter your Payoneer account email
   - Choose settlement currency (USD, EUR, or GBP)
   - Complete 2-factor authentication

## Testing Payments

Use 2Checkout's test cards:
- **Visa**: 4111111111111111 (Exp: 12/25, CVV: 123)
- **MasterCard**: 5555555555554444 (Exp: 12/25, CVV: 123)

## Production Deployment

When deploying to Vercel:

1. Add `CHECKOUT_MERCHANT_ID` to Vercel environment variables
2. Ensure `DATABASE_URL` is set to your Neon database
3. Update 2Checkout webhook to point to production domain
4. Update callback handler URL in Vercel deployment config

## Troubleshooting

### Payment page not loading
- Check merchant ID is correct in Vercel
- Verify `DATABASE_URL` is set
- Check browser console for errors

### Payments not being recorded
- Ensure `orders` table is created in Neon
- Check webhook is configured correctly in 2Checkout
- Verify webhook URL is accessible

### Domain/Sitemap Issues
- Sitemap now uses dynamic domain detection from request headers
- Works correctly on both Replit and Vercel
- Cache headers set to prevent stale content

## Support

For 2Checkout issues:
- Email: support@2checkout.com
- Chat: Available 24/7 at 2checkout.com
- Knowledge Base: https://verifone.cloud/docs/2checkout
