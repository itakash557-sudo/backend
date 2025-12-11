const express = require('express');
const cors = require('cors');
require('dotenv').config();
const nodemailer = require('nodemailer');
const path = require('path');

const app = express();

// Allow requests from your website
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Gmail Setup
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Check if email is working
transporter.verify((error, success) => {
  if (error) {
    console.log('❌ Email Error:', error);
  } else {
    console.log('✅ Email is ready to send!');
  }
});

// Route: Send Email
app.post('/api/send-email', async (req, res) => {
  const { name, email, message, subject } = req.body;

  // Check if fields are filled
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Fill all fields please' });
  }

  try {
    // Email 1: Send to YOUR inbox
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: `New Message from ${name}`,
      html: `
        <h2>📧 New Contact Form Message</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Subject:</strong> ${subject || 'No subject'}</p>
        <hr>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `,
    });

    // Email 2: Send confirmation to VISITOR
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: '✅ I received your message!',
      html: `
        <h2>Thank you ${name}! 🎉</h2>
        <p>I got your message and will reply soon.</p>
        <p><strong>Your message:</strong></p>
        <p>${message}</p>
      `,
    });

    res.status(200).json({ success: true, message: 'Email sent!' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to send email' });
  }
});

// Test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'Server is working!' });
});

// Start server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`
  ✅ Server running on http://localhost:${PORT}
  `);
});