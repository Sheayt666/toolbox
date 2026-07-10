const fs = require('fs');

const toolsTsPath = 'C:\\Users\\hiak0\\AppData\\Roaming\\TRAE SOLO CN\\ModularData\\ai-agent\\work-mode-projects\\6a4d86c19ecd28972b169f1c\\toolbox\\src\\lib\\tools.ts';

const content = fs.readFileSync(toolsTsPath, 'utf-8');
const importMatch = content.match(/import\s*\{([\s\S]*?)\}\s*from\s*"lucide-react"/);
if (!importMatch) { console.log('No import found'); process.exit(1); }

const importBody = importMatch[1];
const iconMatches = importBody.matchAll(/^\s*(\w+)(?:\s+as\s+\w+)?,?\s*$/gm);
const importedIcons = [];
for (const m of iconMatches) {
  importedIcons.push(m[1]);
}

// 检查重复
const seen = {};
const duplicates = [];
for (const icon of importedIcons) {
  if (seen[icon]) {
    duplicates.push(icon);
  }
  seen[icon] = true;
}

console.log('Total imports:', importedIcons.length);
console.log('Unique imports:', Object.keys(seen).length);
console.log('Duplicates:', duplicates.length);
if (duplicates.length > 0) {
  console.log('Duplicate icons:', duplicates.join(', '));
}
