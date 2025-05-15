// global-setup.ts
import fs from 'fs';
import path from 'path';
import { getOrCreateRunId } from './libs/runUtils';

export default async function globalSetup() {
  const runId = getOrCreateRunId();
  const outputDir = path.join(__dirname, 'output', runId);

  process.env.RUN_ID = runId;

  const subDirs = [
    'downloads',
    'screenshots',
    'recordings',
    'attachments',
    'test-results',
    'playwright-report'
  ];

  for (const dir of subDirs) {
    fs.mkdirSync(path.join(outputDir, dir), { recursive: true });
  }

  // Optionally write to a file or log if needed
  console.log('Global setup completed with runId:', runId);
}
