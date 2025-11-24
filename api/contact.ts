import type { VercelRequest, VercelResponse } from '@vercel/node';
import nodemailer from 'nodemailer';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, email, subject, message } = req.body;

  if (!name || !email || !subject || !message) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

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

    res.status(200).json({ 
      success: true, 
      message: "Message sent successfully! We'll get back to you soon.",
    });
  } catch (error) {
    console.error("Failed to send contact email:", error);
    res.status(500).json({ 
      error: "Failed to send message. Please try again later.",
    });
  }
}
