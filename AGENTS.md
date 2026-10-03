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
- `Ship.tryShoot()` always returns 3 bullets fanned by `TRIPLE_SPREAD` (permanent triple shot).
- The only `PowerUp` is velocidad: drifts with `wrap()`, expires after 12 s, and on pickup sets `ship.speedTimer = POWERUP_DURATION` (`2x` on `THRUST`). At least one is guaranteed to drop per level (`powerupDropped`), with a 20% chance of extras from size≥2 asteroids.
- The "estrella fugaz" is implemented in `game.js` as an `Asteroid` with `special: true` (fast, cian trail, `ttl` ~6 s, no `split()`, 150 pts). It appears on a periodic `shootingStarTimer`. The velocidad power-up is separate. Verify feature claims against `game.js`.
