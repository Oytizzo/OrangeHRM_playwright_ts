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

    private async delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
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

    private createGmailTransporter(user: string, pass: string) {
        return nodemailer.createTransport({
            service: 'gmail',
            auth: { user, pass },
        });
    }

    // ===============================================================================
    private async connectToEmail(email: string, password: string) {
        const config = {
            imap: {
                user: email,
                password: password,
                host: 'imap.gmail.com',
                port: 993,
                tls: true,
                tlsOptions: { rejectUnauthorized: false }
            }
        };
        return imaps.connect(config);

    }

    private async searchEmailsSince(connection: imaps.ImapSimple, sinceTime: Date) {
        await connection.openBox('INBOX');
        const searchCriteria = ['ALL', ['SINCE', sinceTime.toUTCString()]];
        const fetchOptions = {
            bodies: ['HEADER.FIELDS (FROM TO SUBJECT DATE)', 'TEXT'],
            markSeen: true
        };
        return connection.search(searchCriteria, fetchOptions);
    }

    private extractEmailContent(result: any) {
        const header = result.parts.find((p: any) => p.which === 'HEADER.FIELDS (FROM TO SUBJECT DATE)');
        const body = result.parts.find((p: any) => p.which === 'TEXT');

        return {
            subject: header?.body.subject?.[0] || '',
            from: header?.body.from?.[0],
            to: header?.body.to?.[0],
            date: header?.body.date?.[0],
            bodyText: body?.body?.toString() || '',
            uid: result.attributes.uid
        };
    }

    private async moveEmailToTrash(connection: imaps.ImapSimple, uid: number) {
        await connection.moveMessage(uid, '[Gmail]/Trash');
    }


    public async readLatestEmail(email: string, password: string, subjectFilter: string, bodyFilter: string, afterTime: Date, maxAttempts: number = 5, delayMs: number = 5000): Promise<string | null>  {
        try {
            let attempt = 0;
            const connection = await this.connectToEmail(email, password);

            while (attempt < maxAttempts) {
                attempt++;
                console.log(`\n🔁 Attempt ${attempt}/${maxAttempts} to read email...`);

                const results = await this.searchEmailsSince(connection, afterTime);
                for (const res of results) {
                    const content = this.extractEmailContent(res);
    
                    if (content.subject.includes(subjectFilter) && content.bodyText.includes(bodyFilter)) {
                        // console.log(`\n📩 Email Found:
                        //     Subject: ${content.subject}
                        //     Date: ${content.date}
                        //     From: ${content.from}
                        //     To: ${content.to}
                        //     Body (partial): ${content.bodyText.substring(0, 200)}...
                        // `);
                        console.log(`\n📨 Email Matched!`);
                        console.log(`----------------------------------`);
                        console.log(`📅 Date   : ${content.date}`);
                        console.log(`📤 From   : ${content.from}`);
                        console.log(`📥 To     : ${content.to}`);
                        console.log(`📝 Subject: ${content.subject}`);
                        console.log(`🧾 Body   :\n${content.bodyText.substring(0, 200)}`);
                        console.log(`----------------------------------\n`);
                        // console.log(res);
                        // console.log(`----------------------------------\n`);
                        await this.moveEmailToTrash(connection, content.uid);
                        return content.bodyText;
                    }
                }
            }

            if (attempt < maxAttempts) {
                await this.delay(delayMs);
            }

            console.log(`\n❌ No matching email found in ${email} with subject: "${subjectFilter}" and body containing: "${bodyFilter}"`);
            return null;
        } catch (error) {
            console.error(`\nError occurred while reading email for ${email}`);
            throw new Error(`${error}`);
        }
    }

    // Email: Send an email using Gmail SMTP
    async sendEmailViaGmail(from: string, to: string, subject: string, text: string, appPassword: string) {
        try {
            const transporter = this.createGmailTransporter(from, appPassword);

            await transporter.sendMail({from, to, subject, text});

            console.log(`\nEmail sent successfully from ${from} to ${to} with subject: "${subject}"`);
        } catch (error) {
            console.error(`\nError occurred while sending email from ${from} to ${to}`);
            throw new Error(`${error}`);
        }
    }

    async sendEmailViaSendGrid(from: string, to: string, subject: string, text: string, html?: string) {
        try {
            sgMail.setApiKey(process.env.SENDGRID_API_KEY!);
            await sgMail.send({
                to,
                from, // must be the verified sender
                subject,
                text,
                html: html || `<p>${text}</p>`,
            });

            console.log(`\n✅ Email sent successfully from ${from} to ${to}`);
        } catch (error: any) {
            console.error(`\n❌ Failed to send email from ${from} to ${to}`);
            console.error(error?.response?.body || error);
            throw new Error(`SendGrid email failed: ${error.message}`);
        }
    }
    
    // Email: Read latest unread email from Gmail
    // async readLatestEmail(email: string, password: string, subjectFilter?: string): Promise<string | null> {
    //     const imaps = require('imap-simple');
    //     const config = {
    //         imap: {
    //             user: email,
    //             password: password,
    //             host: 'imap.gmail.com',
    //             port: 993,
    //             tls: true,
    //             tlsOptions: { rejectUnauthorized: false }
    //         },
    //     };
    
    //     const timeout = 45000; // 45 seconds
    //     const pollInterval = 5000;
    //     const maxAttempts = Math.ceil(timeout / pollInterval);
    //     let attempt = 0;
    
    //     try {
    //         const connection = await imaps.connect(config);
    //         await connection.openBox('INBOX');
    
    //         while (attempt < maxAttempts) {
    //             console.log(`🔄 Checking inbox for "${subjectFilter}" (Attempt ${attempt + 1}/${maxAttempts})`);
    
    //             const searchCriteria = ['UNSEEN'];
    //             const fetchOptions = {
    //                 bodies: ['HEADER.FIELDS (FROM TO SUBJECT DATE)', 'TEXT'],
    //                 markSeen: true,
    //             };
    
    //             const results = await connection.search(searchCriteria, fetchOptions);
    
    //             if (results.length > 0) {
    //                 for (const res of results) {
    //                     const headerPart = res.parts.find(p => p.which === 'HEADER.FIELDS (FROM TO SUBJECT DATE)');
    //                     const bodyPart = res.parts.find(p => p.which === 'TEXT');
    
    //                     const subject = headerPart?.body.subject?.[0] || '(No Subject)';
    //                     const from = headerPart?.body.from?.[0] || '(No From)';
    //                     const to = headerPart?.body.to?.[0] || '(No To)';
    //                     const date = headerPart?.body.date?.[0] || '(No Date)';
    //                     const body = bodyPart?.body?.toString() || '(No Body)';
    
    //                     if (!subjectFilter || subject.includes(subjectFilter)) {
    //                         console.log(`\n📨 Email Matched!`);
    //                         console.log(`----------------------------------`);
    //                         console.log(`📅 Date   : ${date}`);
    //                         console.log(`📤 From   : ${from}`);
    //                         console.log(`📥 To     : ${to}`);
    //                         console.log(`📝 Subject: ${subject}`);
    //                         console.log(`🧾 Body   :\n${body}`);
    //                         console.log(`----------------------------------\n`);
    //                         console.log(res);
    //                         console.log(`----------------------------------\n`);
    //                         return body;
    //                     } else {
    //                         console.log(`📧 Ignoring email with unmatched subject: "${subject}"`);
    //                     }
    //                 }
    //             } else {
    //                 console.log(`📭 No unseen emails found.`);
    //             }
    
    //             await new Promise(res => setTimeout(res, pollInterval));
    //             attempt++;
    //         }
    
    //         console.warn(`❌ Timed out after ${timeout / 1000}s. No email received matching subject: "${subjectFilter}"`);
    //         return null;
    //     } catch (error) {
    //         console.error(`\n🚨 Error occurred while reading email for ${email}`);
    //         throw new Error(`${error}`);
    //     }
    // }
}
