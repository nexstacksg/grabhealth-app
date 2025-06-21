const nodemailer = require('nodemailer');
require('dotenv').config();

// Test SMTP connection
async function testSMTP() {
  console.log('Testing SMTP configuration...\n');
  console.log('SMTP_HOST:', process.env.SMTP_HOST);
  console.log('SMTP_PORT:', process.env.SMTP_PORT);
  console.log('SMTP_USER:', process.env.SMTP_USER);
  console.log('SMTP_PASS:', process.env.SMTP_PASS ? '***hidden***' : 'NOT SET');
  
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    debug: true, // Enable debug output
    logger: true // Enable logger
  });

  try {
    // Verify connection
    console.log('\nVerifying SMTP connection...');
    await transporter.verify();
    console.log('✅ SMTP connection successful!');
    
    // Try sending a test email
    console.log('\nSending test email...');
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || 'test@example.com',
      to: 'test@example.com',
      subject: 'SMTP Test',
      text: 'This is a test email',
      html: '<p>This is a test email</p>'
    });
    
    console.log('✅ Email sent successfully!');
    console.log('Message ID:', info.messageId);
  } catch (error) {
    console.error('❌ SMTP Error:', error.message);
    console.error('Full error:', error);
  }
}

testSMTP();