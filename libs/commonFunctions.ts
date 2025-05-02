import { Page, errors, expect } from '@playwright/test';
import path from 'path';
import nodemailer from 'nodemailer';
import imaps from 'imap-simple';
import sgMail from '@sendgrid/mail';

export class CommonFunctions {
    private page: Page;
    private defaultTimeout: number;

    constructor(page: Page) {
        this.page = page;
        this.defaultTimeout = 60_000;
    }

    // UI example function
    async goToUrl(url: string) {
        try {
            await this.page.goto(url, { waitUntil: 'networkidle' });
            console.log(`\nNavigate to web url: ${url}`);
        } catch (error) {
            console.log(`\nError occurred while navigating to web url: ${url}`);
            throw new Error(`${error}`);
        }
    }

    // Email: Send an email using Gmail SMTP
    async sendEmail(from: string, to: string, subject: string, text: string, password: string) {
        try {
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: from,
                    pass: password,
                },
            });

            await transporter.sendMail({
                from,
                to,
                subject,
                text,
            });

            console.log(`\nEmail sent successfully from ${from} to ${to} with subject: "${subject}"`);
        } catch (error) {
            console.error(`\nError occurred while sending email from ${from} to ${to}`);
            throw new Error(`${error}`);
        }
    }

    async sendEmailFromSendgrid(from: string, to: string, subject: string, text: string, html?: string) {
        try {
            sgMail.setApiKey(process.env.SENDGRID_API_KEY!);
            const msg = {
                to,
                from, // must be the verified sender
                subject,
                text,
                html: html || `<p>${text}</p>`,
            };
    
            await sgMail.send(msg);
            console.log(`\n✅ Email sent successfully from ${from} to ${to}`);
        } catch (error: any) {
            console.error(`\n❌ Failed to send email from ${from} to ${to}`);
            console.error(error?.response?.body || error);
            throw new Error(`SendGrid email failed: ${error.message}`);
        }
    }
    
    // Email: Read latest unread email from Gmail
    async readLatestEmail(email: string, password: string, subjectFilter?: string): Promise<string | null> {
        const imaps = require('imap-simple');
        const config = {
            imap: {
                user: email,
                password: password,
                host: 'imap.gmail.com',
                port: 993,
                tls: true,
                tlsOptions: { rejectUnauthorized: false }
            },
        };
    
        const timeout = 45000; // 45 seconds
        const pollInterval = 5000;
        const maxAttempts = Math.ceil(timeout / pollInterval);
        let attempt = 0;
    
        try {
            const connection = await imaps.connect(config);
            await connection.openBox('INBOX');
    
            while (attempt < maxAttempts) {
                console.log(`🔄 Checking inbox for "${subjectFilter}" (Attempt ${attempt + 1}/${maxAttempts})`);
    
                const searchCriteria = ['UNSEEN'];
                const fetchOptions = {
                    bodies: ['HEADER.FIELDS (FROM TO SUBJECT DATE)', 'TEXT'],
                    markSeen: true,
                };
    
                const results = await connection.search(searchCriteria, fetchOptions);
    
                if (results.length > 0) {
                    for (const res of results) {
                        const headerPart = res.parts.find(p => p.which === 'HEADER.FIELDS (FROM TO SUBJECT DATE)');
                        const bodyPart = res.parts.find(p => p.which === 'TEXT');
    
                        const subject = headerPart?.body.subject?.[0] || '(No Subject)';
                        const from = headerPart?.body.from?.[0] || '(No From)';
                        const to = headerPart?.body.to?.[0] || '(No To)';
                        const date = headerPart?.body.date?.[0] || '(No Date)';
                        const body = bodyPart?.body?.toString() || '(No Body)';
    
                        if (!subjectFilter || subject.includes(subjectFilter)) {
                            console.log(`\n📨 Email Matched!`);
                            console.log(`----------------------------------`);
                            console.log(`📅 Date   : ${date}`);
                            console.log(`📤 From   : ${from}`);
                            console.log(`📥 To     : ${to}`);
                            console.log(`📝 Subject: ${subject}`);
                            console.log(`🧾 Body   :\n${body}`);
                            console.log(`----------------------------------\n`);
                            console.log(res);
                            console.log(`----------------------------------\n`);
                            return body;
                        } else {
                            console.log(`📧 Ignoring email with unmatched subject: "${subject}"`);
                        }
                    }
                } else {
                    console.log(`📭 No unseen emails found.`);
                }
    
                await new Promise(res => setTimeout(res, pollInterval));
                attempt++;
            }
    
            console.warn(`❌ Timed out after ${timeout / 1000}s. No email received matching subject: "${subjectFilter}"`);
            return null;
        } catch (error) {
            console.error(`\n🚨 Error occurred while reading email for ${email}`);
            throw new Error(`${error}`);
        }
    }
}
