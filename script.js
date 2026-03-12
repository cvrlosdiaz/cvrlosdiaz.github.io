/* ============================================================
   carlos's corner — script.js
   ============================================================ */

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

// ---- Visitor count (localStorage for fun) ----
const visitKey   = "carlos-corner-visits";
let visitCount   = parseInt(localStorage.getItem(visitKey) || "0") + 1;
localStorage.setItem(visitKey, visitCount);
const vcEl = document.getElementById("visitor-count");
if (vcEl) vcEl.textContent = `you've been here ${visitCount} time${visitCount === 1 ? "" : "s"} ♥`;
