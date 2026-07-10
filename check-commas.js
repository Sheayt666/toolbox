const fs = require('fs');

const toolsPath = 'C:\\Users\\hiak0\\AppData\\Roaming\\TRAE SOLO CN\\ModularData\\ai-agent\\work-mode-projects\\6a4d86c19ecd28972b169f1c\\toolbox\\src\\lib\\tools.ts';

let content = fs.readFileSync(toolsPath, 'utf-8');

// 检查连续逗号
const doubleCommas = content.match(/,\s*,/g);
console.log('tools.ts double commas:', doubleCommas ? doubleCommas.length : 0);

// 也检查其他ts文件
const filesToCheck = [
  'C:\\Users\\hiak0\\AppData\\Roaming\\TRAE SOLO CN\\ModularData\\ai-agent\\work-mode-projects\\6a4d86c19ecd28972b169f1c\\toolbox\\src\\data\\toolSeoContent.ts',
];

for (const file of filesToCheck) {
  const c = fs.readFileSync(file, 'utf-8');
  const dc = c.match(/,\s*,/g);
  console.log(`${file.split('\\').pop()}: ${dc ? dc.length : 0} double commas`);
}
