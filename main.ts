// ai-excited-01 — phoenix entry runner.
// Reads entry.png next to this file, sanity-checks it, and copies it
// byte-for-byte into the output directory make.fun expects.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const MAX_BYTES = 1024 * 1024; // make.fun image cap: 1 MiB

const here = dirname(fileURLToPath(import.meta.url));
const source = join(here, "entry.png");
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";

const bytes = readFileSync(source);

// Magic-byte check: JPEG starts ff d8 ff, PNG starts 89 50 4e 47.
const isJpeg = bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
const isPng =
  bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47;
if (!isJpeg && !isPng) {
  throw new Error("entry.png is neither JPEG nor PNG (bad magic bytes)");
}

if (bytes.length > MAX_BYTES) {
  throw new Error(`entry.png is ${bytes.length} bytes, over the 1 MiB cap`);
}

mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, "entry.png"), bytes);
console.log(`wrote ${bytes.length} bytes to ${join(outDir, "entry.png")}`);
