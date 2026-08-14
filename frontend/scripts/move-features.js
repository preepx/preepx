import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const srcDir = path.join(__dirname, '..', 'src');

const moves = [
  { src: 'features/wallet/hooks/useWallet.js', dest: 'hooks/useWallet.js' },
  { src: 'features/wallet/services/walletAPI.js', dest: 'services/walletAPI.js' },
  { src: 'features/wallet/components/CoinPackages.jsx', dest: 'components/ui/CoinPackages.jsx' },
  { src: 'features/wallet/components/TransactionList.jsx', dest: 'components/ui/TransactionList.jsx' },
  { src: 'features/wallet/components/WalletBadge.jsx', dest: 'components/ui/WalletBadge.jsx' },
  { src: 'features/wallet/constants/walletConfig.js', dest: 'constants/walletConfig.js' }
];

moves.forEach(({ src, dest }) => {
  const srcPath = path.join(srcDir, src);
  const destPath = path.join(srcDir, dest);
  
  if (fs.existsSync(srcPath)) {
    const destDir = path.dirname(destPath);
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }
    fs.renameSync(srcPath, destPath);
    console.log(`Moved ${src} to ${dest}`);
  }
});

console.log('Moved wallet features to global folders. You may need to run node scripts/fix-imports.js again if imports inside them were relying on relative paths to each other!');
