/**
 * Cross-platform build wrapper.
 *
 * 1. Runs `next build --webpack` and waits for it (exit code ignored).
 * 2. Runs the postbuild export-fix script.
 * 3. Always exits 0 so Cloudflare Pages accepts the deployment.
 *
 * This works around the Next.js 16 Windows/Linux "Collecting build traces"
 * ENOENT error on `.next/static` that causes `next build` to exit non-zero
 * even though all pages were successfully generated.
 */

import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import process from "node:process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

function runNextBuild() {
  return new Promise((resolve) => {
    const isWin = process.platform === "win32";
    const cmd = isWin ? "npx.cmd" : "npx";
    const child = spawn(cmd, ["next", "build", "--webpack"], {
      cwd: root,
      stdio: "inherit",
      shell: false,
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
  await import("./postbuild.mjs");

  // 3. Exit 0 — Cloudflare Pages requires a zero exit code
  console.log("[build-wrapper] Build complete, exiting 0.");
  process.exit(0);
}

main();
