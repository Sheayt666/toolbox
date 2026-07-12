/**
 * Post-build script: ensures the `out/` directory is fully populated
 * even when `next build` exits with a non-zero code (e.g. the Windows
 * "Collecting build traces" ENOENT error on `.next/static`).
 *
 * Strategy:
 * 1. Copy every *.html file from `.next/server/app/` → `out/`
 *    (converts `blog/slug.html` → `out/blog/slug/index.html`)
 * 2. Copy static assets from `.next/static/` → `out/_next/static/`
 *    (skips gracefully if the source directory is inaccessible)
 * 3. Copy `public/` files → `out/` (robots.txt, favicon, etc.)
 * 4. Copy `.next/server/app/_next/` if it exists (prerendered data)
 *
 * Runs on both Windows and Linux.  No external dependencies.
 */

import { readdirSync, statSync, existsSync, mkdirSync, copyFileSync, lstatSync, rmSync } from "node:fs";
import { readdir as readdirAsync } from "node:fs/promises";
import { join, dirname, relative, sep, normalize } from "node:path";
import { fileURLToPath } from "node:url";
import process from "node:process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const nextDir = join(root, ".next");
const serverAppDir = join(nextDir, "server", "app");
const staticDir = join(nextDir, "static");
const outDir = join(root, "out");
const publicDir = join(root, "public");

/* ---------- helpers ---------- */

function ensureDir(dir) {
  mkdirSync(dir, { recursive: true });
}

/**
 * Recursively copy a directory.  Returns the number of files copied.
 * If the source directory cannot be read, returns 0 (no throw).
 */
function copyDir(src, dest) {
  let count = 0;
  let entries;
  try {
    entries = readdirSync(src, { withFileTypes: true });
  } catch {
    // Source directory doesn't exist or is inaccessible — skip silently.
    return 0;
  }
  for (const entry of entries) {
    const srcPath = join(src, entry.name);
    const destPath = join(dest, entry.name);
    if (entry.isDirectory()) {
      count += copyDir(srcPath, destPath);
    } else if (entry.isFile()) {
      ensureDir(dirname(destPath));
      try {
        copyFileSync(srcPath, destPath);
        count++;
      } catch {
        // Individual file copy failure — skip.
      }
    }
  }
  return count;
}

/**
 * Walk a directory tree and yield every file path (relative to `root`).
 */
async function walk(dir) {
  const results = [];
  let entries;
  try {
    entries = await readdirAsync(dir, { withFileTypes: true });
  } catch {
    return results;
  }
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...(await walk(full)));
    } else if (entry.isFile()) {
      results.push(full);
    }
  }
  return results;
}

/* ---------- main ---------- */

async function main() {
  console.log("[postbuild] Starting export fix…");

  // 0. If `out/` already has HTML files, the export succeeded — nothing to do.
  try {
    const existing = await walk(outDir);
    const htmlFiles = existing.filter((f) => f.endsWith(".html"));
    if (htmlFiles.length > 5) {
      console.log(`[postbuild] out/ already has ${htmlFiles.length} HTML files — export succeeded, skipping.`);
      return;
    }
  } catch {
    // out/ doesn't exist or is empty — proceed.
  }

  ensureDir(outDir);
  let copied = 0;

  // 1. Copy HTML pages from .next/server/app/ → out/
  //    Convert `blog/slug.html` → `out/blog/slug/index.html`
  //    Keep root-level `page.html` → `out/page.html`  (Cloudflare serves both)
  if (existsSync(serverAppDir)) {
    const files = await walk(serverAppDir);
    const htmlFiles = files.filter((f) => f.endsWith(".html"));
    console.log(`[postbuild] Found ${htmlFiles.length} HTML files in .next/server/app/`);

    for (const file of htmlFiles) {
      const rel = relative(serverAppDir, file).split(sep).join("/");
      // Skip _next internal files (they are asset manifests, not pages)
      if (rel.startsWith("_next/")) continue;

      let destPath;
      if (rel === "index.html") {
        destPath = join(outDir, "index.html");
      } else if (rel.endsWith("/index.html")) {
        // Already in directory form: blog/index.html → out/blog/index.html
        destPath = join(outDir, rel);
      } else {
        // File form: blog/slug.html → out/blog/slug/index.html
        // This ensures Cloudflare Pages serves /blog/slug correctly.
        const withoutExt = rel.replace(/\.html$/, "");
        destPath = join(outDir, withoutExt, "index.html");
      }

      ensureDir(dirname(destPath));
      try {
        copyFileSync(file, destPath);
        copied++;
      } catch (e) {
        console.warn(`[postbuild] Failed to copy ${rel}: ${e.message}`);
      }
    }
    console.log(`[postbuild] Copied ${copied} HTML pages to out/`);
  } else {
    console.warn("[postbuild] .next/server/app/ does not exist — no pages to copy!");
  }

  // 2. Copy static assets from .next/static/ → out/_next/static/
  const destStatic = join(outDir, "_next", "static");
  const staticCount = copyDir(staticDir, destStatic);
  console.log(`[postbuild] Copied ${staticCount} static asset files to out/_next/static/`);

  // 2b. Also check .next/server/app/_next/ for any prerendered data
  const serverNextDir = join(serverAppDir, "_next");
  if (existsSync(serverNextDir)) {
    const serverNextCount = copyDir(serverNextDir, join(outDir, "_next"));
    console.log(`[postbuild] Copied ${serverNextCount} files from .next/server/app/_next/`);
  }

  // 3. Copy public/ files → out/
  if (existsSync(publicDir)) {
    const publicCount = copyDir(publicDir, outDir);
    console.log(`[postbuild] Copied ${publicCount} public files to out/`);
  }

  // 4. Copy additional manifest files that Cloudflare / Next.js might need
  const manifestFiles = [
    "export-marker.json",
    "build-manifest.json",
    "prerender-manifest.json",
    "routes-manifest.json",
    "app-path-routes-manifest.json",
    "images-manifest.json",
    "react-loadable-manifest.json",
  ];
  for (const f of manifestFiles) {
    const src = join(nextDir, f);
    if (existsSync(src)) {
      try {
        copyFileSync(src, join(outDir, "_next", f));
      } catch {
        // ignore
      }
    }
  }

  // 5. Update export-detail.json to mark success
  const exportDetail = {
    version: 1,
    outDirectory: outDir,
    success: true,
  };
  try {
    const { writeFileSync } = await import("node:fs");
    writeFileSync(join(nextDir, "export-detail.json"), JSON.stringify(exportDetail, null, 2));
    console.log("[postbuild] Updated export-detail.json → success: true");
  } catch {
    // ignore
  }

  console.log(`[postbuild] Done. Total HTML pages: ${copied}`);
}

// Use top-level await so that `await import("./postbuild.mjs")` in build.mjs
// actually waits for postbuild to finish before checking the out/ directory.
try {
  await main();
} catch (e) {
  console.error("[postbuild] Fatal error:", e);
}
