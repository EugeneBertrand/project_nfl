const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, 'data');
const files = fs.readdirSync(dataDir).filter(f => f.endsWith('.csv'));

files.forEach(file => {
  const filePath = path.join(dataDir, file);
  const header = fs.readFileSync(filePath, 'utf8').split('\n')[0].split(',');
  const seen = new Set();
  const duplicates = [];
  header.forEach(col => {
    if (seen.has(col)) duplicates.push(col);
    seen.add(col);
  });
  if (duplicates.length) {
    console.log(`${file}: Duplicate columns:`, duplicates);
  } else {
    console.log(`${file}: No duplicate columns!`);
  }
}); 