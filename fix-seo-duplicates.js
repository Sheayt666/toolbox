const fs = require('fs');

const seoPath = 'C:\\Users\\hiak0\\AppData\\Roaming\\TRAE SOLO CN\\ModularData\\ai-agent\\work-mode-projects\\6a4d86c19ecd28972b169f1c\\toolbox\\src\\data\\toolSeoContent.ts';

let content = fs.readFileSync(seoPath, 'utf-8');

// 要删除的重复toolId
const duplicateIds = ['regex-generator', 'chinese-pinyin-input', 'image-compare', 'text-summary'];

// 找到"补充工具 SEO 内容"部分的起始位置
const sectionStart = content.indexOf('// ========== 补充工具 SEO 内容 ==========');
if (sectionStart === -1) {
  console.log('Section not found');
  process.exit(1);
}

// 找到数组结束位置
const arrayEnd = content.indexOf('];', sectionStart);

// 提取该部分内容
const sectionContent = content.substring(sectionStart, arrayEnd);

// 统计每个toolId出现的次数
const allMatches = [...content.matchAll(/toolId:\s*"([^"]+)"/g)].map(m => m[1]);
const counts = {};
for (const id of allMatches) {
  counts[id] = (counts[id] || 0) + 1;
}

const duplicates = Object.entries(counts).filter(([_, count]) => count > 1);
console.log('Duplicate toolIds:', duplicates.length);
for (const [id, count] of duplicates) {
  console.log(`  ${id}: ${count} times`);
}

// 删除重复的SEO条目 - 在补充工具部分中删除
// 我们需要找到每个重复条目的第二个出现位置并删除
for (const dupId of duplicateIds) {
  // 找到所有出现的位置
  const regex = new RegExp(`\\n\\s*\\{\\s*\\n\\s*toolId:\\s*"${dupId}"[\\s\\S]*?\\n\\s*\\}`, 'g');
  const matches = [...content.matchAll(regex)];
  
  if (matches.length >= 2) {
    // 删除第二个出现的位置
    const secondMatch = matches[1];
    console.log(`Removing second occurrence of ${dupId} at position ${secondMatch.index}`);
    content = content.substring(0, secondMatch.index) + content.substring(secondMatch.index + secondMatch[0].length);
  }
}

fs.writeFileSync(seoPath, content, 'utf-8');

// 验证
const newMatches = [...content.matchAll(/toolId:\s*"([^"]+)"/g)].map(m => m[1]);
const newCounts = {};
for (const id of newMatches) {
  newCounts[id] = (newCounts[id] || 0) + 1;
}

const newDuplicates = Object.entries(newCounts).filter(([_, count]) => count > 1);
console.log('\nAfter fix:');
console.log('Total entries:', newMatches.length);
console.log('Remaining duplicates:', newDuplicates.length);
if (newDuplicates.length > 0) {
  for (const [id, count] of newDuplicates) {
    console.log(`  ${id}: ${count} times`);
  }
} else {
  console.log('No duplicates found!');
}
