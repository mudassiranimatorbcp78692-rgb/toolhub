import type { VercelRequest, VercelResponse } from '@vercel/node';
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { reviewsTable } from '../shared/schema';
import { desc, eq } from 'drizzle-orm';

let db: ReturnType<typeof drizzle> | null = null;

async function getDb() {
  if (!db && process.env.DATABASE_URL) {
    try {
      const sql = neon(process.env.DATABASE_URL);
      db = drizzle(sql, { schema: { reviewsTable } });
    } catch (error) {
      console.error('Failed to initialize database:', error);
    }
  }
  return db;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const database = await getDb();

    if (req.method === 'POST') {
      const { toolName, rating, comment, userName, userEmail } = req.body;

      if (!toolName || !rating || !comment || !userName) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields',
        });
      }

      if (!database) {
        return res.status(500).json({
          success: false,
          message: 'Database not available',
        });
      }

      try {
        const newReview = await database.insert(reviewsTable).values({
          toolName,
          rating: parseInt(rating),
          comment,
          userName,
          userEmail: userEmail || null,
        }).returning();

        res.status(201).json({
          success: true,
          message: 'Review submitted successfully!',
          review: newReview[0],
        });
      } catch (dbError) {
        console.error('Database error:', dbError);
        res.status(500).json({
          success: false,
          message: 'Failed to save review',
        });
      }
    } else if (req.method === 'GET') {
      const toolName = req.query.toolName as string | undefined;

      if (!database) {
        return res.json({
          success: true,
          reviews: [],
          total: 0,
        });
      }

      try {
        const reviews = toolName
          ? await database
              .select()
              .from(reviewsTable)
              .where(eq(reviewsTable.toolName, toolName))
              .orderBy(desc(reviewsTable.createdAt))
              .limit(20)
          : await database
              .select()
              .from(reviewsTable)
              .orderBy(desc(reviewsTable.createdAt))
              .limit(20);

        res.status(200).json({
          success: true,
          reviews: reviews || [],
          total: (reviews || []).length,
        });
      } catch (dbError) {
        console.error('Database query error:', dbError);
        res.json({
          success: true,
          reviews: [],
          total: 0,
        });
      }
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Handler error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
}
