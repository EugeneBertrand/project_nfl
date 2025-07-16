const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, 'data');
const files = fs.readdirSync(dataDir).filter(f => f.endsWith('.csv'));

files.forEach(file => {
  const filePath = path.join(dataDir, file);
  const lines = fs.readFileSync(filePath, 'utf8').split('\n');
  if (lines.length === 0) return;
  const header = lines[0].split(',');
  const nameCount = {};
  const newHeader = header.map(col => {
    if (!nameCount[col]) {
      nameCount[col] = 1;
      return col;
    } else {
      nameCount[col]++;
      return col + '_' + nameCount[col];
    }
  });
  lines[0] = newHeader.join(',');
  fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
  console.log(`${file}: Duplicates fixed.`);
}); 