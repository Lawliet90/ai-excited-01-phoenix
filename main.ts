// ai-excited-01 — make.fun entry runner (round 4)
// Reads entry.png sitting next to this script, validates it, and copies it
// byte-for-byte into $MAKEFUN_OUTPUT_DIR/entry.png (default /output).
// Node 22, stdlib only — no dependencies.

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const MAX_BYTES = 1024 * 1024; // 1 MiB cap enforced by the bounty
const MAX_DIMENSION = 1024; // max width/height in pixels
const INPUT_NAME = "entry.png";
const OUTPUT_NAME = "entry.png";

const here = dirname(fileURLToPath(import.meta.url));
const inputPath = join(here, INPUT_NAME);
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
const outputPath = join(outDir, OUTPUT_NAME);

// PNG signature: 89 50 4E 47 0D 0A 1A 0A
const PNG_MAGIC = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
// JPEG starts with FF D8 FF
const JPEG_MAGIC = Buffer.from([0xff, 0xd8, 0xff]);

function isPng(buf: Buffer): boolean {
  return buf.length >= PNG_MAGIC.length && buf.subarray(0, PNG_MAGIC.length).equals(PNG_MAGIC);
}

function isJpeg(buf: Buffer): boolean {
  return buf.length >= JPEG_MAGIC.length && buf.subarray(0, JPEG_MAGIC.length).equals(JPEG_MAGIC);
}

// PNG: width/height are big-endian uint32 at IHDR bytes 16-23.
function pngDimensions(buf: Buffer): { width: number; height: number } {
  if (buf.length < 24) throw new Error("PNG too short for an IHDR chunk");
  return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
}

// JPEG: walk the segments until the first Start-Of-Frame marker (0xC0-0xCF
// except 0xC4, 0xC8, 0xCC); its payload holds height then width, big-endian.
function jpegDimensions(buf: Buffer): { width: number; height: number } {
  let offset = 2; // skip SOI (FF D8)
  while (offset + 9 <= buf.length) {
    if (buf[offset] !== 0xff) throw new Error("malformed JPEG: expected segment marker");
    const marker = buf[offset + 1];
    const length = buf.readUInt16BE(offset + 2);
    if (marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc) {
      return { height: buf.readUInt16BE(offset + 5), width: buf.readUInt16BE(offset + 7) };
    }
    offset += 2 + length;
  }
  throw new Error("JPEG has no Start-Of-Frame segment");
}

function dimensions(buf: Buffer): { width: number; height: number } {
  return isPng(buf) ? pngDimensions(buf) : jpegDimensions(buf);
}

function main(): void {
  if (!existsSync(inputPath)) {
    throw new Error(`input not found: ${inputPath}`);
  }

  const data = readFileSync(inputPath);

  // 1. Format check by magic bytes — never trust the extension.
  if (!isPng(data) && !isJpeg(data)) {
    throw new Error("entry.png is neither PNG nor JPEG (bad magic bytes)");
  }

  // 2. Size cap: the bounty rejects anything over 1 MiB.
  if (data.length > MAX_BYTES) {
    throw new Error(`entry.png is ${data.length} bytes, over the ${MAX_BYTES} byte cap`);
  }

  // 3. Dimension cap: parse width/height from the header, never decode pixels.
  const { width, height } = dimensions(data);
  if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
    throw new Error(`entry.png is ${width}x${height}, over the ${MAX_DIMENSION}x${MAX_DIMENSION} cap`);
  }
  console.log(`entry.png: ${width}x${height}, ${data.length} bytes`);

  mkdirSync(outDir, { recursive: true });
  writeFileSync(outputPath, data); // byte-for-byte copy, no re-encoding
  console.log(`wrote ${outputPath} (${data.length} bytes)`);
}

main();
