// Game Renderer - Canvas drawing for all game states

import { getSkins } from './gameEngine';

const SKINS_MAP = {};
// Use base skin data (no unlocks needed for rendering).
getSkins(0).forEach((s) => {
  SKINS_MAP[s.id] = s;
});

const PLAYER_SCALE = 1.4;

export function render(ctx, state, canvasWidth, canvasHeight, menuWobble) {
  ctx.save();

  // Screen shake
  if (state.screenShake > 0) {
    const shakeX = (Math.random() - 0.5) * state.screenShake * 15;
    const shakeY = (Math.random() - 0.5) * state.screenShake * 15;
    ctx.translate(shakeX, shakeY);
  }

  drawBackground(ctx, state, canvasWidth, canvasHeight);
  drawStreet(ctx, state, canvasWidth, canvasHeight);
  drawBuildings(ctx, state, canvasWidth, canvasHeight);
  drawStreetLights(ctx, state, canvasWidth, canvasHeight);

  if (state.screen === 'menu') {
    drawMenuStickman(ctx, state, canvasWidth, canvasHeight, menuWobble);
  } else if (state.screen === 'playing' || state.screen === 'paused' || state.screen === 'falling') {
    drawObstacles(ctx, state, canvasWidth, canvasHeight);
    drawStickman(ctx, state, canvasWidth, canvasHeight);
    drawParticles(ctx, state);
  }

  ctx.restore();
}

function drawBackground(ctx, state, w, h) {
  // Night sky gradient
  const grad = ctx.createLinearGradient(0, 0, 0, h * 0.65);
  grad.addColorStop(0, '#0a0a1a');
  grad.addColorStop(0.5, '#111133');
  grad.addColorStop(1, '#1a1a3a');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  // Moon
  ctx.beginPath();
  ctx.arc(w * 0.85, h * 0.12, 30, 0, Math.PI * 2);
  ctx.fillStyle = '#fffde7';
  ctx.fill();
  ctx.beginPath();
  ctx.arc(w * 0.85 + 8, h * 0.12 - 5, 25, 0, Math.PI * 2);
  ctx.fillStyle = '#111133';
  ctx.fill();

  // Stars
  const time = Date.now() / 1000;
  state.stars.forEach(star => {
    const twinkle = Math.sin(time * star.speed + star.twinkle) * 0.5 + 0.5;
    ctx.globalAlpha = 0.3 + twinkle * 0.7;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(star.x, star.y, star.size * twinkle, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.globalAlpha = 1;
}

function drawBuildings(ctx, state, w, h) {
  const groundY = h * 0.68 + 40;
  state.buildings.forEach(b => {
    ctx.fillStyle = b.color;
    ctx.fillRect(b.x, groundY - b.height, b.width, b.height);

    // Windows
    const cols = Math.floor(b.width / 20);
    const rows = Math.floor(b.height / 25);
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const wx = b.x + 8 + col * (b.width - 16) / Math.max(cols, 1);
        const wy = groundY - b.height + 12 + row * 25;
        const lit = Math.sin(b.x * 0.1 + row * 3 + col * 7) > -0.3;
        ctx.fillStyle = lit ? `rgba(255, 230, 150, ${0.6 + Math.random() * 0.2})` : 'rgba(20,20,40,0.8)';
        ctx.fillRect(wx, wy, 10, 14);
      }
    }
  });
}

function drawStreet(ctx, state, w, h) {
  const groundY = h * 0.68 + 40;

  // Street
  const streetGrad = ctx.createLinearGradient(0, groundY, 0, h);
  streetGrad.addColorStop(0, '#2a2a2a');
  streetGrad.addColorStop(1, '#1a1a1a');
  ctx.fillStyle = streetGrad;
  ctx.fillRect(0, groundY, w, h - groundY);

  // Sidewalk
  ctx.fillStyle = '#3a3a3a';
  ctx.fillRect(0, groundY, w, 8);

  // Road lines
  const lineOffset = state.streetOffset % 60;
  ctx.setLineDash([30, 30]);
  ctx.lineDashOffset = -lineOffset;
  ctx.strokeStyle = '#ffdd44';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(0, groundY + (h - groundY) * 0.5);
  ctx.lineTo(w, groundY + (h - groundY) * 0.5);
  ctx.stroke();
  ctx.setLineDash([]);

  // Curb
  ctx.fillStyle = '#555';
  ctx.fillRect(0, groundY - 2, w, 4);
}

function drawStreetLights(ctx, state, w, h) {
  const groundY = h * 0.68 + 40;
  const time = Date.now() / 1000;

  state.streetLights.forEach(sl => {
    // Pole
    ctx.strokeStyle = '#444';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(sl.x, groundY);
    ctx.lineTo(sl.x, groundY - 120);
    ctx.lineTo(sl.x + 15, groundY - 125);
    ctx.stroke();

    // Light glow
    const flicker = Math.sin(time * 3 + sl.glowPhase) * 0.1 + 0.9;
    const glowGrad = ctx.createRadialGradient(sl.x + 15, groundY - 125, 0, sl.x + 15, groundY - 125, 80);
    glowGrad.addColorStop(0, `rgba(255, 220, 150, ${0.4 * flicker})`);
    glowGrad.addColorStop(0.5, `rgba(255, 200, 100, ${0.15 * flicker})`);
    glowGrad.addColorStop(1, 'rgba(255, 200, 100, 0)');
    ctx.fillStyle = glowGrad;
    ctx.beginPath();
    ctx.arc(sl.x + 15, groundY - 125, 80, 0, Math.PI * 2);
    ctx.fill();

    // Bulb
    ctx.fillStyle = `rgba(255, 240, 200, ${flicker})`;
    ctx.beginPath();
    ctx.arc(sl.x + 15, groundY - 125, 5, 0, Math.PI * 2);
    ctx.fill();
  });
}

function drawStickman(ctx, state, w, h) {
  const { player } = state;
  const skin = SKINS_MAP[player.skinId] || SKINS_MAP['default'];
  const lean = player.lean;

  ctx.save();
  ctx.translate(player.x, player.y);
  ctx.scale(PLAYER_SCALE, PLAYER_SCALE);

  // Apply lean rotation
  const leanAngle = lean * 0.5;

  if (state.screen === 'falling') {
    drawFallingStickman(ctx, state, skin, leanAngle);
    ctx.restore();
    return;
  }

  ctx.rotate(leanAngle);

  const legSwing = Math.sin(player.legPhase) * 0.4;
  const armSwing = Math.sin(player.armPhase) * 0.3;

  ctx.strokeStyle = skin.color;
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  // Shadow
  ctx.save();
  ctx.globalAlpha = 0.2;
  ctx.fillStyle = '#000';
  ctx.beginPath();
  ctx.ellipse(0, 35, 20 + Math.abs(lean) * 10, 5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Left leg
  ctx.beginPath();
  ctx.moveTo(0, 10);
  ctx.lineTo(-8 + Math.sin(legSwing) * 10, 35);
  ctx.stroke();

  // Right leg
  ctx.beginPath();
  ctx.moveTo(0, 10);
  ctx.lineTo(8 - Math.sin(legSwing) * 10, 35);
  ctx.stroke();

  // Body
  ctx.beginPath();
  ctx.moveTo(0, -20);
  ctx.lineTo(0, 10);
  ctx.stroke();

  // Left arm
  ctx.beginPath();
  ctx.moveTo(0, -12);
  ctx.lineTo(-15 + Math.sin(armSwing) * 8, 5 + Math.cos(armSwing) * 5);
  ctx.stroke();

  // Right arm (holding accessory)
  const rightArmEndX = 15 - Math.sin(armSwing) * 8;
  const rightArmEndY = 5 - Math.cos(armSwing) * 5;
  ctx.beginPath();
  ctx.moveTo(0, -12);
  ctx.lineTo(rightArmEndX, rightArmEndY);
  ctx.stroke();

  // Head
  ctx.beginPath();
  ctx.arc(0, -28, 9, 0, Math.PI * 2);
  ctx.fillStyle = skin.id === 'zombie' ? '#3d7a2e' : (skin.id === 'astronaut' ? '#e0e0e0' : '#ffdab9');
  ctx.fill();
  ctx.stroke();

  // Eyes (dizzy)
  const eyeOffset = Math.sin(Date.now() / 200) * 1.5;
  ctx.fillStyle = skin.color;
  ctx.beginPath();
  ctx.arc(-3 + eyeOffset, -30, 1.5, 0, Math.PI * 2);
  ctx.arc(3 + eyeOffset, -30, 1.5, 0, Math.PI * 2);
  ctx.fill();

  // Dizzy swirls above head
  if (Math.abs(lean) > 0.3) {
    const t = Date.now() / 300;
    ctx.strokeStyle = '#ffdd44';
    ctx.lineWidth = 1.5;
    for (let i = 0; i < 2; i++) {
      const angle = t + i * Math.PI;
      const r = 8 + i * 4;
      ctx.beginPath();
      ctx.arc(Math.cos(angle) * r, -40 + Math.sin(angle) * 3, 3, 0, Math.PI * 1.5);
      ctx.stroke();
    }
  }

  // Draw hat
  drawHat(ctx, skin);

  // Draw accessory
  drawAccessory(ctx, skin, rightArmEndX, rightArmEndY);

  ctx.restore();
}

function drawFallingStickman(ctx, state, skin, baseLean) {
  const p = state.fallProgress;
  const { player } = state;

  ctx.save();

  if (state.fallType === 'faceplant') {
    const angle = baseLean + p * (baseLean > 0 ? 1.5 : -1.5);
    const dropY = p * p * 40;
    ctx.rotate(angle);
    ctx.translate(0, dropY);
  } else if (state.fallType === 'spin') {
    const angle = baseLean + p * Math.PI * 3 * (baseLean > 0 ? 1 : -1);
    ctx.rotate(angle);
    ctx.translate(0, p * 30);
  } else { // slide
    ctx.translate(baseLean * p * 60, p * p * 50);
    ctx.rotate(baseLean * p * 1.2);
  }

  // Simplified stickman during fall
  ctx.strokeStyle = skin.color;
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';

  // Body
  ctx.beginPath();
  ctx.moveTo(0, -20);
  ctx.lineTo(0, 10);
  ctx.stroke();

  // Arms flailing
  const flail = Math.sin(p * 20) * 0.8;
  ctx.beginPath();
  ctx.moveTo(0, -12);
  ctx.lineTo(-20 + flail * 15, -5 + Math.sin(p * 15) * 20);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(0, -12);
  ctx.lineTo(20 - flail * 15, -5 - Math.sin(p * 15) * 20);
  ctx.stroke();

  // Legs
  ctx.beginPath();
  ctx.moveTo(0, 10);
  ctx.lineTo(-10 + Math.sin(p * 12) * 10, 35);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(0, 10);
  ctx.lineTo(10 - Math.sin(p * 12) * 10, 35);
  ctx.stroke();

  // Head
  ctx.beginPath();
  ctx.arc(0, -28, 9, 0, Math.PI * 2);
  ctx.fillStyle = '#ffdab9';
  ctx.fill();
  ctx.stroke();

  // X eyes
  ctx.strokeStyle = skin.color;
  ctx.lineWidth = 2;
  [-3, 3].forEach(ex => {
    ctx.beginPath();
    ctx.moveTo(ex - 2, -31);
    ctx.lineTo(ex + 2, -27);
    ctx.moveTo(ex + 2, -31);
    ctx.lineTo(ex - 2, -27);
    ctx.stroke();
  });

  ctx.restore();
}

function drawHat(ctx, skin) {
  if (!skin.hat) return;

  ctx.fillStyle = skin.color;
  if (skin.hat === 'tophat') {
    ctx.fillStyle = '#111';
    ctx.fillRect(-10, -46, 20, 15);
    ctx.fillRect(-13, -33, 26, 4);
  } else if (skin.hat === 'headband') {
    ctx.strokeStyle = '#cc0000';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, -28, 11, Math.PI * 0.8, Math.PI * 2.2);
    ctx.stroke();
    // Tail
    ctx.beginPath();
    ctx.moveTo(10, -30);
    ctx.lineTo(20, -35);
    ctx.lineTo(18, -28);
    ctx.stroke();
  } else if (skin.hat === 'piratehat') {
    ctx.fillStyle = '#1a1a1a';
    ctx.beginPath();
    ctx.moveTo(-15, -34);
    ctx.quadraticCurveTo(0, -52, 15, -34);
    ctx.closePath();
    ctx.fill();
    // Skull
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(0, -40, 3, 0, Math.PI * 2);
    ctx.fill();
  } else if (skin.hat === 'helmet') {
    ctx.strokeStyle = '#ccc';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, -28, 12, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = 'rgba(150,200,255,0.3)';
    ctx.beginPath();
    ctx.arc(0, -26, 10, -0.3, Math.PI + 0.3);
    ctx.fill();
  }
}

function drawAccessory(ctx, skin, handX, handY) {
  if (skin.accessory === 'bottle') {
    ctx.fillStyle = '#2d8a4e';
    ctx.fillRect(handX - 3, handY - 14, 6, 14);
    ctx.fillStyle = '#1a5a2e';
    ctx.fillRect(handX - 2, handY - 18, 4, 5);
  } else if (skin.accessory === 'briefcase') {
    ctx.fillStyle = '#5a3a1a';
    ctx.fillRect(handX - 8, handY - 2, 16, 12);
    ctx.strokeStyle = '#8a6a3a';
    ctx.lineWidth = 1;
    ctx.strokeRect(handX - 8, handY - 2, 16, 12);
  } else if (skin.accessory === 'sword') {
    ctx.strokeStyle = '#aaa';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(handX, handY);
    ctx.lineTo(handX + 5, handY - 25);
    ctx.stroke();
    ctx.strokeStyle = '#654';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(handX - 4, handY - 2);
    ctx.lineTo(handX + 4, handY - 2);
    ctx.stroke();
  } else if (skin.accessory === 'hook') {
    ctx.strokeStyle = '#aaa';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(handX + 3, handY + 5, 6, -Math.PI * 0.5, Math.PI);
    ctx.stroke();
  } else if (skin.accessory === 'flag') {
    ctx.strokeStyle = '#888';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(handX, handY);
    ctx.lineTo(handX, handY - 20);
    ctx.stroke();
    ctx.fillStyle = '#ff4444';
    ctx.fillRect(handX, handY - 20, 12, 8);
  } else if (skin.accessory === 'arm') {
    // Zombie detached arm
    ctx.strokeStyle = '#3d7a2e';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(handX, handY);
    ctx.lineTo(handX + 10, handY - 5);
    ctx.lineTo(handX + 15, handY - 8);
    ctx.stroke();
  }
}

function drawMenuStickman(ctx, state, w, h, wobble) {
  const x = w * 0.5;
  const y = h * 0.55;
  const lean = Math.sin(wobble) * 0.25;

  ctx.save();
  ctx.translate(x, y);
  ctx.scale(PLAYER_SCALE, PLAYER_SCALE);
  ctx.rotate(lean);

  const skin = SKINS_MAP[state.selectedSkin] || SKINS_MAP['default'];

  ctx.strokeStyle = skin.color;
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';

  // Shadow
  ctx.save();
  ctx.globalAlpha = 0.2;
  ctx.fillStyle = '#000';
  ctx.beginPath();
  ctx.ellipse(0, 45, 25, 6, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Legs
  const legSwing = Math.sin(wobble * 0.7) * 0.2;
  ctx.beginPath();
  ctx.moveTo(0, 15);
  ctx.lineTo(-12 + Math.sin(legSwing) * 5, 45);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(0, 15);
  ctx.lineTo(12 - Math.sin(legSwing) * 5, 45);
  ctx.stroke();

  // Body
  ctx.beginPath();
  ctx.moveTo(0, -25);
  ctx.lineTo(0, 15);
  ctx.stroke();

  // Left arm
  ctx.beginPath();
  ctx.moveTo(0, -15);
  ctx.lineTo(-18, 5);
  ctx.stroke();

  // Right arm holding bottle up
  const rightArmEndX = 18;
  const rightArmEndY = -5 + Math.sin(wobble * 1.3) * 3;
  ctx.beginPath();
  ctx.moveTo(0, -15);
  ctx.lineTo(rightArmEndX, rightArmEndY);
  ctx.stroke();

  // Head
  ctx.beginPath();
  ctx.arc(0, -35, 12, 0, Math.PI * 2);
  ctx.fillStyle = skin.id === 'zombie' ? '#3d7a2e' : '#ffdab9';
  ctx.fill();
  ctx.stroke();

  // Goofy face
  const eyeWobble = Math.sin(wobble * 2) * 2;
  ctx.fillStyle = skin.color;
  ctx.beginPath();
  ctx.arc(-4 + eyeWobble, -37, 2, 0, Math.PI * 2);
  ctx.arc(4 + eyeWobble, -37, 2, 0, Math.PI * 2);
  ctx.fill();

  // Smile
  ctx.beginPath();
  ctx.arc(0, -32, 5, 0.1, Math.PI - 0.1);
  ctx.stroke();

  drawHat(ctx, skin);
  drawAccessory(ctx, skin, rightArmEndX, rightArmEndY);

  ctx.restore();
}

export function drawObstacles(ctx, state, w, h) {
  state.obstacles.forEach(obs => {
    if (obs.hit) {
      ctx.globalAlpha = 0.4;
    }

    ctx.fillStyle = obs.color;

    if (obs.type === 'cone') {
      ctx.beginPath();
      ctx.moveTo(obs.x + obs.width / 2, obs.y);
      ctx.lineTo(obs.x + obs.width, obs.y + obs.height);
      ctx.lineTo(obs.x, obs.y + obs.height);
      ctx.closePath();
      ctx.fill();
      // Stripes
      ctx.fillStyle = '#fff';
      ctx.fillRect(obs.x + obs.width * 0.25, obs.y + obs.height * 0.4, obs.width * 0.5, 4);
      ctx.fillRect(obs.x + obs.width * 0.15, obs.y + obs.height * 0.65, obs.width * 0.7, 4);
    } else if (obs.type === 'trashcan') {
      ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
      ctx.fillStyle = '#555';
      ctx.fillRect(obs.x - 2, obs.y, obs.width + 4, 6);
      ctx.fillRect(obs.x + 5, obs.y + 12, 3, obs.height - 18);
      ctx.fillRect(obs.x + obs.width - 8, obs.y + 12, 3, obs.height - 18);
    } else if (obs.type === 'bottle') {
      ctx.fillStyle = '#2d8a4e';
      ctx.fillRect(obs.x, obs.y + 8, obs.width, obs.height - 8);
      ctx.fillStyle = '#1a5a2e';
      ctx.fillRect(obs.x + 2, obs.y, obs.width - 4, 10);
    } else if (obs.type === 'puddle') {
      ctx.fillStyle = 'rgba(58, 110, 165, 0.5)';
      ctx.beginPath();
      ctx.ellipse(obs.x + obs.width / 2, obs.y + obs.height / 2, obs.width / 2, obs.height / 2, 0, 0, Math.PI * 2);
      ctx.fill();
      // Reflection
      ctx.fillStyle = 'rgba(100, 160, 220, 0.3)';
      ctx.beginPath();
      ctx.ellipse(obs.x + obs.width * 0.4, obs.y + obs.height * 0.3, obs.width * 0.15, obs.height * 0.2, -0.3, 0, Math.PI * 2);
      ctx.fill();
    } else if (obs.type === 'cat') {
      // Sleeping cat
      ctx.fillStyle = obs.color;
      ctx.beginPath();
      ctx.ellipse(obs.x + obs.width / 2, obs.y + obs.height * 0.6, obs.width / 2, obs.height * 0.4, 0, 0, Math.PI * 2);
      ctx.fill();
      // Head
      ctx.beginPath();
      ctx.arc(obs.x + obs.width * 0.8, obs.y + obs.height * 0.35, 8, 0, Math.PI * 2);
      ctx.fill();
      // Ears
      ctx.beginPath();
      ctx.moveTo(obs.x + obs.width * 0.75, obs.y + obs.height * 0.15);
      ctx.lineTo(obs.x + obs.width * 0.7, obs.y + obs.height * 0.35);
      ctx.lineTo(obs.x + obs.width * 0.82, obs.y + obs.height * 0.28);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(obs.x + obs.width * 0.92, obs.y + obs.height * 0.15);
      ctx.lineTo(obs.x + obs.width * 0.85, obs.y + obs.height * 0.28);
      ctx.lineTo(obs.x + obs.width * 0.95, obs.y + obs.height * 0.35);
      ctx.fill();
      // Tail
      ctx.strokeStyle = obs.color;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(obs.x + 3, obs.y + obs.height * 0.5);
      ctx.quadraticCurveTo(obs.x - 8, obs.y, obs.x + 5, obs.y - 5);
      ctx.stroke();
      // Z's
      ctx.fillStyle = '#fff';
      ctx.font = '10px sans-serif';
      const zt = Date.now() / 600;
      ctx.globalAlpha = Math.sin(zt) * 0.5 + 0.5;
      ctx.fillText('z', obs.x + obs.width * 0.9 + 5, obs.y + obs.height * 0.1 - 5);
      ctx.font = '7px sans-serif';
      ctx.fillText('z', obs.x + obs.width * 0.9 + 12, obs.y + obs.height * 0.1 - 12);
      ctx.globalAlpha = 1;
    }

    ctx.globalAlpha = 1;
  });
}

function drawParticles(ctx, state) {
  state.particles.forEach(p => {
    ctx.globalAlpha = p.life / p.maxLife;
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size * (p.life / p.maxLife), 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.globalAlpha = 1;
}