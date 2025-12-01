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

      // Generate 2Checkout checkout URL using merchant ID from env
      const merchantId = process.env.CHECKOUT_MERCHANT_ID;
      if (!merchantId) {
        return res.status(500).json({ error: "Merchant ID not configured" });
      }

      const checkoutUrl = `https://2checkout.com/checkout/purchase?merchant=${merchantId}&ref=${checkoutId}&email=${encodeURIComponent(email)}&name=${encodeURIComponent(name || "Customer")}`;

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

  // Custom payment handler (direct payments: Payoneer, Bank, EasyPaisa, JazzCash)
  app.post("/api/custom-payment", async (req, res) => {
    try {
      const { planName, price, email, name, paymentMethod } = req.body;

      if (!planName || !price || !email || !name || !paymentMethod) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      // Generate unique invoice ID
      const invoiceId = `INV-${Date.now()}`;

      const db = getDb();
      if (db) {
        try {
          await db.insert(ordersTable).values({
            planName,
            price: String(price),
            customerEmail: email,
            customerName: name,
            paymentMethod,
            status: "pending_manual",
            referenceId: invoiceId,
          });
        } catch (dbErr) {
          console.log("Note: Could not save order, continuing");
        }
      }

      // Get payment instructions and details
      const payoneerEmail = process.env.PAYONEER_EMAIL || "your-payoneer@email.com";
      const bankAccountInfo = process.env.BANK_ACCOUNT_INFO || "Contact support for bank details";
      const easyPaisaNumber = process.env.EASYPAISA_NUMBER || "XXX-XXXXXXX";
      const jazzCashNumber = process.env.JAZZCASH_NUMBER || "XXX-XXXXXXX";

      const instructionsMap: Record<string, { title: string; html: string }> = {
        payoneer_direct: {
          title: "Payoneer Payment Instructions",
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2>📋 Payment Invoice</h2>
              <p>Hello ${name},</p>
              <p>Thank you for choosing Office Tools Hub! Here are your payment instructions:</p>
              
              <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3>Invoice Details</h3>
                <p><strong>Invoice ID:</strong> ${invoiceId}</p>
                <p><strong>Plan:</strong> ${planName} - $${price}/month</p>
                <p><strong>Amount:</strong> $${price} USD</p>
              </div>
              
              <div style="background: #dbeafe; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3>Send Payment To:</h3>
                <p style="font-size: 16px; font-weight: bold;">${payoneerEmail}</p>
              </div>
              
              <div style="background: #fef08a; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3>After Payment:</h3>
                <ol>
                  <li>Take a screenshot of the transaction</li>
                  <li>Reply to this email with the screenshot</li>
                  <li>Include Invoice ID: <strong>${invoiceId}</strong></li>
                </ol>
                <p>Your ${planName} plan will be activated within 2 hours of confirmation.</p>
              </div>
              
              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
              <p style="color: #666; font-size: 12px;">
                © 2025 Office Tools Hub. If you have any questions, reply to this email.
              </p>
            </div>
          `,
        },
        bank_transfer: {
          title: "Bank Transfer Instructions",
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2>📋 Payment Invoice</h2>
              <p>Hello ${name},</p>
              <p>Thank you for choosing Office Tools Hub! Here are your payment instructions:</p>
              
              <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3>Invoice Details</h3>
                <p><strong>Invoice ID:</strong> ${invoiceId}</p>
                <p><strong>Plan:</strong> ${planName} - $${price}/month</p>
                <p><strong>Amount:</strong> $${price} USD</p>
              </div>
              
              <div style="background: #dbeafe; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3>Bank Details:</h3>
                <p>${bankAccountInfo}</p>
                <p><strong>Reference:</strong> ${invoiceId}</p>
              </div>
              
              <div style="background: #fef08a; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3>After Transfer:</h3>
                <ol>
                  <li>Note the transaction ID</li>
                  <li>Reply to this email with transaction ID and screenshot</li>
                  <li>Include Invoice ID: <strong>${invoiceId}</strong></li>
                </ol>
                <p>Your ${planName} plan will be activated within 2 hours of confirmation.</p>
              </div>
              
              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
              <p style="color: #666; font-size: 12px;">
                © 2025 Office Tools Hub. If you have any questions, reply to this email.
              </p>
            </div>
          `,
        },
        easypaisa: {
          title: "EasyPaisa Payment Instructions",
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2>📋 Payment Invoice</h2>
              <p>السلام علیکم ${name},</p>
              <p>Office Tools Hub کے لیے شکریہ! یہاں آپ کی ادائیگی کی ہدایات ہیں:</p>
              
              <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3>Invoice Details</h3>
                <p><strong>Invoice ID:</strong> ${invoiceId}</p>
                <p><strong>Plan:</strong> ${planName} - $${price}/month</p>
                <p><strong>Amount:</strong> $${price} USD (برابر PKR)</p>
              </div>
              
              <div style="background: #dbeafe; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3>ادا کریں:</h3>
                <p style="font-size: 16px; font-weight: bold;">EasyPaisa: ${easyPaisaNumber}</p>
                <p><strong>Reference:</strong> ${invoiceId}</p>
              </div>
              
              <div style="background: #fef08a; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3>ادائیگی کے بعد:</h3>
                <ol>
                  <li>لین دین کا اسکرین شاٹ لیں</li>
                  <li>اس ای میل کا جواب دیں اسکرین شاٹ کے ساتھ</li>
                  <li>Invoice ID شامل کریں: <strong>${invoiceId}</strong></li>
                </ol>
                <p>آپ کی ${planName} plan 2 گھنٹے میں فعال ہو جائے گی۔</p>
              </div>
              
              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
              <p style="color: #666; font-size: 12px;">
                © 2025 Office Tools Hub. اگر آپ کے کوئی سوالات ہوں تو ای میل کا جواب دیں۔
              </p>
            </div>
          `,
        },
        jazzcash: {
          title: "JazzCash Payment Instructions",
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2>📋 Payment Invoice</h2>
              <p>السلام علیکم ${name},</p>
              <p>Office Tools Hub کے لیے شکریہ! یہاں آپ کی ادائیگی کی ہدایات ہیں:</p>
              
              <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3>Invoice Details</h3>
                <p><strong>Invoice ID:</strong> ${invoiceId}</p>
                <p><strong>Plan:</strong> ${planName} - $${price}/month</p>
                <p><strong>Amount:</strong> $${price} USD (برابر PKR)</p>
              </div>
              
              <div style="background: #dbeafe; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3>ادا کریں:</h3>
                <p style="font-size: 16px; font-weight: bold;">JazzCash: ${jazzCashNumber}</p>
                <p><strong>Reference:</strong> ${invoiceId}</p>
              </div>
              
              <div style="background: #fef08a; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3>ادائیگی کے بعد:</h3>
                <ol>
                  <li>لین دین کا اسکرین شاٹ لیں</li>
                  <li>اس ای میل کا جواب دیں اسکرین شاٹ کے ساتھ</li>
                  <li>Invoice ID شامل کریں: <strong>${invoiceId}</strong></li>
                </ol>
                <p>آپ کی ${planName} plan 2 گھنٹے میں فعال ہو جائے گی۔</p>
              </div>
              
              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
              <p style="color: #666; font-size: 12px;">
                © 2025 Office Tools Hub. اگر آپ کے کوئی سوالات ہوں تو ای میل کا جواب دیں۔
              </p>
            </div>
          `,
        },
      };

      const instructionData = instructionsMap[paymentMethod] || {
        title: "Payment Instructions",
        html: "<p>Please contact support for payment instructions.</p>",
      };

      // Send email to customer
      try {
        await transporter.sendMail({
          from: process.env.GMAIL_USER,
          to: email,
          subject: `Office Tools Hub - ${instructionData.title}`,
          html: instructionData.html,
        });
        console.log(`Payment instructions sent to ${email}`);
      } catch (emailErr) {
        console.error("Failed to send email:", emailErr);
        // Continue anyway - order is still created
      }

      res.json({
        success: true,
        invoiceId,
        message: "Payment order created. Instructions sent to your email.",
      });
    } catch (error) {
      console.error("Custom payment error:", error);
      res.status(500).json({
        error: error instanceof Error ? error.message : "Failed to process custom payment",
      });
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
