const fs = require('fs');
const path = require('path');
module.exports = function writeBase64(fileRelPath, b64) {
  const fullPath = path.join(__dirname, '..', fileRelPath);
  const dir = path.dirname(fullPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(fullPath, Buffer.from(b64, 'base64').toString('utf8'));
  console.log('Written:', fileRelPath);
};
