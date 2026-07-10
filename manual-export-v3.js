const fs = require('fs');
const path = require('path');

// Paths
const nextServerApp = 'C:\\Users\\hiak0\\AppData\\Roaming\\TRAE SOLO CN\\ModularData\\ai-agent\\work-mode-projects\\6a4d86c19ecd28972b169f1c\\toolbox\\.next\\server\\app';
const outDir = 'C:\\Users\\hiak0\\AppData\\Roaming\\TRAE SOLO CN\\ModularData\\ai-agent\\work-mode-projects\\6a4d86c19ecd28972b169f1c\\toolbox\\out';
const nextStatic = 'C:\\Users\\hiak0\\AppData\\Roaming\\TRAE SOLO CN\\ModularData\\ai-agent\\work-mode-projects\\6a4d86c19ecd28972b169f1c\\toolbox\\.next\\static';
const outNextStatic = path.join(outDir, '_next', 'static');

console.log('Manual static export (workaround for Next.js 16 Windows ENOENT bug)');
console.log('================================================================');

// Helper to copy directory recursively (safe for Windows with special chars)
function copyDirSafe(src, dest) {
  if (!fs.existsSync(src)) return 0;
  if (!fs.existsSync(dest)) {
    try {
      fs.mkdirSync(dest, { recursive: true });
    } catch (e) {
      // Skip directories that can't be created (like [id] on some Windows configs)
      return 0;
    }
  }
  
  let count = 0;
  let entries;
  try {
    entries = fs.readdirSync(src, { withFileTypes: true });
  } catch (e) {
    return 0;
  }
  
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    
    if (entry.isDirectory()) {
      count += copyDirSafe(srcPath, destPath);
    } else if (entry.isFile()) {
      try {
        fs.copyFileSync(srcPath, destPath);
        count++;
      } catch (e) {
        // Skip files that can't be copied
      }
    }
  }
  return count;
}

// Step 1: Copy static assets (_next/static)
console.log('\n1. Copying static assets...');
const staticCount = copyDirSafe(nextStatic, outNextStatic);
console.log(`   Copied ${staticCount} static files`);

// Step 2: Find and copy all HTML pages from .next/server/app to out/
console.log('\n2. Processing HTML pages...');

function processHtmlPages(srcDir, destDir, relativePath = '') {
  if (!fs.existsSync(srcDir)) return 0;
  
  let count = 0;
  let entries;
  try {
    entries = fs.readdirSync(srcDir, { withFileTypes: true });
  } catch (e) {
    return 0;
  }
  
  for (const entry of entries) {
    const srcPath = path.join(srcDir, entry.name);
    const currentRelPath = relativePath ? `${relativePath}/${entry.name}` : entry.name;
    
    if (entry.isDirectory()) {
      // Skip internal Next.js directories
      if (entry.name.startsWith('_') || entry.name.endsWith('.segments')) {
        continue;
      }
      
      // Check if this directory contains an index.html
      const indexHtml = path.join(srcPath, 'index.html');
      if (fs.existsSync(indexHtml)) {
        const destPageDir = path.join(destDir, currentRelPath);
        try {
          if (!fs.existsSync(destPageDir)) {
            fs.mkdirSync(destPageDir, { recursive: true });
          }
          fs.copyFileSync(indexHtml, path.join(destPageDir, 'index.html'));
          count++;
        } catch (e) {
          // Skip if can't create directory (e.g., special chars on Windows)
        }
      }
      
      // Recurse
      count += processHtmlPages(srcPath, destDir, currentRelPath);
    } else if (entry.isFile() && entry.name.endsWith('.html') && entry.name !== 'index.html') {
      // Root-level HTML files (like 404.html, etc.)
      const destFile = path.join(destDir, relativePath || '', entry.name);
      try {
        if (!fs.existsSync(path.dirname(destFile))) {
          fs.mkdirSync(path.dirname(destFile), { recursive: true });
        }
        fs.copyFileSync(srcPath, destFile);
        count++;
      } catch (e) {
        // skip
      }
    }
  }
  
  return count;
}

const pageCount = processHtmlPages(nextServerApp, outDir);
console.log(`   Total HTML pages: ${pageCount}`);

// Step 3: Copy root index.html
console.log('\n3. Checking root pages...');

// Try multiple possible locations for root index
const rootIndexCandidates = [
  path.join(nextServerApp, 'index.html'),
  path.join(nextServerApp, 'page', 'index.html'),
  path.join(nextServerApp, 'page.html'),
];

for (const candidate of rootIndexCandidates) {
  if (fs.existsSync(candidate)) {
    fs.copyFileSync(candidate, path.join(outDir, 'index.html'));
    console.log(`   Copied root index from: ${candidate.replace(nextServerApp, '')}`);
    break;
  }
}

// Step 4: Copy sitemap.xml, robots.txt, favicon.ico etc.
console.log('\n4. Copying special files...');

function copySpecialFile(dirName, expectedFile, outputName) {
  const dirPath = path.join(nextServerApp, dirName);
  if (!fs.existsSync(dirPath)) return false;
  
  const filePath = path.join(dirPath, expectedFile);
  if (fs.existsSync(filePath)) {
    fs.copyFileSync(filePath, path.join(outDir, outputName));
    console.log(`   Copied: ${outputName}`);
    return true;
  }
  return false;
}

// Sitemap
copySpecialFile('sitemap.xml', 'route.xml', 'sitemap.xml');
copySpecialFile('sitemap.xml', 'sitemap.xml', 'sitemap.xml');

// Robots
copySpecialFile('robots.txt', 'route.txt', 'robots.txt');
copySpecialFile('robots.txt', 'robots.txt', 'robots.txt');

// Favicon
copySpecialFile('favicon.ico', 'route.ico', 'favicon.ico');
copySpecialFile('favicon.ico', 'favicon.ico', 'favicon.ico');

// Step 5: Count and verify
console.log('\n5. Verification:');

function countDirs(dirPath) {
  if (!fs.existsSync(dirPath)) return 0;
  try {
    return fs.readdirSync(dirPath, { withFileTypes: true })
      .filter(d => d.isDirectory() && !d.name.startsWith('[')).length;
  } catch (e) {
    return 0;
  }
}

console.log(`   Tool pages: ${countDirs(path.join(outDir, 'tools'))}`);
console.log(`   Category pages: ${countDirs(path.join(outDir, 'category'))}`);
console.log(`   Blog pages: ${countDirs(path.join(outDir, 'blog'))}`);
console.log(`   Product pages: ${countDirs(path.join(outDir, 'products'))}`);

// Count total files
function countFiles(dir) {
  let count = 0;
  if (!fs.existsSync(dir)) return 0;
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch (e) {
    return 0;
  }
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isFile()) count++;
    else count += countFiles(fullPath);
  }
  return count;
}

const totalFiles = countFiles(outDir);
console.log(`   Total files in out/: ${totalFiles}`);

// Check if index.html exists
if (fs.existsSync(path.join(outDir, 'index.html'))) {
  console.log('   index.html: OK');
} else {
  console.log('   index.html: MISSING');
}

console.log('\n================================================================');
console.log('Export complete! Output directory:', outDir);
