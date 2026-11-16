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
const MAX_DIMENSION = 1024;

// PNG signature (8 bytes) and JPEG start-of-image marker (3 bytes).
const PNG_MAGIC = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const JPEG_MAGIC = Buffer.from([0xff, 0xd8, 0xff]);

// Read width/height straight out of the image header — no decoder needed.
// PNG: width and height are big-endian uint32s at IHDR bytes 16-23.
// JPEG: scan segments for the first Start-Of-Frame marker (0xC0-0xCF,
// skipping 0xC4, 0xC8, 0xCC); height is a big-endian uint16 at offset 5
// inside the segment, width at offset 7.
function parseDimensions(bytes: Buffer, isPng: boolean): { width: number; height: number } {
  if (isPng) {
    if (bytes.length < 24) throw new Error("PNG too short for an IHDR header");
    return { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) };
  }
  let offset = 2; // past the SOI marker
  while (offset + 9 <= bytes.length) {
    if (bytes[offset] !== 0xff) throw new Error("corrupt JPEG: expected segment marker");
    const marker = bytes[offset + 1];
    const length = bytes.readUInt16BE(offset + 2);
    if (marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc) {
      return { height: bytes.readUInt16BE(offset + 5), width: bytes.readUInt16BE(offset + 7) };
    }
    offset += 2 + length;
  }
  throw new Error("JPEG has no Start-Of-Frame segment");
}

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

const { width, height } = parseDimensions(bytes, isPng);
if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
  throw new Error(`entry.png is ${width}x${height}, over the ${MAX_DIMENSION}x${MAX_DIMENSION} cap`);
}

mkdirSync(outDir, { recursive: true });
copyFileSync(source, target);

console.log(`copied ${size} bytes (${isPng ? "PNG" : "JPEG"}, ${width}x${height}) -> ${target}`);
