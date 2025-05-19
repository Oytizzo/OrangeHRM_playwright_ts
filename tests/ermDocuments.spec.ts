import { Page, test, expect, Locator } from '@playwright/test';
import extract from 'extract-zip';
import path from 'path';
import fs from 'fs';
import csv from 'csv-parser';
import pdf from 'pdf-parse';
import AdmZip from 'adm-zip';
import {FileUtils} from '../libs/fileUtils';
import {
  ensureDirectoryExists,
  extractZip,
  listExtractedFiles,
  parsePdfText,
  parseCsv,
  cleanDirectory,
  readFileByType
} from '../libs/utils';

async function login(page: Page) {
  console.log('🔐 Navigating to login page...');
  await page.goto('https://sbx-ereviewmanager.wcgclinical.com');

  console.log('✏️ Filling in username...');
  await page.locator('//input[@autocomplete="username"]').fill('NextGenTestUser1+test@wcgclinical.com');

  console.log('➡️ Clicking Next...');
  await page.click('//*[@value="Next"]');

  console.log('🔑 Filling in password...');
  await page.locator('//*[@name="credentials.passcode"]').fill('DogDogDog1234!');

  console.log('➡️ Clicking Verify...');
  await page.click('//*[@value="Verify"]');

  console.log('⏳ Waiting for login to complete...');
  await page.waitForTimeout(20000); // Consider using a smarter wait if needed

  console.log('✅ Verifying successful login...');
  await expect(page.locator('//*[@data-testid="welcome-title"]')).toHaveText('Welcome AutomationExt1');
  console.log('🎉 Login successful!');
}

async function triggerExport(page: Page, type: 'PDF' | 'CSV') {
  console.log(`📤 Triggering export process for type: ${type}`);

  console.log('🖱️ Clicking "Export All"...');
  await page.getByRole('button', { name: 'Export All' }).click();

  console.log(`📄 Selecting "Export as ${type}"...`);
  await page.getByRole('menuitem', { name: `Export as ${type}` }).click();

  console.log('📁 Navigating to Downloads and Exports...');
  await page.locator('//button[@data-testid="confirm-button"]').click();

  console.log(`✅ Export triggered and redirected to downloads.`);
}

export async function waitForDownloadReady(page: Page, maxRetries = 20, intervalMs = 5000): Promise<boolean> {
  const statusLocator = page.locator('//table/tbody/tr[1]/td[3]//p[@class="chip__label"]');
  const downloadLocator = page.locator('//table/tbody/tr[1]/td[1]//button[@title="download"][1]');

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    await page.reload();
    await page.waitForTimeout(1000); // Let page settle

    const statusText = await statusLocator.textContent().catch(() => null);
    const cleanText = statusText?.trim().toLowerCase();

    console.log(`Attempt ${attempt}: Status = "${cleanText}"`);

    if (cleanText === 'in progress') {
      console.log(`⏳ Still in progress, waiting ${intervalMs}ms...`);
      await page.waitForTimeout(intervalMs);
      continue;
    }

    if (cleanText === 'completed') {
      const count = await downloadLocator.count();
      if (count > 0) {
        console.log('✅ Completed and download button exists in DOM.');
        return true;
      } else {
        console.error('❌ Completed but download button NOT found in DOM.');
        return false;
      }
    }

    console.error(`⚠️ Unexpected status: "${statusText}"`);
    await page.waitForTimeout(intervalMs);
  }

  console.error('❌ Timeout: status never reached "Completed"');
  return false;
}

/**
 * Downloads the file from the first row of the table and saves it to the specified directory.
 * Logs key actions and returns file details.
 * 
 * @param page - Playwright Page instance
 * @param downloadsDir - Absolute path to downloads folder
 * @returns Object containing fileName, filePath, and fileType
 */
export async function downloadFirstRowFile(page: Page, downloadsDir: string): Promise<{
  fileName: string;
  filePath: string;
  fileType: string;
}> {
  console.log('📄 Locating first row in the table...');
  const firstRow = page.locator('table tbody tr').first();
  const downloadButton = firstRow.locator('xpath=.//button[@title="download"]');

  console.log('⬇️ Waiting for download to start...');
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    downloadButton.click()
  ]);

  const fileName = download.suggestedFilename();
  const filePath = path.join(downloadsDir, fileName);
  const fileType = path.extname(fileName).replace('.', ''); // e.g., 'zip', 'pdf', 'csv'

  console.log(`💾 Saving download as: ${filePath}`);
  await download.saveAs(filePath);

  console.log(`✅ Downloaded "${fileName}" of type "${fileType}" saved to ${filePath}`);

  return { fileName, filePath, fileType };
}

export interface ExtractedFileInfo {
  fileName: string;
  fileType: string;
  filePath: string;
}

/**
 * Extracts a ZIP file to a specified output folder and returns info about each extracted file.
 */
export function extractZipToFolder(zipFilePath: string, outputFolderPath: string): ExtractedFileInfo[] {
  console.log(`\n📦 Extracting ZIP file: ${zipFilePath}`);
  console.log(`📂 Destination folder: ${outputFolderPath}`);

  if (!fs.existsSync(zipFilePath)) {
    throw new Error(`❌ ZIP file not found: ${zipFilePath}`);
  }

  if (!fs.existsSync(outputFolderPath)) {
    fs.mkdirSync(outputFolderPath, { recursive: true });
    console.log(`📁 Created output folder: ${outputFolderPath}`);
  }

  const zip = new AdmZip(zipFilePath);
  zip.extractAllTo(outputFolderPath, true);
  console.log(`✅ Extraction complete.`);

  const extractedFiles: ExtractedFileInfo[] = [];

  const entries = zip.getEntries();
  entries.forEach(entry => {
    if (!entry.isDirectory) {
      const fileName = entry.entryName.split('/').pop() || '';
      const filePath = path.resolve(outputFolderPath, fileName);
      const fileType = path.extname(fileName).toLowerCase();

      console.log(`🔹 Extracted: ${fileName} (${fileType})`);

      extractedFiles.push({
        fileName,
        fileType,
        filePath
      });
    }
  });

  return extractedFiles;
}

/**
 * Reads a file from a folder by matching partial name and returns its content.
 * @param extractedFolderPath Folder to look in
 * @param partialFileName Partial name to match
 * @returns { content: string, fullPath: string, fileName: string }
 */
export async function getFileContentByPartialName(
  extractedFolderPath: string,
  partialFileName: string
): Promise<{ content: string; fullPath: string; fileName: string }> {
  console.log(`🔍 Searching in: ${extractedFolderPath}`);
  console.log(`🔍 Looking for file containing: "${partialFileName}"`);

  const files = fs.readdirSync(extractedFolderPath);
  const matchedFile = files.find(file => file.includes(partialFileName));

  if (!matchedFile) {
    throw new Error(`❌ File with partial name "${partialFileName}" not found in ${extractedFolderPath}`);
  }

  const fullFilePath = path.join(extractedFolderPath, matchedFile);
  console.log(`✅ Found: ${matchedFile}`);
  console.log(`📄 Reading file: ${fullFilePath}`);

  const { content } = await readFileByType(fullFilePath); // ✅ fix here

  return {
    content,
    fullPath: fullFilePath,
    fileName: matchedFile
  };
}


test('Download pdf and validate', async ({ page }) => {
  test.setTimeout(2 * 60 * 1000)
  const downloadsDir = path.resolve('downloads');

  try {
    await ensureDirectoryExists(downloadsDir);
    await login(page);
    await triggerExport(page, 'PDF');

    const downloadReady = await waitForDownloadReady(page);
    expect(downloadReady).toBeTruthy(); // Fail if not ready in time

    const { fileName, filePath, fileType } = await downloadFirstRowFile(page, downloadsDir);

    // 'downloads/reports.zip'
    const zipPath = filePath;
    // 'downloads/unzipped/'
    const extractTo = downloadsDir;

    const extracted = extractZipToFolder(zipPath, extractTo);
    console.log('📄 Extracted files:', extracted);

    const { content, fileName: extractedFileName } = await getFileContentByPartialName(downloadsDir, 'Workspaces_19-May-2025');

    console.log(`✅ Validating content of: ${extractedFileName}`);
    console.log('📝 Content preview (first 300 characters):');
    console.log(content.slice(0, 300));

    expect(content).toContain('Created From WCG eReview Manager');
    expect(content).toContain('Generated By: AutomationExt1 ExtUser1 (nextgentestuser1+test@wcgclinical.com)');

  } catch (err) {
    console.error('Test failed with error:', err);
  } finally {
    if (fs.existsSync(downloadsDir)) {
      fs.readdirSync(downloadsDir).forEach(file => {
        fs.unlinkSync(path.join(downloadsDir, file));
      });
      console.log('Cleaned up downloads folder');
    }
  }
});

test('Download CSV and validate', async ({ page }) => {
  test.setTimeout(2 * 60 * 1000);
  const downloadsDir = path.resolve('downloads');

  try {

    await ensureDirectoryExists(downloadsDir);
    await login(page);
    await triggerExport(page, 'CSV');

    const downloadReady = await waitForDownloadReady(page);
    expect(downloadReady).toBeTruthy(); // Fail if not ready in time

    const { fileName, filePath, fileType } = await downloadFirstRowFile(page, downloadsDir);

    const zipPath = filePath;
    const extractTo = downloadsDir;
    const extracted = extractZipToFolder(zipPath, extractTo);

    console.log('📄 Extracted files:', extracted);

    // Find the first .csv file
    const csvFile = extracted.find(f => f.fileName.toLowerCase().endsWith('.csv'));
    if (!csvFile) {
      throw new Error('❌ No CSV file found in the extracted files');
    }

    const csvPath = path.join(downloadsDir, csvFile.fileName);
    const results: any[] = [];

    await new Promise<void>((resolve, reject) => {
      fs.createReadStream(csvPath)
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', () => {
          console.log('✅ Parsed CSV Records:');
          console.table(results);
          resolve();
        })
        .on('error', reject);
    });


    // // Save ZIP to downloads folder
    // const suggestedFileName = download.suggestedFilename();
    // const savedZipPath = path.join(downloadsDir, suggestedFileName);
    // await download.saveAs(savedZipPath);
    // console.log('Downloaded ZIP:', suggestedFileName);

    // // Extract ZIP in same folder
    // await extract(savedZipPath, { dir: downloadsDir });
    // console.log('ZIP extracted successfully to:', downloadsDir);

    // // Find and print all extracted files
    // const extractedFiles = fs.readdirSync(downloadsDir);
    // console.log('Extracted Files:');
    // extractedFiles.forEach(file => {
    //   if (file !== suggestedFileName) {
    //     console.log(' -', file);
    //   }
    // });

    // // Find the first .csv file
    // const csvFile = extractedFiles.find(file => file.endsWith('.csv'));
    // if (csvFile) {
    //   const csvPath = path.join(downloadsDir, csvFile);
    //   const results: any[] = [];

    //   await new Promise<void>((resolve, reject) => {
    //     fs.createReadStream(csvPath)
    //       .pipe(csv())
    //       .on('data', (data) => results.push(data))
    //       .on('end', () => {
    //         console.log('Parsed CSV Records:');
    //         console.table(results);
    //         resolve();
    //       })
    //       .on('error', reject);
    //   });
    // } else {
    //   console.error('No CSV file found in the extracted files.');
    // }

  } catch (err) {
    console.error('Test failed with error:', err);
  } finally {
    // ✅ Cleanup: delete all files from the downloads directory
    if (fs.existsSync(downloadsDir)) {
      fs.readdirSync(downloadsDir).forEach(file => {
        fs.unlinkSync(path.join(downloadsDir, file));
      });
      console.log('Cleaned up downloads folder');
    }
  }
});
