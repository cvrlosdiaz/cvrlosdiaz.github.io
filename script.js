/* ============================================================
   carlos's corner — script.js
   ============================================================ */

// ---- YouTube audio player ----
let ytPlayer  = null;
let ytReady   = false;
let isPlaying = false;

window.onYouTubeIframeAPIReady = function () {
  const btn = document.getElementById("play-btn");
  if (btn) btn.textContent = "[ loading... ]";
  ytPlayer = new YT.Player("yt-player", {
    videoId: "lIxQe1R5hs0",
    playerVars: { autoplay: 0, controls: 0, loop: 1, playlist: "lIxQe1R5hs0" },
    events: {
      onReady() {
        ytReady = true;
        const btn = document.getElementById("play-btn");
        if (btn) btn.textContent = "[ ▶ play ]";
        console.log("YouTube player ready");
      },
      onError(e) {
        console.error("YouTube player error:", e.data);
        const btn = document.getElementById("play-btn");
        if (btn) btn.textContent = "[ unavailable ]";
      },
      onStateChange(e) {
        isPlaying = e.data === YT.PlayerState.PLAYING;
        updatePlayerUI();
      },
    },
  });
};

function updatePlayerUI() {
  const btn = document.getElementById("play-btn");
  const eq  = document.getElementById("player-eq");
  if (btn) btn.textContent = isPlaying ? "[ ⏸ pause ]" : "[ ▶ play ]";
  if (eq)  eq.classList.toggle("paused", !isPlaying);
  // tell monkey
  if (isPlaying) monkeyDance(); else monkeyChill();
}

function toggleMusic() {
  if (!ytReady) {
    console.log("YouTube not ready yet — is an ad blocker active?");
    const btn = document.getElementById("play-btn");
    if (btn) { btn.textContent = "[ not ready ]"; setTimeout(() => { btn.textContent = "[ ▶ play ]"; }, 1500); }
    return;
  }
  if (isPlaying) {
    ytPlayer.pauseVideo();
  } else {
    ytPlayer.setVolume(80);
    ytPlayer.playVideo();
  }
}

// P key = toggle
document.addEventListener("keydown", e => {
  if (e.key.toLowerCase() === "p") toggleMusic();
});

// ---- Nav tab switching ----
const navBtns  = document.querySelectorAll(".nav-btn[data-target]");
const sections = document.querySelectorAll(".section");

navBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    const target = btn.dataset.target;
    sections.forEach(s => s.classList.remove("active"));
    navBtns.forEach(b => b.classList.remove("active"));
    document.getElementById(target)?.classList.add("active");
    btn.classList.add("active");
  });
});

// ---- Stars canvas ----
const canvas = document.getElementById("stars-canvas");
const ctx    = canvas.getContext("2d");
let stars    = [];

function resizeCanvas() {
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
}

function initStars(count = 120) {
  stars = [];
  for (let i = 0; i < count; i++) {
    stars.push({
      x:     Math.random() * canvas.width,
      y:     Math.random() * canvas.height,
      r:     Math.random() * 1.5 + 0.3,
      alpha: Math.random(),
      speed: Math.random() * 0.005 + 0.002,
    });
  }
}

function drawStars() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  stars.forEach(s => {
    s.alpha += s.speed;
    if (s.alpha > 1 || s.alpha < 0) s.speed *= -1;
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(148, 0, 211, ${s.alpha * 0.6})`;
    ctx.fill();
  });
  requestAnimationFrame(drawStars);
}

resizeCanvas();
initStars();
drawStars();
window.addEventListener("resize", () => { resizeCanvas(); initStars(); });

// ---- Cursor sparkle trail ----
const sparkleChars = ["✦", "✧", "★", "✿", "♥", "✨", "·"];

document.addEventListener("mousemove", e => {
  if (Math.random() > 0.25) return; // not every move
  const el = document.createElement("span");
  el.className   = "sparkle";
  el.textContent = sparkleChars[Math.floor(Math.random() * sparkleChars.length)];
  el.style.left  = e.clientX + "px";
  el.style.top   = e.clientY + "px";
  el.style.color = `hsl(${Math.random() * 60 + 270}, 100%, 70%)`;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 800);
});

// ---- Ellipsis animation (handled in CSS) ----

// ---- Easter egg: Konami Code ----
const KONAMI = [
  "ArrowUp","ArrowUp","ArrowDown","ArrowDown",
  "ArrowLeft","ArrowRight","ArrowLeft","ArrowRight",
  "b","a"
];
let konamiIdx = 0;

document.addEventListener("keydown", e => {
  if (e.key === KONAMI[konamiIdx]) {
    konamiIdx++;
    if (konamiIdx === KONAMI.length) {
      showEasterEgg();
      konamiIdx = 0;
    }
  } else {
    konamiIdx = 0;
  }
});

// ---- Easter egg: hidden clickable in ??? section ----
const hiddenTrigger = document.getElementById("hidden-trigger");
if (hiddenTrigger) {
  hiddenTrigger.addEventListener("click", showEasterEgg);
}

// Show hint text after a few seconds on ??? page
navBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    if (btn.dataset.target === "mystery") {
      setTimeout(() => {
        const konamiHint = document.getElementById("konami-hint");
        const clickHint  = document.getElementById("click-hint");
        if (konamiHint) konamiHint.style.opacity = "1";
        setTimeout(() => {
          if (clickHint) clickHint.style.opacity = "1";
        }, 2500);
      }, 2000);
    }
  });
});

// ---- Easter egg: triple-click the avatar ----
let avatarClicks = 0;
let avatarTimer  = null;
const avatar = document.getElementById("avatar");
if (avatar) {
  avatar.addEventListener("click", () => {
    avatarClicks++;
    clearTimeout(avatarTimer);
    avatarTimer = setTimeout(() => { avatarClicks = 0; }, 600);
    if (avatarClicks >= 3) {
      avatarClicks = 0;
      showEasterEgg();
    }
  });
}

function showEasterEgg() {
  const popup = document.getElementById("egg-popup");
  if (popup) popup.classList.remove("hidden");
  launchConfetti();
}

document.getElementById("close-popup")?.addEventListener("click", () => {
  document.getElementById("egg-popup")?.classList.add("hidden");
});

// Close popup on backdrop click
document.getElementById("egg-popup")?.addEventListener("click", e => {
  if (e.target === e.currentTarget) {
    e.currentTarget.classList.add("hidden");
  }
});

// ---- Confetti burst ----
function launchConfetti() {
  const chars  = ["✦","★","✿","♥","✨","·","◆","▲"];
  const colors = ["#ff69b4","#00ccff","#ffeb00","#39ff14","#cc88ff","#ffffff"];
  for (let i = 0; i < 40; i++) {
    setTimeout(() => {
      const el = document.createElement("span");
      el.className   = "sparkle";
      el.textContent = chars[Math.floor(Math.random() * chars.length)];
      el.style.left  = Math.random() * 100 + "vw";
      el.style.top   = Math.random() * 100 + "vh";
      el.style.color = colors[Math.floor(Math.random() * colors.length)];
      el.style.fontSize = (Math.random() * 1.5 + 0.5) + "rem";
      document.body.appendChild(el);
      setTimeout(() => el.remove(), 900);
    }, i * 30);
  }
}

// ---- Secret: right-click override ----
document.addEventListener("contextmenu", e => {
  e.preventDefault();
  const msg = [
    "no snooping 👀",
    "u sneaky lil thing",
    "nothing to see here... or is there?",
    "check the source code instead ;)",
  ];
  const el = document.createElement("div");
  el.textContent = msg[Math.floor(Math.random() * msg.length)];
  el.style.cssText = `
    position: fixed;
    left: ${e.clientX}px;
    top: ${e.clientY}px;
    background: #1a0033;
    color: #ff69b4;
    font-family: "VT323", monospace;
    font-size: 1.3rem;
    padding: 6px 14px;
    border: 1px solid #ff69b4;
    z-index: 9999;
    pointer-events: none;
    white-space: nowrap;
  `;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 1800);
});

// ---- Secret: type "carlos" anywhere ----
let typedBuffer = "";
document.addEventListener("keypress", e => {
  typedBuffer += e.key.toLowerCase();
  if (typedBuffer.length > 10) typedBuffer = typedBuffer.slice(-10);
  if (typedBuffer.includes("carlos")) {
    typedBuffer = "";
    launchConfetti();
    // Flash the title
    const title = document.querySelector(".site-title");
    if (title) {
      const orig = title.style.color;
      title.style.color = "#00ccff";
      title.style.textShadow = "0 0 20px #00ccff";
      setTimeout(() => {
        title.style.color      = orig;
        title.style.textShadow = "";
      }, 1500);
    }
  }
});

// ---- Monkey (Boots-style canvas) ----
let monkeyDance = () => {};
let monkeyChill = () => {};

(function () {
  const hbEl      = document.getElementById("monkey-hb");
  const monkeyObj = document.getElementById("monkey-obj");
  const flipper   = document.getElementById("monkey-flipper");
  const prompt    = document.getElementById("banana-prompt");

  // Canvas drawn at 2x resolution, displayed at half size for crispness
  // Display size: 40×56px  (4x smaller area than before)
  const CW = 80, CH = 112, DW = 40, DH = 56;
  const canvas = document.createElement("canvas");
  canvas.id = "monkey-canvas";
  canvas.width = CW; canvas.height = CH;
  canvas.style.width = DW + "px"; canvas.style.height = DH + "px";
  flipper.appendChild(canvas);
  const ctx = canvas.getContext("2d");

  // ---- Boots-accurate color palette ----
  const FUR   = "#E8A028";   // warm golden-orange
  const LIGHT = "#F5D898";   // cream face / belly
  const BOOT  = "#E02020";   // bright red boots
  const BOOTD = "#8B0E0E";   // boot shadow / sole
  const WHITE = "#FFFFFF";
  const DARK  = "#0E0620";   // deep pupils
  const NOSE  = "#3A1800";
  const LINE  = "#7A4010";   // warm brown outline
  const PINK  = "#FFB8B8";   // inner ear

  // ---- State ----
  let mx          = window.innerWidth / 2;
  let mvx         = 0.8;
  let facing      = 1;
  let health      = 100;
  let bananaEl    = null;   // the DOM banana element
  let bananaX     = null;   // target x for monkey
  let bananaState = "none"; // "falling" | "landed" | "ready"
  let bananaPhys  = null;   // { x, y, vy, splitFrame }
  let nomming     = false;
  let monkeyState = "walking";
  let loungeTimer = null;
  let t           = 0;

  // ---- Drawing helpers ----
  function oval(cx, cy, rx, ry, fill, lw = 1) {
    ctx.beginPath();
    ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
    ctx.fillStyle = fill; ctx.strokeStyle = LINE; ctx.lineWidth = lw;
    ctx.fill(); ctx.stroke();
  }
  function circ(cx, cy, r, fill, lw = 1) {
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fillStyle = fill; ctx.strokeStyle = LINE; ctx.lineWidth = lw;
    ctx.fill(); ctx.stroke();
  }

  // Boots: tall red boot drawn at current ctx origin
  function drawBoot() {
    // Leg / boot shaft
    ctx.beginPath();
    ctx.ellipse(0, -6, 5, 8, 0, 0, Math.PI * 2);
    ctx.fillStyle = BOOT; ctx.strokeStyle = BOOTD; ctx.lineWidth = 1.5;
    ctx.fill(); ctx.stroke();
    // Foot
    ctx.beginPath();
    ctx.ellipse(3, 0, 9, 5, -0.1, 0, Math.PI * 2);
    ctx.fillStyle = BOOT; ctx.strokeStyle = BOOTD; ctx.lineWidth = 1.5;
    ctx.fill(); ctx.stroke();
    // Cuff fold
    ctx.beginPath();
    ctx.ellipse(0, -12, 5.5, 2.5, 0, 0, Math.PI * 2);
    ctx.fillStyle = "#FF4444"; ctx.fill();
    // Shine
    ctx.beginPath();
    ctx.ellipse(1, -1, 3, 1.5, -0.2, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255,255,255,0.3)"; ctx.fill();
  }

  function drawEar(ex, ey) {
    circ(ex, ey, 9, FUR, 1.5);
    circ(ex, ey, 5, PINK, 0);
  }

  function drawEye(ex, ey, dead) {
    // Outer white — Boots has HUGE eyes
    ctx.beginPath();
    ctx.ellipse(ex, ey, 7, 8.5, 0, 0, Math.PI * 2);
    ctx.fillStyle = WHITE; ctx.strokeStyle = LINE; ctx.lineWidth = 1.2;
    ctx.fill(); ctx.stroke();
    if (dead) {
      ctx.strokeStyle = "#333"; ctx.lineWidth = 2.5; ctx.lineCap = "round";
      ctx.beginPath(); ctx.moveTo(ex-4,ey-4); ctx.lineTo(ex+4,ey+4); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(ex+4,ey-4); ctx.lineTo(ex-4,ey+4); ctx.stroke();
    } else {
      // Iris
      ctx.beginPath();
      ctx.ellipse(ex+1, ey+1, 4.5, 5.5, 0, 0, Math.PI * 2);
      ctx.fillStyle = "#4A2800"; ctx.fill();
      // Pupil
      ctx.beginPath();
      ctx.ellipse(ex+1, ey+1, 3, 3.8, 0, 0, Math.PI * 2);
      ctx.fillStyle = DARK; ctx.fill();
      // Big shine (very Boots)
      ctx.beginPath();
      ctx.arc(ex+3.5, ey-2.5, 2.2, 0, Math.PI * 2);
      ctx.fillStyle = WHITE; ctx.fill();
      // Small second shine
      ctx.beginPath();
      ctx.arc(ex-1, ey+2.5, 1, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255,255,255,0.6)"; ctx.fill();
    }
  }

  // ---- Main draw ----
  function drawMonkey(state) {
    ctx.clearRect(0, 0, CW, CH);
    ctx.save();
    if (facing === -1) { ctx.translate(CW, 0); ctx.scale(-1, 1); }

    // ---- Per-limb animation angles ----
    let armFR = 0.3, armBR = -0.3;
    let armFFR = 0,  armBFR = 0;
    let legFR = 0,   legBR = 0;
    let by = 0, bodyLean = 0;

    if (state === "dancing") {
      const beat = Math.tanh(Math.sin(t * 9) * 6);
      const sway = Math.sin(t * 4.5);
      // Disco: alternating arm up/down point
      armFR  = -0.35 - beat * 1.05;
      armBR  = -0.35 + beat * 1.05;
      armFFR =  beat * 0.55;
      armBFR = -beat * 0.55;
      legFR  =  beat * 0.70;
      legBR  = -beat * 0.70;
      by         = Math.abs(Math.sin(t * 9)) * 16;
      bodyLean   = sway * 0.22;
    } else if (state === "walking") {
      const sw = Math.sin(t * 5.5) * 0.40;
      armFR  =  0.3 - sw * 0.9;
      armBR  = -0.3 + sw * 0.9;
      legFR  =  sw * 0.72;
      legBR  = -sw * 0.72;
      by     = Math.abs(Math.sin(t * 5.5)) * 2.5;
    } else if (state === "lounging") {
      armFR  =  1.0;
      armBR  = -1.0;
      legFR  = -0.7;
      legBR  =  0.7;
    }

    // Boots has a big head — push body down a bit
    const bX = 40, bY = 76 - by;
    const hX = 40, hY = bY - 36;

    // Tail
    ctx.save();
    ctx.strokeStyle = FUR; ctx.lineWidth = 5; ctx.lineCap = "round";
    const tw = Math.sin(t * (state === "dancing" ? 12 : 3)) * (state === "dancing" ? 14 : 8);
    ctx.beginPath();
    ctx.moveTo(bX - 13, bY - 8);
    ctx.bezierCurveTo(bX-28, bY-12+tw*0.3, bX-34, bY-28+tw, bX-26, bY-44+tw*1.3);
    ctx.stroke();
    ctx.restore();

    // Body lean wrapper
    ctx.save();
    ctx.translate(bX, bY - 14); ctx.rotate(bodyLean); ctx.translate(-bX, -(bY - 14));

    // Back arm
    ctx.save();
    ctx.translate(bX - 14, bY - 20);
    ctx.rotate(armBR);
    oval(0, 8, 4, 9, FUR);
    ctx.translate(0, 15); ctx.rotate(armBFR);
    oval(0, 6, 3, 7, FUR);
    ctx.translate(0, 11); circ(0, 0, 3.5, LIGHT);
    ctx.restore();

    // Back leg
    ctx.save();
    ctx.translate(bX - 9, bY + 2);
    ctx.rotate(legBR);
    oval(0, 8, 5.5, 9, FUR);
    ctx.translate(0, 15); ctx.rotate(legBR * 0.3 + 0.1);
    oval(0, 6, 4.5, 7, FUR);
    ctx.translate(0, 11); drawBoot();
    ctx.restore();

    // Body — Boots has a smallish oval body
    ctx.save();
    ctx.translate(bX, bY);
    ctx.beginPath();
    ctx.ellipse(0, -11, 17, 20, 0, 0, Math.PI * 2);
    ctx.fillStyle = FUR; ctx.strokeStyle = LINE; ctx.lineWidth = 1.5;
    ctx.fill(); ctx.stroke();
    // Belly
    ctx.beginPath();
    ctx.ellipse(0, -8, 10, 14, 0, 0, Math.PI * 2);
    ctx.fillStyle = LIGHT; ctx.fill();
    ctx.restore();

    // Front leg
    ctx.save();
    ctx.translate(bX + 9, bY + 2);
    ctx.rotate(legFR);
    oval(0, 8, 5.5, 9, FUR);
    ctx.translate(0, 15); ctx.rotate(legFR * 0.3 + 0.1);
    oval(0, 6, 4.5, 7, FUR);
    ctx.translate(0, 11); drawBoot();
    ctx.restore();

    // Front arm
    ctx.save();
    ctx.translate(bX + 14, bY - 20);
    ctx.rotate(armFR);
    oval(0, 8, 4, 9, FUR);
    ctx.translate(0, 15); ctx.rotate(armFFR);
    oval(0, 6, 3, 7, FUR);
    ctx.translate(0, 11); circ(0, 0, 3.5, LIGHT);
    ctx.restore();

    ctx.restore(); // body lean

    // Head — proportionally large like Boots
    const headBob = state === "dancing" ? Math.sin(t * 9) * 3.5 : 0;
    ctx.save();
    ctx.translate(hX, hY + headBob);
    ctx.rotate(state === "dancing" ? Math.sin(t * 4.5) * 0.2 : 0);

    drawEar(-16, -2); drawEar(16, -2);

    // Head — bigger radius for Boots' large round head
    circ(0, 0, 21, FUR, 1.5);

    // Cream muzzle (lower half of face, very prominent)
    ctx.beginPath();
    ctx.ellipse(0, 9, 14, 12, 0, 0, Math.PI * 2);
    ctx.fillStyle = LIGHT; ctx.fill();
    ctx.strokeStyle = LINE; ctx.lineWidth = 0.8; ctx.stroke();

    // Eyes — Boots' signature HUGE eyes
    drawEye(-8, -4, health <= 0);
    drawEye(8, -4, health <= 0);

    // Nose — small oval
    ctx.beginPath();
    ctx.ellipse(0, 5, 3, 2, 0, 0, Math.PI * 2);
    ctx.fillStyle = NOSE; ctx.fill();

    // Mouth
    ctx.strokeStyle = NOSE; ctx.lineWidth = 1.8; ctx.lineCap = "round";
    if (health <= 0) {
      ctx.beginPath(); ctx.arc(0, 13, 8, 1.1*Math.PI, 1.9*Math.PI); ctx.stroke();
    } else if (state === "dancing") {
      ctx.beginPath(); ctx.arc(0, 9, 9, 0.08*Math.PI, 0.92*Math.PI);
      ctx.fillStyle = "#7A0000"; ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.arc(0, 10, 5, 0.1*Math.PI, 0.9*Math.PI);
      ctx.fillStyle = "#FF5555"; ctx.fill();
    } else {
      ctx.beginPath(); ctx.arc(0, 9, 8, 0.1*Math.PI, 0.9*Math.PI); ctx.stroke();
    }

    // zzz when lounging
    if (state === "lounging") {
      ctx.font = "bold 7px sans-serif";
      ctx.fillStyle = "#9966bb";
      const zOff = Math.sin(t * 2) * 2;
      ctx.fillText("z", 20, -20 + zOff);
      ctx.fillText("z", 26, -28 + zOff);
    }

    ctx.restore(); // head
    ctx.restore(); // facing flip
  }

  // ---- State machine ----
  monkeyDance = function () {
    clearTimeout(loungeTimer);
    monkeyState = "dancing";
  };
  monkeyChill = function () {
    monkeyState = "walking";
    scheduleLounge();
  };
  function scheduleLounge() {
    clearTimeout(loungeTimer);
    if (monkeyState === "dancing") return;
    loungeTimer = setTimeout(() => {
      if (monkeyState !== "walking") return;
      monkeyState = "lounging";
      setTimeout(() => {
        if (monkeyState === "lounging") { monkeyState = "walking"; scheduleLounge(); }
      }, 2500 + Math.random() * 2500);
    }, 5000 + Math.random() * 7000);
  }
  scheduleLounge();

  // ---- Health ----
  function setHealth(h) {
    health = Math.max(0, Math.min(100, h));
    hbEl.style.width      = health + "%";
    hbEl.style.background = health > 60 ? "#39ff14" : health > 30 ? "#ffeb00" : "#ff4444";
    if (health <= 25 && bananaState === "none") prompt.classList.remove("hidden");
    else                                        prompt.classList.add("hidden");
  }
  setInterval(() => { if (!nomming) setHealth(health - 2); }, 4000);

  // ---- Banana — falling + split animation ----
  const GROUND_Y = window.innerHeight - 22; // where banana lands

  function dropBanana(targetX) {
    // Clean up old banana
    if (bananaEl) { bananaEl.remove(); bananaEl = null; }
    prompt.classList.add("hidden");

    const bx = (targetX !== undefined)
      ? Math.max(30, Math.min(window.innerWidth - 30, targetX))
      : Math.random() * (window.innerWidth - 100) + 50;

    // Physics object — starts at top of screen
    bananaPhys = { x: bx, y: -30, vy: 2, splitFrame: 0, split: false };
    bananaState = "falling";

    // Create DOM element for the banana
    bananaEl = document.createElement("div");
    bananaEl.style.cssText = `
      position: fixed; pointer-events: none; z-index: 49;
      font-size: 1.6rem; line-height: 1;
      transition: none;
      transform-origin: center bottom;
    `;
    bananaEl.textContent = "🍌";
    document.body.appendChild(bananaEl);
  }

  function updateBanana() {
    if (!bananaPhys || bananaState === "none") return;

    const p = bananaPhys;

    if (bananaState === "falling") {
      p.vy += 0.45; // gravity
      p.y  += p.vy;

      // Spin while falling
      const spinDeg = p.vy * 8;
      bananaEl.style.left      = (p.x - 12) + "px";
      bananaEl.style.top       = p.y + "px";
      bananaEl.style.transform = `rotate(${p.y * 3}deg)`;

      if (p.y >= GROUND_Y) {
        // Landed!
        p.y  = GROUND_Y;
        p.vy = 0;
        bananaState = "splitting";
        bananaEl.style.top       = p.y + "px";
        bananaEl.style.transform = "rotate(0deg)";

        // Squash on impact
        bananaEl.style.transition = "transform 0.08s ease-out";
        bananaEl.style.transform  = "scaleX(1.5) scaleY(0.5)";

        setTimeout(() => {
          // Bounce back then split open
          bananaEl.style.transform = "scaleX(0.9) scaleY(1.1)";
          setTimeout(() => {
            bananaEl.style.transform = "scaleX(1) scaleY(1)";
            bananaEl.textContent = "🍌";
            // Split: show peel splat
            setTimeout(() => {
              bananaEl.style.fontSize  = "2rem";
              bananaEl.textContent     = "🍌";
              bananaEl.style.filter    = "hue-rotate(20deg) brightness(1.2)";
              bananaState = "ready";
              bananaX     = p.x; // monkey can now walk to it
            }, 150);
          }, 80);
        }, 80);
      }
    }
  }

  document.addEventListener("keydown", e => {
    if (e.key.toLowerCase() === "b") dropBanana();
  });
  document.addEventListener("click", e => {
    if (e.clientY > window.innerHeight - 90) dropBanana(e.clientX);
  });

  // ---- Animation loop ----
  const DISPLAY_CX = DW / 2; // center offset for positioning

  function animate() {
    t += 0.016;
    updateBanana();

    if (bananaX !== null && bananaState === "ready") {
      const diff = bananaX - mx;
      if (Math.abs(diff) < 14) {
        // Eat it!
        nomming = true;
        if (bananaEl) { bananaEl.remove(); bananaEl = null; }
        bananaX = null; bananaState = "none"; bananaPhys = null;
        setHealth(health + 50);
        let b = 0;
        const bInt = setInterval(() => {
          monkeyObj.style.bottom = b % 2 === 0 ? "22px" : "10px";
          if (++b > 7) { clearInterval(bInt); monkeyObj.style.bottom = "10px"; nomming = false; }
        }, 75);
      } else {
        mvx = diff > 0 ? 1.5 : -1.5;
        mx += mvx;
      }
    } else if (monkeyState === "dancing") {
      mvx = Math.sin(t * 3.2) * 1.4;
      mx  = Math.max(DISPLAY_CX, Math.min(window.innerWidth - DISPLAY_CX, mx + mvx));
    } else if (monkeyState === "lounging") {
      mvx *= 0.88;
    } else if (health > 0) {
      if (Math.random() < 0.007) mvx *= -1;
      mx += mvx;
      if (mx < DISPLAY_CX)                       { mx = DISPLAY_CX;                       mvx =  Math.abs(mvx); }
      if (mx > window.innerWidth - DISPLAY_CX)   { mx = window.innerWidth - DISPLAY_CX;   mvx = -Math.abs(mvx); }
    }

    if (Math.abs(mvx) > 0.08) facing = mvx > 0 ? 1 : -1;

    drawMonkey(health <= 0 ? "dead" : monkeyState);
    monkeyObj.style.left = (mx - DISPLAY_CX) + "px";
    requestAnimationFrame(animate);
  }
  animate();
})();

// ---- Visitor count (localStorage for fun) ----
const visitKey   = "carlos-corner-visits";
let visitCount   = parseInt(localStorage.getItem(visitKey) || "0") + 1;
localStorage.setItem(visitKey, visitCount);
const vcEl = document.getElementById("visitor-count");
if (vcEl) vcEl.textContent = `you've been here ${visitCount} time${visitCount === 1 ? "" : "s"} 8->`;
