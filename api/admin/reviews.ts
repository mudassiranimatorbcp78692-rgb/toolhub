import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');

  if (req.method === 'OPTIONS') {
    return res.status(200).json({ success: true });
  }

  try {
    if (!process.env.DATABASE_URL) {
      return res.status(503).json({ success: false, message: 'Database not configured' });
    }

    const { drizzle } = await import('drizzle-orm/neon-http');
    const { neon } = await import('@neondatabase/serverless');
    const { reviewsTable } = await import('../../shared/schema');
    const { eq, desc } = await import('drizzle-orm');

    const sql = neon(process.env.DATABASE_URL);
    const db = drizzle(sql, { schema: { reviewsTable } });

    // GET - Fetch all reviews for admin
    if (req.method === 'GET') {
      try {
        const reviews = await db
          .select()
          .from(reviewsTable)
          .orderBy(desc(reviewsTable.createdAt))
          .limit(500);

        return res.json({
          success: true,
          reviews: reviews.map(r => ({
            id: r.id,
            toolName: r.toolName,
            rating: r.rating,
            comment: r.comment,
            userName: r.userName,
            userEmail: r.userEmail || null,
            createdAt: r.createdAt instanceof Date ? r.createdAt.toISOString() : new Date(r.createdAt).toISOString(),
            isPinned: r.isPinned,
          })),
        });
      } catch (err) {
        console.error('GET admin reviews error:', err);
        return res.json({ success: true, reviews: [] });
      }
    }

    // DELETE - Remove a review
    if (req.method === 'DELETE') {
      try {
        const { reviewId } = req.body;
        if (!reviewId) {
          return res.status(400).json({ success: false, message: 'Review ID required' });
        }

        await db
          .delete(reviewsTable)
          .where(eq(reviewsTable.id, parseInt(String(reviewId))));

        return res.json({ success: true, message: 'Review deleted' });
      } catch (err) {
        console.error('DELETE review error:', err);
        return res.status(500).json({ success: false, message: 'Failed to delete review' });
      }
    }

    // POST - Pin/unpin review
    if (req.method === 'POST') {
      try {
        const { reviewId, isPinned } = req.body;
        if (!reviewId) {
          return res.status(400).json({ success: false, message: 'Review ID required' });
        }

        await db
          .update(reviewsTable)
          .set({ isPinned: Boolean(isPinned) })
          .where(eq(reviewsTable.id, parseInt(String(reviewId))));

        return res.json({ success: true, message: isPinned ? 'Review pinned' : 'Review unpinned' });
      } catch (err) {
        console.error('POST pin review error:', err);
        return res.status(500).json({ success: false, message: 'Failed to update review' });
      }
    }

    return res.status(405).json({ success: false, message: 'Method not allowed' });
  } catch (error) {
    console.error('Admin API error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}
