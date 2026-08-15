import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const srcDir = path.join(__dirname, '..', 'src');

// Define directory structure
const directories = [
  'assets/images',
  'assets/icons',
  'assets/fonts',
  'components/common',
  'components/layout',
  'components/ui',
  'components/shared',
  'pages',
  'layouts',
  'hooks',
  'services/api',
  'services/auth',
  'utils',
  'constants',
  'context',
  'routes',
  'styles',
  'config'
];

// Create directories
directories.forEach(dir => {
  const fullPath = path.join(srcDir, dir);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
    console.log(`Created directory: ${dir}`);
  }
});

// Map of moves (source -> destination)
const moves = [
  { src: 'Login', dest: 'pages/Auth' },
  { src: 'Interview', dest: 'pages/Interview' },
  { src: 'resume', dest: 'pages/Resume' },
  { src: 'features/wallet/pages/WalletPage.jsx', dest: 'pages/WalletPage.jsx' },
  // Let's move some common layouts
];

moves.forEach(({ src, dest }) => {
  const srcPath = path.join(srcDir, src);
  const destPath = path.join(srcDir, dest);
  
  if (fs.existsSync(srcPath)) {
    fs.renameSync(srcPath, destPath);
    console.log(`Moved ${src} to ${dest}`);
  }
});

console.log('Restructure step 1 completed.');
console.log('NOTE: You will need to update import paths manually or run a find/replace to use the @/ alias.');
