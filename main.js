const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const startBtn = document.getElementById('startBtn');
const menu = document.getElementById('menu');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let bgImage = new Image();
let maskCanvas = document.createElement('canvas');
let maskCtx = maskCanvas.getContext('2d');

let enemies = [];

function createEnemies() {
  enemies = [];
  for (let i = 0; i < 2; i++) {
    enemies.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 4,
      vy: (Math.random() - 0.5) * 4,
      size: 20
    });
  }
}

function drawEnemies() {
  ctx.fillStyle = 'red';
  enemies.forEach(e => {
    ctx.beginPath();
    ctx.arc(e.x, e.y, e.size, 0, Math.PI * 2);
    ctx.fill();
  });
}

function updateEnemies() {
  enemies.forEach(e => {
    e.x += e.vx;
    e.y += e.vy;

    if (e.x < e.size || e.x > canvas.width - e.size) e.vx *= -1;
    if (e.y < e.size || e.y > canvas.height - e.size) e.vy *= -1;
  });
}

function drawMask() {
  maskCtx.fillStyle = 'black';
  maskCtx.fillRect(0, 0, maskCanvas.width, maskCanvas.height);
}

function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.drawImage(bgImage, 0, 0, canvas.width, canvas.height);
  ctx.drawImage(maskCanvas, 0, 0);

  updateEnemies();
  drawEnemies();

  requestAnimationFrame(gameLoop);
}

startBtn.onclick = () => {
  menu.style.display = 'none';
  canvas.style.display = 'block';

  fetch('levels.json')
    .then(res => res.json())
    .then(data => {
      bgImage.src = data.levels[0]; // Перший рівень
      bgImage.onload = () => {
        maskCanvas.width = canvas.width;
        maskCanvas.height = canvas.height;
        drawMask();
        createEnemies();
        gameLoop();
      };
    });
};
