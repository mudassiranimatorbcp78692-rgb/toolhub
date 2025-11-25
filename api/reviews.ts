import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS and content-type headers FIRST
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle OPTIONS requests
  if (req.method === 'OPTIONS') {
    res.status(200).json({ success: true });
    return;
  }

  try {
    // Check if DATABASE_URL is available
    if (!process.env.DATABASE_URL) {
      console.warn('DATABASE_URL not configured');
      return res.json({
        success: true,
        reviews: [],
        total: 0,
      });
    }

    // Lazy load database dependencies
    const { drizzle } = await import('drizzle-orm/neon-http');
    const { neon } = await import('@neondatabase/serverless');
    const { reviewsTable } = await import('../shared/schema');
    const { desc, eq } = await import('drizzle-orm');

    // Initialize database
    const sql = neon(process.env.DATABASE_URL);
    const db = drizzle(sql, { schema: { reviewsTable } });

    if (req.method === 'GET') {
      try {
        const toolName = req.query.toolName as string | undefined;

        const reviews = toolName
          ? await db
              .select()
              .from(reviewsTable)
              .where(eq(reviewsTable.toolName, toolName))
              .orderBy(desc(reviewsTable.createdAt))
              .limit(20)
          : await db
              .select()
              .from(reviewsTable)
              .orderBy(desc(reviewsTable.createdAt))
              .limit(20);

        return res.json({
          success: true,
          reviews: reviews || [],
          total: (reviews || []).length,
        });
      } catch (err) {
        console.error('GET /api/reviews error:', err);
        return res.json({
          success: true,
          reviews: [],
          total: 0,
        });
      }
    }

    if (req.method === 'POST') {
      try {
        const { toolName, rating, comment, userName, userEmail } = req.body;

        // Validate input
        if (!toolName || !rating || !comment || !userName) {
          return res.status(400).json({
            success: false,
            message: 'Missing required fields: toolName, rating, comment, userName',
          });
        }

        // Insert review
        const newReview = await db
          .insert(reviewsTable)
          .values({
            toolName,
            rating: parseInt(String(rating)),
            comment,
            userName,
            userEmail: userEmail ? String(userEmail) : null,
          })
          .returning();

        return res.status(201).json({
          success: true,
          message: 'Review submitted successfully!',
          review: newReview[0] || { toolName, rating, comment, userName, userEmail },
        });
      } catch (err) {
        console.error('POST /api/reviews error:', err);
        return res.status(500).json({
          success: false,
          message: 'Failed to save review to database',
        });
      }
    }

    // Method not allowed
    return res.status(405).json({
      success: false,
      message: 'Method not allowed',
    });
  } catch (error) {
    console.error('Unhandled error in /api/reviews:', error);
    return res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Internal server error',
    });
  }
}
