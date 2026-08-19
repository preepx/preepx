const fs = require('fs');
const path = require('path');

const questionsDir = path.join(__dirname, 'src', 'questions');
const mcqDir = path.join(__dirname, 'src', 'mcq-questions');

if (!fs.existsSync(mcqDir)) {
  fs.mkdirSync(mcqDir, { recursive: true });
}

const files = fs.readdirSync(questionsDir).filter(f => f.endsWith('.json'));

files.forEach(file => {
  const targetPath = path.join(mcqDir, file);
  if (!fs.existsSync(targetPath)) {
    fs.writeFileSync(targetPath, '[\n\n]', 'utf-8');
    console.log(`Created empty file: ${file}`);
  } else {
    console.log(`Skipped existing file: ${file}`);
  }
});

console.log('Done!');
