import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import pdfParse from 'pdf-parse';
import { parse } from 'csv-parse/sync';
import { FileUtils } from '../libs/fileUtils';

const downloadDir = path.resolve(__dirname, '../downloads');

test('Download and validate customers CSV content', async ({ browser }) => {
    const expectedHeaders = [
        'Index', 'Customer Id', 'First Name', 'Last Name',
        'Company', 'City', 'Country', 'Phone 1',
        'Phone 2', 'Email', 'Subscription Date', 'Website'
    ];

    const downloadDir = path.resolve(__dirname, '../downloads');
    const context = await browser.newContext({ acceptDownloads: true });
    const page = await context.newPage();
  
    await page.goto('https://practice.expandtesting.com/download');
  
    // Intercept the download
    // const [download] = await Promise.all([
    //     page.waitForEvent('download'),
    //     page.click('a[href*="1746536459724_customers-100.csv"]')
    // ]);
  
    // const filePath = path.join(downloadDir, await download.suggestedFilename());
    // await download.saveAs(filePath);

    const filePath = await FileUtils.downloadWithRetry(
        page,
        'a[href*="1746536459724_customers-100.csv"]',
        downloadDir
    );
  
    console.log(`✅ CSV downloaded to: ${filePath}`);
  
    // Read the file and parse it
    // const fileContent = fs.readFileSync(filePath, 'utf-8');
    // const records = parse(fileContent, {
    //     columns: true,
    //     skip_empty_lines: true,
    // });

    const records = FileUtils.parseCSV(filePath);
  
    console.log(`📄 Parsed ${records.length} data rows`);
    console.table([records[0]]);
  
    // ✅ Validation
    const actualHeaders = Object.keys(records[0]);
    console.log('🔍 Actual Headers:', actualHeaders);
    expect(actualHeaders).toEqual(expectedHeaders);

    expect(records.length).toBe(100);
  
    console.log('✅ CSV content validated successfully.');
});

test('Download and validate resume PDF content', async ({ browser }) => {
    const context = await browser.newContext({ acceptDownloads: true });
    const page = await context.newPage();
  
    // Go to the download page
    await page.goto('https://practice.expandtesting.com/download');
  
    // Trigger download
    const downloadPromise = page.waitForEvent('download');
    await page.click('a[href*="1746542927124_resume.pdf"]');
    const download = await downloadPromise;
  
    // Ensure download directory exists
    if (!fs.existsSync(downloadDir)) {
      fs.mkdirSync(downloadDir, { recursive: true });
    }
  
    // const filePath = path.join(downloadDir, download.suggestedFilename());
    // await download.saveAs(filePath);
    const filePath = await FileUtils.downloadWithRetry(
        page,
        'a[href*="1746542927124_resume.pdf"]',
        downloadDir
    );
    
  
    console.log(`✅ File downloaded to: ${filePath}`);
  
    // Read and validate PDF contents
    const fileBuffer = fs.readFileSync(filePath);
    const pdfData = await pdfParse(fileBuffer);

    console.log('✅ PDF page count:', pdfData.numpages);
    console.log('📄 Extracted PDF Text:\n', pdfData.text);  
    // console.log('\n📄 Extracted PDF Text:\n', pdfData.text.slice(0, 300));
  
    expect(pdfData.text).toContain('Suriya');
    expect(pdfData.text).toContain('sales professional');
    expect(pdfData.numpages).toBeGreaterThan(0);
});
