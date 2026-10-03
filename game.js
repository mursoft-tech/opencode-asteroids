'use strict';

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const W = 800;
const H = 600;

// ── Input ─────────────────────────────────────────────────────────────────────
const keys = {};
const justPressed = {};

window.addEventListener('keydown', e => {
  if (e.ctrlKey && e.shiftKey && (e.code === 'KeyP' || e.key.toLowerCase() === 'p' || e.code === 'KeyX' || e.key.toLowerCase() === 'x')) {
    e.preventDefault();
    const combo = (e.code === 'KeyP' || e.key.toLowerCase() === 'p') ? 'Ctrl+Shift+P' : 'Ctrl+Shift+X';
    if (!keys[combo]) {
      justPressed[combo] = true;
    }
    keys[combo] = true;
    return;
  }
  justPressed[e.code] = !keys[e.code];
  keys[e.code] = true;
  if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code))
    e.preventDefault();
});
window.addEventListener('keyup', e => {
  keys[e.code] = false;
  if (e.code === 'KeyP' || e.key.toLowerCase() === 'p') keys['Ctrl+Shift+P'] = false;
  if (e.code === 'KeyX' || e.key.toLowerCase() === 'x') keys['Ctrl+Shift+X'] = false;
  if (e.key === 'Control' || e.key === 'Shift') {
    keys['Ctrl+Shift+P'] = false;
    keys['Ctrl+Shift+X'] = false;
  }
});

function pressed(code) {
  const val = justPressed[code];
  justPressed[code] = false;
  return val;
}

// ── Utils ─────────────────────────────────────────────────────────────────────
const wrap  = (v, max) => ((v % max) + max) % max;
const dist  = (a, b)   => Math.hypot(a.x - b.x, a.y - b.y);
const rand  = (min, max) => min + Math.random() * (max - min);
const randInt = (min, max) => Math.floor(rand(min, max + 1));

// ── Skins de la nave ──────────────────────────────────────────────────────────
// Cada skin dibuja el contorno en coordenadas locales de la nave (nariz hacia +x).
const SKINS = [
  {
    name: 'CLASICA',
    draw(c, color) {
      c.strokeStyle = color;
      c.lineWidth   = 1.5;
      c.lineJoin    = 'round';
      c.beginPath();
      c.moveTo( 20,  0);
      c.lineTo(-12, -9);
      c.lineTo( -7,  0);
      c.lineTo(-12,  9);
      c.closePath();
      c.stroke();
    },
  },
  {
    name: 'INTERCEPTOR',
    draw(c, color) {
      c.strokeStyle = color;
      c.lineWidth   = 1.5;
      c.lineJoin    = 'round';
      c.beginPath();
      c.moveTo( 24,  0);
      c.lineTo( -6, -6);
      c.lineTo(-14, -9);
      c.lineTo( -8,  0);
      c.lineTo(-14,  9);
      c.lineTo( -6,  6);
      c.closePath();
      c.stroke();
    },
  },
  {
    name: 'PESADA',
    draw(c, color) {
      c.strokeStyle = color;
      c.lineWidth   = 1.8;
      c.lineJoin    = 'round';
      c.beginPath();
      c.moveTo( 16,   0);
      c.lineTo( 10, -11);
      c.lineTo(-10, -11);
      c.lineTo(-15,   0);
      c.lineTo(-10,  11);
      c.lineTo( 10,  11);
      c.closePath();
      c.stroke();
      c.beginPath();
      c.moveTo( 10, 0);
      c.lineTo(-10, 0);
      c.stroke();
    },
  },
  {
    name: 'FANTASMA',
    draw(c, color) {
      c.strokeStyle = color;
      c.lineWidth   = 1.5;
      c.lineJoin    = 'round';
      c.setLineDash([3, 3]);
      c.beginPath();
      c.moveTo( 20,  0);
      c.lineTo(-12, -9);
      c.lineTo( -7,  0);
      c.lineTo(-12,  9);
      c.closePath();
      c.stroke();
      c.setLineDash([]);
    },
  },
];

const SKIN_STORAGE_KEY = 'asteroids.skin';

function loadSkin() {
  try {
    const v = parseInt(localStorage.getItem(SKIN_STORAGE_KEY), 10);
    if (Number.isInteger(v) && v >= 0 && v < SKINS.length) return v;
  } catch (e) {}
  return 0;
}

function setSkin(i) {
  currentSkin = ((i % SKINS.length) + SKINS.length) % SKINS.length;
  try { localStorage.setItem(SKIN_STORAGE_KEY, String(currentSkin)); } catch (e) {}
}

function drawShipShape(skin, x, y, scale, color) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(-Math.PI / 2);
  ctx.scale(scale, scale);
  skin.draw(ctx, color);
  ctx.restore();
}

// ── Bullet ────────────────────────────────────────────────────────────────────
class Bullet {
  constructor(x, y, angle) {
    this.x = x;
    this.y = y;
    const SPEED = 520;
    this.vx = Math.cos(angle) * SPEED;
    this.vy = Math.sin(angle) * SPEED;
    this.ttl  = 1.1;
    this.radius = 2;
    this.dead = false;
  }

  update(dt) {
    this.x = wrap(this.x + this.vx * dt, W);
    this.y = wrap(this.y + this.vy * dt, H);
    this.ttl -= dt;
    if (this.ttl <= 0) this.dead = true;
  }

  draw() {
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
  }
}

// ── EnemyBullet ───────────────────────────────────────────────────────────────
const ENEMY_BULLET_SPEED = 260;

class EnemyBullet {
  constructor(x, y, angle) {
    this.x = x;
    this.y = y;
    this.vx = Math.cos(angle) * ENEMY_BULLET_SPEED;
    this.vy = Math.sin(angle) * ENEMY_BULLET_SPEED;
    this.ttl  = 2.6;
    this.radius = 3;
    this.dead = false;
  }

  update(dt) {
    this.x = wrap(this.x + this.vx * dt, W);
    this.y = wrap(this.y + this.vy * dt, H);
    this.ttl -= dt;
    if (this.ttl <= 0) this.dead = true;
  }

  draw() {
    ctx.fillStyle = '#f55';
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
  }
}

// ── Asteroid ──────────────────────────────────────────────────────────────────
const RADII  = [0, 16, 30, 50];   // por tamaño 1, 2, 3
const SPEEDS = [0, 85, 55, 32];   // velocidad base por tamaño
const POINTS = [0, 100, 50, 20];  // puntos por tamaño

const SHOOTING_STAR_POINTS = 150;
const SHOOTING_STAR_TTL    = 6;    // segundos antes de desvanecerse
const SHOOTING_STAR_MULT   = 2.2;  // multiplicador de velocidad

const POWERUP_DURATION = 5;    // segundos que dura un power-up activo
const TRIPLE_SPREAD    = 0.14; // rad (~8°) de desviación por bala lateral

// ── Enemigo (OVNI) ────────────────────────────────────────────────────────────
const ENEMY_POINTS        = 200;
const ENEMY_SPEED         = 55;   // px/s
const ENEMY_FIRE_INTERVAL = 1.8;  // segundos entre disparos
const ENEMY_MAX           = 3;    // enemigos simultáneos
const SHIELD_DURATION     = 8;    // segundos de escudo
const SHIELD_DROP_CHANCE  = 0.35; // probabilidad de soltar escudo al morir un OVNI

class Enemy {
  constructor(x, y, angle) {
    this.x = x;
    this.y = y;
    this.radius = 15;
    this.dead = false;
    const speed = ENEMY_SPEED + rand(-10, 10);
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;
    this.fireTimer = rand(0.8, ENEMY_FIRE_INTERVAL);
  }

  update(dt) {
    this.x = wrap(this.x + this.vx * dt, W);
    this.y = wrap(this.y + this.vy * dt, H);
    this.fireTimer -= dt;
  }

  tryShoot(ship) {
    if (this.fireTimer > 0 || this.dead || ship.dead) return null;
    this.fireTimer = ENEMY_FIRE_INTERVAL + rand(-0.3, 0.3);
    const angle = Math.atan2(ship.y - this.y, ship.x - this.x) + rand(-0.12, 0.12);
    return new EnemyBullet(this.x, this.y, angle);
  }

  draw() {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.strokeStyle = '#f55';
    ctx.lineWidth   = 1.5;
    ctx.lineJoin    = 'round';
    // Cúpula
    ctx.beginPath();
    ctx.arc(0, -3, 6, Math.PI, 0);
    ctx.stroke();
    // Casco (platillo)
    ctx.beginPath();
    ctx.ellipse(0, 1, this.radius, 6, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }
}

class Asteroid {
  constructor(x, y, size = 3, opts = {}) {
    this.x    = x;
    this.y    = y;
    this.size = size;
    this.radius = RADII[size];
    this.dead = false;
    this.special = !!opts.special;

    const angle = opts.angle !== undefined ? opts.angle : rand(0, Math.PI * 2);
    const speed = (SPEEDS[size] + rand(-15, 15)) * (this.special ? SHOOTING_STAR_MULT : 1);
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;
    this.rotSpeed = rand(-1.2, 1.2);
    this.rot = rand(0, Math.PI * 2);

    if (this.special) this.ttl = SHOOTING_STAR_TTL;

    // Polígono irregular
    const n = randInt(8, 13);
    this.verts = [];
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      const r = this.radius * rand(0.6, 1.0);
      this.verts.push([Math.cos(a) * r, Math.sin(a) * r]);
    }
  }

  update(dt) {
    this.x   = wrap(this.x + this.vx * dt, W);
    this.y   = wrap(this.y + this.vy * dt, H);
    this.rot += this.rotSpeed * dt;
    if (this.special) {
      this.ttl -= dt;
      if (this.ttl <= 0) this.dead = true;
    }
  }

  split() {
    if (this.special || this.size <= 1) return [];
    return [
      new Asteroid(this.x, this.y, this.size - 1),
      new Asteroid(this.x, this.y, this.size - 1),
    ];
  }

  draw() {
    // Estela de la estrella fugaz
    if (this.special) {
      const speed = Math.hypot(this.vx, this.vy) || 1;
      const len = 34;
      const tx = this.x - (this.vx / speed) * len;
      const ty = this.y - (this.vy / speed) * len;
      const alpha = Math.min(1, this.ttl / 1.5).toFixed(2);
      const grad = ctx.createLinearGradient(this.x, this.y, tx, ty);
      grad.addColorStop(0, `rgba(80,200,255,${alpha})`);
      grad.addColorStop(1, 'rgba(80,200,255,0)');
      ctx.save();
      ctx.strokeStyle = grad;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(this.x, this.y);
      ctx.lineTo(tx, ty);
      ctx.stroke();
      ctx.restore();
    }

    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rot);
    ctx.globalAlpha = this.special ? Math.min(1, this.ttl / 1.5) : 1;
    ctx.strokeStyle = this.special ? '#4cf' : '#fff';
    ctx.lineWidth   = 1.5;
    ctx.lineJoin    = 'round';
    ctx.beginPath();
    ctx.moveTo(this.verts[0][0], this.verts[0][1]);
    for (let i = 1; i < this.verts.length; i++)
      ctx.lineTo(this.verts[i][0], this.verts[i][1]);
    ctx.closePath();
    ctx.stroke();
    ctx.restore();
  }
}

// ── Ship ──────────────────────────────────────────────────────────────────────
class Ship {
  constructor() { this.reset(); }

  reset() {
    this.x      = W / 2;
    this.y      = H / 2;
    this.angle  = -Math.PI / 2;
    this.vx     = 0;
    this.vy     = 0;
    this.radius = 12;
    this.thrusting     = false;
    this.invincible    = 3;
    this.shootCooldown = 0;
    this.speedTimer    = 0;
    this.shieldTimer   = 0;
    this.dead          = false;
  }

  update(dt) {
    if (this.dead) return;
    if (this.invincible    > 0) this.invincible    -= dt;
    if (this.shootCooldown > 0) this.shootCooldown -= dt;
    if (this.speedTimer    > 0) this.speedTimer    -= dt;
    if (this.shieldTimer   > 0) this.shieldTimer   -= dt;

    const ROT   = 3.5;   // rad/s
    const THRUST = 260;  // px/s²
    const DRAG   = 0.987;
    const boost  = this.speedTimer > 0 ? 2 : 1;

    if (keys['ArrowLeft'])  this.angle -= ROT * dt;
    if (keys['ArrowRight']) this.angle += ROT * dt;

    this.thrusting = !!keys['ArrowUp'];
    if (this.thrusting) {
      this.vx += Math.cos(this.angle) * THRUST * boost * dt;
      this.vy += Math.sin(this.angle) * THRUST * boost * dt;
    }

    this.vx *= DRAG;
    this.vy *= DRAG;
    this.x = wrap(this.x + this.vx * dt, W);
    this.y = wrap(this.y + this.vy * dt, H);
  }

  tryShoot() {
    if (this.shootCooldown > 0 || this.dead) return [];
    this.shootCooldown = 0.2;
    const NOSE = 21;
    const ox = this.x + Math.cos(this.angle) * NOSE;
    const oy = this.y + Math.sin(this.angle) * NOSE;
    return [
      new Bullet(ox, oy, this.angle - TRIPLE_SPREAD),
      new Bullet(ox, oy, this.angle),
      new Bullet(ox, oy, this.angle + TRIPLE_SPREAD),
    ];
  }

  draw() {
    if (this.dead) return;

    // Escudo activo
    if (this.shieldTimer > 0) {
      const pulse = 1 + Math.sin(this.shieldTimer * 10) * 0.08;
      const alpha = this.shieldTimer < 2
        ? 0.35 + 0.45 * Math.abs(Math.sin(this.shieldTimer * 8))
        : 0.8;
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.strokeStyle = `rgba(110,255,110,${alpha.toFixed(2)})`;
      ctx.lineWidth   = 2;
      ctx.beginPath();
      ctx.arc(0, 0, this.radius * 1.8 * pulse, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // Parpadeo durante invencibilidad de reaparición
    if (this.invincible > 0 && Math.floor(this.invincible * 8) % 2 === 0) return;

    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);

    // Silueta según la skin activa
    SKINS[currentSkin].draw(ctx, this.speedTimer > 0 ? '#4cf' : '#fff');

    // Llama del propulsor
    if (this.thrusting && Math.random() > 0.35) {
      ctx.beginPath();
      ctx.moveTo(-8, -4);
      ctx.lineTo(-8 - rand(6, 14), 0);
      ctx.lineTo(-8,  4);
      ctx.strokeStyle = 'rgba(255, 130, 0, 0.85)';
      ctx.stroke();
    }

    ctx.restore();
  }
}

// ── Partículas (explosión) ────────────────────────────────────────────────────
class Particle {
  constructor(x, y) {
    this.x  = x;
    this.y  = y;
    const angle = rand(0, Math.PI * 2);
    const speed = rand(30, 130);
    this.vx   = Math.cos(angle) * speed;
    this.vy   = Math.sin(angle) * speed;
    this.life = rand(0.4, 1.1);
    this.ttl  = this.life;
    this.dead = false;
  }

  update(dt) {
    this.x  += this.vx * dt;
    this.y  += this.vy * dt;
    this.ttl -= dt;
    if (this.ttl <= 0) this.dead = true;
  }

  draw() {
    const alpha = this.ttl / this.life;
    ctx.strokeStyle = `rgba(255,255,255,${alpha.toFixed(2)})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(this.x, this.y);
    ctx.lineTo(this.x - this.vx * 0.05, this.y - this.vy * 0.05);
    ctx.stroke();
  }
}

// ── Power-ups (velocidad / escudo) ────────────────────────────────────────────
class PowerUp {
  constructor(x, y, type = 'speed') {
    this.x = x;
    this.y = y;
    this.type = type;   // 'speed' | 'shield'
    this.radius = 12;
    this.dead = false;
    this.ttl = 12;
    const angle = rand(0, Math.PI * 2);
    const speed = 40;
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;
  }

  update(dt) {
    this.x   = wrap(this.x + this.vx * dt, W);
    this.y   = wrap(this.y + this.vy * dt, H);
    this.ttl -= dt;
    if (this.ttl <= 0) this.dead = true;
  }

  draw() {
    const pulse = 1 + Math.sin(this.ttl * 8) * 0.12;
    const r = this.radius * pulse;
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.lineWidth = 2;
    ctx.lineJoin  = 'round';
    if (this.type === 'shield') {
      ctx.strokeStyle = '#6f6';
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.5, 0, Math.PI * 2);
      ctx.stroke();
    } else {
      ctx.strokeStyle = '#4cf';
      ctx.beginPath();
      ctx.moveTo( 0, -r);
      ctx.lineTo( r,  0);
      ctx.lineTo( 0,  r);
      ctx.lineTo(-r,  0);
      ctx.closePath();
      ctx.stroke();
    }
    ctx.restore();
  }
}

// ── Estado del juego ──────────────────────────────────────────────────────────
let ship, bullets, asteroids, particles, powerups;
let enemies, enemyBullets;
let score, lives, level;
let currentSkin;
let state;      // 'playing' | 'dead' | 'gameover' | 'paused'
let prevState = 'playing';
let deadTimer;
let shootingStarTimer;
let powerupDropped; // garantiza al menos un power-up por nivel
let enemyTimer;

function spawnAsteroids(count) {
  const SAFE_DIST = 130;
  for (let i = 0; i < count; i++) {
    let x, y;
    do {
      x = rand(0, W);
      y = rand(0, H);
    } while (Math.hypot(x - W / 2, y - H / 2) < SAFE_DIST);
    asteroids.push(new Asteroid(x, y, 3));
  }
}

function spawnShootingStar() {
  let x, y, angle;
  const edge = randInt(0, 3);
  if (edge === 0)       { x = rand(0, W); y = 0; angle =  Math.PI / 2; }
  else if (edge === 1)  { x = W; y = rand(0, H); angle =  Math.PI;     }
  else if (edge === 2)  { x = rand(0, W); y = H; angle = -Math.PI / 2; }
  else                  { x = 0; y = rand(0, H); angle =  0;           }
  angle += rand(-0.5, 0.5);
  asteroids.push(new Asteroid(x, y, 1, { special: true, angle }));
}

function spawnEnemy() {
  let x, y;
  const edge = randInt(0, 3);
  if (edge === 0)       { x = rand(0, W); y = 0; }
  else if (edge === 1)  { x = W; y = rand(0, H); }
  else if (edge === 2)  { x = rand(0, W); y = H; }
  else                  { x = 0; y = rand(0, H); }
  const angle = Math.atan2(ship.y - y, ship.x - x) + rand(-0.6, 0.6);
  enemies.push(new Enemy(x, y, angle));
}

function initGame() {
  ship          = new Ship();
  bullets   = [];
  asteroids = [];
  particles = [];
  powerups  = [];
  enemies      = [];
  enemyBullets = [];
  score  = 0;
  lives  = 3;
  level  = 1;
  state  = 'playing';
  prevState = 'playing';
  shootingStarTimer = 8;
  powerupDropped = false;
  enemyTimer = 10;
  spawnAsteroids(4);
}

function nextLevel() {
  level++;
  bullets      = [];
  particles    = [];
  powerups     = [];
  enemies      = [];
  enemyBullets = [];
  enemyTimer   = 6;
  powerupDropped = false;
  ship.reset();
  spawnAsteroids(3 + level);
}

function explode(x, y, count = 8) {
  for (let i = 0; i < count; i++) particles.push(new Particle(x, y));
}

function killShip() {
  explode(ship.x, ship.y, 14);
  ship.dead = true;
  lives--;
  if (lives <= 0) {
    state = 'gameover';
  } else {
    state     = 'dead';
    deadTimer = 2;
  }
}

// ── Update ────────────────────────────────────────────────────────────────────
function update(dt) {
  if (pressed('Ctrl+Shift+X')) {
    if (state !== 'gameover') {
      state = 'gameover';
    }
  }

  if (pressed('Ctrl+Shift+P')) {
    if (state === 'paused') {
      state = prevState;
    } else if (state === 'playing' || state === 'dead') {
      prevState = state;
      state = 'paused';
    }
  }

  if (state === 'paused') {
    // Selección de skin desde el menú de pausa
    for (let i = 0; i < SKINS.length && i < 9; i++) {
      if (pressed(`Digit${i + 1}`)) setSkin(i);
    }
    if (pressed('ArrowRight')) setSkin(currentSkin + 1);
    if (pressed('ArrowLeft'))  setSkin(currentSkin - 1);
    return;
  }

  if (state === 'gameover') {
    if (pressed('Space')) initGame();
    particles.forEach(p => p.update(dt));
    particles = particles.filter(p => !p.dead);
    return;
  }

  if (state === 'dead') {
    deadTimer -= dt;
    particles.forEach(p => p.update(dt));
    particles = particles.filter(p => !p.dead);
    asteroids.forEach(a => a.update(dt));
    powerups.forEach(p => p.update(dt));
    powerups = powerups.filter(p => !p.dead);
    enemies.forEach(e => e.update(dt));
    enemyBullets.forEach(b => b.update(dt));
    enemyBullets = enemyBullets.filter(b => !b.dead);
    if (deadTimer <= 0) { state = 'playing'; ship.reset(); }
    return;
  }

  // Disparar
  if (pressed('Space')) {
    bullets.push(...ship.tryShoot());
  }

  // Ciclar skin en vivo
  if (pressed('KeyS')) setSkin(currentSkin + 1);

  ship.update(dt);
  bullets.forEach(b => b.update(dt));
  asteroids.forEach(a => a.update(dt));
  particles.forEach(p => p.update(dt));
  powerups.forEach(p => p.update(dt));
  enemies.forEach(e => e.update(dt));
  enemyBullets.forEach(b => b.update(dt));

  bullets   = bullets.filter(b => !b.dead);
  particles = particles.filter(p => !p.dead);
  powerups  = powerups.filter(p => !p.dead);
  asteroids = asteroids.filter(a => !a.dead);

  // Estrella fugaz periódica
  shootingStarTimer -= dt;
  if (shootingStarTimer <= 0) {
    if (asteroids.filter(a => a.special).length < 2) spawnShootingStar();
    shootingStarTimer = rand(12, 20);
  }

  // Aparición periódica de enemigos
  enemyTimer -= dt;
  if (enemyTimer <= 0) {
    if (enemies.length < ENEMY_MAX) spawnEnemy();
    enemyTimer = rand(9, Math.max(5, 16 - level));
  }

  // Disparo enemigo
  if (!ship.dead) {
    for (const e of enemies) {
      const shot = e.tryShoot(ship);
      if (shot) enemyBullets.push(shot);
    }
  }

  // Bala vs asteroide
  const newAsteroids = [];
  for (const b of bullets) {
    for (const a of asteroids) {
      if (!a.dead && !b.dead && dist(b, a) < a.radius) {
        b.dead = true;
        a.dead = true;
        score += a.special ? SHOOTING_STAR_POINTS : POINTS[a.size];
        explode(a.x, a.y, a.special ? 16 : a.size * 5);
        if (!a.special && a.size >= 2 && (!powerupDropped || Math.random() < 0.2)) {
          powerups.push(new PowerUp(a.x, a.y));
          powerupDropped = true;
        }
        newAsteroids.push(...a.split());
      }
    }
  }
  asteroids = asteroids.filter(a => !a.dead).concat(newAsteroids);
  bullets   = bullets.filter(b => !b.dead);

  // Bala vs enemigo
  for (const b of bullets) {
    for (const e of enemies) {
      if (!e.dead && !b.dead && dist(b, e) < e.radius) {
        b.dead = true;
        e.dead = true;
        score += ENEMY_POINTS;
        explode(e.x, e.y, 12);
        if (Math.random() < SHIELD_DROP_CHANCE) powerups.push(new PowerUp(e.x, e.y, 'shield'));
      }
    }
  }
  bullets = bullets.filter(b => !b.dead);
  enemies = enemies.filter(e => !e.dead);

  // Bala enemiga vs nave (el escudo la absorbe)
  if (!ship.dead && ship.invincible <= 0) {
    for (const b of enemyBullets) {
      if (!b.dead && dist(ship, b) < ship.radius + b.radius) {
        b.dead = true;
        if (ship.shieldTimer > 0) {
          explode(b.x, b.y, 4);
        } else {
          killShip();
          break;
        }
      }
    }
  }
  enemyBullets = enemyBullets.filter(b => !b.dead);

  // Nave vs power-up
  if (!ship.dead) {
    for (const p of powerups) {
      if (!p.dead && dist(ship, p) < ship.radius + p.radius) {
        p.dead = true;
        if (p.type === 'shield') {
          ship.shieldTimer = SHIELD_DURATION;
        } else {
          ship.speedTimer = POWERUP_DURATION;
        }
        explode(p.x, p.y, 6);
      }
    }
  }
  powerups = powerups.filter(p => !p.dead);

  // Nave vs asteroide
  if (!ship.dead && ship.invincible <= 0) {
    for (const a of asteroids) {
      if (dist(ship, a) < ship.radius + a.radius * 0.82) {
        killShip();
        break;
      }
    }
  }

  // Nave vs enemigo
  if (!ship.dead && ship.invincible <= 0) {
    for (const e of enemies) {
      if (dist(ship, e) < ship.radius + e.radius * 0.82) {
        killShip();
        break;
      }
    }
  }

  // Nivel completado
  if (!asteroids.some(a => !a.special)) nextLevel();
}

// ── Draw ──────────────────────────────────────────────────────────────────────
function drawLifeIcon(x, y) {
  drawShipShape(SKINS[currentSkin], x, y, 0.5, '#fff');
}

function drawHUD() {
  ctx.fillStyle = '#fff';
  ctx.font = '15px monospace';

  ctx.textAlign = 'left';
  ctx.fillText(`SCORE  ${score}`, 14, 26);

  ctx.textAlign = 'center';
  ctx.fillText(`NIVEL ${level}`, W / 2, 26);

  for (let i = 0; i < lives; i++)
    drawLifeIcon(W - 16 - i * 22, 18);

  if (ship.shieldTimer > 0) {
    ctx.textAlign = 'center';
    ctx.fillStyle = '#6f6';
    ctx.fillText(`ESCUDO ${Math.ceil(ship.shieldTimer)}`, W / 2, 48);
  }
}

function drawOverlay(title, sub) {
  ctx.textAlign   = 'center';
  ctx.fillStyle   = '#fff';
  ctx.font        = 'bold 46px monospace';
  ctx.fillText(title, W / 2, H / 2 - 18);
  ctx.font        = '18px monospace';
  ctx.fillStyle   = 'rgba(255,255,255,0.65)';
  ctx.fillText(sub, W / 2, H / 2 + 22);
}

function drawFooter() {
  ctx.save();
  ctx.textAlign = 'center';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
  ctx.font = '13px monospace';
  if (state === 'gameover') {
    ctx.fillText('ESPACIO: Reiniciar', W / 2, H - 18);
  } else if (state === 'paused') {
    ctx.fillText('CTRL+SHIFT+P: Reanudar   |   CTRL+SHIFT+X: Terminar', W / 2, H - 18);
  } else {
    ctx.fillText('CTRL+SHIFT+P: Pausar   |   CTRL+SHIFT+X: Terminar', W / 2, H - 18);
  }
  ctx.restore();
}

function drawSkinMenu() {
  const topY   = H / 2 + 110;
  const gap    = 140;
  const startX = W / 2 - gap * (SKINS.length - 1) / 2;

  ctx.save();
  ctx.textAlign = 'center';
  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  ctx.font      = '14px monospace';
  ctx.fillText('SKIN   (1-4  ó  ← →)', W / 2, topY - 48);

  for (let i = 0; i < SKINS.length; i++) {
    const x        = startX + i * gap;
    const selected = i === currentSkin;
    const color    = selected ? '#4cf' : 'rgba(255,255,255,0.5)';
    drawShipShape(SKINS[i], x, topY, 1, color);

    ctx.fillStyle = color;
    ctx.font      = selected ? 'bold 13px monospace' : '13px monospace';
    ctx.fillText(`${i + 1}. ${SKINS[i].name}`, x, topY + 36);
  }
  ctx.restore();
}

function draw() {
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, W, H);

  particles.forEach(p => p.draw());
  asteroids.forEach(a => a.draw());
  bullets.forEach(b => b.draw());
  powerups.forEach(p => p.draw());
  enemies.forEach(e => e.draw());
  enemyBullets.forEach(b => b.draw());
  ship.draw();

  drawHUD();
  drawFooter();

  if (state === 'paused') {
    drawOverlay('PAUSA', 'CTRL + SHIFT + P PARA CONTINUAR   —   CTRL + SHIFT + X PARA TERMINAR');
    drawSkinMenu();
  } else if (state === 'gameover')
    drawOverlay('GAME OVER', `PUNTAJE: ${score}   —   ESPACIO PARA REINICIAR`);
}

// ── Loop principal ────────────────────────────────────────────────────────────
let lastTime = null;

function loop(ts) {
  const dt = lastTime === null ? 0 : Math.min((ts - lastTime) / 1000, 0.05);
  lastTime = ts;
  update(dt);
  draw();
  requestAnimationFrame(loop);
}

currentSkin = loadSkin();
initGame();
requestAnimationFrame(loop);
