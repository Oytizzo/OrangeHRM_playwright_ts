const fs = require('fs');
const path = require('path');

// Generate a runId like 20250513_173021
const runId = new Date().toISOString().replace(/[-:]/g, '').replace('T', '_').slice(0, 15);

// Create base output folder
const baseDir = path.join(__dirname, 'output', runId);
fs.mkdirSync(baseDir, { recursive: true });

// Create subfolders
['downloads', 'screenshots', 'attachments', 'playwright-report', 'test-results'].forEach((folder) => {
  fs.mkdirSync(path.join(baseDir, folder), { recursive: true });
});

// Save metadata to run-meta.json
const metadata = { runId, baseDir };
fs.writeFileSync(path.join(__dirname, 'run-meta.json'), JSON.stringify(metadata, null, 2));

console.log(`📁 Created output folder: ${baseDir}`);
