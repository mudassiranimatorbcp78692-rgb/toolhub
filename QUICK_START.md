# 🚀 2Checkout Payment Integration - Quick Start

Your Office Tools Hub is now ready to accept payments! Here's what to do:

## ✅ Already Done

- ✅ Pricing page with Pro ($2/month) and Enterprise ($5/month) plans
- ✅ Payment form with customer details collection
- ✅ Support for Visa/Mastercard and Payoneer payments
- ✅ 2Checkout API integration
- ✅ Database table for tracking orders (orders table created)
- ✅ Merchant ID configured (255801704351)

## 🔧 Quick Setup (5 minutes)

### Step 1: Update Your Vercel Environment
Add these to your Vercel project settings:

```
CHECKOUT_MERCHANT_ID=255801704351
DATABASE_URL=postgresql://neondb_owner:npg_pzImeXK27URT@ep-raspy-silence-ahb2jnyg-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

### Step 2: Configure 2Checkout Webhook
1. Log in: https://www.2checkout.com
2. Settings → Webhooks
3. Add webhook: `https://yourdomain.com/api/2checkout-callback`
4. Select events: Order Complete, Order Approved, Order Failed

### Step 3: Set Up Payouts
1. Settings → Payout Details
2. Select: **Payoneer**
3. Enter: Your Payoneer email
4. Currency: USD/EUR/GBP (choose one)

Done! 🎉

## 🧪 Test It

### Local Testing
1. Go to `/pricing` page
2. Click "Go Pro"
3. Fill in test details:
   - Name: John Doe
   - Email: test@example.com
   - Payment: Visa Card
4. Click "Proceed to Payment"
5. You should see 2Checkout page

### Test Card Details
- **Visa**: 4111111111111111 (Exp: 12/25, CVV: 123)
- **MasterCard**: 5555555555554444 (Exp: 12/25, CVV: 123)

## 📊 Monitor Payments

### Check Orders in Database
```sql
SELECT * FROM orders;
```

### Check Payment Status
- Pending: User initiated but not paid
- Completed: Successfully paid
- Failed: Payment failed

## 🎯 What Happens After Payment

When user completes payment:
1. 2Checkout sends webhook to your server
2. Order status updates to "completed"
3. Payment reference ID is stored
4. Revenue flows to your Payoneer account weekly

## 💰 Payouts to Pakistan

### How to Withdraw
1. Funds from 2Checkout → Your Payoneer account
2. From Payoneer → Your Pakistan bank account
3. Or use Payoneer debit card

### Timeline
- 2Checkout: Weekly payouts (minimum $50)
- To bank: 2-3 business days
- Payoneer fee: ~2-3%

## 📱 FAQ

**Q: Can users from Pakistan pay?**
A: Yes! They can use Payoneer which is available in Pakistan.

**Q: Are international payments supported?**
A: Yes! Visa/Mastercard work worldwide. Only some countries have payment method restrictions with 2Checkout.

**Q: How much does 2Checkout charge?**
A: 2.4-3.9% + 30-45¢ per transaction.

**Q: What if payment fails?**
A: User stays on pricing page and can retry. Order marked as "failed" in database.

## 🆘 Troubleshooting

| Issue | Solution |
|-------|----------|
| "Merchant ID not configured" | Check Vercel env vars are set |
| Payments not showing in database | Create orders table (see PAYMENT_SETUP.md) |
| Webhook not working | Verify webhook URL in 2Checkout is correct |
| User sees error after payment | Check DATABASE_URL is accessible |

## 📞 Support

**2Checkout Support:**
- Email: support@2checkout.com
- Chat: 24/7 at 2checkout.com
- Docs: https://verifone.cloud/docs/2checkout

## 🔐 Security Notes

- All card data processed by 2Checkout (PCI compliant)
- Your site never sees card numbers
- Orders tracked in secure Neon database
- Merchant ID is public (it's a standard parameter)

---

**You're all set!** Your payment system is ready to go. Deploy to Vercel and start collecting payments! 🚀
