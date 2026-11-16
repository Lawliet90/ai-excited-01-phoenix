// ai-excited-01 entry: copies the phoenix image to the output directory.
// The image lives beside this file as entry.png; the judge only ever sees
// the bytes we write to $MAKEFUN_OUTPUT_DIR/entry.png, so we check the file
// is really an image and inside the competition limits before copying it.

import { copyFileSync, mkdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const MAX_BYTES = 1_048_576; // 1 MiB, the competition cap
const INPUT = join(import.meta.dirname, "entry.png");

// Where the harness expects the entry; defaults to /output per the rules.
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
const outFile = join(outDir, "entry.png");

// Read the image and make sure it is a real PNG or JPEG by its first bytes.
const data = readFileSync(INPUT);
const isPng = data[0] === 0x89 && data[1] === 0x50 && data[2] === 0x4e && data[3] === 0x47;
const isJpeg = data[0] === 0xff && data[1] === 0xd8 && data[2] === 0xff;
if (!isPng && !isJpeg) {
  throw new Error("entry.png is neither a PNG nor a JPEG (bad magic bytes)");
}

// Read width/height straight out of the file header, no image library:
// PNG stores them in the IHDR chunk (bytes 16-23, big-endian); JPEG stores
// them in the first Start-Of-Frame segment we meet while scanning markers.
function dimensions(buf: Buffer): { width: number; height: number } {
  if (buf[0] === 0x89) {
    return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
  }
  let i = 2; // skip the SOI marker
  while (i < buf.length - 1) {
    if (buf[i] !== 0xff) { i++; continue; }
    const marker = buf[i + 1];
    if (marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc) {
      return { height: buf.readUInt16BE(i + 5), width: buf.readUInt16BE(i + 7) };
    }
    i += 2 + buf.readUInt16BE(i + 2); // skip this segment
  }
  throw new Error("could not find a JPEG Start-Of-Frame segment");
}

// Enforce the size limit before anything else touches the file.
if (statSync(INPUT).size > MAX_BYTES) {
  throw new Error(`entry.png is over the 1 MiB limit (${statSync(INPUT).size} bytes)`);
}

// Enforce the 1024x1024 pixel limit from the header we just parsed.
const { width, height } = dimensions(data);
if (width > 1024 || height > 1024) {
  throw new Error(`entry.png is ${width}x${height}, over the 1024x1024 limit`);
}

// Copy the bytes exactly as they are — no re-encoding, no edits.
mkdirSync(outDir, { recursive: true });
copyFileSync(INPUT, outFile);
console.log(`wrote ${outFile} (${data.length} bytes)`);
