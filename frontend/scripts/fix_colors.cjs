const fs = require('fs');
const path = require('path');

// 1. Fix Auth CSS colors
const authDir = 'c:\\Users\\ck436\\OneDrive\\Desktop\\preepx\\frontend\\src\\styles\\auth';
const files = fs.readdirSync(authDir).filter(f => f.endsWith('.css'));

for (const file of files) {
  const filePath = path.join(authDir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  content = content.replace(/#3d7a64/gi, '#3D5EFF');
  content = content.replace(/#2f6f5b/gi, '#6017C7');
  content = content.replace(/#2a5c4a/gi, '#6017C7');
  content = content.replace(/rgba\(61,\s*122,\s*100,/gi, 'rgba(61, 94, 255,');

  fs.writeFileSync(filePath, content, 'utf8');
}

console.log("Auth colors updated successfully!");
