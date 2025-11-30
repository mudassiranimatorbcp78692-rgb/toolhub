import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  const protocol = req.headers['x-forwarded-proto'] || 'https';
  const host = req.headers['x-forwarded-host'] || req.headers['host'] || 'officetoolshub.vercel.app';
  const domain = `${protocol}://${host}`;
  
  const robots = `User-agent: *
Allow: /
Disallow: /api/

Sitemap: ${domain}/sitemap.xml`;

  res.setHeader('Content-Type', 'text/plain');
  res.status(200).send(robots);
}
