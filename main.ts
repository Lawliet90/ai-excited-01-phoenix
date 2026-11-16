// ai-excited-01 — make.fun entry runner (Round 6)
// Copies entry.png beside this file, byte-for-byte, to
// $MAKEFUN_OUTPUT_DIR/entry.png (default /output) after validating it
// against the competition gate: PNG or JPEG by magic bytes, at most
// 1 MiB, at most 1024x1024 pixels. Node 22, stdlib only, no network,
// fully deterministic (the copy is byte-identical on every run).

import { copyFileSync, mkdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const MAX_BYTES = 1024 * 1024;
const MAX_SIDE = 1024;

const PNG_MAGIC = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const JPEG_SOI = Buffer.from([0xff, 0xd8, 0xff]);

function fail(message: string): never {
  throw new Error(`entry.png rejected: ${message}`);
}

function kindOf(buf: Buffer): "png" | "jpeg" | null {
  if (buf.length >= 8 && buf.subarray(0, 8).equals(PNG_MAGIC)) return "png";
  if (buf.length >= 3 && buf.subarray(0, 3).equals(JPEG_SOI)) return "jpeg";
  return null;
}

// PNG: width/height are big-endian uint32s at IHDR offsets 16 and 20.
function pngSize(buf: Buffer): [number, number] {
  if (buf.length < 24) fail("truncated PNG header");
  return [buf.readUInt32BE(16), buf.readUInt32BE(20)];
}

// JPEG: walk the segments until the first Start-Of-Frame marker
// (0xC0-0xCF except DHT 0xC4, JPG 0xC8, DAC 0xCC); height sits 2 bytes
// after the 1-byte precision field, width right after it. Standalone
// markers (0xD0-0xD9) carry no length field; SOS (0xDA) begins the
// scan data, so a missing SOF before it means the file is malformed.
function jpegSize(buf: Buffer): [number, number] {
  let pos = 2; // past the SOI marker
  while (pos + 4 <= buf.length) {
    if (buf[pos] !== 0xff) fail("malformed JPEG segment");
    const marker = buf[pos + 1];
    if (marker === 0xda) fail("no Start-Of-Frame segment before scan data");
    if (marker >= 0xd0 && marker <= 0xd9) {
      pos += 2;
      continue;
    }
    const segLen = buf.readUInt16BE(pos + 2);
    if (segLen < 2 || pos + 2 + segLen > buf.length) {
      fail("JPEG segment overruns the file");
    }
    const isSof =
      marker >= 0xc0 && marker <= 0xcf &&
      marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc;
    if (isSof) {
      if (segLen < 7) fail("truncated JPEG Start-Of-Frame segment");
      return [buf.readUInt16BE(pos + 7), buf.readUInt16BE(pos + 5)];
    }
    pos += 2 + segLen;
  }
  fail("no Start-Of-Frame segment found");
}

const here = dirname(fileURLToPath(import.meta.url));
const source = join(here, "entry.png");
const buf = readFileSync(source);

if (buf.length > MAX_BYTES) {
  fail(`${buf.length} bytes exceeds the ${MAX_BYTES} byte cap`);
}

const kind = kindOf(buf);
if (kind === null) fail("neither PNG nor JPEG (bad magic bytes)");

const [width, height] = kind === "png" ? pngSize(buf) : jpegSize(buf);
if (width > MAX_SIDE || height > MAX_SIDE) {
  fail(`${width}x${height} exceeds the ${MAX_SIDE}x${MAX_SIDE} cap`);
}

const outDir = process.env.MAKEFUN_OUTPUT_DIR || "/output";
mkdirSync(outDir, { recursive: true });
const dest = join(outDir, "entry.png");
copyFileSync(source, dest);

console.log(
  `copied entry.png (${kind}, ${width}x${height}, ${buf.length} bytes) -> ${dest}`,
);
