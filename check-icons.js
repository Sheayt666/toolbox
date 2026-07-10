const lucide = require('lucide-react');
const fs = require('fs');
const path = require('path');

const allExports = Object.keys(lucide).filter(k => !k.endsWith('Icon') && !k.startsWith('Lucide'));

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

const missing = importedIcons.filter(icon => !allExports.includes(icon));
console.log('Imported icons:', importedIcons.length);
console.log('Missing icons:', missing.length);
console.log('Missing list:', missing.join(', '));

// 查找每个缺失图标的使用位置
console.log('\n=== Usage of missing icons ===');
for (const icon of missing) {
  const regex = new RegExp(`icon:\\s*${icon}`, 'g');
  const matches = content.match(regex);
  if (matches) {
    console.log(`${icon}: used ${matches.length} times`);
  }
}
