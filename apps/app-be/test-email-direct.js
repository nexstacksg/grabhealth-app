const nodemailer = require('nodemailer');
require('dotenv').config();

console.log('Testing email with configuration:');
console.log({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_SECURE === 'true',
  user: process.env.SMTP_USER ? process.env.SMTP_USER.substring(0, 3) + '***' : 'NOT SET',
  pass: process.env.SMTP_PASS ? '***' : 'NOT SET',
  from: process.env.EMAIL_FROM
});

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
  connectionTimeout: 5000,
  greetingTimeout: 5000,
  socketTimeout: 10000,
  debug: true, // Enable debug output
  logger: true // Enable logger
});

async function testEmail() {
  try {
    // Verify connection
    console.log('\nVerifying SMTP connection...');
    await transporter.verify();
    console.log('✅ SMTP connection verified successfully!');
    
    // Send test email
    console.log('\nSending test email...');
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || `"GrabHealth" <${process.env.SMTP_USER}>`,
      to: 'ken88ling@gmail.com',
      subject: 'GrabHealth Test Email',
      html: '<h1>Test Email</h1><p>If you receive this, email configuration is working!</p>'
    });
    
    console.log('✅ Email sent successfully!');
    console.log('Message ID:', info.messageId);
    console.log('Response:', info.response);
  } catch (error) {
    console.error('❌ Email test failed:', error.message);
    console.error('Full error:', error);
  }
}

testEmail();