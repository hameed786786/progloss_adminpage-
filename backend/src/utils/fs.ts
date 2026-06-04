import fs from 'fs';
import path from 'path';

export function getExportsDir(): string {
  return process.env.EXPORTS_DIR || path.join(process.cwd(), 'exports');
}

export function resolveExportFilePath(fileName: string): string {
  return path.join(getExportsDir(), fileName);
}

export function ensureExportsDirExists(): void {
  const dir = getExportsDir();
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

export function fileExists(p: string): boolean {
  return fs.existsSync(p);
}
