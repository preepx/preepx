import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const srcDir = path.join(__dirname, '..', 'src');
const stylesDir = path.join(srcDir, 'styles');

if (!fs.existsSync(stylesDir)) {
  fs.mkdirSync(stylesDir, { recursive: true });
}

// Function to recursively find all files
function getAllFiles(dirPath, arrayOfFiles) {
  const files = fs.readdirSync(dirPath);

  arrayOfFiles = arrayOfFiles || [];

  files.forEach(function(file) {
    if (fs.statSync(dirPath + "/" + file).isDirectory()) {
      arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
    } else {
      arrayOfFiles.push(path.join(dirPath, file));
    }
  });

  return arrayOfFiles;
}

const allFiles = getAllFiles(srcDir);
const cssFiles = allFiles.filter(f => f.endsWith('.css') && !f.includes(path.sep + 'styles' + path.sep));
const jsxFiles = allFiles.filter(f => f.endsWith('.jsx') || f.endsWith('.js'));

// 1. Move CSS files
const cssFileNameMap = {}; // maps old full path to new full path
cssFiles.forEach(cssPath => {
  const fileName = path.basename(cssPath);
  const destPath = path.join(stylesDir, fileName);
  
  // Note: Assuming no file name collisions for now. If there are, they will overwrite.
  fs.renameSync(cssPath, destPath);
  console.log(`Moved ${fileName} to styles/`);
  cssFileNameMap[fileName] = destPath;
});

// 2. Update imports in JSX/JS files
jsxFiles.forEach(jsxPath => {
  let content = fs.readFileSync(jsxPath, 'utf8');
  let hasChanges = false;
  
  // Regex to match css imports like: import './App.css'; or import '../styles/App.css';
  const importRegex = /import\s+['"]([^'"]+\.css)['"]/g;
  
  content = content.replace(importRegex, (match, p1) => {
    const fileName = path.basename(p1);
    if (cssFileNameMap[fileName] || fileName === 'index.css') {
      hasChanges = true;
      return `import '@/styles/${fileName}'`;
    }
    return match;
  });

  if (hasChanges) {
    fs.writeFileSync(jsxPath, content, 'utf8');
    console.log(`Updated imports in ${path.basename(jsxPath)}`);
  }
});

console.log('All CSS files moved to styles folder and imports updated!');
