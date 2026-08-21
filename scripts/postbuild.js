import fs from 'fs';
import path from 'path';

const rootDir = process.cwd();
const distDir = path.join(rootDir, 'dist');

if (fs.existsSync(distDir)) {
  // Old hashed chunks accumulate forever otherwise — every prior build's
  // assets stay referenced by nothing but still sit on disk, which also
  // confuses the bundler into treating them as naming collisions on the
  // next build. Clear stale root assets before copying the fresh ones.
  const rootAssetsDir = path.join(rootDir, 'assets');
  if (fs.existsSync(rootAssetsDir)) {
    fs.rmSync(rootAssetsDir, { recursive: true, force: true });
  }

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
