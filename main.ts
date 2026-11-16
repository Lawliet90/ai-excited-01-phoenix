// ai-excited-01 — make.fun entry runner (Round 5)
// Reads entry.png beside this file, validates it, and copies it byte-for-byte
// to $MAKEFUN_OUTPUT_DIR/entry.png (default /output).
// Node 22, stdlib only.

import { copyFileSync, mkdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const MAX_BYTES = 1024 * 1024; // 1 MiB hard cap for the entry image

// Resolve the directory this script lives in, so entry.png is found
// regardless of the caller's working directory.
const here = dirname(fileURLToPath(import.meta.url));
const sourcePath = join(here, "entry.png");

// --- Load and validate -------------------------------------------------
const data = readFileSync(sourcePath);
const size = statSync(sourcePath).size;

if (size > MAX_BYTES) {
  throw new Error(
    `entry.png is ${size} bytes, over the ${MAX_BYTES} byte cap`,
  );
}

// Magic-byte sniffing: accept PNG or JPEG, reject anything else.
const isPng =
  data.length >= 8 &&
  data[0] === 0x89 && data[1] === 0x50 && data[2] === 0x4e &&
  data[3] === 0x47 && data[4] === 0x0d && data[5] === 0x0a &&
  data[6] === 0x1a && data[7] === 0x0a;
const isJpeg = data.length >= 3 && data[0] === 0xff && data[1] === 0xd8 && data[2] === 0xff;

if (!isPng && !isJpeg) {
  throw new Error("entry.png is neither PNG nor JPEG (bad magic bytes)");
}

// --- Copy byte-for-byte --------------------------------------------------
const outDir = process.env.MAKEFUN_OUTPUT_DIR || "/output";
mkdirSync(outDir, { recursive: true });
const destPath = join(outDir, "entry.png");
copyFileSync(sourcePath, destPath);

console.log(`copied entry.png (${size} bytes) -> ${destPath}`);
