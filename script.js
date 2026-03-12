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

  // Create canvas
  const CW = 80, CH = 112;
  const canvas = document.createElement("canvas");
  canvas.id = "monkey-canvas";
  canvas.width = CW; canvas.height = CH;
  canvas.style.width = CW + "px"; canvas.style.height = CH + "px";
  flipper.appendChild(canvas);
  const ctx = canvas.getContext("2d");

  // Colors (Boots palette)
  const FUR   = "#E07528";
  const LIGHT = "#F5C090";
  const BOOT  = "#CC2020";
  const BOOTD = "#8B1010";
  const WHITE = "#FFFFFF";
  const DARK  = "#180820";
  const NOSE  = "#5C2A00";
  const LINE  = "#7A3A00";
  const PINK  = "#FFB0B0";

  // State
  let mx          = window.innerWidth / 2;
  let mvx         = 0.8;
  let facing      = 1;
  let health      = 100;
  let bananaEl    = null;
  let bananaX     = null;
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
  function boot(bx, by) {
    // Shoe body
    ctx.beginPath();
    ctx.ellipse(bx + 3, by, 11, 6, -0.15, 0, Math.PI * 2);
    ctx.fillStyle = BOOT; ctx.strokeStyle = BOOTD; ctx.lineWidth = 1.5;
    ctx.fill(); ctx.stroke();
    // Ankle cuff
    ctx.beginPath();
    ctx.ellipse(bx - 4, by - 3, 5, 4, 0, 0, Math.PI * 2);
    ctx.fillStyle = BOOT; ctx.strokeStyle = BOOTD; ctx.lineWidth = 1;
    ctx.fill(); ctx.stroke();
    // Shine
    ctx.beginPath();
    ctx.ellipse(bx, by - 2, 4, 2, -0.2, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255,255,255,0.25)"; ctx.fill();
  }
  function ear(ex, ey) {
    circ(ex, ey, 9, FUR, 1.5);
    circ(ex, ey, 5.5, PINK, 0);
  }
  function eye(ex, ey, dead) {
    // White
    ctx.beginPath();
    ctx.ellipse(ex, ey, 6, 7.5, 0, 0, Math.PI * 2);
    ctx.fillStyle = WHITE; ctx.strokeStyle = LINE; ctx.lineWidth = 1;
    ctx.fill(); ctx.stroke();
    if (dead) {
      ctx.strokeStyle = DARK; ctx.lineWidth = 2; ctx.lineCap = "round";
      ctx.beginPath(); ctx.moveTo(ex-4,ey-4); ctx.lineTo(ex+4,ey+4); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(ex+4,ey-4); ctx.lineTo(ex-4,ey+4); ctx.stroke();
    } else {
      // Pupil
      ctx.beginPath();
      ctx.ellipse(ex + 1, ey + 1, 3.5, 5, 0, 0, Math.PI * 2);
      ctx.fillStyle = DARK; ctx.fill();
      // Shine
      ctx.beginPath();
      ctx.arc(ex + 3, ey - 2, 1.5, 0, Math.PI * 2);
      ctx.fillStyle = WHITE; ctx.fill();
    }
  }

  // ---- Main draw ----
  function drawMonkey(state) {
    ctx.clearRect(0, 0, CW, CH);
    ctx.save();
    if (facing === -1) { ctx.translate(CW, 0); ctx.scale(-1, 1); }

    // Animation values
    let sw = 0, by = 0, armUp = 0;
    if (state === "dancing") {
      sw     = Math.sin(t * 11) * 0.55;
      by     = Math.abs(Math.sin(t * 11)) * 9;
      armUp  = Math.cos(t * 9) * 0.65;
    } else if (state === "walking") {
      sw = Math.sin(t * 5.5) * 0.38;
      by = Math.abs(Math.sin(t * 5.5)) * 2.5;
    } else if (state === "lounging") {
      sw = 0.15; // slightly splayed out
    }

    const bX = 40, bY = 72 - by;
    const hX = 40, hY = bY - 33;

    // Tail (wags with music)
    ctx.save();
    ctx.strokeStyle = FUR; ctx.lineWidth = 5; ctx.lineCap = "round";
    const tw = Math.sin(t * (state === "dancing" ? 8 : 3)) * 8;
    ctx.beginPath();
    ctx.moveTo(bX - 14, bY - 8);
    ctx.bezierCurveTo(bX-30, bY-12+tw*0.3, bX-36, bY-30+tw, bX-28, bY-46+tw*1.3);
    ctx.stroke();
    ctx.restore();

    // --- Back arm ---
    ctx.save();
    ctx.translate(bX - 15, bY - 19);
    ctx.rotate(-0.3 + sw * 0.9 + armUp);
    oval(0, 9, 4.5, 10, FUR);       // upper arm
    ctx.translate(0, 17); ctx.rotate(sw * 0.25);
    oval(0, 6.5, 3.5, 7, FUR);     // forearm
    ctx.translate(0, 12);
    circ(0, 0, 4, LIGHT);           // hand
    ctx.restore();

    // --- Back leg ---
    ctx.save();
    ctx.translate(bX - 10, bY + 2);
    ctx.rotate(state === "lounging" ? 0.6 : -sw * 0.7);
    oval(0, 9, 6, 10, FUR);
    ctx.translate(0, 17); ctx.rotate(sw * 0.25 + 0.1);
    oval(0, 7, 5, 8, FUR);
    ctx.translate(0, 13);
    boot(-5, 0);
    ctx.restore();

    // --- Body ---
    ctx.save();
    ctx.translate(bX, bY);
    // Torso
    ctx.beginPath();
    ctx.ellipse(0, -12, 19, 23, 0, 0, Math.PI * 2);
    ctx.fillStyle = FUR; ctx.strokeStyle = LINE; ctx.lineWidth = 1.5;
    ctx.fill(); ctx.stroke();
    // Belly
    ctx.beginPath();
    ctx.ellipse(0, -8, 12, 16, 0, 0, Math.PI * 2);
    ctx.fillStyle = LIGHT; ctx.fill();
    ctx.restore();

    // --- Front leg ---
    ctx.save();
    ctx.translate(bX + 10, bY + 2);
    ctx.rotate(state === "lounging" ? -0.6 : sw * 0.7);
    oval(0, 9, 6, 10, FUR);
    ctx.translate(0, 17); ctx.rotate(-sw * 0.25 + 0.1);
    oval(0, 7, 5, 8, FUR);
    ctx.translate(0, 13);
    boot(-5, 0);
    ctx.restore();

    // --- Front arm ---
    ctx.save();
    ctx.translate(bX + 15, bY - 19);
    ctx.rotate(0.3 - sw * 0.9 - armUp);
    oval(0, 9, 4.5, 10, FUR);
    ctx.translate(0, 17); ctx.rotate(-sw * 0.25);
    oval(0, 6.5, 3.5, 7, FUR);
    ctx.translate(0, 12);
    circ(0, 0, 4, LIGHT);
    ctx.restore();

    // --- Head ---
    ctx.save();
    ctx.translate(hX, hY);
    ear(-15, -1); ear(15, -1);

    // Head circle
    circ(0, 0, 19, FUR, 1.5);

    // Muzzle
    ctx.beginPath();
    ctx.ellipse(0, 7.5, 12, 10, 0, 0, Math.PI * 2);
    ctx.fillStyle = LIGHT; ctx.fill();
    ctx.strokeStyle = LINE; ctx.lineWidth = 0.8; ctx.stroke();

    // Eyes
    eye(-7, -3, health <= 0);
    eye(7, -3, health <= 0);

    // Nose
    circ(0, 4, 2.5, NOSE, 0);

    // Mouth
    ctx.strokeStyle = NOSE; ctx.lineWidth = 1.5; ctx.lineCap = "round";
    if (health <= 0) {
      ctx.beginPath(); ctx.arc(0, 11, 7, 1.15*Math.PI, 1.85*Math.PI); ctx.stroke(); // sad
    } else if (state === "dancing") {
      // open happy mouth
      ctx.beginPath(); ctx.arc(0, 7, 7, 0.1*Math.PI, 0.9*Math.PI); ctx.fillStyle = "#8B1010"; ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.arc(0, 8, 4, 0.1*Math.PI, 0.9*Math.PI); ctx.fillStyle = "#FF6666"; ctx.fill();
    } else {
      ctx.beginPath(); ctx.arc(0, 7, 7, 0.1*Math.PI, 0.9*Math.PI); ctx.stroke(); // smile
    }

    // Lounging: little "zzz"
    if (state === "lounging") {
      ctx.save();
      ctx.font = "bold 8px 'Press Start 2P', monospace";
      ctx.fillStyle = "#9966bb";
      const zOff = Math.sin(t * 2) * 2;
      ctx.fillText("z", 18, -20 + zOff);
      ctx.fillText("z", 24, -28 + zOff);
      ctx.restore();
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
    if (health <= 25 && !bananaX) prompt.classList.remove("hidden");
    else                          prompt.classList.add("hidden");
  }
  setInterval(() => { if (!nomming) setHealth(health - 2); }, 4000);

  // ---- Banana ----
  function dropBanana(x) {
    if (bananaEl) bananaEl.remove();
    const bx = (x !== undefined) ? x : Math.random() * (window.innerWidth - 80) + 40;
    bananaEl = document.createElement("div");
    bananaEl.className = "banana-item"; bananaEl.textContent = "🍌";
    bananaEl.style.left = bx + "px";
    document.body.appendChild(bananaEl);
    bananaX = bx; prompt.classList.add("hidden");
  }
  document.addEventListener("keydown", e => { if (e.key.toLowerCase() === "b") dropBanana(); });
  document.addEventListener("click",   e => { if (e.clientY > window.innerHeight - 90) dropBanana(e.clientX); });

  // ---- Animation loop ----
  function animate() {
    t += 0.016;

    if (bananaX !== null) {
      const diff = bananaX - mx;
      if (Math.abs(diff) < 10) {
        nomming = true;
        bananaEl.remove(); bananaEl = null; bananaX = null;
        setHealth(health + 50);
        let b = 0;
        const bInterval = setInterval(() => {
          monkeyObj.style.bottom = b % 2 === 0 ? "26px" : "10px";
          if (++b > 7) { clearInterval(bInterval); monkeyObj.style.bottom = "10px"; nomming = false; }
        }, 75);
      } else {
        mvx = diff > 0 ? 1.5 : -1.5;
        mx += mvx;
      }
    } else if (monkeyState === "dancing") {
      mvx = Math.sin(t * 3.2) * 1.4;
      mx  = Math.max(CW/2, Math.min(window.innerWidth - CW/2, mx + mvx));
    } else if (monkeyState === "lounging") {
      mvx *= 0.88;
    } else if (health > 0) {
      if (Math.random() < 0.007) mvx *= -1;
      mx += mvx;
      if (mx < CW/2)                       { mx = CW/2;                       mvx =  Math.abs(mvx); }
      if (mx > window.innerWidth - CW/2)   { mx = window.innerWidth - CW/2;   mvx = -Math.abs(mvx); }
    }

    if (Math.abs(mvx) > 0.08) facing = mvx > 0 ? 1 : -1;

    drawMonkey(health <= 0 ? "dead" : monkeyState);
    monkeyObj.style.left = (mx - CW / 2) + "px";
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
