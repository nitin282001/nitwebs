import fs from 'fs';
import path from 'path';

const rootDir = process.cwd();
const distDir = path.join(rootDir, 'dist');

if (fs.existsSync(distDir)) {
  console.log('📦 Syncing compiled build from dist/ to root repository...');
  const items = fs.readdirSync(distDir);
  for (const item of items) {
    const srcPath = path.join(distDir, item);
    const destPath = path.join(rootDir, item);
    fs.cpSync(srcPath, destPath, { recursive: true, force: true });
  }
  console.log('✅ Production bundle synced to root for Hostinger web root execution!');
} else {
  console.error('❌ dist/ directory not found!');
}
