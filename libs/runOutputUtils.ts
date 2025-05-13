import fs from 'fs';
import path from 'path';

export class RunOutputUtils {
  static generateRunId(timezone: string = 'UTC+6-00'): string {
    const now = new Date();
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'short', year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
      hour12: false, timeZone: 'UTC'
    };
    const formatted = now.toLocaleString('en-GB', options)
      .replace(/[/,]/g, '')
      .replace(/:/g, '-')
      .replace(/\s+/g, '_');
    return `${formatted}_${timezone}`;
  }

  static createRunOutputDir(base: string = 'output', runId?: string): string {
    const id = runId || this.generateRunId();
    const dirPath = path.resolve(base, id);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
    return dirPath;
  }

  static createSubDirs(basePath: string, subDirs: string[]): void {
    for (const dir of subDirs) {
      const fullPath = path.join(basePath, dir);
      if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true });
      }
    }
  }
}
