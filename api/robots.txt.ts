import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  const robots = `User-agent: *
Allow: /
Disallow: /api/

Sitemap: https://officetoolshub.com/sitemap.xml`;

  res.setHeader('Content-Type', 'text/plain');
  res.status(200).send(robots);
}
