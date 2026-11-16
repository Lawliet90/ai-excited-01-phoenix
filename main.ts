// ai-excited-01 entry runner — Node 22, stdlib only.
//
// Reads the entry image sitting beside this file, sanity-checks it, and
// copies it byte-for-byte into the make.fun output directory so the judge
// sees exactly the image this repo ships.

import { copyFileSync, existsSync, mkdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

// Upper bound make.fun accepts for an entry image.
const MAX_BYTES = 1_048_576;

// PNG signature (8 bytes) and JPEG start-of-image marker (3 bytes).
const PNG_MAGIC = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const JPEG_MAGIC = Buffer.from([0xff, 0xd8, 0xff]);

const here = dirname(fileURLToPath(import.meta.url));
const source = join(here, "entry.png");
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
const target = join(outDir, "entry.png");

if (!existsSync(source)) {
  throw new Error(`entry image missing: ${source}`);
}

const bytes = readFileSync(source);
const size = statSync(source).size;

// The file must be a real image, not a renamed blob: check the magic bytes.
const isPng = bytes.subarray(0, 8).equals(PNG_MAGIC);
const isJpeg = bytes.subarray(0, 3).equals(JPEG_MAGIC);
if (!isPng && !isJpeg) {
  throw new Error("entry.png is neither PNG nor JPEG (bad magic bytes)");
}

if (size > MAX_BYTES) {
  throw new Error(`entry.png is ${size} bytes, over the ${MAX_BYTES} byte cap`);
}

mkdirSync(outDir, { recursive: true });
copyFileSync(source, target);

console.log(`copied ${size} bytes (${isPng ? "PNG" : "JPEG"}) -> ${target}`);
