const fs = require('fs');
const path = require('path');

// Paths
const nextServerApp = 'C:\\Users\\hiak0\\AppData\\Roaming\\TRAE SOLO CN\\ModularData\\ai-agent\\work-mode-projects\\6a4d86c19ecd28972b169f1c\\toolbox\\.next\\server\\app';
const outDir = 'C:\\Users\\hiak0\\AppData\\Roaming\\TRAE SOLO CN\\ModularData\\ai-agent\\work-mode-projects\\6a4d86c19ecd28972b169f1c\\toolbox\\out';
const nextStatic = 'C:\\Users\\hiak0\\AppData\\Roaming\\TRAE SOLO CN\\ModularData\\ai-agent\\work-mode-projects\\6a4d86c19ecd28972b169f1c\\toolbox\\.next\\static';
const outNextStatic = path.join(outDir, '_next', 'static');

console.log('Manual static export (workaround for Next.js 16 Windows ENOENT bug)');
console.log('================================================================');

// Helper to copy directory recursively
function copyDir(src, dest) {
  if (!fs.existsSync(src)) return 0;
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  
  let count = 0;
  const entries = fs.readdirSync(src, { withFileTypes: true });
  
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    
    if (entry.isDirectory()) {
      count += copyDir(srcPath, destPath);
    } else if (entry.isFile()) {
      fs.copyFileSync(srcPath, destPath);
      count++;
    }
  }
  return count;
}

// Step 1: Copy static assets (_next/static)
console.log('\n1. Copying static assets...');
const staticCount = copyDir(nextStatic, outNextStatic);
console.log(`   Copied ${staticCount} static files`);

// Step 2: Find and copy all HTML pages from .next/server/app to out/
console.log('\n2. Processing HTML pages...');

function processHtmlPages(srcDir, destDir, relativePath = '') {
  if (!fs.existsSync(srcDir)) return 0;
  
  let count = 0;
  const entries = fs.readdirSync(srcDir, { withFileTypes: true });
  
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
        if (!fs.existsSync(destPageDir)) {
          fs.mkdirSync(destPageDir, { recursive: true });
        }
        fs.copyFileSync(indexHtml, path.join(destPageDir, 'index.html'));
        count++;
      }
      
      // Recurse
      count += processHtmlPages(srcPath, destDir, currentRelPath);
    } else if (entry.isFile() && entry.name.endsWith('.html') && entry.name !== 'index.html') {
      // Root-level HTML files (like 404.html, etc.)
      const destFile = path.join(destDir, relativePath || '', entry.name);
      if (!fs.existsSync(path.dirname(destFile))) {
        fs.mkdirSync(path.dirname(destFile), { recursive: true });
      }
      fs.copyFileSync(srcPath, destFile);
      count++;
    }
  }
  
  return count;
}

const pageCount = processHtmlPages(nextServerApp, outDir);
console.log(`   Total HTML pages: ${pageCount}`);

// Step 3: Copy root index.html
console.log('\n3. Checking root pages...');
const rootIndex = path.join(nextServerApp, 'index.html');
if (fs.existsSync(rootIndex)) {
  fs.copyFileSync(rootIndex, path.join(outDir, 'index.html'));
  console.log('   Copied: index.html');
}

// Check for root page.html
const rootPageHtml = path.join(nextServerApp, 'page.html');
if (fs.existsSync(rootPageHtml)) {
  fs.copyFileSync(rootPageHtml, path.join(outDir, 'index.html'));
  console.log('   Copied: page.html -> index.html');
}

// Step 4: Copy sitemap.xml, robots.txt, favicon.ico etc.
console.log('\n4. Copying special files...');

// Sitemap
const sitemapDir = path.join(nextServerApp, 'sitemap.xml');
if (fs.existsSync(sitemapDir)) {
  const sitemapFile = path.join(sitemapDir, 'route.xml');
  if (fs.existsSync(sitemapFile)) {
    fs.copyFileSync(sitemapFile, path.join(outDir, 'sitemap.xml'));
    console.log('   Copied: sitemap.xml');
  }
}

// Robots
const robotsDir = path.join(nextServerApp, 'robots.txt');
if (fs.existsSync(robotsDir)) {
  const robotsFile = path.join(robotsDir, 'route.txt');
  if (fs.existsSync(robotsFile)) {
    fs.copyFileSync(robotsFile, path.join(outDir, 'robots.txt'));
    console.log('   Copied: robots.txt');
  }
}

// Favicon
const faviconDir = path.join(nextServerApp, 'favicon.ico');
if (fs.existsSync(faviconDir)) {
  const faviconFile = path.join(faviconDir, 'route.ico');
  if (fs.existsSync(faviconFile)) {
    fs.copyFileSync(faviconFile, path.join(outDir, 'favicon.ico'));
    console.log('   Copied: favicon.ico');
  }
}

// Step 5: Count and verify
console.log('\n5. Verification:');
const toolsOutDir = path.join(outDir, 'tools');
if (fs.existsSync(toolsOutDir)) {
  const toolDirs = fs.readdirSync(toolsOutDir, { withFileTypes: true })
    .filter(d => d.isDirectory() && !d.name.startsWith('['));
  console.log(`   Tool pages: ${toolDirs.length}`);
}

const categoryOutDir = path.join(outDir, 'category');
if (fs.existsSync(categoryOutDir)) {
  const catDirs = fs.readdirSync(categoryOutDir, { withFileTypes: true })
    .filter(d => d.isDirectory() && !d.name.startsWith('['));
  console.log(`   Category pages: ${catDirs.length}`);
}

const blogOutDir = path.join(outDir, 'blog');
if (fs.existsSync(blogOutDir)) {
  const blogDirs = fs.readdirSync(blogOutDir, { withFileTypes: true })
    .filter(d => d.isDirectory() && !d.name.startsWith('['));
  console.log(`   Blog pages: ${blogDirs.length}`);
}

const productsOutDir = path.join(outDir, 'products');
if (fs.existsSync(productsOutDir)) {
  const prodDirs = fs.readdirSync(productsOutDir, { withFileTypes: true })
    .filter(d => d.isDirectory() && !d.name.startsWith('['));
  console.log(`   Product pages: ${prodDirs.length}`);
}

// Count total files
function countFiles(dir) {
  let count = 0;
  if (!fs.existsSync(dir)) return 0;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
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
