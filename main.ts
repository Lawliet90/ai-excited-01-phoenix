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

// Dimension check, parsed from the header — never trust the extension.
// PNG: width/height are big-endian uint32s at IHDR offset 16 and 20.
// JPEG: scan segments for a Start-Of-Frame marker (0xc0–0xcf except 0xc4,
// 0xc8, 0xcc); height is big-endian uint16 at +5, width at +7.
function dimensions(buf) {
  if (isPng) return [buf.readUInt32BE(16), buf.readUInt32BE(20)];
  let i = 2; // skip SOI marker
  while (i + 9 < buf.length) {
    if (buf[i] !== 0xff) throw new Error("corrupt JPEG: expected segment marker");
    const marker = buf[i + 1];
    const len = buf.readUInt16BE(i + 2);
    if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)) {
      return [buf.readUInt16BE(i + 7), buf.readUInt16BE(i + 5)];
    }
    i += 2 + len;
  }
  throw new Error("could not find a JPEG Start-Of-Frame segment");
}

const [width, height] = dimensions(bytes);
if (width > 1024 || height > 1024) {
  throw new Error(`entry.png is ${width}x${height}, over the 1024x1024 cap`);
}
console.log(`entry.png: ${width}x${height}, ${bytes.length} bytes`);

mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, "entry.png"), bytes);
console.log(`wrote ${bytes.length} bytes to ${join(outDir, "entry.png")}`);
