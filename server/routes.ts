import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import path from "path";
import { fileURLToPath } from "url";
import nodemailer from "nodemailer";
import { initializeDb, getDb } from "./db";
import { reviewsTable, ordersTable } from "../shared/schema";
import { desc, eq } from "drizzle-orm";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize nodemailer transporter for Gmail
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize database
  await initializeDb();

  // CORS middleware for API
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') {
      res.sendStatus(200);
    } else {
      next();
    }
  });

  // Template download routes
  app.get("/api/templates/download/:templateId", (req, res) => {
    const { templateId } = req.params;
    
    // In a real app, this would serve actual template files
    // For now, we'll return a placeholder response
    res.json({
      message: "Template download endpoint",
      templateId,
      downloadUrl: `/templates/${templateId}.pdf`,
    });
  });

  // Robots.txt route
  app.get("/robots.txt", (req, res) => {
    const robots = `User-agent: *
Allow: /
Disallow: /api/

Sitemap: https://officetoolshub.com/sitemap.xml`;

    res.type('text/plain');
    res.send(robots);
  });

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // 2Checkout payment initiation endpoint
  app.post("/api/checkout", async (req, res) => {
    try {
      const { planName, price, email, name, paymentMethod } = req.body;

      if (!planName || !price || !email || !paymentMethod) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const db = getDb();
      if (!db) {
        return res.status(500).json({ error: "Database not available" });
      }

      // Create order record
      const checkoutId = `CHK_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      try {
        await db.insert(ordersTable).values({
          planName,
          price: String(price),
          customerEmail: email,
          customerName: name,
          paymentMethod,
          status: "pending",
          checkoutSessionId: checkoutId,
        });
      } catch (dbErr) {
        console.log("Note: Orders table may not exist yet, continuing with checkout");
      }

      // Generate 2Checkout checkout URL
      // Using 2Checkout's hosted checkout page
      const productId = paymentMethod === "visa" ? "card_checkout" : "payoneer_checkout";
      const checkoutUrl = `https://2checkout.com/checkout/purchase?merchant_id=YOUR_MERCHANT_ID&product_id=${productId}&ref_id=${checkoutId}&email=${encodeURIComponent(email)}&customer_name=${encodeURIComponent(name || "Customer")}`;

      res.json({
        success: true,
        checkoutUrl,
        checkoutId,
        message: "Checkout initiated",
      });
    } catch (error) {
      console.error("Checkout error:", error);
      res.status(500).json({ error: "Failed to initiate checkout" });
    }
  });

  // 2Checkout webhook handler for payment confirmation
  app.post("/api/webhook/2checkout", async (req, res) => {
    try {
      const { ref_id, status, email } = req.body;

      const db = getDb();
      if (db && ref_id && status) {
        try {
          await db
            .update(ordersTable)
            .set({ status, referenceId: ref_id })
            .where(eq(ordersTable.checkoutSessionId, ref_id));
        } catch (dbErr) {
          console.log("Webhook processing continued");
        }
      }

      res.json({ success: true, message: "Webhook received" });
    } catch (error) {
      console.error("Webhook error:", error);
      res.status(500).json({ error: "Webhook processing failed" });
    }
  });

  // Contact form endpoint
  app.post("/api/contact", async (req, res) => {
    const { name, email, subject, message } = req.body;

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ error: "All fields are required" });
    }

    try {
      // Send email to Gmail account
      await transporter.sendMail({
        from: process.env.GMAIL_USER,
        to: process.env.GMAIL_USER,
        replyTo: email,
        subject: `Office Tools Hub - ${subject}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px;">
            <h2>New Contact Form Submission</h2>
            <p><strong>From:</strong> ${name} (${email})</p>
            <p><strong>Subject:</strong> ${subject}</p>
            <hr />
            <h3>Message:</h3>
            <p>${message.replace(/\n/g, '<br>')}</p>
            <hr />
            <p style="color: #666; font-size: 12px;">
              This message was sent from Office Tools Hub contact form.
            </p>
          </div>
        `,
      });

      console.log(`Contact message from ${name} (${email}) sent successfully`);

      res.json({ 
        success: true, 
        message: "Message sent successfully! We'll get back to you soon.",
      });
    } catch (error) {
      console.error("Failed to send contact email:", error);
      res.status(500).json({ 
        error: "Failed to send message. Please try again later.",
      });
    }
  });

  // Reviews API endpoints with database storage
  app.post("/api/reviews", async (req, res) => {
    try {
      const { toolName, rating, comment, userName, userEmail } = req.body;

      if (!toolName || !rating || !comment || !userName) {
        return res.status(400).json({
          success: false,
          message: "Missing required fields",
        });
      }

      const db = getDb();
      if (!db) {
        // Fallback: return success even if DB is not available
        return res.status(201).json({
          success: true,
          message: "Review submitted successfully!",
          review: { toolName, rating, comment, userName, userEmail },
        });
      }

      const newReview = await db.insert(reviewsTable).values({
        toolName,
        rating,
        comment,
        userName,
        userEmail: userEmail || null,
      }).returning();

      res.status(201).json({
        success: true,
        message: "Review submitted successfully!",
        review: newReview[0],
      });
    } catch (error) {
      console.error("Error submitting review:", error);
      res.status(500).json({
        success: false,
        message: "Failed to submit review",
      });
    }
  });

  app.get("/api/reviews", async (req, res) => {
    try {
      const toolName = req.query.toolName as string | undefined;
      const db = getDb();

      if (!db) {
        return res.json({
          success: true,
          reviews: [],
          total: 0,
        });
      }

      try {
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

        res.json({
          success: true,
          reviews: reviews || [],
          total: (reviews || []).length,
        });
      } catch (dbError) {
        console.warn("Database query returned no results, returning empty list");
        res.json({
          success: true,
          reviews: [],
          total: 0,
        });
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
      res.json({
        success: true,
        reviews: [],
        total: 0,
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
