import * as fs from 'fs';
import * as path from 'path';

const runIdFile = path.join(__dirname, '../output/currentRunId.txt');
// const runIdFile = path.resolve(__dirname, '../output/currentRunId.txt');

export function getRunId(): string {
  if (!fs.existsSync(runIdFile)) {
    throw new Error(`❌ Run ID file not found at: ${runIdFile}`);
  }

  const runId = fs.readFileSync(runIdFile, 'utf-8').trim();

  if (!runId) {
    throw new Error('❌ Run ID file is empty');
  }

  return runId;
}

export function getDownloadsDir(): string {
  const runId = getRunId();
  const downloadsDir = path.resolve('output', runId, 'downloads');

  if (!fs.existsSync(downloadsDir)) {
    fs.mkdirSync(downloadsDir, { recursive: true });
  }

  return downloadsDir;
}

export function getOrCreateRunId(): string {
  if (fs.existsSync(runIdFile)) {
    return fs.readFileSync(runIdFile, 'utf-8').trim();
  }

  const now = new Date();
  const pad = (n: number) => n.toString().padStart(2, '0');
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const date = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  const time = `${pad(now.getHours())}-${pad(now.getMinutes())}-${pad(now.getSeconds())}`;
  const day = dayNames[now.getDay()];
  const offset = -now.getTimezoneOffset();
  const sign = offset >= 0 ? '+' : '-';
  const hours = pad(Math.floor(Math.abs(offset) / 60));
  const minutes = pad(Math.abs(offset) % 60);
  const timezone = `UTC${sign}${hours}-${minutes}`;
  const runId = `${date}_${day}_${time}_${timezone}`;

  fs.mkdirSync(path.dirname(runIdFile), { recursive: true });
  fs.writeFileSync(runIdFile, runId, 'utf-8');

  return runId;
}
