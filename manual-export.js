const fs = require('fs');
const path = require('path');

// Paths
const nextServerApp = 'C:\\Users\\hiak0\\AppData\\Roaming\\TRAE SOLO CN\\ModularData\\ai-agent\\work-mode-projects\\6a4d86c19ecd28972b169f1c\\toolbox\\.next\\server\\app';
const outDir = 'C:\\Users\\hiak0\\AppData\\Roaming\\TRAE SOLO CN\\ModularData\\ai-agent\\work-mode-projects\\6a4d86c19ecd28972b169f1c\\toolbox\\out';

console.log('Manual static export from .next/server/app to out/');
console.log('================================================');

// Safe readdir
function safeReaddir(dir) {
  try {
    return fs.readdirSync(dir, { withFileTypes: true });
  } catch (e) {
    return [];
  }
}

// Safe exists
function safeExists(p) {
  try {
    return fs.existsSync(p);
  } catch (e) {
    return false;
  }
}

// Process HTML files from .next/server/app to out/
function processAppDir(srcDir, destDir, relativePath = '') {
  const entries = safeReaddir(srcDir);
  let pageCount = 0;
  
  for (const entry of entries) {
    const srcPath = path.join(srcDir, entry.name);
    const currentRelPath = relativePath ? `${relativePath}/${entry.name}` : entry.name;
    
    // Skip files at this level (only process directories)
    if (entry.isFile()) continue;
    
    // Skip segment directories and internal Next.js dirs
    if (entry.name.endsWith('.segments') || entry.name.startsWith('_')) {
      continue;
    }
    
    // Check if this is a "page" directory (contains page.html)
    if (entry.name === 'page') {
      const pageHtml = path.join(srcPath, 'page.html');
      if (safeExists(pageHtml)) {
        // The parent directory is the page route
        // destDir is the parent, we need to create index.html there
        const destIndex = path.join(destDir, 'index.html');
        if (!safeExists(path.dirname(destIndex))) {
          fs.mkdirSync(path.dirname(destIndex), { recursive: true });
        }
        fs.copyFileSync(pageHtml, destIndex);
        pageCount++;
      }
      continue;
    }
    
    // Check if this directory has a page.html directly
    const pageHtmlDirect = path.join(srcPath, 'page.html');
    if (safeExists(pageHtmlDirect)) {
      const destPageDir = path.join(destDir, currentRelPath);
      if (!safeExists(destPageDir)) {
        fs.mkdirSync(destPageDir, { recursive: true });
      }
      fs.copyFileSync(pageHtmlDirect, path.join(destPageDir, 'index.html'));
      pageCount++;
    }
    
    // Recurse into subdirectories
    const destSubDir = path.join(destDir, currentRelPath);
    if (!safeExists(destSubDir)) {
      fs.mkdirSync(destSubDir, { recursive: true });
    }
    pageCount += processAppDir(srcPath, destSubDir, currentRelPath);
  }
  
  return pageCount;
}

// Copy root-level files
function copyRootFiles(srcDir, destDir) {
  let count = 0;
  
  // Root index page - check page/page.html or page.html
  const rootPageDir = path.join(srcDir, 'page');
  const rootPageHtml = path.join(srcDir, 'page.html');
  
  if (safeExists(path.join(rootPageDir, 'page.html'))) {
    fs.copyFileSync(path.join(rootPageDir, 'page.html'), path.join(destDir, 'index.html'));
    count++;
    console.log('  Copied: index.html (from page/page.html)');
  } else if (safeExists(rootPageHtml)) {
    fs.copyFileSync(rootPageHtml, path.join(destDir, 'index.html'));
    count++;
    console.log('  Copied: index.html');
  }
  
  // Sitemap
  const sitemapDir = path.join(srcDir, 'sitemap.xml');
  if (safeExists(sitemapDir)) {
    // Try route.xml first, then sitemap.xml
    const sitemapFile1 = path.join(sitemapDir, 'route.xml');
    const sitemapFile2 = path.join(sitemapDir, 'sitemap.xml');
    if (safeExists(sitemapFile1)) {
      fs.copyFileSync(sitemapFile1, path.join(destDir, 'sitemap.xml'));
      count++;
      console.log('  Copied: sitemap.xml');
    } else if (safeExists(sitemapFile2)) {
      fs.copyFileSync(sitemapFile2, path.join(destDir, 'sitemap.xml'));
      count++;
      console.log('  Copied: sitemap.xml');
    }
  }
  
  // Robots
  const robotsDir = path.join(srcDir, 'robots.txt');
  if (safeExists(robotsDir)) {
    const robotsFile1 = path.join(robotsDir, 'route.txt');
    const robotsFile2 = path.join(robotsDir, 'robots.txt');
    if (safeExists(robotsFile1)) {
      fs.copyFileSync(robotsFile1, path.join(destDir, 'robots.txt'));
      count++;
      console.log('  Copied: robots.txt');
    } else if (safeExists(robotsFile2)) {
      fs.copyFileSync(robotsFile2, path.join(destDir, 'robots.txt'));
      count++;
      console.log('  Copied: robots.txt');
    }
  }
  
  // Favicon
  const faviconDir = path.join(srcDir, 'favicon.ico');
  if (safeExists(faviconDir)) {
    const faviconFile1 = path.join(faviconDir, 'route.ico');
    const faviconFile2 = path.join(faviconDir, 'favicon.ico');
    if (safeExists(faviconFile1)) {
      fs.copyFileSync(faviconFile1, path.join(destDir, 'favicon.ico'));
      count++;
      console.log('  Copied: favicon.ico');
    } else if (safeExists(faviconFile2)) {
      fs.copyFileSync(faviconFile2, path.join(destDir, 'favicon.ico'));
      count++;
      console.log('  Copied: favicon.ico');
    }
  }
  
  return count;
}

// Main
console.log('\n1. Copying root files...');
const rootCount = copyRootFiles(nextServerApp, outDir);
console.log(`   Total root files: ${rootCount}`);

console.log('\n2. Processing page directories...');
const pageCount = processAppDir(nextServerApp, outDir);
console.log(`   Total pages generated: ${pageCount}`);

// Count tool pages specifically
const toolsOutDir = path.join(outDir, 'tools');
if (safeExists(toolsOutDir)) {
  const toolDirs = safeReaddir(toolsOutDir).filter(d => d.isDirectory() && !d.name.startsWith('['));
  console.log(`\n3. Tool pages: ${toolDirs.length}`);
}

// Count category pages
const categoryOutDir = path.join(outDir, 'category');
if (safeExists(categoryOutDir)) {
  const catDirs = safeReaddir(categoryOutDir).filter(d => d.isDirectory() && !d.name.startsWith('['));
  console.log(`4. Category pages: ${catDirs.length}`);
}

// Count blog pages
const blogOutDir = path.join(outDir, 'blog');
if (safeExists(blogOutDir)) {
  const blogDirs = safeReaddir(blogOutDir).filter(d => d.isDirectory() && !d.name.startsWith('['));
  console.log(`5. Blog pages: ${blogDirs.length}`);
}

// Count product pages
const productsOutDir = path.join(outDir, 'products');
if (safeExists(productsOutDir)) {
  const prodDirs = safeReaddir(productsOutDir).filter(d => d.isDirectory() && !d.name.startsWith('['));
  console.log(`6. Product pages: ${prodDirs.length}`);
}

console.log('\n================================================');
console.log('Export complete!');
console.log(`Output directory: ${outDir}`);

// Verify out dir structure
const totalFiles = countFiles(outDir);
console.log(`Total files in out/: ${totalFiles}`);

function countFiles(dir) {
  let count = 0;
  if (!safeExists(dir)) return 0;
  const entries = safeReaddir(dir);
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isFile()) count++;
    else count += countFiles(fullPath);
  }
  return count;
}
