const fs = require('fs');

// 检查所有可能的图标错误
const toolsPath = 'C:\\Users\\hiak0\\AppData\\Roaming\\TRAE SOLO CN\\ModularData\\ai-agent\\work-mode-projects\\6a4d86c19ecd28972b169f1c\\toolbox\\src\\lib\\tools.ts';

let content = fs.readFileSync(toolsPath, 'utf-8');

// 提取导入的图标
const importMatch = content.match(/import\s*\{([^}]+)\}\s*from\s*"lucide-react"/s);
if (!importMatch) {
  console.log('Cannot find import statement');
  process.exit(1);
}

const importedIcons = importMatch[1]
  .split('\n')
  .map(s => s.trim().replace(/,$/, '').replace(/^type\s+/, ''))
  .filter(s => s && s !== 'type');

console.log('Imported icons count:', importedIcons.length);

// 提取所有使用的图标
const iconUsages = [...content.matchAll(/icon:\s*(\w+)/g)].map(m => m[1]);
const uniqueIcons = [...new Set(iconUsages)];

console.log('Unique icons used:', uniqueIcons.length);

// 找出未导入的图标
const missingIcons = uniqueIcons.filter(icon => !importedIcons.includes(icon));
console.log('\nMissing icons:', missingIcons.length);
for (const icon of missingIcons) {
  console.log(`  - ${icon}`);
}

// 检查是否有重复的图标导入
const iconCounts = {};
for (const icon of importedIcons) {
  iconCounts[icon] = (iconCounts[icon] || 0) + 1;
}
const duplicates = Object.entries(iconCounts).filter(([_, count]) => count > 1);
console.log('\nDuplicate icon imports:', duplicates.length);
for (const [icon, count] of duplicates) {
  console.log(`  - ${icon}: ${count} times`);
}

console.log('\nDone!');
