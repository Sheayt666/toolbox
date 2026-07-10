const fs = require('fs');

const seoPath = 'C:\\Users\\hiak0\\AppData\\Roaming\\TRAE SOLO CN\\ModularData\\ai-agent\\work-mode-projects\\6a4d86c19ecd28972b169f1c\\toolbox\\src\\data\\toolSeoContent.ts';

let content = fs.readFileSync(seoPath, 'utf-8');

// 找出所有连续逗号的位置
let pos = 0;
const doubleCommaPositions = [];
while ((pos = content.indexOf(',,', pos)) !== -1) {
  // 显示上下文
  const start = Math.max(0, pos - 50);
  const end = Math.min(content.length, pos + 50);
  doubleCommaPositions.push({
    position: pos,
    context: content.substring(start, end).replace(/\n/g, '\\n')
  });
  pos += 2;
}

console.log('Double comma positions:');
for (const dcp of doubleCommaPositions) {
  console.log(`  Position ${dcp.position}: ...${dcp.context}...`);
}

// 修复：替换所有的 ,, 为 ,
const fixedContent = content.replace(/,\s*,/g, ',');
fs.writeFileSync(seoPath, fixedContent, 'utf-8');

// 再次检查
const afterFix = fixedContent.match(/,\s*,/g);
console.log('\nAfter fix, double commas remaining:', afterFix ? afterFix.length : 0);
