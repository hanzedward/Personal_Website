const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Screen setup
canvas.width = 960;
canvas.height = 540;

// Physics
const GRAVITY = 0.5;
const GROUND_Y = 400;

// === Mario ===
const mario = {
  x: 100,
  y: GROUND_Y,
  vx: 0,
  vy: 0,
  w: 80,
  h: 96,
  grounded: true,
  facing: 1,
  walkFrame: 0,
};

// === Box ===
const box = { x: 520, y: GROUND_Y - 200, w: 72, h: 64, hit: false, respawnTimer: 0 };

// === Load images ===
const stand = new Image(); stand.src = "assets/mario-sprite-stand.png";
const walk1 = new Image(); walk1.src = "assets/mario-sprite-walk1.png";
const walk2 = new Image(); walk2.src = "assets/mario-sprite-walk2.png";
const jump = new Image(); jump.src = "assets/mario-sprite-jump.png";
const blockIcon = new Image(); blockIcon.src = "assets/block-icon.png";
const background = new Image(); background.src = "assets/background.png";

// === Controls ===
const keys = {};
window.addEventListener("keydown", (e) => (keys[e.code] = true));
window.addEventListener("keyup", (e) => (keys[e.code] = false));

// === Coins ===
const coins = [];
let coinCount = 0;
let gameRunning = true;

// === Update ===
function update() {
  // Movement
  if (keys["ArrowLeft"]) {
    mario.vx = -4;
    mario.facing = -1;
  } else if (keys["ArrowRight"]) {
    mario.vx = 4;
    mario.facing = 1;
  } else {
    mario.vx = 0;
  }

  // Jump
  if ((keys["Space"] || keys["KeyZ"]) && mario.grounded) {
    mario.vy = -12;
    mario.grounded = false;
  }

  // Gravity
  mario.x += mario.vx;
  mario.y += mario.vy;
  if (!mario.grounded) mario.vy += GRAVITY;

  // Ground
  if (mario.y >= GROUND_Y) {
    mario.y = GROUND_Y;
    mario.vy = 0;
    mario.grounded = true;
  }

  // Box hit from below
  if (
    mario.x + mario.w > box.x &&
    mario.x < box.x + box.w &&
    mario.y < box.y + box.h &&
    mario.y + mario.h > box.y &&
    mario.vy < 0 &&
    mario.y > box.y - 80
  ) {
    if (!box.hit) {
      box.hit = true;
      box.respawnTimer = 180; // 3 sec
      coinCount++;
      document.getElementById("coinCount").textContent = coinCount;
      coins.push({ x: box.x + 30, y: box.y - 20, vy: -4, life: 60 });
    }
    mario.vy = 0;
  }

  // Box respawn
  if (box.hit && box.respawnTimer > 0) {
    box.respawnTimer--;
    if (box.respawnTimer <= 0) box.hit = false;
  }

  // Coin animation
  coins.forEach((c) => {
    c.y += c.vy;
    c.vy += 0.2;
    c.life--;
  });
  for (let i = coins.length - 1; i >= 0; i--) {
    if (coins[i].life <= 0) coins.splice(i, 1);
  }

  // Walk frames
  if (Math.abs(mario.vx) > 0.1 && mario.grounded) {
    mario.walkFrame += 0.2;
    if (mario.walkFrame > 2) mario.walkFrame = 0;
  } else mario.walkFrame = 0;
}

// === Draw ===
function draw() {
  ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

  // Box
  if (!box.hit) ctx.drawImage(blockIcon, box.x, box.y, box.w, box.h);
  else {
    ctx.fillStyle = "#c49e42";
    ctx.fillRect(box.x, box.y, box.w, box.h);
  }

  // Coins
  ctx.fillStyle = "#ffcc00";
  coins.forEach((c) => {
    ctx.beginPath();
    ctx.arc(c.x, c.y, 10, 0, Math.PI * 2);
    ctx.fill();
  });

  // Mario
  let sprite = stand;
  if (!mario.grounded) sprite = jump;
  else if (Math.abs(mario.vx) > 0.1)
    sprite = mario.walkFrame < 1 ? walk1 : walk2;

  ctx.save();
  ctx.translate(mario.x + mario.w / 2, mario.y);
  ctx.scale(mario.facing, 1);
  ctx.drawImage(sprite, -mario.w / 2, -mario.h, mario.w, mario.h);
  ctx.restore();

  // Ground
  ctx.fillStyle = "#2b8e2b";
  ctx.fillRect(0, GROUND_Y + 96, canvas.width, 300);
}

// === Game Loop ===
function loop() {
  if (!gameRunning) return;
  update();
  draw();
  requestAnimationFrame(loop);
}
loop();

// === Back button ===
document.getElementById("backBtn").addEventListener("click", () => {
  gameRunning = false;
  // Go back to the player/start section in the main website
  window.location.href = "index.html#mainHero";
});

// === SKIP INTRO if coming from the game ===
window.addEventListener("DOMContentLoaded", () => {
  if (window.location.hash === "#mainHero" || window.location.hash === "#player") {
    const introOverlay = document.getElementById("introOverlay");
    const siteContent = document.getElementById("siteContent");
    if (introOverlay && siteContent) {
      introOverlay.style.display = "none";
      siteContent.removeAttribute("aria-hidden");
    }
  }
});
