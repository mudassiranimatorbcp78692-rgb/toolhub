# Deployment Checklist

## Before Pushing to Vercel

- [ ] Ensure DATABASE_URL is set in Vercel env vars
- [ ] Ensure CHECKOUT_MERCHANT_ID=255801704351 is set in Vercel env vars
- [ ] Test `/pricing` page works locally
- [ ] Test checkout API: `POST /api/checkout` returns checkout URL
- [ ] Database orders table is created in Neon

## After Deploying to Vercel

- [ ] Test `/pricing` page on Vercel domain
- [ ] Try the checkout flow with test payment
- [ ] Verify order appears in database after payment
- [ ] Check webhook URL is configured: `https://yourdomain.vercel.app/api/2checkout-callback`

## Final Steps

- [ ] Update 2Checkout webhook to point to Vercel domain
- [ ] Set up Payoneer payout method in 2Checkout
- [ ] Test with real payment (optional - small amount)
- [ ] Monitor first payments in database

---

**Remember:** Orders table was already created. Just deploy and test!
