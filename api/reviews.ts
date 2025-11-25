import type { VercelRequest, VercelResponse } from '@vercel/node';
import { pgTable, text, integer, timestamp, serial } from 'drizzle-orm/pg-core';
import { sql as sqlFn } from 'drizzle-orm';

// Define reviewsTable inline for Vercel
const reviewsTable = pgTable('reviews', {
  id: serial('id').primaryKey(),
  toolName: text('tool_name').notNull(),
  rating: integer('rating').notNull(),
  comment: text('comment').notNull(),
  userName: text('user_name').notNull(),
  userEmail: text('user_email'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

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

    // Use postgres driver instead of neon for better compatibility
    const { drizzle } = await import('drizzle-orm/postgres-js');
    const postgres = await import('postgres');
    const { desc, eq } = await import('drizzle-orm');

    const client = postgres(process.env.DATABASE_URL);
    const db = drizzle(client, { schema: { reviewsTable } });

    // GET - Fetch reviews
    if (req.method === 'GET') {
      try {
        const toolName = req.query.toolName as string | undefined;

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

        await client.end();
        
        return res.status(200).json({
          success: true,
          reviews: reviews.map(r => ({
            id: r.id,
            toolName: r.toolName,
            rating: r.rating,
            comment: r.comment,
            userName: r.userName,
            userEmail: r.userEmail || null,
            createdAt: r.createdAt instanceof Date ? r.createdAt.toISOString() : new Date(r.createdAt).toISOString(),
          })) || [],
          total: reviews.length,
        });
      } catch (err) {
        console.error('GET reviews error:', err);
        await client.end();
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

        if (!toolName || rating === undefined || !comment || !userName) {
          await client.end();
          return res.status(400).json({
            success: false,
            message: 'Missing required fields',
          });
        }

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

        await client.end();
        const review = newReview[0];

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
            createdAt: review.createdAt instanceof Date ? review.createdAt.toISOString() : new Date(review.createdAt).toISOString(),
          } : null,
        });
      } catch (err) {
        console.error('POST review error:', err);
        await client.end();
        return res.status(500).json({
          success: false,
          message: err instanceof Error ? err.message : 'Failed to save review',
        });
      }
    }

    await client.end();
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  } catch (error) {
    console.error('Unhandled error:', error);
    return res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Server error',
    });
  }
}
