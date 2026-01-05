// api/contact.ts - Vercel Serverless Function for Contact Form
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

// Validation functions
function validateName(name: string): boolean {
  if (!name || name.length < 1 || name.length > 100) return false;
  return /^[a-zA-Z\s\u0D80-\u0DFF\u0900-\u097F.-]+$/.test(name);
}

function validateEmail(email: string): boolean {
  if (!email || email.length > 254) return false;
  return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);
}

function validatePhone(phone: string): boolean {
  if (!phone || phone.length < 7 || phone.length > 20) return false;
  return /^[\d\s+()-]+$/.test(phone);
}

function sanitizeString(input: string): string {
  return input.trim().replace(/[<>]/g, '').substring(0, 1000);
}

// Rate limiting
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(identifier: string): boolean {
  const now = Date.now();
  const limit = rateLimitMap.get(identifier);

  if (!limit || now > limit.resetTime) {
    rateLimitMap.set(identifier, { count: 1, resetTime: now + 60000 });
    return true;
  }

  if (limit.count >= 5) return false;
  limit.count++;
  return true;
}

interface ContactData {
  name: string;
  email: string;
  phone: string;
  service: string;
  message: string;
}

export default async function handler(req: any, res: any) {
  // CORS
  const allowedOrigins = [
    'https://divgaze.com',
    'https://www.divgaze.com',
    'http://localhost:3000',
    'http://localhost:5173'
  ];

  const origin = req.headers.origin || '';
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Rate limiting
    const clientIp = req.headers['x-forwarded-for'] || req.connection?.remoteAddress || 'unknown';
    if (!checkRateLimit(clientIp)) {
      return res.status(429).json({ error: 'Too many requests. Please try again later.' });
    }

    const data: ContactData = req.body;

    // Validate
    if (!data.name || !validateName(data.name)) {
      return res.status(400).json({ error: 'Invalid name' });
    }
    if (!data.email || !validateEmail(data.email)) {
      return res.status(400).json({ error: 'Invalid email' });
    }
    if (!data.phone || !validatePhone(data.phone)) {
      return res.status(400).json({ error: 'Invalid phone number' });
    }
    if (!data.service) {
      return res.status(400).json({ error: 'Please select a service' });
    }
    if (!data.message || data.message.length < 10) {
      return res.status(400).json({ error: 'Message too short' });
    }

    // Sanitize
    const sanitizedData = {
      name: sanitizeString(data.name),
      email: data.email.toLowerCase().trim(),
      phone: sanitizeString(data.phone),
      service: sanitizeString(data.service),
      message: sanitizeString(data.message),
    };

    const timestamp = new Date().toLocaleString('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short',
      timeZone: 'Asia/Colombo'
    });

    // Email to Company
    await resend.emails.send({
      from: 'DivGaze Website <contact@divgaze.com>',
      to: process.env.COMPANY_EMAIL || 'divgaze@gmail.com',
      subject: `🔔 New Inquiry - ${sanitizedData.service}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #000; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
            .section { background: white; padding: 20px; margin: 15px 0; border-radius: 8px; border-left: 4px solid #000; }
            .label { font-weight: 600; color: #666; }
            .value { color: #333; margin-left: 10px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0;">🔔 New Client Inquiry</h1>
              <p style="margin: 10px 0 0 0; opacity: 0.9;">From Website Contact Form</p>
            </div>
            
            <div class="content">
              <div class="section">
                <h3 style="margin-top: 0;">Client Details</h3>
                <p><span class="label">Name:</span><span class="value">${sanitizedData.name}</span></p>
                <p><span class="label">Email:</span><span class="value"><a href="mailto:${sanitizedData.email}">${sanitizedData.email}</a></span></p>
                <p><span class="label">Phone:</span><span class="value"><a href="tel:${sanitizedData.phone}">${sanitizedData.phone}</a></span></p>
              </div>

              <div class="section">
                <h3 style="margin-top: 0;">Inquiry Details</h3>
                <p><span class="label">Service:</span><span class="value"><strong>${sanitizedData.service}</strong></span></p>
                <p><span class="label">Message:</span></p>
                <p style="background: #f0f0f0; padding: 15px; border-radius: 6px; font-style: italic;">"${sanitizedData.message}"</p>
              </div>

              <div class="section">
                <p><span class="label">Received:</span><span class="value">${timestamp}</span></p>
                <p><span class="label">Source:</span><span class="value">Website Contact Form</span></p>
              </div>

              <div style="text-align: center; margin-top: 20px;">
                <a href="mailto:${sanitizedData.email}?subject=Re: Your DivGaze Inquiry" 
                   style="display: inline-block; padding: 12px 24px; background: #000; color: white; text-decoration: none; border-radius: 6px;">
                  Reply to ${sanitizedData.name}
                </a>
              </div>
            </div>
          </div>
        </body>
        </html>
      `
    });

    // Confirmation email to client
    await resend.emails.send({
      from: 'DivGaze Team <contact@divgaze.com>',
      to: sanitizedData.email,
      subject: '✅ We received your message - DivGaze',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #000; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div style="font-size: 48px;">✅</div>
              <h1 style="margin: 10px 0 0 0;">Thank You!</h1>
              <p style="margin: 10px 0 0 0; opacity: 0.9;">We've received your message</p>
            </div>
            
            <div class="content">
              <p>Hi ${sanitizedData.name},</p>
              
              <p>Thank you for reaching out to DivGaze! We've received your inquiry about <strong>${sanitizedData.service}</strong>.</p>
              
              <p>Our team will review your message and get back to you within <strong>24 hours</strong>.</p>

              <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="margin-top: 0;">Your Message:</h3>
                <p><strong>Service:</strong> ${sanitizedData.service}</p>
                <p style="font-style: italic; color: #666;">"${sanitizedData.message}"</p>
              </div>

              <p>In the meantime, feel free to:</p>
              <ul>
                <li>Visit our website: <a href="https://divgaze.com">divgaze.com</a></li>
                <li>Email us directly: <a href="mailto:divgaze@gmail.com">divgaze@gmail.com</a></li>
              </ul>

              <p style="margin-top: 30px;">
                Best regards,<br>
                <strong>DivGaze Team</strong>
              </p>
            </div>
          </div>
        </body>
        </html>
      `
    });

    return res.status(200).json({ success: true, message: 'Message sent successfully' });

  } catch (error) {
    console.error('Contact form error:', error);
    return res.status(500).json({ error: 'Failed to send message. Please try again.' });
  }
}
