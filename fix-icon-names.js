const fs = require('fs');

// 修复图标名称
const toolsPath = 'C:\\Users\\hiak0\\AppData\\Roaming\\TRAE SOLO CN\\ModularData\\ai-agent\\work-mode-projects\\6a4d86c19ecd28972b169f1c\\toolbox\\src\\lib\\tools.ts';

let content = fs.readFileSync(toolsPath, 'utf-8');

// 图标名称映射（从错误名称到正确的 lucide-react 名称）
const iconFixes = {
  'WalletIcon': 'Wallet',
  'TimerIcon': 'Timer',
  'DiceIcon': 'Dice5',
  'ReceiptIcon': 'Receipt',
  'FlameIcon': 'Flame',
  'SunIcon': 'Sun',
  'CircleIcon': 'Circle',
  'EyeIcon': 'Eye',
  'TypeIcon': 'Type',
};

for (const [wrong, correct] of Object.entries(iconFixes)) {
  const regex = new RegExp(`icon:\\s*${wrong}\\b`, 'g');
  content = content.replace(regex, `icon: ${correct}`);
  console.log(`Replaced ${wrong} with ${correct}`);
}

fs.writeFileSync(toolsPath, content, 'utf-8');

// 现在需要把这些正确的图标名添加到导入中
// 先检查导入部分
const importMatch = content.match(/import\s*\{([^}]+)\}\s*from\s*"lucide-react"/);
if (importMatch) {
  const importedIcons = importMatch[1].split(',').map(s => s.trim()).filter(Boolean);
  const iconsToAdd = ['Wallet', 'Timer', 'Dice5', 'Receipt', 'Flame', 'Sun', 'Circle', 'Type'];
  
  const missingImports = iconsToAdd.filter(icon => !importedIcons.includes(icon));
  console.log('\nIcons to add to imports:', missingImports);
  
  if (missingImports.length > 0) {
    // 在 type LucideIcon 之前添加
    const newImportString = missingImports.join(',\n  ') + ',\n  type LucideIcon,';
    content = content.replace(/,\n\s*type LucideIcon,/, ',\n  ' + missingImports.join(',\n  ') + ',\n  type LucideIcon,');
    fs.writeFileSync(toolsPath, content, 'utf-8');
    console.log('Added missing icon imports');
  }
}

console.log('\nDone!');
