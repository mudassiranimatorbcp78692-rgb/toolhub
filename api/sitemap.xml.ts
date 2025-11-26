import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  // Get domain from request headers - this will be the actual domain the request came from
  const host = req.headers.host || req.headers['x-forwarded-host'] || "officetoolshub.vercel.app";
  const protocol = req.headers['x-forwarded-proto'] || "https";
  const baseUrl = `${protocol}://${host}`;
  
  // Ensure cache is disabled so Google Search Console gets fresh URLs
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  const tools = [
    "pdf-to-jpg", "jpg-to-pdf", "pdf-merge", "pdf-split", "pdf-compress", 
    "pdf-rotate", "pdf-protect", "image-compress", "image-resize", "image-crop",
    "image-converter", "image-color-picker", "image-enhance", "word-counter",
    "case-converter", "remove-duplicates", "lorem-ipsum", "grammar-checker",
    "qr-code", "barcode", "password", "username", "html-to-pdf", "image-to-text",
    "percentage-calculator", "loan-calculator", "gpa-calculator", "zakat-calculator"
  ];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/tools</loc>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${baseUrl}/templates</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${baseUrl}/pricing</loc>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>${baseUrl}/contact</loc>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
  ${tools.map(tool => `  <url>
    <loc>${baseUrl}/tool/${tool}</loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`).join('\n')}
</urlset>`;

  res.setHeader('Content-Type', 'application/xml');
  res.status(200).send(sitemap);
}
