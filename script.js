/* ============================================================
   carlos's corner — script.js
   ============================================================ */

// ---- YouTube audio player ----
let ytPlayer  = null;
let ytReady   = false;
let isPlaying = false;

window.onYouTubeIframeAPIReady = function () {
  ytPlayer = new YT.Player("yt-player", {
    videoId: "lIxQe1R5hs0",
    playerVars: { autoplay: 0, controls: 0, loop: 1, playlist: "lIxQe1R5hs0" },
    events: {
      onReady() { ytReady = true; },
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
  if (!ytReady) return;
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

// ---- Monkey ----
// monkeyDance() and monkeyChill() called by music player
let monkeyDance = () => {};
let monkeyChill = () => {};

(function () {
  const hbEl      = document.getElementById("monkey-hb");
  const monkeyObj = document.getElementById("monkey-obj");
  const flipper   = document.getElementById("monkey-flipper");
  const sprite    = document.getElementById("monkey-sprite");
  const prompt    = document.getElementById("banana-prompt");

  let mx       = window.innerWidth / 2;
  let mvx      = 0.8;
  let health   = 100;
  let bananaEl = null;
  let bananaX  = null;
  let nomming  = false;

  // states: 'walking' | 'dancing' | 'lounging'
  let monkeyState   = "walking";
  let loungeTimer   = null;

  // expose to outer scope
  monkeyDance = function () {
    clearTimeout(loungeTimer);
    monkeyState = "dancing";
    sprite.classList.remove("lounging");
    sprite.classList.add("dancing");
    sprite.textContent = health <= 0 ? "🙈" : "🐒";
  };

  monkeyChill = function () {
    sprite.classList.remove("dancing");
    monkeyState = "walking";
    sprite.textContent = health <= 0 ? "🙈" : "🐒";
    scheduleLounge();
  };

  function scheduleLounge() {
    clearTimeout(loungeTimer);
    if (monkeyState === "dancing") return;
    const delay = 4000 + Math.random() * 6000; // lounge every 4-10s
    loungeTimer = setTimeout(() => {
      if (monkeyState !== "walking") return;
      monkeyState = "lounging";
      sprite.classList.add("lounging");
      const duration = 2500 + Math.random() * 2500;
      setTimeout(() => {
        if (monkeyState === "lounging") {
          monkeyState = "walking";
          sprite.classList.remove("lounging");
          scheduleLounge();
        }
      }, duration);
    }, delay);
  }

  scheduleLounge();

  function setHealth(h) {
    health = Math.max(0, Math.min(100, h));
    hbEl.style.width      = health + "%";
    hbEl.style.background = health > 60 ? "#39ff14" : health > 30 ? "#ffeb00" : "#ff4444";
    if (health <= 0) { sprite.textContent = "🙈"; sprite.classList.remove("dancing", "lounging"); }
    else             sprite.textContent = "🐒";
    if (health <= 25 && !bananaX) prompt.classList.remove("hidden");
    else                          prompt.classList.add("hidden");
  }

  setInterval(() => { if (!nomming) setHealth(health - 2); }, 4000);

  function dropBanana(x) {
    if (bananaEl) bananaEl.remove();
    const bx = (x !== undefined) ? x : Math.random() * (window.innerWidth - 80) + 40;
    bananaEl = document.createElement("div");
    bananaEl.className   = "banana-item";
    bananaEl.textContent = "🍌";
    bananaEl.style.left  = bx + "px";
    document.body.appendChild(bananaEl);
    bananaX = bx;
    prompt.classList.add("hidden");
  }

  document.addEventListener("keydown", e => {
    if (e.key.toLowerCase() === "b") dropBanana();
  });
  document.addEventListener("click", e => {
    if (e.clientY > window.innerHeight - 80) dropBanana(e.clientX);
  });

  function animate() {
    if (bananaX !== null) {
      const diff = bananaX - mx;
      if (Math.abs(diff) < 10) {
        nomming = true;
        bananaEl.remove(); bananaEl = null; bananaX = null;
        setHealth(health + 50);
        let b = 0;
        const bounce = setInterval(() => {
          monkeyObj.style.bottom = b % 2 === 0 ? "22px" : "10px";
          if (++b > 6) { clearInterval(bounce); monkeyObj.style.bottom = "10px"; nomming = false; }
        }, 80);
      } else {
        mvx = diff > 0 ? 1.4 : -1.4;
        mx += mvx;
      }
    } else if (monkeyState === "dancing") {
      // shimmy side to side
      mvx = Math.sin(Date.now() / 180) * 1.2;
      mx += mvx;
      mx = Math.max(20, Math.min(window.innerWidth - 40, mx));
    } else if (monkeyState === "lounging") {
      // stay put, slow drift
      mvx *= 0.92;
    } else if (health > 0) {
      // normal meander
      if (Math.random() < 0.007) mvx *= -1;
      mx += mvx;
      if (mx < 20)                     { mx = 20;                     mvx =  Math.abs(mvx); }
      if (mx > window.innerWidth - 40) { mx = window.innerWidth - 40; mvx = -Math.abs(mvx); }
    }

    monkeyObj.style.left    = mx + "px";
    // only flip direction when not lounging
    if (monkeyState !== "lounging") {
      flipper.style.transform = mvx < 0 ? "scaleX(-1)" : "scaleX(1)";
    }
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
