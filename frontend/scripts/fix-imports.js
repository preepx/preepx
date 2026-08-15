import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const srcDir = path.join(__dirname, '..', 'src');

const knownDirs = [
  'components',
  'services',
  'utils',
  'hooks',
  'assets',
  'context',
  'constants',
  'layouts',
  'routes',
  'config',
  'data'
];

function getAllFiles(dirPath, arrayOfFiles) {
  const files = fs.readdirSync(dirPath);
  arrayOfFiles = arrayOfFiles || [];
  files.forEach(function(file) {
    if (fs.statSync(path.join(dirPath, file)).isDirectory()) {
      arrayOfFiles = getAllFiles(path.join(dirPath, file), arrayOfFiles);
    } else {
      arrayOfFiles.push(path.join(dirPath, file));
    }
  });
  return arrayOfFiles;
}

const allFiles = getAllFiles(srcDir).filter(f => f.endsWith('.jsx') || f.endsWith('.js'));

let updatedCount = 0;

allFiles.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;

  // Replace ../ or ../../ relative imports pointing to known dirs with @/
  // Match: import ... from "../services/..."
  // Match: import ... from "../../components/..."
  
  knownDirs.forEach(dir => {
    // Regex matches: import ... from "../dir/..." or import ... from "../../dir/..." or import ... from "../../../dir/..."
    const regex = new RegExp(`from\\s+['"](?:\\.\\.\\/)+${dir}\\/([^'"]+)['"]`, 'g');
    content = content.replace(regex, `from "@/` + dir + `/$1"`);
    
    // Also cover dynamic imports like import("../dir/...")
    const regexDynamic = new RegExp(`import\\(['"](?:\\.\\.\\/)+${dir}\\/([^'"]+)['"]\\)`, 'g');
    content = content.replace(regexDynamic, `import("@/` + dir + `/$1")`);
  });

  if (content !== originalContent) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Updated relative imports in ${path.basename(file)}`);
    updatedCount++;
  }
});

console.log(`\nImport fix complete! Updated ${updatedCount} files to use the @/ alias.`);
