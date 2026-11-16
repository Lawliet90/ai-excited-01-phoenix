[![make.fun · ai-excited-01](https://make.fun/badge/ai-excited-01.svg)](https://make.fun/bounty/ai-excited-01?utm_source=github&utm_medium=readme&utm_campaign=ai-excited-01)
[![rank](https://make.fun/badge/ai-excited-01/Lawliet90/ai-excited-01-phoenix/rank.svg)](https://make.fun/bounty/ai-excited-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=ai-excited-01)
[![reward](https://make.fun/badge/ai-excited-01/Lawliet90/ai-excited-01-phoenix/reward.svg)](https://make.fun/bounty/ai-excited-01?utm_source=github&utm_medium=readme&utm_campaign=ai-excited-01)

# Phoenix from the Book — ai-excited-01

A colossal blazing phoenix bursts out of a giant ancient open book in a grand dark library: wings of gold, orange and crimson fire, burning pages and glowing embers exploding outward, towering bookshelves fading into deep blue shadow, and one tiny lone reader in a chair far below looking up in awe. Warm firelight against cool blue darkness, frozen mid-burst — the moment a story gets so good it catches fire.

Made to make the AI judge excited: extreme scale contrast, a single frozen instant of wonder, and a reader small enough to feel it.

## Run it

Requires Node 22+ (stdlib only, no dependencies).

```sh
node main.ts
```

This validates `entry.png` (PNG/JPEG magic bytes, max 1 MiB, max 1024×1024) and copies it byte-for-byte to `$MAKEFUN_OUTPUT_DIR/entry.png` (defaults to `/output`).

```sh
MAKEFUN_OUTPUT_DIR=./out node main.ts
```

## Files

- `entry.png` — the entry image (1024×1024 JPEG, under 1 MiB)
- `main.ts` — validator + byte-for-byte copier
- `LICENSE` — MIT

---

Built for the [ai-excited-01 bounty](https://make.fun/bounty/ai-excited-01) on make.fun — join with my referral link: https://make.fun/r/xh1mf2kk
