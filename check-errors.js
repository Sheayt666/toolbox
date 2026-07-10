const fs = require('fs');
const path = require('path');

// 检查所有可能的TypeScript错误

// 1. 检查 tools.ts 中是否有未导入的图标
const toolsPath = 'C:\\Users\\hiak0\\AppData\\Roaming\\TRAE SOLO CN\\ModularData\\ai-agent\\work-mode-projects\\6a4d86c19ecd28972b169f1c\\toolbox\\src\\lib\\tools.ts';
const toolsContent = fs.readFileSync(toolsPath, 'utf-8');

// 提取所有图标名称
const iconMatches = toolsContent.match(/icon:\s*(\w+)/g) || [];
const iconNames = [...new Set(iconMatches.map(m => m.replace('icon: ', '').trim()))];

// 提取导入的图标
const importMatch = toolsContent.match(/import\s*\{([^}]+)\}\s*from\s*"lucide-react"/);
if (importMatch) {
  const importedIcons = importMatch[1].split(',').map(s => s.trim().replace(/^type\s+/, '')).filter(Boolean);
  console.log('Imported icons:', importedIcons.length);
  console.log('Used icons:', iconNames.length);
  
  // 找出未导入的图标
  const missingIcons = iconNames.filter(icon => !importedIcons.includes(icon));
  console.log('\nMissing icons:', missingIcons.length);
  for (const icon of missingIcons) {
    console.log(`  - ${icon}`);
  }
}

// 2. 检查 products/page.tsx
const productsPagePath = 'C:\\Users\\hiak0\\AppData\\Roaming\\TRAE SOLO CN\\ModularData\\ai-agent\\work-mode-projects\\6a4d86c19ecd28972b169f1c\\toolbox\\src\\app\\products\\page.tsx';
if (fs.existsSync(productsPagePath)) {
  const content = fs.readFileSync(productsPagePath, 'utf-8');
  const iconMatches2 = content.match(/\b([A-Z]\w+Icon|RefreshCw|Shield|Zap|Users|Star|TrendingUp|Filter|MessageCircle|Sparkles|ShoppingCart|Clock)\b/g) || [];
  console.log('\nProducts page icons:', [...new Set(iconMatches2)]);
}

console.log('\nDone checking.');
