const fs = require('fs');

const productsPath = 'C:\\Users\\hiak0\\AppData\\Roaming\\TRAE SOLO CN\\ModularData\\ai-agent\\work-mode-projects\\6a4d86c19ecd28972b169f1c\\toolbox\\src\\lib\\products.ts';

let content = fs.readFileSync(productsPath, 'utf-8');

// 替换所有 RefreshCcw 为 RefreshCw
content = content.replace(/RefreshCcw/g, 'RefreshCw');

fs.writeFileSync(productsPath, content, 'utf-8');

console.log('Replaced all RefreshCcw with RefreshCw');
