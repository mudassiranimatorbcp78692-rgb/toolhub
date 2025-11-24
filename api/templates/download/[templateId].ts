import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  const { templateId } = req.query;
  
  res.status(200).json({
    message: "Template download endpoint",
    templateId,
    downloadUrl: `/templates/${templateId}.pdf`,
  });
}
