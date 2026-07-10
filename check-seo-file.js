const fs = require('fs');

const seoPath = 'C:\\Users\\hiak0\\AppData\\Roaming\\TRAE SOLO CN\\ModularData\\ai-agent\\work-mode-projects\\6a4d86c19ecd28972b169f1c\\toolbox\\src\\data\\toolSeoContent.ts';

let content = fs.readFileSync(seoPath, 'utf-8');

// 检查连续逗号
const doubleCommas = content.match(/,\s*,/g);
console.log('Double commas:', doubleCommas ? doubleCommas.length : 0);

// 检查数组开头附近有没有问题
const arrayStart = content.indexOf('export const toolSeoContents: ToolSEOContent[] = [');
if (arrayStart !== -1) {
  const section = content.substring(arrayStart, arrayStart + 500);
  console.log('\nArray start section:');
  console.log(section.substring(0, 200));
}

// 检查数组结尾
const arrayEnd = content.lastIndexOf('];');
if (arrayEnd !== -1) {
  const section = content.substring(arrayEnd - 200, arrayEnd + 5);
  console.log('\nArray end section:');
  console.log(section);
}

// 统计toolId
const toolIds = [...content.matchAll(/toolId:\s*"([^"]+)"/g)].map(m => m[1]);
console.log('\nTotal toolIds:', toolIds.length);

// 检查是否有空对象或格式问题
// 找出所有的 { toolId: 模式
const objectStarts = [...content.matchAll(/\n\s*\{\s*\n\s*toolId:/g)];
console.log('Object starts (with toolId on second line):', objectStarts.length);
