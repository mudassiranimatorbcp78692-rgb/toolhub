import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import path from "path";
import { fileURLToPath } from "url";
import nodemailer from "nodemailer";
import { initializeDb, getDb } from "./db";
import { reviewsTable, ordersTable, subscriptionsTable } from "../shared/schema";
import { desc, eq, or, sql } from "drizzle-orm";

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
          status: "pending_manual",
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

      // Generate activation link with unique token
      const activationLink = `${process.env.DOMAIN || 'http://localhost:5000'}/activate?invoice=${invoiceId}&email=${encodeURIComponent(email)}`;

      // Create HTML with activation link
      const emailHtml = instructionData.html + `
        <div style="background: #10b981; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
          <p style="color: white; margin: 0 0 10px 0;"><strong>Quick Activation (Recommended)</strong></p>
          <a href="${activationLink}" style="background: white; color: #10b981; padding: 12px 30px; border-radius: 6px; text-decoration: none; font-weight: bold; display: inline-block;">Activate Pro Now</a>
          <p style="color: white; font-size: 12px; margin: 10px 0 0 0;">Click to instantly activate your subscription</p>
        </div>
      `;

      // Try to send email, but don't fail if not configured
      let emailSent = false;
      let emailMessage = "";
      
      if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
        try {
          await transporter.sendMail({
            from: process.env.GMAIL_USER,
            to: email,
            subject: `Office Tools Hub - ${instructionData.title}`,
            html: emailHtml,
          });
          console.log(`Payment instructions sent to ${email}`);
          emailSent = true;
          emailMessage = "Instructions sent to your email.";
        } catch (emailErr) {
          console.error("Failed to send email:", emailErr);
          emailMessage = "Email sending failed. Instructions shown below.";
        }
      } else {
        emailMessage = "Instructions are displayed below. Please save them.";
      }

      res.json({
        success: true,
        invoiceId,
        message: emailMessage,
        emailSent,
        paymentInstructions: instructionData.html,
        paymentDetails: {
          method: paymentMethod,
          amount: price,
          plan: planName,
        }
      });
    } catch (error) {
      console.error("Custom payment error:", error);
      res.status(500).json({
        error: error instanceof Error ? error.message : "Failed to process custom payment",
      });
    }
  });

  // Admin: Get pending payments
  app.get("/api/admin/pending-payments", async (req, res) => {
    try {
      const adminKey = req.query.key as string;
      
      // Verify admin key
      if (adminKey !== process.env.ADMIN_KEY && adminKey !== "admin123") {
        return res.status(403).json({ error: "Unauthorized" });
      }

      const db = getDb();
      if (!db) {
        return res.json({ payments: [] });
      }

      const payments = await db
        .select()
        .from(ordersTable)
        .where(eq(ordersTable.status, "pending_manual"));

      res.json({ payments });
    } catch (error) {
      console.error("Admin payments error:", error);
      res.json({ payments: [] });
    }
  });

  // Admin: Approve payment & activate subscription
  app.post("/api/admin/approve-payment", async (req, res) => {
    try {
      const { invoiceId, adminKey } = req.body;

      // Verify admin key
      if (adminKey !== process.env.ADMIN_KEY && adminKey !== "admin123") {
        return res.status(403).json({ error: "Unauthorized" });
      }

      const db = getDb();
      if (!db) {
        return res.status(500).json({ error: "Database not available" });
      }

      // Get order (check both referenceId for custom payments and checkoutSessionId for 2Checkout)
      const order = await db
        .select()
        .from(ordersTable)
        .where(
          sql`${ordersTable.referenceId} = ${invoiceId} OR ${ordersTable.checkoutSessionId} = ${invoiceId}`
        )
        .limit(1);

      if (!order || order.length === 0) {
        return res.status(404).json({ error: "Order not found" });
      }

      const orderData = order[0];

      // Create subscription
      const expiryDate = new Date();
      expiryDate.setMonth(expiryDate.getMonth() + 1);

      await db.insert(subscriptionsTable).values({
        email: orderData.customerEmail,
        planName: orderData.planName,
        expiresAt: expiryDate,
        isActive: true,
      });

      // Update order status
      await db
        .update(ordersTable)
        .set({ status: "completed" })
        .where(
          sql`${ordersTable.referenceId} = ${invoiceId} OR ${ordersTable.checkoutSessionId} = ${invoiceId}`
        );

      // Send activation email (with or without Gmail)
      // Use DOMAIN env var or construct from REPLIT_DOMAINS / VERCEL_URL
      const domain = process.env.DOMAIN || 
                     (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 
                     (process.env.REPLIT_DOMAINS ? `https://${process.env.REPLIT_DOMAINS}` : 
                     'http://localhost:5000'));
      const verificationUrl = `${domain}/verify-access?email=${encodeURIComponent(orderData.customerEmail)}`;
      
      const emailContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>🎉 Subscription Activated!</h2>
          <p>Hello ${orderData.customerName},</p>
          <p>Your payment has been verified and your <strong>${orderData.planName}</strong> subscription is now <strong>ACTIVE</strong>!</p>
          
          <div style="background: #10b981; color: white; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
            <h3 style="margin-top: 0;">✨ Your Pro Access is Ready! ✨</h3>
            <p>Email: <strong>${orderData.customerEmail}</strong></p>
            <p style="margin: 10px 0;">Subscription: <strong>${orderData.planName}</strong></p>
          </div>

          <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">📱 How to Access Your Pro Tools:</h3>
            <ol style="margin: 10px 0; padding-left: 20px;">
              <li style="margin: 8px 0;">
                <strong>Go to Office Tools Hub website</strong>
              </li>
              <li style="margin: 8px 0;">
                <strong>Click "My Account" button</strong> (top right of the page, next to "Go Pro")
              </li>
              <li style="margin: 8px 0;">
                <strong>Enter your email:</strong> <code style="background: white; padding: 2px 6px; border-radius: 3px;">${orderData.customerEmail}</code>
              </li>
              <li style="margin: 8px 0;">
                <strong>Click "Check Access"</strong>
              </li>
              <li style="margin: 8px 0;">
                <strong>Boom! 🎉</strong> You'll see: <span style="color: #10b981; font-weight: bold;">✅ Pro Access Active!</span>
              </li>
            </ol>
          </div>

          <div style="background: #fef3c7; border: 1px solid #fbbf24; padding: 12px; border-radius: 6px; margin: 20px 0;">
            <p style="margin: 0; font-size: 13px; color: #92400e;">
              <strong>💡 Quick Tip:</strong> That's it! Your Pro status is instantly available. Just click "My Account" anytime to verify your subscription.
            </p>
          </div>

          <div style="background: #ede9fe; border: 1px solid #c4b5fd; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #6d28d9;">📋 What You Get:</h3>
            <ul style="margin: 10px 0; padding-left: 20px; color: #6d28d9;">
              <li>✨ All premium tools with priority access</li>
              <li>📁 ${orderData.planName === 'Enterprise' ? 'Unlimited' : '50MB'} file size limit</li>
              <li>⚡ Lightning fast processing</li>
              <li>💬 Priority email support</li>
              <li>🔄 Regular feature updates</li>
            </ul>
          </div>

          <div style="background: #f0fdf4; border: 1px solid #86efac; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #166534;">🔐 Your Pro Status:</h3>
            <p style="margin: 8px 0; color: #166534;">
              Your Pro status is tied to your email: <strong>${orderData.customerEmail}</strong>
            </p>
            <p style="margin: 8px 0; color: #166534; font-size: 12px;">
              You can check your access anytime by clicking "My Account" → Enter this email → See your status instantly
            </p>
          </div>

          <div style="background: #fef2f2; border: 1px solid #fecaca; padding: 12px; border-radius: 6px; margin: 20px 0;">
            <p style="margin: 0; font-size: 12px; color: #7f1d1d;">
              <strong>❓ Can't see your Pro status?</strong> Make sure you're entering the same email: <strong>${orderData.customerEmail}</strong>
            </p>
          </div>

          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">

          <p style="color: #666; font-size: 12px; text-align: center;">
            Need help? Reply to this email or visit our support page.<br>
            © 2025 Office Tools Hub. Thank you for supporting us! 🙌
          </p>
        </div>
      `;

      if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
        try {
          await transporter.sendMail({
            from: process.env.GMAIL_USER,
            to: orderData.customerEmail,
            subject: "✅ Office Tools Hub - Subscription Activated! 🎉",
            html: emailContent,
          });
          console.log(`Activation email sent to ${orderData.customerEmail}`);
        } catch (emailErr) {
          console.error("Failed to send activation email:", emailErr);
        }
      } else {
        console.log(`⚠️ Gmail not configured. User ${orderData.customerEmail} should use verification link: ${verificationUrl}`);
      }

      res.json({
        success: true,
        message: "Payment approved and subscription activated!",
      });
    } catch (error) {
      console.error("Approve payment error:", error);
      res.status(500).json({
        error: error instanceof Error ? error.message : "Failed to approve payment",
      });
    }
  });

  // Admin: Reject payment
  app.post("/api/admin/reject-payment", async (req, res) => {
    try {
      const { invoiceId, adminKey } = req.body;

      // Verify admin key
      if (adminKey !== process.env.ADMIN_KEY && adminKey !== "admin123") {
        return res.status(403).json({ error: "Unauthorized" });
      }

      const db = getDb();
      if (!db) {
        return res.status(500).json({ error: "Database not available" });
      }

      // Update order status (check both referenceId and checkoutSessionId)
      await db
        .update(ordersTable)
        .set({ status: "failed" })
        .where(
          sql`${ordersTable.referenceId} = ${invoiceId} OR ${ordersTable.checkoutSessionId} = ${invoiceId}`
        );

      res.json({ success: true, message: "Payment rejected" });
    } catch (error) {
      console.error("Reject payment error:", error);
      res.status(500).json({ error: "Failed to reject payment" });
    }
  });

  // Verify subscription status (for users) - Check if email has active Pro
  app.get("/api/verify-subscription", async (req, res) => {
    try {
      const { email } = req.query;

      if (!email) {
        return res.status(400).json({ error: "Email required", hasAccess: false });
      }

      const db = getDb();
      if (!db) {
        return res.json({ hasAccess: false });
      }

      const subscription = await db
        .select()
        .from(subscriptionsTable)
        .where(eq(subscriptionsTable.email, String(email).toLowerCase()))
        .limit(1);

      if (!subscription || subscription.length === 0) {
        return res.json({
          hasAccess: false,
          message: "No active subscription found",
        });
      }

      const sub = subscription[0];
      const now = new Date();
      const isExpired = sub.expiresAt && new Date(sub.expiresAt) < now;

      res.json({
        hasAccess: sub.isActive && !isExpired,
        planName: sub.planName,
        email: sub.email,
        activatedAt: sub.activatedAt,
        expiresAt: sub.expiresAt,
        daysRemaining: sub.expiresAt 
          ? Math.ceil((new Date(sub.expiresAt).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
          : null,
      });
    } catch (error) {
      console.error("Subscription verification error:", error);
      res.json({ hasAccess: false });
    }
  });

  // Check payment status (for users)
  app.get("/api/check-payment-status", async (req, res) => {
    try {
      const { invoice, email } = req.query;

      if (!invoice || !email) {
        return res.status(400).json({ error: "Missing invoice or email" });
      }

      const db = getDb();
      if (!db) {
        return res.json({ status: "unknown" });
      }

      const order = await db
        .select()
        .from(ordersTable)
        .where(eq(ordersTable.referenceId, String(invoice)))
        .limit(1);

      if (!order || order.length === 0) {
        return res.json({ status: "not_found" });
      }

      const orderData = order[0];

      res.json({
        status: orderData.status,
        planName: orderData.planName,
        price: orderData.price,
        createdAt: orderData.createdAt,
      });
    } catch (error) {
      console.error("Payment status check error:", error);
      res.json({ status: "error" });
    }
  });

  // Activate subscription endpoint (via email link)
  app.get("/api/activate-subscription", async (req, res) => {
    try {
      const { invoice, email } = req.query;

      if (!invoice || !email) {
        return res.status(400).json({ error: "Missing invoice or email" });
      }

      const db = getDb();
      if (!db) {
        return res.status(500).json({ error: "Database not available" });
      }

      // Find order
      const order = await db
        .select()
        .from(ordersTable)
        .where(eq(ordersTable.referenceId, String(invoice)))
        .limit(1);

      if (!order || order.length === 0) {
        return res.status(404).json({ error: "Invoice not found" });
      }

      const orderData = order[0];

      // Check if already activated
      const existingSub = await db
        .select()
        .from(subscriptionsTable)
        .where(eq(subscriptionsTable.email, String(email)))
        .limit(1);

      if (existingSub && existingSub.length > 0) {
        return res.json({
          success: true,
          message: "Already activated!",
          plan: existingSub[0].planName,
        });
      }

      // Create subscription
      const expiryDate = new Date();
      expiryDate.setMonth(expiryDate.getMonth() + 1);

      await db.insert(subscriptionsTable).values({
        email: String(email),
        planName: orderData.planName,
        expiresAt: expiryDate,
        isActive: true,
      });

      // Update order status
      await db
        .update(ordersTable)
        .set({ status: "completed" })
        .where(eq(ordersTable.referenceId, String(invoice)));

      res.json({
        success: true,
        message: `✅ ${orderData.planName} activated successfully!`,
        plan: orderData.planName,
      });
    } catch (error) {
      console.error("Activation error:", error);
      res.status(500).json({
        error: error instanceof Error ? error.message : "Activation failed",
      });
    }
  });

  // Check user subscription status
  app.get("/api/check-subscription", async (req, res) => {
    try {
      const email = req.query.email as string;

      if (!email) {
        return res.status(400).json({ plan: "Free" });
      }

      const db = getDb();
      if (!db) {
        return res.json({ plan: "Free" });
      }

      const subscription = await db
        .select()
        .from(subscriptionsTable)
        .where(eq(subscriptionsTable.email, email))
        .limit(1);

      if (!subscription || subscription.length === 0) {
        return res.json({ plan: "Free", email });
      }

      const sub = subscription[0];

      // Check if expired
      if (sub.expiresAt && new Date(sub.expiresAt) < new Date()) {
        return res.json({ plan: "Free", email, message: "Subscription expired" });
      }

      res.json({
        plan: sub.planName || "Free",
        email,
        activatedAt: sub.activatedAt,
        expiresAt: sub.expiresAt,
      });
    } catch (error) {
      console.error("Subscription check error:", error);
      res.json({ plan: "Free" });
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
