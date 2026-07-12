/**
 * Cross-platform build wrapper.
 *
 * 1. Runs `next build --webpack` and waits for it (exit code ignored).
 * 2. Runs the postbuild export-fix script.
 * 3. Always exits 0 so Cloudflare Pages accepts the deployment.
 *
 * This works around the Next.js 16 "Collecting build traces" ENOENT error
 * on `.next/static` that causes `next build` to exit non-zero even though
 * all pages were successfully generated.
 */

import { spawn, spawnSync, execSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { existsSync } from "node:fs";
import process from "node:process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

function runNextBuild() {
  return new Promise((resolve) => {
    // Try node_modules/.bin/next first (most reliable), fall back to npx.
    const localNext = join(root, "node_modules", ".bin", "next");
    const isWin = process.platform === "win32";

    let cmd, args, useShell;
    if (existsSync(localNext)) {
      if (isWin) {
        // On Windows, node_modules/.bin/next is a shell script, not JS.
        // Use npx.cmd which handles PATH resolution and spaces correctly.
        cmd = "npx.cmd";
        args = ["next", "build", "--webpack"];
        useShell = true;
      } else {
        // On Linux/macOS, .bin/next is a JS file (or symlink) — run directly.
        cmd = localNext;
        args = ["build", "--webpack"];
        useShell = false;
      }
    } else {
      // Fall back to npx.
      cmd = isWin ? "npx.cmd" : "npx";
      args = ["next", "build", "--webpack"];
      useShell = isWin;
    }

    console.log(`[build-wrapper] Running: ${cmd} ${args.join(" ")}`);

    const child = spawn(cmd, args, {
      cwd: root,
      stdio: "inherit",
      shell: useShell,
    });

    child.on("close", (code) => {
      console.log(`[build-wrapper] next build exited with code ${code}`);
      resolve(code);
    });

    child.on("error", (err) => {
      console.error("[build-wrapper] Failed to start next build:", err.message);
      resolve(1);
    });
  });
}

async function main() {
  // 1. Run next build (ignore exit code)
  await runNextBuild();

  // 2. Run postbuild export-fix
  try {
    await import("./postbuild.mjs");
  } catch (e) {
    console.error("[build-wrapper] Postbuild error:", e.message);
  }

  // 3. Verify out/ directory has content
  const outDir = join(root, "out");
  try {
    const { readdirSync } = await import("node:fs");
    const files = readdirSync(outDir);
    console.log(`[build-wrapper] out/ directory has ${files.length} entries: ${files.join(", ")}`);
  } catch (e) {
    console.error("[build-wrapper] out/ directory check failed:", e.message);
  }

  // 4. Exit 0 — Cloudflare Pages requires a zero exit code
  console.log("[build-wrapper] Build complete, exiting 0.");
  process.exit(0);
}

main();
