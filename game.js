const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

let W, H;
function resize() {
  W = canvas.width = window.innerWidth;
  H = canvas.height = window.innerHeight;
}
resize();
window.addEventListener("resize", resize);

/* ========== 状态 ========== */
let running = true;
let score = 0;
let speed = 6;
let difficultyTimer = 0;

/* ========== 地面 ========== */
const groundY = () => H * 0.78;

/* ========== 骆驼 ========== */
const camel = {
  x: W * 0.2,
  y: 0,
  w: 70,
  h: 50,
  vy: 0,
  gravity: 1.2,
  jumpPower: -19,
  onGround: false,
  frame: 0,
  tick: 0
};

/* ========== 输入缓冲 ========== */
let jumpBuffered = false;
let bufferTimer = 0;

function requestJump() {
  jumpBuffered = true;
  bufferTimer = 8;
}

window.addEventListener("touchstart", requestJump);
window.addEventListener("keydown", e => {
  if (e.code === "Space") requestJump();
});

/* ========== UI ========== */
const scoreEl = document.getElementById("score");
const pauseBtn = document.getElementById("pauseBtn");
const pauseMenu = document.getElementById("pauseMenu");
const resumeBtn = document.getElementById("resumeBtn");
const restartBtn = document.getElementById("restartBtn");

pauseBtn.onclick = () => {
  running = false;
  pauseMenu.classList.remove("hidden");
};

resumeBtn.onclick = () => {
  running = true;
  pauseMenu.classList.add("hidden");
  loop();
};

restartBtn.onclick = () => {
  obstacles.length = 0;
  score = 0;
  speed = 6;
  camel.vy = 0;
  camel.y = groundY() - camel.h;
  running = true;
  pauseMenu.classList.add("hidden");
  loop();
};

/* ========== 障碍 ========== */
const obstacles = [];

function spawnObstacle() {
  const type = Math.random();
  let height = 40;

  if (type > 0.7) height = 80;
  if (type > 0.9) height = 100;

  obstacles.push({
    x: W + 40,
    y: groundY() - height,
    w: 30,
    h: height
  });

  if (Math.random() > 0.75 && speed > 9) {
    obstacles.push({
      x: W + 90,
      y: groundY() - 40,
      w: 28,
      h: 40
    });
  }
}

/* ========== 碰撞 ========== */
function hit(a, b) {
  return (
    a.x < b.x + b.w &&
    a.x + a.w > b.x &&
    a.y < b.y + b.h &&
    a.y + a.h > b.y
  );
}

/* ========== 背景 ========== */
function drawBackground() {
  const grad = ctx.createLinearGradient(0,0,0,H);
  grad.addColorStop(0,"#6ec6ff");
  grad.addColorStop(1,"#c2a06b");
  ctx.fillStyle = grad;
  ctx.fillRect(0,0,W,H);

  ctx.fillStyle = "#f2c94c";
  ctx.beginPath();
  ctx.arc(W*0.85,H*0.22,40,0,Math.PI*2);
  ctx.fill();

  ctx.fillStyle = "#c2a06b";
  ctx.fillRect(0,groundY(),W,H);
}

/* ========== 骆驼绘制 ========== */
function drawCamel() {
  ctx.save();
  ctx.translate(camel.x, camel.y);

  ctx.fillStyle = "#8b6b3f";
  ctx.fillRect(0,20,camel.w,25);
  ctx.fillRect(20,0,20,20);

  const leg = Math.sin(camel.frame * 0.5) * 6;
  ctx.fillRect(10,45,6,15+leg);
  ctx.fillRect(30,45,6,15-leg);
  ctx.fillRect(50,45,6,15+leg);

  ctx.restore();
}

/* ========== 主循环 ========== */
let obstacleTimer = 0;

function loop() {
  if (!running) return;

  ctx.clearRect(0,0,W,H);
  drawBackground();

  // 难度提升
  difficultyTimer++;
  speed *= 1.00015;
  camel.gravity = 1.2 + speed * 0.02;

  // 输入缓冲
  if (jumpBuffered && camel.onGround) {
    camel.vy = camel.jumpPower;
    camel.onGround = false;
    jumpBuffered = false;
  }
  bufferTimer--;
  if (bufferTimer <= 0) jumpBuffered = false;

  // 物理
  camel.vy += camel.gravity;
  camel.y += camel.vy;

  if (camel.y >= groundY() - camel.h) {
    camel.y = groundY() - camel.h;
    camel.vy = 0;
    camel.onGround = true;
  }

  camel.tick++;
  if (camel.tick > 5) {
    camel.frame++;
    camel.tick = 0;
  }

  drawCamel();

  obstacleTimer++;
  if (obstacleTimer > Math.max(40, 90 - speed * 4)) {
    spawnObstacle();
    obstacleTimer = 0;
  }

  for (let i = obstacles.length - 1; i >= 0; i--) {
    const o = obstacles[i];
    o.x -= speed;

    ctx.fillStyle = "#2f4f2f";
    ctx.fillRect(o.x,o.y,o.w,o.h);

    if (hit(camel,o)) {
      running = false;
      pauseMenu.classList.remove("hidden");
    }

    if (o.x + o.w < 0) obstacles.splice(i,1);
  }

  score++;
  scoreEl.textContent = score;

  requestAnimationFrame(loop);
}

camel.y = groundY() - camel.h;
loop();
