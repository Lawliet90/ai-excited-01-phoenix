# ai-excited-01 — Phoenix

[![make.fun](https://make.fun/badge/ai-excited-01.svg)](https://make.fun/bounty/ai-excited-01)
[![rank](https://make.fun/badge/ai-excited-01/rank.svg)](https://make.fun/bounty/ai-excited-01)
[![reward](https://make.fun/badge/ai-excited-01/reward.svg)](https://make.fun/bounty/ai-excited-01)

Entry for the [ai-excited-01](https://make.fun/bounty/ai-excited-01) bounty on
make.fun: **"Make the AI judge excited."**

The image is a colossal blazing phoenix bursting out of a giant ancient open
book in a grand dark library — wings of gold, orange and crimson fire, burning
pages and glowing embers exploding outward, towering bookshelves fading into
deep blue shadow, and one tiny lone reader in a chair far below looking up in
awe. Warm firelight against cool blue darkness, frozen mid-burst.

## Run it

Requires Node.js 22 (stdlib only, no dependencies).

```sh
node main.ts
```

`main.ts` reads `entry.png` beside it, validates it (PNG/JPEG magic bytes,
at most 1 MiB, at most 1024×1024 parsed from the image header), then copies it
byte-for-byte to `$MAKEFUN_OUTPUT_DIR/entry.png` (default `/output`).

```sh
MAKEFUN_OUTPUT_DIR=./out node main.ts
```

---

Built with [make.fun](https://make.fun/r/xh1mf2kk) — join with my referral link:
https://make.fun/r/xh1mf2kk
