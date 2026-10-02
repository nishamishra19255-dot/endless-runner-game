const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const scoreValue = document.getElementById('scoreValue');
const bestValue = document.getElementById('bestValue');
const speedValue = document.getElementById('speedValue');
const startOverlay = document.getElementById('startOverlay');
const gameOverOverlay = document.getElementById('gameOverOverlay');
const finalScoreText = document.getElementById('finalScoreText');
const startBtn = document.getElementById('startBtn');
const restartBtn = document.getElementById('restartBtn');

const laneCenters = [105, 210, 315];
const groundY = 600;
const basePlayerWidth = 52;
const basePlayerHeight = 66;
const obstacleTypes = ['barrier', 'lowBarrier', 'train', 'cone'];

const state = {
  running: false,
  over: false,
  score: 0,
  best: Number(localStorage.getItem('velocity-best') || 0),
  speed: 340,
  spawnTimer: 0.9,
  lastTime: 0,
};

const player = {
  lane: 1,
  jumpOffset: 0,
  velocityY: 0,
  isSliding: false,
  slideTimer: 0,
  width: basePlayerWidth,
  height: basePlayerHeight,
};

const obstacles = [];
const coins = [];

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function rand(min, max) {
  return Math.random() * (max - min) + min;
}

function updateHud() {
  scoreValue.textContent = Math.floor(state.score).toString();
  bestValue.textContent = Math.floor(state.best).toString();
  speedValue.textContent = `${(state.speed / 340).toFixed(1)}x`;
}

function resetGame() {
  obstacles.length = 0;
  coins.length = 0;
  player.lane = 1;
  player.jumpOffset = 0;
  player.velocityY = 0;
  player.isSliding = false;
  player.slideTimer = 0;
  player.width = basePlayerWidth;
  player.height = basePlayerHeight;
  state.score = 0;
  state.speed = 340;
  state.spawnTimer = 0.9;
  state.running = true;
  state.over = false;
  state.lastTime = 0;
  startOverlay.classList.add('hidden');
  gameOverOverlay.classList.add('hidden');
  updateHud();
}

function startGame() {
  resetGame();
}

function endGame() {
  state.running = false;
  state.over = true;
  if (state.score > state.best) {
    state.best = Math.floor(state.score);
    localStorage.setItem('velocity-best', String(state.best));
  }
  finalScoreText.textContent = `Score: ${Math.floor(state.score)}`;
  updateHud();
  gameOverOverlay.classList.remove('hidden');
}

function moveLane(direction) {
  if (!state.running || state.over) return;
  player.lane = clamp(player.lane + direction, 0, laneCenters.length - 1);
}

function jump() {
  if (!state.running || state.over) return;
  if (player.jumpOffset <= 8) {
    player.velocityY = 760;
  }
}

function slide() {
  if (!state.running || state.over) return;
  if (player.jumpOffset <= 10) {
    player.isSliding = true;
    player.slideTimer = 0.55;
  }
}

function spawnObstacle(type = 'barrier', lane = Math.floor(Math.random() * laneCenters.length)) {
  let width = 60;
  let height = 54;

  if (type === 'train') {
    width = 88;
    height = 130;
  } else if (type === 'cone') {
    width = 42;
    height = 46;
  } else if (type === 'lowBarrier') {
    width = 66;
    height = 30;
  }

  obstacles.push({
    lane,
    type,
    x: laneCenters[lane],
    y: -120,
    width,
    height,
  });
}

function spawnCoinTrail(lane, count = 5) {
  for (let i = 0; i < count; i += 1) {
    coins.push({
      lane,
      y: -120 - i * 40,
      radius: 12,
      collected: false,
    });
  }
}

function spawnPattern() {
  const roll = Math.random();
  const safeLane = Math.floor(Math.random() * laneCenters.length);
  const otherLanes = [0, 1, 2].filter((lane) => lane !== safeLane);

  if (roll < 0.26) {
    const lane = Math.floor(Math.random() * laneCenters.length);
    spawnObstacle('barrier', lane);
    spawnCoinTrail(safeLane, 4);
  } else if (roll < 0.52) {
    const lane = Math.floor(Math.random() * laneCenters.length);
    spawnObstacle('lowBarrier', lane);
    spawnCoinTrail(safeLane, 5);
  } else if (roll < 0.68) {
    const laneA = otherLanes[Math.floor(Math.random() * otherLanes.length)];
    const laneB = otherLanes.find((lane) => lane !== laneA) || laneA;
    spawnObstacle('barrier', laneA);
    spawnObstacle('cone', laneB);
    spawnCoinTrail(safeLane, 4);
  } else if (roll < 0.84) {
    const lane = Math.floor(Math.random() * laneCenters.length);
    spawnObstacle('train', lane);
    spawnCoinTrail(Math.floor(Math.random() * laneCenters.length), 5);
  } else {
    const lane = Math.floor(Math.random() * laneCenters.length);
    spawnObstacle('barrier', lane);
    spawnObstacle('barrier', (lane + 1) % 3);
    spawnCoinTrail(safeLane, 5);
  }
}

function getPlayerRect() {
  const currentHeight = player.isSliding ? 34 : player.height;
  const currentWidth = player.isSliding ? 60 : player.width;
  const x = laneCenters[player.lane] - currentWidth / 2;
  const y = groundY - currentHeight - player.jumpOffset;

  return { x, y, width: currentWidth, height: currentHeight };
}

function rectsIntersect(a, b) {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

function handleCollision() {
  const playerRect = getPlayerRect();

  for (let i = obstacles.length - 1; i >= 0; i -= 1) {
    const obstacle = obstacles[i];
    const obstacleRect = {
      x: laneCenters[obstacle.lane] - obstacle.width / 2,
      y: obstacle.y,
      width: obstacle.width,
      height: obstacle.height,
    };

    const isJumpingClear = obstacle.type === 'barrier' && player.jumpOffset > 42;
    const isSlidingUnder = obstacle.type === 'lowBarrier' && player.isSliding;

    if (rectsIntersect(playerRect, obstacleRect) && !isJumpingClear && !isSlidingUnder) {
      endGame();
      return;
    }
  }

  for (let i = coins.length - 1; i >= 0; i -= 1) {
    const coin = coins[i];
    if (coin.collected) continue;

    const coinX = laneCenters[coin.lane];
    const coinY = coin.y;
    const playerRect = getPlayerRect();
    const dx = Math.abs(coinX - (playerRect.x + playerRect.width / 2));
    const dy = Math.abs(coinY - (playerRect.y + playerRect.height / 2));

    if (dx < 36 && dy < 36) {
      coin.collected = true;
      state.score += 25;
    }
  }

  for (let i = coins.length - 1; i >= 0; i -= 1) {
    if (coins[i].collected) {
      coins.splice(i, 1);
    }
  }
}

function update(dt) {
  state.score += dt * 20;
  state.speed = Math.min(780, state.speed + dt * 7);
  state.spawnTimer -= dt;

  if (state.spawnTimer <= 0) {
    spawnPattern();
    state.spawnTimer = Math.max(0.68, 1.28 - state.score / 500);
  }

  if (player.velocityY !== 0 || player.jumpOffset > 0) {
    player.velocityY -= 1850 * dt;
    player.jumpOffset += player.velocityY * dt;
    if (player.jumpOffset < 0) {
      player.jumpOffset = 0;
      player.velocityY = 0;
    }
  }

  if (player.isSliding) {
    player.slideTimer -= dt;
    if (player.slideTimer <= 0) {
      player.isSliding = false;
      player.slideTimer = 0;
    }
  }

  for (let i = obstacles.length - 1; i >= 0; i -= 1) {
    obstacles[i].y += state.speed * dt;
    if (obstacles[i].y > canvas.height + 180) {
      obstacles.splice(i, 1);
    }
  }

  for (let i = coins.length - 1; i >= 0; i -= 1) {
    coins[i].y += state.speed * dt;
    if (coins[i].y > canvas.height + 100) {
      coins.splice(i, 1);
    }
  }

  handleCollision();
  updateHud();
}

function drawRoundedRect(x, y, width, height, radius, fill) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
}

function drawBackground() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const sky = ctx.createLinearGradient(0, 0, 0, canvas.height);
  sky.addColorStop(0, '#0d1746');
  sky.addColorStop(0.42, '#111a31');
  sky.addColorStop(1, '#080b16');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (let i = 0; i < 7; i += 1) {
    const buildingX = i * 70 + (Math.sin(i * 1.4) * 18);
    const buildingH = 110 + (i % 4) * 56;
    ctx.fillStyle = 'rgba(12, 16, 27, 0.8)';
    ctx.fillRect(buildingX, 300 - buildingH, 42, buildingH);
    ctx.fillStyle = 'rgba(114, 146, 236, 0.3)';
    for (let row = 0; row < 5; row += 1) {
      for (let col = 0; col < 3; col += 1) {
        ctx.fillRect(buildingX + 7 + col * 10, 310 - buildingH + 12 + row * 18, 6, 10);
      }
    }
  }

  ctx.fillStyle = '#0a0d17';
  ctx.fillRect(0, 500, canvas.width, 220);

  ctx.fillStyle = '#1d2742';
  ctx.fillRect(28, 515, 364, 14);
  ctx.fillRect(50, 565, 320, 14);
  ctx.fillRect(30, 615, 360, 16);

  for (let i = 0; i < 30; i += 1) {
    const x = i * 18 + ((performance.now() / 25) % 18);
    ctx.fillStyle = 'rgba(255,255,255,0.16)';
    ctx.fillRect(x % (canvas.width + 20), 525 + (i % 3) * 28, 8, 6);
  }

  ctx.fillStyle = '#101827';
  ctx.fillRect(0, 640, canvas.width, 80);
}

function drawCoin(coin) {
  const x = laneCenters[coin.lane];
  const y = coin.y;

  ctx.beginPath();
  ctx.arc(x, y, coin.radius, 0, Math.PI * 2);
  ctx.fillStyle = '#ffd76a';
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = '#ffb300';
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(x, y, coin.radius - 6, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255, 241, 186, 0.6)';
  ctx.fill();
}

function drawObstacle(obstacle) {
  const x = laneCenters[obstacle.lane] - obstacle.width / 2;
  const y = obstacle.y;
  const half = obstacle.width / 2;

  if (obstacle.type === 'barrier') {
    ctx.fillStyle = '#ff7c6a';
    drawRoundedRect(x, y, obstacle.width, obstacle.height, 10, '#ff7c6a');
    ctx.fillStyle = '#ffd0c5';
    ctx.fillRect(x + 8, y + 12, obstacle.width - 16, 10);
    ctx.fillRect(x + 8, y + 28, obstacle.width - 16, 8);
  } else if (obstacle.type === 'lowBarrier') {
    ctx.fillStyle = '#f5b942';
    drawRoundedRect(x, y, obstacle.width, obstacle.height, 10, '#f5b942');
    ctx.fillStyle = '#ffe198';
    ctx.fillRect(x + 10, y + 8, obstacle.width - 20, 6);
  } else if (obstacle.type === 'train') {
    ctx.fillStyle = '#4dc3ff';
    drawRoundedRect(x, y, obstacle.width, obstacle.height, 18, '#4dc3ff');
    ctx.fillStyle = '#d9f1ff';
    ctx.fillRect(x + 14, y + 18, obstacle.width - 28, 34);
    ctx.fillRect(x + 18, y + 60, obstacle.width - 36, 22);
    ctx.fillStyle = '#2c4aa8';
    ctx.fillRect(x + 8, y + 90, obstacle.width - 16, 12);
  } else if (obstacle.type === 'cone') {
    ctx.fillStyle = '#ffcb5d';
    ctx.beginPath();
    ctx.moveTo(x + half, y);
    ctx.lineTo(x + obstacle.width, y + obstacle.height);
    ctx.lineTo(x, y + obstacle.height);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#fff3c5';
    ctx.fillRect(x + half - 4, y + 8, 8, obstacle.height - 12);
  }
}

function drawPlayer() {
  const playerX = laneCenters[player.lane];
  const playerY = groundY - (player.isSliding ? 34 : player.height) - player.jumpOffset;
  const currentWidth = player.isSliding ? 62 : 52;
  const currentHeight = player.isSliding ? 34 : 66;

  ctx.fillStyle = '#8ef5ff';
  ctx.beginPath();
  ctx.arc(playerX, playerY + 12, 12, 0, Math.PI * 2);
  ctx.fill();

  const bodyY = playerY + 16;
  const bodyX = playerX - currentWidth / 2;

  drawRoundedRect(bodyX, bodyY, currentWidth, currentHeight - 14, 14, '#6d7dff');
  ctx.fillStyle = '#c4f4ff';
  ctx.fillRect(playerX - 14, bodyY + 14, 28, 18);

  if (player.isSliding) {
    ctx.fillStyle = '#d9f7ff';
    ctx.fillRect(playerX - 20, playerY + 28, 40, 7);
  }
}

function drawScene() {
  drawBackground();

  for (const coin of coins) {
    drawCoin(coin);
  }

  for (const obstacle of obstacles) {
    drawObstacle(obstacle);
  }

  drawPlayer();
}

function loop(timestamp) {
  if (!state.lastTime) state.lastTime = timestamp;
  const dt = Math.min((timestamp - state.lastTime) / 1000, 0.03);
  state.lastTime = timestamp;

  if (state.running) {
    update(dt);
  }

  drawScene();
  requestAnimationFrame(loop);
}

startBtn.addEventListener('click', startGame);
restartBtn.addEventListener('click', startGame);

['ArrowLeft', 'a', 'A'].includes('A');

window.addEventListener('keydown', (event) => {
  if (['ArrowLeft', 'a', 'A'].includes(event.key)) {
    moveLane(-1);
  }

  if (['ArrowRight', 'd', 'D'].includes(event.key)) {
    moveLane(1);
  }

  if (['ArrowUp', 'w', 'W', ' '].includes(event.key)) {
    jump();
  }

  if (['ArrowDown', 's', 'S'].includes(event.key)) {
    slide();
  }
});

document.querySelectorAll('.control-btn').forEach((button) => {
  button.addEventListener('click', () => {
    const action = button.dataset.action;
    if (action === 'left') moveLane(-1);
    if (action === 'right') moveLane(1);
    if (action === 'jump') jump();
    if (action === 'slide') slide();
  });
});

updateHud();
requestAnimationFrame(loop);
