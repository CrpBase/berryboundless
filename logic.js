
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const urlParams = new URLSearchParams(window.location.search);
const levelId = urlParams.get("level") || "level1";

let levelConfig = null;
let img = new Image();
let mask = [];

fetch("config/levels.json")
  .then(res => res.json())
  .then(data => {
    const level = data.levels.find(l => l.id === levelId);
    if (!level) throw new Error("Level not found");

    levelConfig = level;
    img.src = level.image;
    img.onload = () => init();
  });

function init() {
  const fieldW = Math.floor(canvas.width * 0.7);
  const fieldH = Math.floor(canvas.height * 0.7);
  const fieldX = Math.floor((canvas.width - fieldW) / 2);
  const fieldY = Math.floor((canvas.height - fieldH) / 2);
  const gridSize = 10;
  const cols = Math.floor(fieldW / gridSize);
  const rows = Math.floor(fieldH / gridSize);

  let player = {
    x: Math.floor(cols / 2),
    y: rows - 1,
    trail: [],
    drawing: false,
    tick: 0
  };
  let dir = null;

  mask = Array(rows).fill(0).map(() => Array(cols).fill(0));
  for (let x = 0; x < cols; x++) {
    mask[0][x] = 2;
    mask[rows - 1][x] = 2;
  }
  for (let y = 0; y < rows; y++) {
    mask[y][0] = 2;
    mask[y][cols - 1] = 2;
  }

  const enemies = [];
  for (let i = 0; i < levelConfig.enemies; i++) {
    enemies.push({
      x: 5 + i * 3,
      y: 5 + i * 3,
      vx: (i % 2 === 0 ? 1 : -1) * levelConfig.enemySpeed,
      vy: (i % 2 === 1 ? 1 : -1) * levelConfig.enemySpeed
    });
  }

  document.addEventListener("keydown", e => {
    if (e.key === "ArrowUp") dir = "up";
    if (e.key === "ArrowDown") dir = "down";
    if (e.key === "ArrowLeft") dir = "left";
    if (e.key === "ArrowRight") dir = "right";
  });

  function updatePlayer() {
    player.tick++;
    if (player.tick % levelConfig.playerSpeed !== 0) return;

    let nx = player.x;
    let ny = player.y;
    if (dir === "up") ny--;
    if (dir === "down") ny++;
    if (dir === "left") nx--;
    if (dir === "right") nx++;

    if (nx < 0 || ny < 0 || nx >= cols || ny >= rows) return;

    if (mask[ny][nx] === 0 && !player.drawing) {
      player.drawing = true;
      player.trail = [];
    }

    player.x = nx;
    player.y = ny;

    if (player.drawing) {
      player.trail.push({ x: nx, y: ny });
      if (mask[ny][nx] === 1 || mask[ny][nx] === 2) {
        fillMask();
        player.drawing = false;
        player.trail = [];
      }
    }
  }

  function fillMask() {
    const visited = Array(rows).fill(0).map(() => Array(cols).fill(false));
    function flood(x, y) {
      const stack = [{ x, y }];
      while (stack.length) {
        const { x, y } = stack.pop();
        if (x < 0 || y < 0 || x >= cols || y >= rows) continue;
        if (visited[y][x] || mask[y][x] === 1) continue;
        visited[y][x] = true;
        stack.push({ x: x + 1, y });
        stack.push({ x: x - 1, y });
        stack.push({ x, y: y + 1 });
        stack.push({ x, y: y - 1 });
      }
    }

    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        if (mask[y][x] === 2) flood(x, y);
      }
    }

    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        if (!visited[y][x]) mask[y][x] = 1;
      }
    }
  }

  function updateEnemies() {
    for (let e of enemies) {
      e.x += e.vx;
      e.y += e.vy;
      if (e.x <= 1 || e.x >= cols - 2) e.vx *= -1;
      if (e.y <= 1 || e.y >= rows - 2) e.vy *= -1;
    }
  }

  function checkCollision() {
    if (!player.drawing) return;
    for (let e of enemies) {
      for (let p of player.trail) {
        if (Math.abs(e.x - p.x) < 1 && Math.abs(e.y - p.y) < 1) {
          alert("Game Over");
          location.reload();
        }
      }
    }
  }

  function draw() {
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const fieldW = Math.floor(canvas.width * 0.7);
    const fieldH = Math.floor(canvas.height * 0.7);
    const fieldX = Math.floor((canvas.width - fieldW) / 2);
    const fieldY = Math.floor((canvas.height - fieldH) / 2);
    const gridSize = 10;
    const cols = Math.floor(fieldW / gridSize);
    const rows = Math.floor(fieldH / gridSize);

    ctx.drawImage(img, fieldX, fieldY, fieldW, fieldH);

    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        if (mask[y][x] !== 1) {
          ctx.fillStyle = mask[y][x] === 2 ? "white" : "black";
          ctx.fillRect(fieldX + x * gridSize, fieldY + y * gridSize, gridSize, gridSize);
        }
      }
    }

    if (player.trail.length > 0) {
      ctx.strokeStyle = "white";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(fieldX + player.trail[0].x * gridSize + 5, fieldY + player.trail[0].y * gridSize + 5);
      for (let i = 1; i < player.trail.length; i++) {
        const p = player.trail[i];
        ctx.lineTo(fieldX + p.x * gridSize + 5, fieldY + p.y * gridSize + 5);
      }
      ctx.stroke();
    }

    ctx.fillStyle = "red";
    for (let e of enemies) {
      ctx.beginPath();
      ctx.arc(fieldX + e.x * gridSize + 5, fieldY + e.y * gridSize + 5, 6, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.fillStyle = "lime";
    ctx.beginPath();
    ctx.arc(fieldX + player.x * gridSize + 5, fieldY + player.y * gridSize + 5, 5, 0, Math.PI * 2);
    ctx.fill();
  }

  function loop() {
    updatePlayer();
    updateEnemies();
    checkCollision();
    draw();
    requestAnimationFrame(loop);
  }

  loop();
}
