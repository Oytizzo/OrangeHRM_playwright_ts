import fs from 'fs';
import path from 'path';
import pdfParse from 'pdf-parse';
import extract from 'extract-zip';
import csvParser from 'csv-parser';
import { parse } from 'csv-parse/sync';
import { Page } from '@playwright/test';

export class FileUtils {

    static ensureDownloadDir(folderName: string = 'downloads'): string {
        const dirPath = path.resolve(folderName);
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
        }
        return dirPath;
    }

    static cleanDownloads(folderName: string): void {
        const dirPath = path.resolve(folderName);
        if (fs.existsSync(dirPath)) {
            fs.readdirSync(dirPath).forEach(file => {
                fs.unlinkSync(path.join(dirPath, file));
            });
        }
    }

    static async extractZip(zipPath: string, extractToFolder: string = 'downloads'): Promise<string[]> {
        const targetDir = path.resolve(extractToFolder);
        await extract(zipPath, { dir: targetDir });
        const allFiles = fs.readdirSync(targetDir).filter(file => file !== path.basename(zipPath));
        console.log(`✅ ZIP extracted to: ${targetDir}`);
        return allFiles;
    }


    static parseCSV(filePath: string): any[] {
        try {
            const content = fs.readFileSync(filePath, 'utf8');
            const records = parse(content, {
                columns: true,
                skip_empty_lines: true,
            });
            console.log(`✅ CSV file parsed successfully: ${filePath}`);
            return records;
        } catch (error) {
            console.error(`❌ Failed to parse CSV file: ${filePath}`);
            throw error;
        }
    }

    static async parseCSVStream(filePath: string): Promise<any[]> {
        const results: any[] = [];
        return new Promise((resolve, reject) => {
            fs.createReadStream(filePath)
                .pipe(csvParser())
                .on('data', data => results.push(data))
                .on('end', () => resolve(results))
                .on('error', error => reject(error));
        });
    }

    static async extractPdfText(filePath: string): Promise<string> {
        try {
            const fileBuffer = fs.readFileSync(filePath);
            const data = await pdfParse(fileBuffer);
            console.log(`✅ PDF text extracted: ${filePath}`);
            return data.text;
        } catch (error) {
            console.error(`❌ Failed to extract PDF: ${filePath}`);
            throw error;
        }
    }

    static validateCsvHeaders(records: any[], expectedHeaders: string[]): void {
        if (!records.length) throw new Error('CSV has no records');
        const actualHeaders = Object.keys(records[0]);
        for (const header of expectedHeaders) {
            if (!actualHeaders.includes(header)) {
                throw new Error(`Missing expected header: ${header}`);
            }
        }
        console.log('✅ CSV headers validated successfully.');
    }

    static validatePdfContains(content: string, expectedText: string): void {
        if (!content.includes(expectedText)) {
            throw new Error(`PDF does not contain expected text: "${expectedText}"`);
        }
        console.log('✅ PDF content validated successfully.');
    }

    static async downloadWithRetry(page: Page, selector: string, downloadDir: string, maxAttempts = 3): Promise<string> {
        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            try {
                console.log(`🔄 Attempt ${attempt}: Triggering download for ${selector}`);
                const [download] = await Promise.all([
                    page.waitForEvent('download'),
                    page.click(selector),
                ]);
                const suggestedFileName = await download.suggestedFilename();
                const filePath = path.join(downloadDir, suggestedFileName);
                await download.saveAs(filePath);
                console.log(`✅ File downloaded to: ${filePath}`);
                return filePath;
            } catch (error) {
                console.error(`⚠️ Download attempt ${attempt} failed: ${error}`);
                if (attempt === maxAttempts) {
                    throw new Error(`❌ Failed to download file after ${maxAttempts} attempts`);
                }
            }
        }
        throw new Error('Unexpected download failure');
    }
}
