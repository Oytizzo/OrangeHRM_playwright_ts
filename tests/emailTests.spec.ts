import { test, expect } from '@playwright/test';
import { CommonFunctions } from '../libs/commonFunctions';
import dotenv from 'dotenv';

dotenv.config();

test('Send and read Gmail email', async ({ page }) => {
  const common = new CommonFunctions(page);

  const from = process.env.SENDER_EMAIL;
  const to = process.env.RECEIVER_EMAIL;
  const subject = 'Playwright Email Test 777';
  const text = 'This is a test email sent by automation 7777.';
  const fromPassword = process.env.SENDER_PASS; // Use Gmail App Password
  const receiverPassword = process.env.RECEIVER_PASS;

  if (!from || !to || !fromPassword || !receiverPassword) {
    throw new Error('❌ Missing required environment variables.');
  }

  // Capture current time just before sending email
  const sentTime = new Date();
  try {
    await common.sendEmailViaGmail(from, to, subject, text, fromPassword);
    console.log('✅ Email sent successfully.');
  } catch (error) {
    console.error('❌ Email send test failed.');
    throw error;
  }

  try {
    const body = await common.readLatestEmail(to, receiverPassword, 'Email Test', 'test email', sentTime, 5, 3000);
    expect(body).toContain('test email sent by automation');
    console.log('✅ Email read and verified successfully.');
  } catch (error) {
    console.error('❌ Email read test failed.');
    throw error;
  }
});
