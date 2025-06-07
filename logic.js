
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const levelId = "level1";
let levelConfig = null;
let img = new Image();
let mask = [];

fetch("config/levels.json")
  .then((res) => res.json())
  .then((data) => {
    const level = data.levels.find((l) => l.id === levelId);
    if (!level) throw new Error("Level not found");

    levelConfig = level;
    img.src = level.image;
    img.onload = () => init();
  });

let player = { x: 0, y: 0, radius: 5, speed: 2, vx: 0, vy: 0, trail: [], cutting: false };
let enemies = [];
let field = { x: 0, y: 0, width: 0, height: 0 };

function init() {
  field.width = Math.floor(canvas.width * 0.7);
  field.height = Math.floor(canvas.height * 0.7);
  field.x = Math.floor((canvas.width - field.width) / 2);
  field.y = Math.floor((canvas.height - field.height) / 2);

  mask = Array(canvas.height)
    .fill()
    .map(() => Array(canvas.width).fill(1));

  for (let y = field.y; y < field.y + field.height; y++) {
    for (let x = field.x; x < field.x + field.width; x++) {
      mask[y][x] = 0;
    }
  }

  player.x = field.x;
  player.y = field.y + field.height - 1;
  player.speed = levelConfig.playerSpeed;

  enemies = [];
  for (let i = 0; i < levelConfig.enemies; i++) {
    enemies.push({
      x: field.x + Math.random() * field.width,
      y: field.y + Math.random() * field.height,
      vx: 1 + Math.random(),
      vy: 1 + Math.random(),
      radius: 4,
    });
  }

  loop();
}

function loop() {
  requestAnimationFrame(loop);
  update();
  draw();
}

function update() {
  player.x += player.vx;
  player.y += player.vy;

  if (player.cutting) {
    player.trail.push({ x: player.x, y: player.y });
    for (let e of enemies) {
      if (intersectsTrail(e.x, e.y)) {
        alert("Game Over!");
        init();
        return;
      }
    }
  }

  if (
    player.x <= field.x ||
    player.x >= field.x + field.width ||
    player.y <= field.y ||
    player.y >= field.y + field.height
  ) {
    if (player.cutting) {
      player.trail.push({ x: player.x, y: player.y });
      fillCaptured();
    }
    player.trail = [];
    player.cutting = false;
  }

  for (let e of enemies) {
    e.x += e.vx * levelConfig.enemySpeed;
    e.y += e.vy * levelConfig.enemySpeed;
    if (e.x <= field.x || e.x >= field.x + field.width) e.vx *= -1;
    if (e.y <= field.y || e.y >= field.y + field.height) e.vy *= -1;
  }
}

function intersectsTrail(x, y) {
  return player.trail.some((p) => Math.hypot(p.x - x, p.y - y) < 4);
}

function fillCaptured() {
  let visited = Array(canvas.height)
    .fill()
    .map(() => Array(canvas.width).fill(false));

  function floodFill(x, y) {
    let stack = [[x, y]];
    while (stack.length) {
      let [cx, cy] = stack.pop();
      if (
        cx < 0 ||
        cy < 0 ||
        cx >= canvas.width ||
        cy >= canvas.height ||
        visited[cy][cx] ||
        mask[cy][cx] !== 0
      )
        continue;
      visited[cy][cx] = true;
      stack.push([cx + 1, cy]);
      stack.push([cx - 1, cy]);
      stack.push([cx, cy + 1]);
      stack.push([cx, cy - 1]);
    }
  }

  floodFill(field.x + 1, field.y + 1);

  for (let y = field.y; y < field.y + field.height; y++) {
    for (let x = field.x; x < field.x + field.width; x++) {
      if (!visited[y][x]) mask[y][x] = 2;
    }
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "black";
  for (let y = 0; y < canvas.height; y++) {
    for (let x = 0; x < canvas.width; x++) {
      if (mask[y][x] === 1) ctx.fillRect(x, y, 1, 1);
    }
  }

  ctx.strokeStyle = "white";
  ctx.lineWidth = 2;
  ctx.strokeRect(field.x, field.y, field.width, field.height);

  if (player.cutting) {
    ctx.strokeStyle = "white";
    ctx.beginPath();
    ctx.moveTo(player.trail[0].x, player.trail[0].y);
    for (let p of player.trail) ctx.lineTo(p.x, p.y);
    ctx.stroke();
  }

  ctx.fillStyle = "lime";
  ctx.beginPath();
  ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "red";
  for (let e of enemies) {
    ctx.beginPath();
    ctx.arc(e.x, e.y, e.radius, 0, Math.PI * 2);
    ctx.fill();
  }
}

document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowUp") {
    player.vx = 0;
    player.vy = -player.speed;
    player.cutting = true;
  } else if (e.key === "ArrowDown") {
    player.vx = 0;
    player.vy = player.speed;
    player.cutting = true;
  } else if (e.key === "ArrowLeft") {
    player.vx = -player.speed;
    player.vy = 0;
    player.cutting = true;
  } else if (e.key === "ArrowRight") {
    player.vx = player.speed;
    player.vy = 0;
    player.cutting = true;
  }
});
