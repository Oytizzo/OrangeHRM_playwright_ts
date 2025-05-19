// libs/utils.ts
import extract from 'extract-zip';
import path from 'path';
import fs from 'fs';
import pdf from 'pdf-parse';
import csv from 'csv-parser';
import mammoth from 'mammoth';
import xlsx from 'xlsx';

export async function ensureDirectoryExists(dirPath: string) {
  console.log(`📁 Checking if directory exists: ${dirPath}`);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`📁 Directory created: ${dirPath}`);
  } else {
    console.log(`✅ Directory already exists: ${dirPath}`);
  }
}

export async function extractZip(zipPath: string, extractTo: string): Promise<void> {
  await extract(zipPath, { dir: extractTo });
  console.log('ZIP extracted successfully to:', extractTo);
}

export function listExtractedFiles(directory: string, excludeFile?: string): string[] {
  const files = fs.readdirSync(directory);
  files.forEach(file => {
    if (file !== excludeFile) {
      console.log(' -', file);
    }
  });
  return files.filter(file => file !== excludeFile);
}

export async function parsePdfText(filePath: string): Promise<string> {
  const buffer = fs.readFileSync(filePath);
  const data = await pdf(buffer);
  return data.text;
}

export async function parseCsv(filePath: string): Promise<any[]> {
  const results: any[] = [];
  return new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', reject);
  });
}

export function cleanDirectory(directory: string) {
  if (fs.existsSync(directory)) {
    fs.readdirSync(directory).forEach(file => {
      fs.unlinkSync(path.join(directory, file));
    });
    console.log('Cleaned up downloads folder');
  }
}

// CSV
function readCsv(filePath: string): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const results: any[] = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => {
        console.log(`✅ CSV parsed: ${results.length} rows`);
        resolve(results);
      })
      .on('error', reject);
  });
}

// PDF
async function readPdf(filePath: string): Promise<string> {
  const buffer = fs.readFileSync(filePath);
  const data = await pdf(buffer);
  console.log(`✅ PDF text extracted (${data.text.length} characters)`);
  return data.text;
}

// DOCX
async function readDocx(filePath: string): Promise<string> {
  const buffer = fs.readFileSync(filePath);
  const result = await mammoth.extractRawText({ buffer });
  console.log(`✅ DOCX text extracted (${result.value.length} characters)`);
  return result.value;
}

// TXT
function readTxt(filePath: string): string {
  const content = fs.readFileSync(filePath, 'utf8');
  console.log(`✅ TXT file read (${content.length} characters)`);
  return content;
}

// Excel
function readExcel(filePath: string): any[] {
  const workbook = xlsx.readFile(filePath);
  const sheet = workbook.SheetNames[0];
  const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheet]);
  console.log(`✅ Excel parsed from sheet "${sheet}" with ${data.length} rows`);
  return data;
}

// JSON
function readJson(filePath: string): any {
  const raw = fs.readFileSync(filePath, 'utf8');
  const json = JSON.parse(raw);
  console.log(`✅ JSON parsed with ${Object.keys(json).length} top-level keys`);
  return json;
}

export async function readFileByType(filePath: string): Promise<{ type: string; content: any }> {
  const ext = path.extname(filePath).toLowerCase();
  const fileName = path.basename(filePath);

  console.log(`\n🔍 Reading file: ${fileName}`);
  console.log(`📁 Path: ${filePath}`);
  console.log(`📄 Detected file type: ${ext}`);

  switch (ext) {
    case '.csv':
      return { type: 'csv', content: await readCsv(filePath) };
    case '.pdf':
      return { type: 'pdf', content: await readPdf(filePath) };
    case '.docx':
      return { type: 'docx', content: await readDocx(filePath) };
    case '.txt':
      return { type: 'txt', content: readTxt(filePath) };
    case '.xlsx':
    case '.xls':
      return { type: 'excel', content: readExcel(filePath) };
    case '.json':
      return { type: 'json', content: readJson(filePath) };
    default:
      console.warn(`⚠️ Unsupported file type: ${ext}`);
      return { type: 'unsupported', content: null };
  }
}
