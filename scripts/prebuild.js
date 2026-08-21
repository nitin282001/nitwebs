import fs from 'fs';
import path from 'path';

const indexPath = path.join(process.cwd(), 'index.html');
let html = fs.readFileSync(indexPath, 'utf8');

// postbuild.js overwrites index.html with the previous build's own output
// (hashed /assets/*.js references). If that's left in place, the next
// `vite build` reads its own prior output as its entry point instead of
// /src/main.tsx, corrupting every subsequent build. Reset to the dev-mode
// entry before building.
html = html.replace(
  /<script type="module"[^>]*src="\/assets\/[^"]+\.js"><\/script>\s*\n?/,
  '<script type="module" src="/src/main.tsx"></script>\n'
);
html = html.replace(/\s*<link rel="stylesheet"[^>]*href="\/assets\/[^"]+\.css">\s*\n?/, '\n');

fs.writeFileSync(indexPath, html);
console.log('🔄 Reset index.html entrypoint to /src/main.tsx before build.');
