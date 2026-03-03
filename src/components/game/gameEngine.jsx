// Game Engine - Physics, Player, Obstacles, State

// Base skin definitions. Unlocks are based on best distance (meters).
const SKINS = [
  { id: 'default', name: 'Classic Drunk', color: '#000000', hat: null, accessory: 'bottle', unlockAt: 0 },
  { id: 'zombie', name: 'Zombie', color: '#2d5a1e', hat: null, accessory: 'arm', unlockAt: 100 },
  { id: 'businessman', name: 'Businessman', color: '#1a1a2e', hat: 'tophat', accessory: 'briefcase', unlockAt: 200 },
  { id: 'ninja', name: 'Ninja', color: '#2c2c2c', hat: 'headband', accessory: 'sword', unlockAt: 300 },
  { id: 'pirate', name: 'Pirate', color: '#3d2b1f', hat: 'piratehat', accessory: 'hook', unlockAt: 400 },
  { id: 'astronaut', name: 'Astronaut', color: '#e0e0e0', hat: 'helmet', accessory: 'flag', unlockAt: 500 },
];

// Slightly larger obstacles for better visibility.
const OBSTACLE_TYPES = [
  { type: 'cone', width: 45, height: 60, color: '#ff6b35', balancePenalty: 0.15 },
  { type: 'trashcan', width: 50, height: 70, color: '#6b6b6b', balancePenalty: 0.25 },
  { type: 'bottle', width: 18, height: 40, color: '#4a9e4a', balancePenalty: 0.1 },
  { type: 'puddle', width: 80, height: 16, color: '#3a6ea5', balancePenalty: 0.2 },
  { type: 'cat', width: 50, height: 35, color: '#8B4513', balancePenalty: 0.18 },
];

const FALL_TYPES = ['faceplant', 'spin', 'slide'];

export function createGameState() {
  return {
    screen: 'menu', // menu, playing, paused, gameover, leaderboard, skins
    player: {
      x: 0,
      y: 0,
      lean: 0, // -1 to 1, 0 is balanced
      leanVelocity: 0,
      legPhase: 0,
      armPhase: 0,
      wobbleIntensity: 0.3,
      speed: 1,
      skinId: 'default',
    },
    balance: 0.5, // 0 to 1, 0.5 is center
    balanceDrain: 0.008,
    distance: 0,
    bestScore: parseInt(localStorage.getItem('drunkwalk_best') || '0'),
    obstacles: [],
    obstacleTimer: 0,
    streetOffset: 0,
    difficulty: 1,
    fallType: null,
    fallProgress: 0,
    particles: [],
    screenShake: 0,
    inputCooldown: 0,
    wobbleDirection: 1,
    wobbleTimer: 0,
    lastTime: 0,
    stars: [],
    buildings: [],
    streetLights: [],
    leaderboard: JSON.parse(localStorage.getItem('drunkwalk_leaderboard') || '[]'),
    selectedSkin: localStorage.getItem('drunkwalk_skin') || 'default',
    lastEvent: null, // used by GameCanvas to trigger sounds (hit, gameover, etc.)
  };
}

export function initEnvironment(state, canvasWidth, canvasHeight) {
  // Generate stars
  state.stars = [];
  for (let i = 0; i < 80; i++) {
    state.stars.push({
      x: Math.random() * canvasWidth,
      y: Math.random() * canvasHeight * 0.4,
      size: Math.random() * 2 + 0.5,
      twinkle: Math.random() * Math.PI * 2,
      speed: Math.random() * 2 + 1,
    });
  }

  // Generate buildings
  state.buildings = [];
  let bx = -100;
  while (bx < canvasWidth + 200) {
    const w = 60 + Math.random() * 80;
    const h = 80 + Math.random() * 150;
    state.buildings.push({
      x: bx,
      width: w,
      height: h,
      windows: Math.floor(Math.random() * 8) + 2,
      color: `hsl(${220 + Math.random() * 30}, ${10 + Math.random() * 15}%, ${12 + Math.random() * 10}%)`,
    });
    bx += w + 5 + Math.random() * 15;
  }

  // Street lights
  state.streetLights = [];
  for (let i = 0; i < 6; i++) {
    state.streetLights.push({
      x: i * (canvasWidth / 5) + 50 + Math.random() * 30,
      glowPhase: Math.random() * Math.PI * 2,
    });
  }

  // Player position
  state.player.x = canvasWidth * 0.5;
  state.player.y = canvasHeight * 0.68;
}

export function updateGame(state, dt, canvasWidth, canvasHeight) {
  if (state.screen !== 'playing') return state;

  const dtCapped = Math.min(dt, 0.05);

  // Increase difficulty over time
  state.difficulty = 1 + state.distance / 50;
  state.player.wobbleIntensity = Math.min(0.3 + state.difficulty * 0.04, 0.9);
  state.balanceDrain = Math.min(0.008 + state.difficulty * 0.001, 0.025);
  // Increase running speed as the player travels further
  state.player.speed = 1 + Math.min(state.difficulty * 0.4, 3); // caps at 4x base

  // Wobble timer - random direction changes
  state.wobbleTimer -= dtCapped;
  if (state.wobbleTimer <= 0) {
    state.wobbleDirection = Math.random() > 0.5 ? 1 : -1;
    state.wobbleTimer = 0.5 + Math.random() * 1.5 / state.difficulty;
  }

  // Apply wobble force to lean
  const wobbleForce = state.wobbleDirection * state.player.wobbleIntensity * dtCapped * 2;
  state.player.leanVelocity += wobbleForce;
  state.player.leanVelocity *= 0.95; // damping
  state.player.lean += state.player.leanVelocity * dtCapped * 3;
  state.player.lean = Math.max(-1, Math.min(1, state.player.lean));

  // Balance meter follows lean
  state.balance = 0.5 - state.player.lean * 0.5;
  state.balance = Math.max(0, Math.min(1, state.balance));

  // Drain balance toward edges
  if (state.balance > 0.5) {
    state.balance -= state.balanceDrain * dtCapped * 10 * (state.balance - 0.5);
  } else {
    state.balance += state.balanceDrain * dtCapped * 10 * (0.5 - state.balance);
  }

  // Input cooldown
  if (state.inputCooldown > 0) state.inputCooldown -= dtCapped;

  // Walking animation
  state.player.legPhase += dtCapped * (3 + state.difficulty * 0.5);
  state.player.armPhase += dtCapped * (2.5 + state.difficulty * 0.4);

  // Distance and street scroll speed scale with player speed
  state.distance += dtCapped * state.player.speed;
  state.streetOffset += dtCapped * 80 * state.player.speed;

  // Move buildings and street lights
  const scrollSpeed = dtCapped * 40 * state.player.speed;
  state.buildings.forEach(b => { b.x -= scrollSpeed; });
  state.streetLights.forEach(sl => { sl.x -= scrollSpeed; });

  // Recycle buildings
  const leftmost = Math.min(...state.buildings.map(b => b.x + b.width));
  if (leftmost < -200) {
    const rightmost = Math.max(...state.buildings.map(b => b.x + b.width));
    const removed = state.buildings.shift();
    removed.x = rightmost + 5 + Math.random() * 15;
    removed.width = 60 + Math.random() * 80;
    removed.height = 80 + Math.random() * 150;
    removed.color = `hsl(${220 + Math.random() * 30}, ${10 + Math.random() * 15}%, ${12 + Math.random() * 10}%)`;
    state.buildings.push(removed);
  }

  // Recycle street lights
  state.streetLights.forEach(sl => {
    if (sl.x < -50) sl.x += canvasWidth + 200;
  });

  // Obstacles
  state.obstacleTimer -= dtCapped;
  if (state.obstacleTimer <= 0) {
    const type = OBSTACLE_TYPES[Math.floor(Math.random() * OBSTACLE_TYPES.length)];
    state.obstacles.push({
      ...type,
      x: canvasWidth + 50,
      y: canvasHeight * 0.68 + 35 - type.height / 2 + (Math.random() - 0.5) * 20,
      hit: false,
    });
    state.obstacleTimer = 2 + Math.random() * 3 / state.difficulty;
  }

  // Move obstacles
  state.obstacles.forEach(obs => {
    obs.x -= scrollSpeed * 2;
  });

  // Check collisions
  // Slightly larger hitbox to match the visually bigger stickman.
  const playerHitbox = {
    x: state.player.x - 20,
    y: state.player.y - 50,
    w: 40,
    h: 90,
  };

  state.obstacles.forEach(obs => {
    if (!obs.hit && obs.x < playerHitbox.x + playerHitbox.w && obs.x + obs.width > playerHitbox.x &&
        obs.y < playerHitbox.y + playerHitbox.h && obs.y + obs.height > playerHitbox.y) {
      obs.hit = true;
      // Push lean toward edge
      state.player.leanVelocity += (Math.random() > 0.5 ? 1 : -1) * obs.balancePenalty * 3;
      state.screenShake = 0.3;
      state.lastEvent = 'hitObstacle';
      // Particles
      for (let i = 0; i < 8; i++) {
        state.particles.push({
          x: obs.x + obs.width / 2,
          y: obs.y,
          vx: (Math.random() - 0.5) * 200,
          vy: -Math.random() * 150 - 50,
          life: 0.5 + Math.random() * 0.5,
          maxLife: 0.5 + Math.random() * 0.5,
          color: obs.color,
          size: 3 + Math.random() * 4,
        });
      }
    }
  });

  // Remove off-screen obstacles
  state.obstacles = state.obstacles.filter(obs => obs.x > -100);

  // Update particles
  state.particles.forEach(p => {
    p.x += p.vx * dtCapped;
    p.y += p.vy * dtCapped;
    p.vy += 400 * dtCapped;
    p.life -= dtCapped;
  });
  state.particles = state.particles.filter(p => p.life > 0);

  // Screen shake decay
  if (state.screenShake > 0) state.screenShake -= dtCapped * 2;

  // Check fall
  if (Math.abs(state.player.lean) >= 0.95) {
    state.fallType = FALL_TYPES[Math.floor(Math.random() * FALL_TYPES.length)];
    state.fallProgress = 0;
    state.screen = 'falling';
  }

  return state;
}

export function updateFalling(state, dt) {
  state.fallProgress += dt * 2;
  if (state.fallProgress >= 1) {
    state.screen = 'gameover';
    state.lastEvent = 'gameover';
    const score = Math.floor(state.distance);
    if (score > state.bestScore) {
      state.bestScore = score;
      localStorage.setItem('drunkwalk_best', score.toString());
    }
    // Add to leaderboard
    const lb = [...state.leaderboard, { score, date: new Date().toISOString() }];
    lb.sort((a, b) => b.score - a.score);
    state.leaderboard = lb.slice(0, 10);
    localStorage.setItem('drunkwalk_leaderboard', JSON.stringify(state.leaderboard));
  }
  return state;
}

export function pressLeft(state) {
  if (state.screen !== 'playing' || state.inputCooldown > 0) return;
  state.player.leanVelocity -= 0.4;
  state.inputCooldown = 0.1;
}

export function pressRight(state) {
  if (state.screen !== 'playing' || state.inputCooldown > 0) return;
  state.player.leanVelocity += 0.4;
  state.inputCooldown = 0.1;
}

export function getSkins(bestScore = 0) {
  return SKINS.map((skin) => ({
    ...skin,
    unlocked: bestScore >= (skin.unlockAt ?? 0),
  }));
}

export function getObstacleTypes() {
  return OBSTACLE_TYPES;
}