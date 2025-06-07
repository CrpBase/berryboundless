
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const gridSize = 10;
const cols = Math.floor(canvas.width / gridSize);
const rows = Math.floor(canvas.height / gridSize);

const fieldWidth = Math.floor(cols * 0.7);
const fieldHeight = Math.floor(rows * 0.7);
const offsetX = Math.floor((cols - fieldWidth) / 2);
const offsetY = Math.floor((rows - fieldHeight) / 2);

let mask = Array.from({ length: rows }, () => Array(cols).fill(0));
let player = { x: offsetX, y: offsetY + fieldHeight - 1, dx: 0, dy: 0 };
let image = new Image();
let keys = {};
let revealed = [];

image.src = "./levels/level1.jpg";
image.onload = () => {
  draw();
  gameLoop();
};

document.addEventListener("keydown", (e) => keys[e.key] = true);
document.addEventListener("keyup", (e) => keys[e.key] = false);

function drawFrame() {
  ctx.strokeStyle = "white";
  ctx.lineWidth = 2;
  ctx.strokeRect(offsetX * gridSize, offsetY * gridSize, fieldWidth * gridSize, fieldHeight * gridSize);
}

function drawPlayer() {
  ctx.fillStyle = "white";
  ctx.beginPath();
  ctx.arc(player.x * gridSize + gridSize / 2, player.y * gridSize + gridSize / 2, gridSize / 2, 0, 2 * Math.PI);
  ctx.fill();
}

function draw() {
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  drawFrame();
  drawPlayer();
}

function update() {
  player.dx = player.dy = 0;
  if (keys["ArrowUp"]) player.dy = -1;
  if (keys["ArrowDown"]) player.dy = 1;
  if (keys["ArrowLeft"]) player.dx = -1;
  if (keys["ArrowRight"]) player.dx = 1;

  let nextX = player.x + player.dx;
  let nextY = player.y + player.dy;

  if (
    nextX >= offsetX && nextX < offsetX + fieldWidth &&
    nextY >= offsetY && nextY < offsetY + fieldHeight
  ) {
    player.x = nextX;
    player.y = nextY;
  }
}

function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}
