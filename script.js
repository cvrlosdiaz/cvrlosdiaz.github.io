/* ============================================================
   carlos's corner — script.js
   ============================================================ */

// ---- YouTube audio player ----
let ytPlayer = null;
let ytReady  = false;
let isPlaying = false;

window.onYouTubeIframeAPIReady = function () {
  ytPlayer = new YT.Player("yt-player", {
    videoId: "lIxQe1R5hs0",
    playerVars: { autoplay: 1, controls: 0, loop: 1, playlist: "lIxQe1R5hs0" },
    events: {
      onReady(e) {
        ytReady = true;
        e.target.setVolume(80);
        e.target.playVideo();
        isPlaying = true;
      },
      onStateChange(e) {
        isPlaying = e.data === YT.PlayerState.PLAYING;
        const indicator = document.getElementById("play-indicator");
        if (indicator) indicator.textContent = isPlaying ? "▶" : "⏸";
      },
    },
  });
};

// P key = toggle pause/play
document.addEventListener("keydown", e => {
  if (e.key.toLowerCase() === "p" && ytReady) {
    if (isPlaying) {
      ytPlayer.pauseVideo();
    } else {
      ytPlayer.playVideo();
    }
  }
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

// ---- Monkey ----
(function () {
  const canvas   = document.getElementById("monkey-canvas");
  const mctx     = canvas.getContext("2d");
  const hbEl     = document.getElementById("monkey-hb");
  const monkeyObj = document.getElementById("monkey-obj");
  const prompt   = document.getElementById("banana-prompt");

  // --- pixel art frames (16x16 scaled to 32x32, 2 walk frames + 1 sad) ---
  // Each row = one row of pixels, each char = one pixel
  // T=tan, D=dark brown, B=brown, _=transparent, W=white, R=red, G=green
  const palette = {
    T: "#c8913a", D: "#5c3317", B: "#8B5E3C",
    W: "#ffffff", R: "#ff4444", _: null,
    E: "#111111", // eyes
  };
  const FRAMES = [
    // walk frame 1
    [
      "____DDDD____",
      "___DTTTTTD__",
      "__DTTTTTTTD_",
      "__DTTEТТED__",  // eyes
      "__DTTTTTTD__",
      "___DDDDDDD__",
      "___BTTTTTB__",
      "__BBТTТТBBB_",
      "_BTTTTTTTTB_",
      "_BTTTTTTTТB_",
      "__BBBBBBBB__",
      "__BВ____BB__",
      "__BB____TB__",
      "_DBB____BDT_",
      "_DTT____TTD_",
      "_____________",
    ],
    // walk frame 2 (legs swapped)
    [
      "____DDDD____",
      "___DTTTTTD__",
      "__DTTTTTTTD_",
      "__DTTЕТТED__",
      "__DTTTTTTD__",
      "___DDDDDDD__",
      "___BTTTTTB__",
      "__BBTТТТBBB_",
      "_BTTTTTTTTB_",
      "_BTTTTTTTТB_",
      "__BBBBBBBB__",
      "__BB____BB__",
      "__TB____BB__",
      "_DTT____BBD_",
      "_DТТ____TTD_",
      "_____________",
    ],
  ];

  // Simple clean pixel monkey using basic shapes via canvas
  function drawMonkey(frame, facing, sad) {
    mctx.clearRect(0, 0, 32, 32);
    const p = sad ? drawSad : (frame === 0 ? drawWalk1 : drawWalk2);
    p(facing);
  }

  function px(x, y, color) {
    if (!color) return;
    mctx.fillStyle = color;
    mctx.fillRect(x * 2, y * 2, 2, 2);
  }

  function drawBase(facing) {
    const f = facing; // 1 = right, -1 = left (we'll flip with ctx transform)
    // head
    for (let x = 3; x <= 8; x++) for (let y = 1; y <= 5; y++) px(x, y, "#c8913a");
    // ears
    px(2, 2, "#c8913a"); px(2, 3, "#c8913a");
    px(9, 2, "#c8913a"); px(9, 3, "#c8913a");
    // eyes
    px(4, 3, "#111"); px(7, 3, "#111");
    // nose
    px(5, 4, "#8B5E3C"); px(6, 4, "#8B5E3C");
    // mouth (happy)
    px(5, 5, "#8B5E3C"); px(6, 5, "#8B5E3C");
    // body
    for (let x = 3; x <= 8; x++) for (let y = 6; y <= 10; y++) px(x, y, "#a0703a");
    // arms
    px(2, 6, "#c8913a"); px(2, 7, "#c8913a"); px(1, 8, "#c8913a");
    px(9, 6, "#c8913a"); px(9, 7, "#c8913a"); px(10, 8, "#c8913a");
    // tail
    px(9, 9, "#8B5E3C"); px(10, 10, "#8B5E3C"); px(11, 11, "#8B5E3C");
    px(11, 12, "#8B5E3C"); px(10, 13, "#8B5E3C");
  }

  function drawWalk1(facing) {
    drawBase(facing);
    // legs: left forward, right back
    px(3, 11, "#c8913a"); px(3, 12, "#c8913a"); px(2, 13, "#c8913a"); px(2, 14, "#c8913a");
    px(7, 11, "#c8913a"); px(7, 12, "#c8913a"); px(8, 13, "#c8913a"); px(8, 14, "#c8913a");
  }

  function drawWalk2(facing) {
    drawBase(facing);
    // legs swapped
    px(3, 11, "#c8913a"); px(3, 12, "#c8913a"); px(4, 13, "#c8913a"); px(4, 14, "#c8913a");
    px(7, 11, "#c8913a"); px(7, 12, "#c8913a"); px(6, 13, "#c8913a"); px(6, 14, "#c8913a");
  }

  function drawSad(facing) {
    // head + body same, but sad mouth and sitting
    for (let x = 3; x <= 8; x++) for (let y = 1; y <= 5; y++) px(x, y, "#c8913a");
    px(2, 2, "#c8913a"); px(2, 3, "#c8913a");
    px(9, 2, "#c8913a"); px(9, 3, "#c8913a");
    px(4, 3, "#111"); px(7, 3, "#111");
    px(5, 4, "#8B5E3C"); px(6, 4, "#8B5E3C");
    // sad mouth
    px(4, 6, "#8B5E3C"); px(7, 6, "#8B5E3C"); px(5, 5, "#8B5E3C"); px(6, 5, "#8B5E3C");
    // body sitting
    for (let x = 3; x <= 8; x++) for (let y = 6; y <= 9; y++) px(x, y, "#a0703a");
    // sitting legs spread out
    px(2, 9, "#c8913a"); px(1, 9, "#c8913a"); px(1, 10, "#c8913a");
    px(9, 9, "#c8913a"); px(10, 9, "#c8913a"); px(10, 10, "#c8913a");
    // sweat drop
    px(2, 1, "#00ccff"); px(2, 2, "#00ccff");
  }

  // --- state ---
  let mx       = window.innerWidth / 2;
  let mvx      = 0.7;
  let health   = 100;
  let frame    = 0;
  let frameTick = 0;
  let bananaEl = null;
  let bananaX  = null;
  let sad      = false;
  let nomming  = false;

  function setHealth(h) {
    health = Math.max(0, Math.min(100, h));
    hbEl.style.width = health + "%";
    hbEl.style.background = health > 60 ? "#39ff14" : health > 30 ? "#ffeb00" : "#ff4444";
    sad = health <= 0;
    if (health <= 25 && !bananaX) {
      prompt.classList.remove("hidden");
    } else {
      prompt.classList.add("hidden");
    }
  }

  // drain health every 3s
  setInterval(() => { if (!nomming) setHealth(health - 2); }, 3000);

  function dropBanana(x) {
    if (bananaEl) bananaEl.remove();
    bananaEl = document.createElement("div");
    bananaEl.className = "banana-item";
    bananaEl.textContent = "🍌";
    const bx = x ?? (Math.random() * (window.innerWidth - 60) + 30);
    bananaEl.style.left = bx + "px";
    document.body.appendChild(bananaEl);
    bananaX = bx;
    prompt.classList.add("hidden");
  }

  // B key or click on ground to drop banana
  document.addEventListener("keydown", e => {
    if (e.key.toLowerCase() === "b") dropBanana();
  });
  document.addEventListener("click", e => {
    if (e.clientY > window.innerHeight - 80) dropBanana(e.clientX);
  });

  function animate() {
    frameTick++;
    if (frameTick % 18 === 0) frame = 1 - frame;

    if (sad) {
      // sit and wait
      drawMonkey(0, mvx > 0 ? 1 : -1, true);
      monkeyObj.style.left = mx + "px";
      requestAnimationFrame(animate);
      return;
    }

    if (bananaX !== null) {
      const diff = bananaX - mx;
      if (Math.abs(diff) < 6) {
        // eat it!
        nomming = true;
        bananaEl?.remove(); bananaEl = null; bananaX = null;
        setHealth(health + 45);
        // happy bounce
        let bounces = 0;
        const bounce = setInterval(() => {
          monkeyObj.style.bottom = (bounces % 2 === 0 ? "18px" : "10px");
          bounces++;
          if (bounces > 5) { clearInterval(bounce); monkeyObj.style.bottom = "10px"; nomming = false; }
        }, 80);
      } else {
        mvx = diff > 0 ? 1.2 : -1.2;
        mx += mvx;
      }
    } else {
      // meander
      if (Math.random() < 0.008) mvx *= -1;
      mx += mvx;
      if (mx < 16)                      { mx = 16;                      mvx = Math.abs(mvx); }
      if (mx > window.innerWidth - 16)  { mx = window.innerWidth - 16;  mvx = -Math.abs(mvx); }
    }

    // flip canvas for direction
    mctx.save();
    mctx.clearRect(0, 0, 32, 32);
    if (mvx < 0) {
      mctx.translate(32, 0);
      mctx.scale(-1, 1);
    }
    drawBase(1);
    if (frame === 0) {
      // walk 1 legs
      px(3, 11, "#c8913a"); px(3, 12, "#c8913a"); px(2, 13, "#c8913a"); px(2, 14, "#c8913a");
      px(7, 11, "#c8913a"); px(7, 12, "#c8913a"); px(8, 13, "#c8913a"); px(8, 14, "#c8913a");
    } else {
      px(3, 11, "#c8913a"); px(3, 12, "#c8913a"); px(4, 13, "#c8913a"); px(4, 14, "#c8913a");
      px(7, 11, "#c8913a"); px(7, 12, "#c8913a"); px(6, 13, "#c8913a"); px(6, 14, "#c8913a");
    }
    mctx.restore();

    monkeyObj.style.left = mx + "px";
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
