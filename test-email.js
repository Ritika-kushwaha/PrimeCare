const nodemailer = require('nodemailer');
require('dotenv').config();

const user = (process.env.SMTP_USER || 'ritikakushwaha62@gmail.com').trim();
const pass = (process.env.SMTP_PASS || '').replace(/\s+/g, '');

console.log('Testing connection with:');
console.log('User:', user);
console.log('Pass length:', pass.length);

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { user, pass }
});

transporter.verify((error, success) => {
  if (error) {
    console.error('\n❌ GMAIL CONNECTION FAILED:');
    console.error(error.message);
    if (error.message.includes('535')) {
      console.log('\n👉 Reason: Google rejected your password.');
      console.log('You must generate a 16-character App Password at: https://myaccount.google.com/apppasswords');
    }
  } else {
    console.log('\n✅ GMAIL CONNECTION SUCCESSFUL! Sending test email...');
    transporter.sendMail({
      from: `"PrimeCare" <${user}>`,
      to: 'ritikakushwaha62@gmail.com',
      subject: 'PrimeCare Real Email Test',
      text: 'If you see this, your Gmail SMTP is working perfectly!'
    }, (err, info) => {
      if (err) console.error('Send error:', err);
      else console.log('🎉 Email delivered! Message ID:', info.messageId);
    });
  }
});
