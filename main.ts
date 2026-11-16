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

// Enforce the size limit before anything else touches the file.
if (statSync(INPUT).size > MAX_BYTES) {
  throw new Error(`entry.png is over the 1 MiB limit (${statSync(INPUT).size} bytes)`);
}

// Copy the bytes exactly as they are — no re-encoding, no edits.
mkdirSync(outDir, { recursive: true });
copyFileSync(INPUT, outFile);
console.log(`wrote ${outFile} (${data.length} bytes)`);
