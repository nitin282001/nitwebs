const fs = require('fs');
const path = require('path');

const apiDir = path.join(__dirname, '..', 'api');

if (!fs.existsSync(apiDir)) {
  fs.mkdirSync(apiDir, { recursive: true });
}

console.log('API directory initialized');
