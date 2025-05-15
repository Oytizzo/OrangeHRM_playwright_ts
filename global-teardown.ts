import * as fs from 'fs';
import * as path from 'path';

export default async function globalTeardown() {
  console.log('Console: 🧹 Global Teardown executed!');

  const runIdFile = path.join(__dirname, 'output', 'currentRunId.txt');

  try {
    if (fs.existsSync(runIdFile)) {
      fs.unlinkSync(runIdFile);
      console.log(`🗑️ Deleted ${runIdFile}`);
    } else {
      console.log(`⚠️ File ${runIdFile} does not exist. Nothing to delete.`);
    }
  } catch (err) {
    console.error(`❌ Failed to delete ${runIdFile}:`, err);
  }
}
