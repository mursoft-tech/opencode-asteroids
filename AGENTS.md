# AGENTS.md

Single-file HTML5 canvas game. No package manager, bundler, tests, lint, or CI — do not add tooling unless asked.

## Running / verifying

- Open `index.html` directly in a browser (works over `file://`; classic script, no ES modules), or `npx serve .`.
- Verification is manual gameplay. There is no automated test command.

## Layout

- `game.js` — all game logic, classes, state, and the `requestAnimationFrame` loop.
- `index.html` — loads `game.js` as a classic `<script>` and defines the canvas.
- Canvas is fixed `800x600`, declared twice: `index.html` canvas attrs and `W`/`H` in `game.js`. Keep them in sync.

## Conventions / gotchas

- `'use strict'`, one global script, no imports/exports. Keep it that way.
- Player-facing text and comments are in Spanish (`SCORE`, `NIVEL`, `GAME OVER`). Match the existing language when adding UI strings.
- Input uses `keys` (held) vs `justPressed`/`pressed()` (edge-triggered, read-once). Use `pressed()` for one-shot actions like shooting/restart. Pause/quit combos use `Ctrl+Shift` and are stored under synthetic labels like `'Ctrl+Shift+P'`.
- State machine: `'playing' | 'dead' | 'gameover' | 'paused'`, with `prevState` for pause/resume and `deadTimer`/`ship.invincible` for respawn invincibility.
- World is toroidal — wrap positions through the `wrap()` helper; don't clamp to edges.
- `PowerUp` (velocidad) drifts with `wrap()`, expires after 12 s, and on pickup sets `ship.speedTimer = 5`; the boost is `2x` on `THRUST`.
- The README's "estrella fugaz" asteroid is **not** implemented in `game.js`; the velocidad power-up is. Verify feature claims against `game.js`.
