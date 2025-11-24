import type { VercelRequest, VercelResponse } from '@vercel/node';
import { reviewSchema } from '../shared/schema';

// In-memory storage for reviews (replace with DB later if needed)
let reviews: Array<{
  id: string;
  toolName: string;
  rating: number;
  comment: string;
  userName: string;
  userEmail?: string;
  createdAt: string;
}> = [];

export default function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'POST') {
    try {
      const validatedData = reviewSchema.parse(req.body);
      
      const newReview = {
        id: Date.now().toString(),
        toolName: validatedData.toolName,
        rating: validatedData.rating,
        comment: validatedData.comment,
        userName: validatedData.userName,
        userEmail: validatedData.userEmail,
        createdAt: new Date().toISOString(),
      };

      reviews.push(newReview);
      
      // Keep only last 1000 reviews in memory
      if (reviews.length > 1000) {
        reviews = reviews.slice(-1000);
      }

      res.status(201).json({
        success: true,
        message: 'Review submitted successfully!',
        review: newReview,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'Invalid review data',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  } else if (req.method === 'GET') {
    const toolName = req.query.toolName as string | undefined;
    
    const filteredReviews = toolName
      ? reviews.filter(r => r.toolName === toolName)
      : reviews;

    res.status(200).json({
      success: true,
      reviews: filteredReviews.slice(-20).reverse(), // Last 20 reviews, newest first
      total: filteredReviews.length,
    });
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
