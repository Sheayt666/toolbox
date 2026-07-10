const fs = require('fs');

const toolsTsPath = 'C:\\Users\\hiak0\\AppData\\Roaming\\TRAE SOLO CN\\ModularData\\ai-agent\\work-mode-projects\\6a4d86c19ecd28972b169f1c\\toolbox\\src\\lib\\tools.ts';

const missingIcons = ['Diagram', 'FileSplit', 'GraphQl', 'Python', 'Backslash', 'Wheel', 'Systole', 'FirstAid'];

let content = fs.readFileSync(toolsTsPath, 'utf-8');

// 从导入中移除不存在的图标
for (const icon of missingIcons) {
  const regex = new RegExp(`\\s*${icon},?\\s*\\n`, 'g');
  content = content.replace(regex, '\n');
  console.log(`Removed ${icon} from imports`);
}

fs.writeFileSync(toolsTsPath, content, 'utf-8');
console.log('Done!');

// 同时更新页面文件中的图标引用
const toolsDir = 'C:\\Users\\hiak0\\AppData\\Roaming\\TRAE SOLO CN\\ModularData\\ai-agent\\work-mode-projects\\6a4d86c19ecd28972b169f1c\\toolbox\\src\\app\\tools';

const pagesToFix = {
  'blood-pressure-chamber': { old: 'Systole', new: 'Activity' },
  'first-aid-guide': { old: 'FirstAid', new: 'HeartPulse' },
};

for (const [dir, { old: oldIcon, new: newIcon }] of Object.entries(pagesToFix)) {
  const pagePath = `${toolsDir}\\${dir}\\page.tsx`;
  if (fs.existsSync(pagePath)) {
    let pageContent = fs.readFileSync(pagePath, 'utf-8');
    pageContent = pageContent.replace(new RegExp(oldIcon, 'g'), newIcon);
    fs.writeFileSync(pagePath, pageContent, 'utf-8');
    console.log(`Fixed ${dir}: ${oldIcon} -> ${newIcon}`);
  }
}

console.log('All done!');
