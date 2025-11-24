# Office Tools Hub - Vercel Deployment Guide

Your app has been restructured to work perfectly with Vercel! Follow these steps to deploy.

## What Changed

Your app now uses **Vercel Serverless Functions** instead of a traditional Express server:

- ✅ **Frontend**: React + Vite builds to `/dist` (outputDirectory configured)
- ✅ **Backend**: Minimal API routes as serverless functions in `/api`
- ✅ **Configuration**: `vercel.json` handles routing and build output
- ✅ **Build**: Optimized for Vercel's deployment system

**Important**: This app is primarily **client-side** - all PDF, image, and text processing tools run entirely in your browser using Web APIs. The backend only handles:
- Contact form (sends emails)
- SEO (sitemap.xml, robots.txt)
- Template downloads
- Future Stripe payments (optional)

## File Structure

```
your-project/
├── api/                      # Serverless API functions
│   ├── health.ts            # GET /api/health
│   ├── contact.ts           # POST /api/contact
│   ├── sitemap.xml.ts       # GET /sitemap.xml
│   ├── robots.txt.ts        # GET /robots.txt
│   └── templates/
│       └── download/
│           └── [templateId].ts
├── client/                   # React frontend source
├── dist/                     # Build output (auto-generated)
├── vercel.json              # Vercel configuration
└── package.json
```

## Deployment Steps

### Step 1: Push to GitHub

```bash
git add .
git commit -m "Restructure for Vercel deployment"
git push origin main
```

### Step 2: Deploy on Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **"Add New Project"**
3. **Import your GitHub repository**
4. Configure build settings:
   - **Framework Preset**: Vite
   - **Root Directory**: Leave as `.` (root)
   - **Build Command**: `npm run vercel-build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

5. Add Environment Variables (if needed):
   - `GMAIL_USER` - Your Gmail address for contact form
   - `GMAIL_APP_PASSWORD` - Gmail app password
   - Any other API keys or secrets

6. Click **"Deploy"**

### Step 3: Wait for Deployment

Vercel will:
- Install dependencies
- Build your React frontend
- Deploy serverless functions
- Give you a live URL (e.g., `your-app.vercel.app`)

## How It Works

### API Routes (Serverless Functions)

Each file in `/api` becomes an endpoint:

| File | URL | Method |
|------|-----|--------|
| `api/health.ts` | `/api/health` | GET |
| `api/contact.ts` | `/api/contact` | POST |
| `api/sitemap.xml.ts` | `/sitemap.xml` | GET |
| `api/robots.txt.ts` | `/robots.txt` | GET |
| `api/templates/download/[templateId].ts` | `/api/templates/download/:id` | GET |

### Routing (vercel.json)

```json
{
  "buildCommand": "npm run vercel-build",
  "outputDirectory": "dist",
  "routes": [
    { "src": "/sitemap.xml", "dest": "/api/sitemap.xml" },
    { "src": "/robots.txt", "dest": "/api/robots.txt" },
    { "src": "/api/(.*)", "dest": "/api/$1" },
    { "handle": "filesystem" },
    { "src": "/(.*)", "dest": "/index.html" }
  ]
}
```

This ensures:
- API calls go to serverless functions
- Static files (CSS, JS, images) are served from disk
- All other routes fall through to index.html (SPA routing)
- No 404 errors on page refresh
- Assets load correctly with proper MIME types

## Environment Variables

Set these in **Vercel Dashboard → Project Settings → Environment Variables**:

### Required (for contact form):
- `GMAIL_USER` - Your Gmail address
- `GMAIL_APP_PASSWORD` - Generate from [Google App Passwords](https://myaccount.google.com/apppasswords)

## Testing Locally

### Development mode (with original Express server):
```bash
npm run dev
```

### Test Vercel build:
```bash
npm run vercel-build
```

### Test with Vercel CLI:
```bash
npm install -g vercel
vercel dev
```

## Common Issues & Solutions

### ❌ 404 on page refresh
**Solution**: Already fixed with `vercel.json` rewrites!

### ❌ API calls fail
**Solution**: Make sure your frontend uses `/api/` prefix:
```javascript
fetch('/api/health')  // ✅ Correct
fetch('http://localhost:5000/api/health')  // ❌ Wrong for production
```

### ❌ Environment variables not working
**Solution**: 
1. Add them in Vercel Dashboard
2. Redeploy the project

### ❌ Build fails
**Solution**: 
1. Check that `npm run vercel-build` works locally
2. Make sure all dependencies are in `package.json`

## Updating Your Deployment

After making changes:

```bash
git add .
git commit -m "Your changes"
git push origin main
```

Vercel automatically redeploys on every push to `main`!

## Custom Domain

1. Go to **Vercel Dashboard → Your Project → Settings → Domains**
2. Add your custom domain (e.g., `officetoolshub.com`)
3. Follow Vercel's DNS configuration instructions
4. Update the `baseUrl` in `api/sitemap.xml.ts` to your domain

## Performance Notes

- ✅ Frontend is served from Vercel's global CDN (super fast)
- ✅ Serverless functions scale automatically
- ✅ Zero server maintenance required
- ⚠️ Serverless functions have cold starts (~1-2s on first request)

## Known Limitations

The Vercel deployment preserves all current functionality. Note:

- **Sessions**: Not used in this app (all tools are public, no auth required)
- **Template Downloads**: Currently placeholder endpoints (returns JSON, not actual files)
- **Stripe Payments**: Not implemented yet (future feature)

If you add these features later:
- Use JWT or Vercel KV for authentication instead of sessions
- Implement Stripe webhooks using Vercel Edge Runtime for proper signature verification

## Support

If deployment fails:
1. Check the Vercel build logs
2. Ensure `npm run vercel-build` works locally
3. Verify all environment variables are set
4. Check that your repository is up to date

## Success!

Once deployed, your app will be live at:
- `https://your-project-name.vercel.app`
- And any custom domains you configure

All tools will work exactly as they do locally! 🎉
