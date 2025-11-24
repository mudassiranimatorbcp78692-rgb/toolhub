import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import path from "path";
import { fileURLToPath } from "url";
import nodemailer from "nodemailer";

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

  // Sitemap.xml route
  app.get("/sitemap.xml", (req, res) => {
    const baseUrl = "https://officetoolshub.com";
    const tools = [
      "pdf-to-jpg", "jpg-to-pdf", "pdf-merge", "pdf-split", "pdf-compress", 
      "pdf-rotate", "pdf-protect", "image-compress", "image-resize", "image-crop",
      "image-converter", "image-color-picker", "image-enhance", "word-counter",
      "case-converter", "remove-duplicates", "lorem-ipsum", "grammar-checker",
      "qr-code", "barcode", "password", "username", "html-to-pdf", "image-to-text",
      "percentage-calculator", "loan-calculator", "gpa-calculator", "zakat-calculator"
    ];

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/tools</loc>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${baseUrl}/templates</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${baseUrl}/pricing</loc>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>${baseUrl}/contact</loc>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
  ${tools.map(tool => `  <url>
    <loc>${baseUrl}/tool/${tool}</loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`).join('\n')}
</urlset>`;

    res.header('Content-Type', 'application/xml');
    res.send(sitemap);
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

  const httpServer = createServer(app);
  return httpServer;
}
