import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set headers FIRST - always JSON
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');

  if (req.method === 'OPTIONS') {
    return res.status(200).json({ success: true });
  }

  try {
    // Verify database URL exists
    if (!process.env.DATABASE_URL) {
      console.error('DATABASE_URL not configured');
      return res.status(503).json({
        success: false,
        message: 'Database not configured',
        reviews: [],
        total: 0,
      });
    }

    // Lazy load Drizzle dependencies
    const { drizzle } = await import('drizzle-orm/neon-http');
    const { neon } = await import('@neondatabase/serverless');
    const { reviewsTable } = await import('../shared/schema');
    const { desc, eq } = await import('drizzle-orm');

    const sql = neon(process.env.DATABASE_URL);
    const db = drizzle(sql, { schema: { reviewsTable } });

    // GET - Fetch reviews
    if (req.method === 'GET') {
      try {
        const toolName = req.query.toolName as string | undefined;
        console.log(`Fetching reviews for tool: ${toolName || 'all'}`);

        const reviews = toolName
          ? await db
              .select()
              .from(reviewsTable)
              .where(eq(reviewsTable.toolName, toolName))
              .orderBy(desc(reviewsTable.createdAt))
              .limit(100)
          : await db
              .select()
              .from(reviewsTable)
              .orderBy(desc(reviewsTable.createdAt))
              .limit(100);

        console.log(`Returned ${reviews.length} reviews`);
        
        return res.status(200).json({
          success: true,
          reviews: reviews.map(r => {
            let createdAtStr = new Date().toISOString();
            if (r.createdAt) {
              createdAtStr = r.createdAt instanceof Date ? r.createdAt.toISOString() : new Date(r.createdAt).toISOString();
            }
            return {
              id: r.id,
              toolName: r.toolName,
              rating: r.rating,
              comment: r.comment,
              userName: r.userName,
              userEmail: r.userEmail || null,
              createdAt: createdAtStr,
            };
          }) || [],
          total: reviews.length,
        });
      } catch (err) {
        console.error('GET reviews error:', err);
        return res.status(200).json({
          success: true,
          reviews: [],
          total: 0,
        });
      }
    }

    // POST - Submit review
    if (req.method === 'POST') {
      try {
        const { toolName, rating, comment, userName, userEmail } = req.body;
        console.log(`Submitting review for ${toolName} by ${userName}`);

        // Validate
        if (!toolName || rating === undefined || !comment || !userName) {
          return res.status(400).json({
            success: false,
            message: 'Missing required fields',
          });
        }

        // Insert - let database set createdAt via defaultNow()
        const newReview = await db
          .insert(reviewsTable)
          .values({
            toolName: String(toolName),
            rating: parseInt(String(rating)),
            comment: String(comment),
            userName: String(userName),
            userEmail: userEmail ? String(userEmail) : null,
          })
          .returning();

        const review = newReview[0];
        console.log(`Review saved with ID: ${review?.id}`);

        let createdAtStr = new Date().toISOString();
        if (review?.createdAt) {
          createdAtStr = review.createdAt instanceof Date ? review.createdAt.toISOString() : new Date(review.createdAt).toISOString();
        }

        return res.status(201).json({
          success: true,
          message: 'Review submitted successfully',
          review: review ? {
            id: review.id,
            toolName: review.toolName,
            rating: review.rating,
            comment: review.comment,
            userName: review.userName,
            userEmail: review.userEmail || null,
            createdAt: createdAtStr,
          } : null,
        });
      } catch (err) {
        console.error('POST review error:', err);
        return res.status(500).json({
          success: false,
          message: err instanceof Error ? err.message : 'Failed to save review',
        });
      }
    }

    return res.status(405).json({ success: false, message: 'Method not allowed' });
  } catch (error) {
    console.error('Unhandled error:', error);
    return res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Server error',
    });
  }
}
