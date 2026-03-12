/* ============================================================
   carlos's corner — script.js
   ============================================================ */

// ---- Photo gate (webcam entry) ----
(function () {
  const gate     = document.getElementById("photo-gate");
  const video    = document.getElementById("gate-video");
  const canvas   = document.getElementById("gate-canvas");
  const snapBtn  = document.getElementById("gate-snap-btn");
  const statusEl = document.getElementById("gate-status");
  const skipBtn  = document.getElementById("gate-skip");
  const flash    = document.getElementById("gate-flash");
  const countdown = document.getElementById("gate-countdown");

  // Only show once per session
  if (sessionStorage.getItem("carlos-gated")) {
    gate.classList.add("hidden");
    loadPerverts();
    return;
  }

  let stream = null;

  navigator.mediaDevices.getUserMedia({ video: { width: 320, height: 240, facingMode: "user" }, audio: false })
    .then(s => {
      stream = s;
      video.srcObject = s;
      statusEl.textContent = "smile! 📸";
      snapBtn.disabled = false;
      snapBtn.textContent = "[ 📸 take photo ]";
    })
    .catch(() => {
      statusEl.textContent = "camera blocked — use skip";
    });

  snapBtn.addEventListener("click", () => {
    snapBtn.disabled = true;
    let count = 3;
    countdown.textContent = count;

    const tick = setInterval(() => {
      count--;
      if (count > 0) {
        countdown.textContent = count;
      } else {
        clearInterval(tick);
        countdown.textContent = "";
        doSnap();
      }
    }, 700);
  });

  function doSnap() {
    // Flash
    flash.classList.add("on");
    setTimeout(() => flash.classList.remove("on"), 120);

    // Capture frame
    canvas.width  = 320;
    canvas.height = 240;
    const ctx2 = canvas.getContext("2d");
    ctx2.save();
    ctx2.translate(canvas.width, 0);
    ctx2.scale(-1, 1); // mirror to match the mirrored video preview
    ctx2.drawImage(video, 0, 0, 320, 240);
    ctx2.restore();

    const dataURL = canvas.toDataURL("image/jpeg", 0.72);

    // Save to localStorage
    try {
      const stored = JSON.parse(localStorage.getItem("carlos-perverts") || "[]");
      stored.push({ url: dataURL, date: new Date().toLocaleDateString() });
      if (stored.length > 25) stored.shift(); // cap at 25
      localStorage.setItem("carlos-perverts", JSON.stringify(stored));
    } catch (e) { /* localStorage full — skip saving */ }

    // Show captured image, hide video
    canvas.style.display = "block";
    video.style.display  = "none";
    statusEl.textContent = "looking good 😎";
    snapBtn.textContent  = "[ enter the crib → ]";
    snapBtn.disabled     = false;
    snapBtn.onclick      = closeGate;
  }

  skipBtn.addEventListener("click", closeGate);

  function closeGate() {
    if (stream) stream.getTracks().forEach(t => t.stop());
    gate.classList.add("hidden");
    sessionStorage.setItem("carlos-gated", "1");
    loadPerverts();
  }
})();

function loadPerverts() {
  const grid   = document.getElementById("perverts-grid");
  if (!grid) return;
  const photos = JSON.parse(localStorage.getItem("carlos-perverts") || "[]");
  if (!photos.length) {
    grid.innerHTML = '<p class="dimmed" style="font-size:1.1rem">no perverts yet. you\'ll be the first.</p>';
    return;
  }
  grid.innerHTML = "";
  // Show newest first
  [...photos].reverse().forEach((p, i) => {
    const div = document.createElement("div");
    div.className = "polaroid";
    const rot = ((i * 37 + 7) % 14) - 7; // deterministic rotation based on index
    div.style.transform = `rotate(${rot}deg)`;
    const img = document.createElement("img");
    img.src = p.url;
    img.alt = "visitor";
    const label = document.createElement("span");
    label.className = "polaroid-label";
    label.textContent = p.date;
    div.appendChild(img);
    div.appendChild(label);
    grid.appendChild(div);
  });
}

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
    if (target === "perverts") loadPerverts();
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

// ---- Monkey (pixel art — Dominican papi bachata edition) ----
let monkeyDance = () => {};
let monkeyChill = () => {};

(function () {
  const hbEl      = document.getElementById("monkey-hb");
  const monkeyObj = document.getElementById("monkey-obj");
  const flipper   = document.getElementById("monkey-flipper");
  const prompt    = document.getElementById("banana-prompt");

  // Pixel art canvas: 16×22 internal, 3× CSS scale → 48×66px display
  const CW = 16, CH = 22, SC = 3;
  const DW = CW * SC, DH = CH * SC;
  const canvas = document.createElement("canvas");
  canvas.id = "monkey-canvas";
  canvas.width  = CW; canvas.height = CH;
  canvas.style.width  = DW + "px";
  canvas.style.height = DH + "px";
  canvas.style.imageRendering = "pixelated";
  flipper.appendChild(canvas);
  const ctx = canvas.getContext("2d");

  // Color palette
  const FUR   = "#7B3F00";   // main fur (warm dark brown)
  const FACE  = "#D4956A";   // face / muzzle (lighter)
  const EYE   = "#1A0800";   // dark eyes
  const SHINE = "#FFFFFF";   // eye shine
  const CAP   = "#1A1A3E";   // snapback crown (navy)
  const BRIM  = "#2C2C5E";   // snapback brim
  const CHAIN = "#FFD700";   // gold chain
  const BELLY = "#B07040";   // belly patch
  const NOSE  = "#3A1500";   // nose

  // ---- State ----
  let mx          = window.innerWidth / 2;
  let mvx         = 0.8;
  let facing      = 1;
  let health      = 100;
  let bananaEl    = null;
  let bananaX     = null;
  let bananaState = "none";
  let bananaPhys  = null;
  let nomming     = false;
  let monkeyState = "walking";
  let loungeTimer = null;
  let t           = 0;

  // ---- Pixel helpers ----
  function px(x, y, c) {
    if (x < 0 || x >= CW || y < 0 || y >= CH) return;
    ctx.fillStyle = c;
    ctx.fillRect(x, y, 1, 1);
  }
  function span(x1, x2, y, c) {
    if (y < 0 || y >= CH) return;
    const a = Math.max(0, x1), b = Math.min(CW - 1, x2);
    if (a > b) return;
    ctx.fillStyle = c;
    ctx.fillRect(a, y, b - a + 1, 1);
  }

  // ---- Main pixel-art draw ----
  function drawMonkey(state) {
    ctx.clearRect(0, 0, CW, CH);

    const dead     = health <= 0;
    const dancing  = state === "dancing";
    const lounging = state === "lounging";

    // --- Bachata animation parameters ---
    // hipOff: body shifts left/right on the beat (shoulders stay still)
    // stepL/R: leg raises -1px on their beat
    // armUp: which side raises for bachata frame
    let hipOff = 0, bounce = 0, stepL = 0, stepR = 0, armUp = 1;

    if (dancing) {
      const beat = t * 3.2;                         // ~3.2 cycles/s
      hipOff = Math.round(Math.sin(beat) * 1.6);    // hip sway ±1–2px
      bounce = Math.sin(beat * 2) > 0.7 ? -1 : 0;  // subtle up-pop on beat
      stepL  = Math.sin(beat) >  0.5 ? -1 : 0;
      stepR  = Math.sin(beat) < -0.5 ? -1 : 0;
      armUp  = Math.sin(beat) > 0 ? 1 : -1;        // alternate which arm leads
    } else if (state === "walking") {
      const sw = Math.sin(t * 5.5);
      stepL = sw >  0.5 ? -1 : 0;
      stepR = sw < -0.5 ? -1 : 0;
    }

    // flip canvas for facing direction
    ctx.save();
    if (facing === -1) { ctx.translate(CW, 0); ctx.scale(-1, 1); }

    // ===== SNAPBACK CAP (rows 0-2) =====
    span(4, 11, 0, CAP);   // crown row 0
    span(4, 11, 1, CAP);   // crown row 1
    span(2, 13, 2, BRIM);  // brim (wider, flat)

    // ===== HEAD (rows 3-8) =====
    const hy = 3;
    span(4, 11, hy,   FUR);  // top of head

    // Rows hy+1..hy+3: ears (col 3 & 12) + head + face
    for (let r = 1; r <= 3; r++) {
      px(3,  hy + r, FUR);   // left ear
      px(12, hy + r, FUR);   // right ear
      span(4, 11, hy + r, FUR);  // head outline
    }
    // Face (lighter fill inside)
    span(5, 10, hy + 1, FACE);
    span(5, 10, hy + 2, FACE);
    span(5, 10, hy + 3, FACE);

    // Eyes
    if (dead) {
      // X eyes
      px(5, hy+1, EYE); px(6, hy+2, EYE);
      px(6, hy+1, EYE); px(5, hy+2, EYE);
      px(9, hy+1, EYE); px(10, hy+2, EYE);
      px(10, hy+1, EYE); px(9, hy+2, EYE);
    } else {
      px(5, hy+2, EYE);   px(6, hy+2, EYE);   // left eye (2-wide)
      px(9, hy+2, EYE);   px(10, hy+2, EYE);  // right eye
      px(5, hy+1, SHINE); px(9, hy+1, SHINE);  // shine dots
    }

    // Nose & mouth
    px(7, hy+3, NOSE); px(8, hy+3, NOSE);      // nose
    if (dancing) {
      px(6, hy+4, NOSE); px(9, hy+4, NOSE);    // big smile corners
      span(7, 8, hy+4, FACE);                   // open mouth
    } else if (!dead) {
      span(6, 9, hy+4, FUR);                    // chin bar / small smile
    }

    // ===== NECK + GOLD CHAIN (row hy+5 = row 8) =====
    const ny = hy + 5;  // row 8
    span(5, 10, ny, FUR);
    // Dominican papi gold chain — alternating gold pixels
    px(5, ny, CHAIN); px(7, ny, CHAIN); px(9, ny, CHAIN);

    // ===== BODY (rows 9-12 + bounce) =====
    // Upper body / shoulders stay centered (no hipOff) — hips shift below
    const by0 = ny + 1 + bounce;  // row 9 (or 8 on bounce pop)
    span(4, 11, by0, FUR);         // shoulders row

    // Hips and lower body shift with hipOff
    span(3 + hipOff, 12 + hipOff, by0 + 1, FUR);
    span(3 + hipOff, 12 + hipOff, by0 + 2, FUR);
    span(4 + hipOff, 11 + hipOff, by0 + 3, FUR);
    // Belly patch
    span(5 + hipOff, 10 + hipOff, by0 + 1, BELLY);
    span(5 + hipOff, 10 + hipOff, by0 + 2, BELLY);

    // ===== ARMS =====
    // Left arm (bachata: raises diagonally up when armUp===1)
    if (dancing && armUp === 1) {
      px(3, by0,   FUR);
      px(2, by0-1, FUR);
      px(1, by0-2, FUR);          // raised diagonal
    } else {
      px(3, by0,   FUR);
      px(2, by0+1, FUR);
      px(3, by0+2, FUR);          // arm down-out
    }
    // Right arm (raises when armUp===-1)
    if (dancing && armUp === -1) {
      px(12, by0,   FUR);
      px(13, by0-1, FUR);
      px(14, by0-2, FUR);         // raised diagonal
    } else {
      px(12, by0,   FUR);
      px(13, by0+1, FUR);
      px(12, by0+2, FUR);         // arm down-out
    }

    // ===== LEGS =====
    const ly = by0 + 4;
    // Left leg
    span(4 + hipOff, 5 + hipOff, ly + stepL,     FUR);
    span(4 + hipOff, 5 + hipOff, ly + stepL + 1, FUR);
    span(4 + hipOff, 5 + hipOff, ly + stepL + 2, FUR);
    // Right leg
    span(9 + hipOff, 10 + hipOff, ly + stepR,     FUR);
    span(9 + hipOff, 10 + hipOff, ly + stepR + 1, FUR);
    span(9 + hipOff, 10 + hipOff, ly + stepR + 2, FUR);
    // Feet (slightly wider)
    span(3 + hipOff, 6 + hipOff, ly + stepL + 3, FUR);
    span(8 + hipOff, 11 + hipOff, ly + stepR + 3, FUR);

    // ===== TAIL (wiggly pixels off left side of body) =====
    const tailAmp = dancing ? 2 : 1;
    const tw = Math.round(Math.sin(t * (dancing ? 10 : 3)) * tailAmp);
    px(2 + hipOff, by0 + 1 + tw, FUR);
    px(1 + hipOff, by0 + tw,     FUR);
    px(0 + hipOff, by0 - 1 + tw, FUR);

    // ===== ZZZ when lounging =====
    if (lounging) {
      ctx.font = "3px sans-serif";
      ctx.fillStyle = "#9966bb";
      ctx.fillText("z", 13, 7);
    }

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
