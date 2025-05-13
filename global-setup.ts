import { FullConfig } from '@playwright/test';
import { RunOutputUtils } from './libs/runOutputUtils';
import path from 'path';
import fs from 'fs';

async function globalSetup(config: FullConfig) {
  const metadataPath = path.join(__dirname, 'run-meta.json');
  const { runId, baseDir } = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));

  // Just ensure the folders exist (defensive)
  RunOutputUtils.createSubDirs(baseDir, [
    'downloads', 'screenshots', 'attachments', 'playwright-report', 'test-results'
  ]);
}

export default globalSetup;
