window.addEventListener('DOMContentLoaded', () => {
  const cameFromGame = sessionStorage.getItem('cameFromGame');
  if (cameFromGame) {

    setTimeout(() => {
      try {
        if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume().catch(()=>{});
        bgMusic.currentTime = 0;
        bgMusic.play().then(() => {
          bgMusic.volume = 0;
          const fadeIn = setInterval(() => {
            bgMusic.volume = Math.min(0.5, bgMusic.volume + 0.05);
            if (bgMusic.volume >= 0.5) clearInterval(fadeIn);
          }, 120);
        }).catch(() => {});
      } catch (err) {
        console.warn('Music resume blocked — waiting for user click.');
      }
    }, 400);

    sessionStorage.removeItem('cameFromGame');
  }
});

const site = {
  name: 'HANZ EDWARD ALCANTARA',
  title: 'Fullstack Tinkerer',
  bio: 'I treat the web like a pixel world — I build playful interfaces, tiny games, and tools that feel alive. I solve problems one brick at a time and collect ideas like coins.',
  age: '21',
  location: 'Philippines',
  email: 'hanz@example.com'
};

try {
  document.getElementById('name').textContent = site.name;
  document.getElementById('bio').textContent = site.bio;
  document.getElementById('age').textContent = site.age;
  document.getElementById('location').textContent = site.location;
  document.getElementById('footerName').textContent = site.name;
  document.getElementById('contactEmail').textContent = site.email;
} catch(e) { /* ignore if some nodes not present at script load */ }

const bgMusic = new Audio('audio/mario-theme.mp3');
bgMusic.loop = true;
bgMusic.volume = 0.5;

// === FIX: Start music when user clicks anywhere ===
window.addEventListener('click', () => {
  if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume().catch(() => {});
  if (bgMusic.paused) {
    bgMusic.currentTime = 0;
    bgMusic.play().catch(() => {});
  }
}, { once: true });

const coinAudio = new Audio('audio/coin.mp3');
const jumpAudio = new Audio('audio/jump.mp3');
const warpAudio = new Audio('audio/warp.mp3');

const AudioContext = window.AudioContext || window.webkitAudioContext;
let audioCtx;
try { audioCtx = new AudioContext(); } catch(e) { audioCtx = null; }

function playCoinGenerated() {
  if (!audioCtx) return;
  const o = audioCtx.createOscillator();
  const g = audioCtx.createGain();
  o.type = 'sawtooth';
  o.frequency.value = 880;
  g.gain.value = 0.06;
  o.connect(g); g.connect(audioCtx.destination);
  o.start();
  o.frequency.exponentialRampToValueAtTime(1320, audioCtx.currentTime + 0.12);
  g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.25);
  setTimeout(()=>o.stop(),260);
}

const hero = document.getElementById('heroSprite');
const coinCountEl = document.getElementById('coinCount');
const coinCountSmall = document.getElementById('coinCountSmall');
let coins = Number(localStorage.getItem('coins') || 0);
if (coinCountEl) coinCountEl.textContent = coins;
if (coinCountSmall) coinCountSmall.textContent = coins;

let musicOn = (localStorage.getItem('musicOn') === 'true');
const musicToggleBtn = document.getElementById('musicToggle');

function popCoinCounter() {
  if (!coinCountEl) return;
  coinCountEl.classList.add('pop');
  setTimeout(()=>coinCountEl.classList.remove('pop'),180);
}
function spawnFloatingCoin(x,y) {
  const el = document.createElement('div');
  el.className = 'floating-coin';
  el.style.left = (x - 14) + 'px';
  el.style.top = (y - 14) + 'px';
  el.innerText = '◆';
  document.body.appendChild(el);
  setTimeout(()=>el.remove(),1000);
}

function playCoin() {
  if (coinAudio && coinAudio.readyState >= 2) {
    coinAudio.currentTime = 0; coinAudio.play().catch(()=>playCoinGenerated());
  } else {
    try { playCoinGenerated(); } catch(e) {}
  }
}

const qBlockBtn = document.getElementById('questionBlock');
if (qBlockBtn) qBlockBtn.classList.add('bob');
let blockCooldown = false;

function hitQuestionBlock(triggerX, triggerY) {
  if (blockCooldown) return;
  blockCooldown = true;
  spawnFloatingCoin(triggerX, triggerY);
  playCoin();
  addCoin(1);

  document.querySelectorAll('.project-mini').forEach(img => {
    img.classList.add('pop');
    setTimeout(()=>img.classList.remove('pop'),240);
  });

  if (coins % 10 === 0) {
    if (audioCtx) {
      const o = audioCtx.createOscillator();
      const g = audioCtx.createGain();
      o.type = 'square';
      o.frequency.value = 440;
      g.gain.value = 0.05;
      o.connect(g); g.connect(audioCtx.destination);
      o.start(); o.frequency.exponentialRampToValueAtTime(660, audioCtx.currentTime + 0.12);
      g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.4);
      setTimeout(()=>o.stop(),450);
    }
  }

  if (qBlockBtn) {
    qBlockBtn.classList.add('hit');
    setTimeout(()=>{ if (qBlockBtn) qBlockBtn.classList.remove('hit'); blockCooldown = false; }, 600);
  } else {
    blockCooldown = false;
  }
}
if (qBlockBtn) qBlockBtn.addEventListener('click', (e) => {
  const rect = qBlockBtn.getBoundingClientRect();
  hitQuestionBlock(rect.left + rect.width/2, rect.top);
});

function addCoin(n=1) {
  coins += n;
  if (coinCountEl) coinCountEl.textContent = coins;
  if (coinCountSmall) coinCountSmall.textContent = coins;
  localStorage.setItem('coins', coins);
  popCoinCounter();
}

let walking = false;
let walkDirection = 1;
let walkInterval = null;
const walkFrames = ['assets/mario-sprite-walk1.png','assets/mario-sprite-walk2.png'];
let currentWalkFrame = 0;

function startWalking() {
  if (walking || !hero) return;
  walking = true;
  hero.classList.add('walking');
  hero.dataset.state = 'walking';
  currentWalkFrame = 0;
  hero.src = walkFrames[currentWalkFrame];
  walkInterval = setInterval(()=> {
    currentWalkFrame = (currentWalkFrame + 1) % walkFrames.length;
    hero.src = walkFrames[currentWalkFrame];
  }, 220);
  hero.style.transform = walkDirection === -1 ? 'scaleX(-1)' : 'scaleX(1)';
}

function stopWalking() {
  if (!walking || !hero) return;
  walking = false;
  hero.classList.remove('walking');
  hero.dataset.state = 'idle';
  clearInterval(walkInterval);
  walkInterval = null;
  hero.src = 'assets/mario-sprite-stand.png';
  hero.style.transform = walkDirection === -1 ? 'scaleX(-1)' : 'scaleX(1)';
}

const walkToggleBtn = document.getElementById('walkToggleBtn');
if (walkToggleBtn) walkToggleBtn.addEventListener('click', () => {
  if (!walking) {
    startWalking();
    walkToggleBtn.textContent = 'Stop';
  } else {
    stopWalking();
    walkToggleBtn.textContent = 'Walk';
  }
});

if (hero) hero.addEventListener('click', () => {
  walkDirection *= -1;
  hero.style.transform = walkDirection === -1 ? 'scaleX(-1)' : 'scaleX(1)';
  if (!walking) {
    startWalking();
    if (walkToggleBtn) walkToggleBtn.textContent = 'Stop';
  }
});

const mainHeroEl = document.getElementById('mainHero');
if (mainHeroEl) mainHeroEl.addEventListener('click', (e) => {
  if (e.target.closest('.btn')) return;
  walkDirection *= -1;
  if (hero) hero.style.transform = walkDirection === -1 ? 'scaleX(-1)' : 'scaleX(1)';
  if (!walking) { startWalking(); if (walkToggleBtn) walkToggleBtn.textContent = 'Stop'; }
});

const jumpBtn = document.getElementById('jumpBtn');
function doJump() {
  if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume().catch(()=>{});
  if (!hero) return;
  hero.classList.add('jump');
  hero.src = 'assets/mario-sprite-jump.png';
  if (jumpAudio && jumpAudio.readyState >= 2) {
    jumpAudio.currentTime = 0; jumpAudio.play().catch(()=>{});
  }
  const rect = hero.getBoundingClientRect();
  spawnFloatingCoin(rect.left + rect.width/2, rect.top);
  playCoin();
  addCoin(1);
  checkBlockHitFromJump();
  document.body.classList.add('speed');
  setTimeout(()=>document.body.classList.remove('speed'), 380);

  setTimeout(()=> {
    hero.classList.remove('jump');
    if (walking) {
      hero.src = walkFrames[currentWalkFrame];
    } else {
      hero.src = 'assets/mario-sprite-stand.png';
    }
  }, 420);
}
if (jumpBtn) jumpBtn.addEventListener('click', doJump);
window.addEventListener('keydown', e => {
  if (e.code === 'Space') {
    if (!document.getElementById('introOverlay')) {
      doJump();
      e.preventDefault();
    }
  }
});

function checkBlockHitFromJump() {
  if (!qBlockBtn || !hero) return;
  const blockRect = qBlockBtn.getBoundingClientRect();
  const heroRect = hero.getBoundingClientRect();
  const dx = Math.abs((heroRect.left + heroRect.width/2) - (blockRect.left + blockRect.width/2));
  const dy = (blockRect.top) - (heroRect.top + heroRect.height/2);
  if (dx < 80 && dy < 40 && dy > -80) {
    hitQuestionBlock(blockRect.left + blockRect.width/2, blockRect.top);
  }
}

const ground = document.querySelector('.ground');
if (ground) ground.addEventListener('click', (e) => {
  playCoin();
  spawnFloatingCoin(e.clientX, e.clientY);
  addCoin(1);
  popCoinCounter();
});

async function startMusicWithFade() {
  try {
    await bgMusic.play();
    bgMusic.volume = 0.0;
    const fadeIn = setInterval(() => {
      bgMusic.volume = Math.min(0.5, bgMusic.volume + 0.05);
      if (bgMusic.volume >= 0.5) clearInterval(fadeIn);
    }, 120);
    musicOn = true;
    localStorage.setItem('musicOn', 'true');
    updateMusicButton();
  } catch (err) {
    console.warn('Autoplay blocked — waiting for user gesture to resume sound.');
  }
}

function stopMusicWithFade() {
  const fadeOut = setInterval(() => {
    if (bgMusic.volume > 0.05) bgMusic.volume -= 0.05;
    else {
      bgMusic.pause();
      bgMusic.volume = 0.5;
      clearInterval(fadeOut);
      musicOn = false;
      localStorage.setItem('musicOn', 'false');
      updateMusicButton();
    }
  }, 100);
}

if (musicToggleBtn)
  musicToggleBtn.addEventListener('click', () => {
    if (!musicOn) startMusicWithFade();
    else stopMusicWithFade();
  });

function updateMusicButton() {
  if (!musicToggleBtn) return;
  musicToggleBtn.textContent = musicOn ? 'Music: ON 🎶' : 'Music: OFF';
  musicToggleBtn.setAttribute('aria-pressed', musicOn ? 'true' : 'false');
}

const introOverlay = document.getElementById('introOverlay');
const siteContent = document.getElementById('siteContent');

function startGameFromIntro() {
  if (!introOverlay) return;

  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }

  introOverlay.style.transition = 'opacity .45s';
  introOverlay.style.opacity = 0;
  setTimeout(() => {
    introOverlay.style.display = 'none';
    siteContent.removeAttribute('aria-hidden');
    introOverlay.remove();
  }, 500);

  if (startAudio && startAudio.readyState >= 2) {
    startAudio.currentTime = 0;
    startAudio.play().catch(() => {});
  }

  bgMusic.currentTime = 0;
  startMusicWithFade();
}

if (introOverlay) {
  introOverlay.addEventListener('click', () => {
    if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume().catch(() => {});
    startGameFromIntro();
    if (bgMusic.paused) {
      bgMusic.play().catch(() => {});
    }
  });
}


window.addEventListener('keydown', (e) => {
  if (introOverlay && introOverlay.style.display !== 'none') {
    startGameFromIntro();
  }
});

window.addEventListener(
  'click',
  () => {
    if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume().catch(() => {});
  },
  { once: true }
);

const pipe = document.getElementById('pipe');
if (pipe) pipe.addEventListener('click', () => {
  if (warpAudio && warpAudio.readyState >= 2) { warpAudio.currentTime = 0; warpAudio.play().catch(()=>{}); }
  const contact = document.querySelector('#contact');
  if (contact) contact.scrollIntoView({ behavior: 'smooth', block: 'center' });
  pipe.style.transform = 'translateY(-6px)';
  setTimeout(()=>pipe.style.transform = '', 420);
});
window.addEventListener('scroll', () => {
  const y = window.scrollY + 110;
  navLinks.forEach(a => a.classList.remove('active'));
  for (const link of navLinks) {
    const target = mapping[link.getAttribute('href')];
    if (target) {
      const rect = target.getBoundingClientRect();
      const top = window.scrollY + rect.top;
      if (y >= top && y < top + rect.height) link.classList.add('active');
    }
  }
});

/* === Quick Contact — Real Email Sending with Formspree === */
const contactForm = document.getElementById('contactForm');
if (contactForm) {
  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(contactForm);
    const submitBtn = contactForm.querySelector('button');
    submitBtn.disabled = true;
    submitBtn.textContent = "Sending...";

    try {
      const res = await fetch(contactForm.action, {
        method: "POST",
        body: formData,
        headers: { 'Accept': 'application/json' }
      });

      if (res.ok) {
        playCoin(); // coin sound effect
        spawnFloatingCoin(window.innerWidth / 2, window.innerHeight / 2); // floating coin animation

        const toast = document.createElement('div');
        toast.textContent = '✅ Message sent successfully!';
        toast.style.position = 'fixed';
        toast.style.bottom = '24px';
        toast.style.left = '50%';
        toast.style.transform = 'translateX(-50%)';
        toast.style.padding = '10px 16px';
        toast.style.borderRadius = '8px';
        toast.style.background = 'linear-gradient(180deg,#fff7c9,#ffd46b)';
        toast.style.fontFamily = 'Press Start 2P, monospace';
        toast.style.fontSize = '11px';
        toast.style.color = '#000';
        toast.style.boxShadow = '0 4px 8px rgba(0,0,0,0.3)';
        toast.style.zIndex = 99999;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 2000);

        contactForm.reset();
      } else {
        alert("❌ Something went wrong. Please try again.");
      }
    } catch (error) {
      alert("⚠️ Network error — please check your connection.");
    }

    submitBtn.disabled = false;
    submitBtn.textContent = "Send";
  });
}
/* ========= Final Working vCard Download ========= */
const downloadBtn = document.getElementById('downloadBtn');
if (downloadBtn) downloadBtn.addEventListener('click', () => {
  // vCard data with proper CRLF and complete fields
  const vcf = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    'N:Alcantara;Hanz Edward;;;',
    'FN:Hanz Edward Alcantara',
    'TITLE:BSIT Student',
    'ORG:Batangas State University — The National Engineering University',
    'EMAIL;TYPE=INTERNET:23-07972@g.batsate-u.edu.ph',
    'TEL;TYPE=CELL:+639777451081',
    'ADR;TYPE=HOME:;;San Pedro, Batangas City;;;Philippines',
    'URL:https://yourpersonalwebsite.com',
    'END:VCARD'
  ].join('\r\n'); // CRLF line endings

  // Create and download the vCard
  const blob = new Blob([vcf], { type: 'text/vcard;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = 'Hanz_Edward_Alcantara.vcf';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  // Play coin + floating coin animation
  playCoin();
  spawnFloatingCoin(window.innerWidth / 2, window.innerHeight / 2);

  // Show confirmation toast
  const toast = document.createElement('div');
  toast.textContent = '📇 vCard saved successfully!';
  toast.style.position = 'fixed';
  toast.style.bottom = '24px';
  toast.style.left = '50%';
  toast.style.transform = 'translateX(-50%)';
  toast.style.padding = '10px 16px';
  toast.style.borderRadius = '8px';
  toast.style.background = 'linear-gradient(180deg,#fff7c9,#ffd46b)';
  toast.style.fontFamily = 'Press Start 2P, monospace';
  toast.style.fontSize = '11px';
  toast.style.color = '#000';
  toast.style.boxShadow = '0 4px 8px rgba(0,0,0,0.3)';
  toast.style.zIndex = 99999;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 2000);
});


const konami = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','KeyB','KeyA'];
let konamiProgress = 0;
window.addEventListener('keydown', e => {
  if (e.code === konami[konamiProgress]) {
    konamiProgress++;
    if (konamiProgress === konami.length) {
      triggerKonami();
      konamiProgress = 0;
    }
  } else konamiProgress = 0;
});
function triggerKonami() {

  const box = document.createElement('div');
  box.style.position = 'fixed';
  box.style.left = '50%';
  box.style.top = '20%';
  box.style.transform = 'translateX(-50%)';
  box.style.padding = '16px 22px';
  box.style.background = 'linear-gradient(180deg,#fff7c9,#ffd46b)';
  box.style.borderRadius = '10px';
  box.style.fontFamily = 'Press Start 2P, monospace';
  box.style.zIndex = 100000;
  box.textContent = 'SECRET UNLOCKED ✨';
  document.body.appendChild(box);
  setTimeout(()=>box.remove(), 3200);
}

const overlay = document.createElement('div');
overlay.className = 'level-overlay';
overlay.innerHTML = `
  <div class="level-badge" id="levelBadge"></div>
  <div class="level-panel" id="levelPanel"><div id="levelInner"></div></div>
`;
document.body.appendChild(overlay);

const levelBadge = document.getElementById('levelBadge');
const levelPanel = document.getElementById('levelPanel');
const levelInner = document.getElementById('levelInner');
const floatingBack = document.getElementById('floatingBack');

const sectionToLevel = {
  'about': { label: 'WORLD 1-1', class: 'level-about', title: 'About Me' },
  'interests': { label: 'WORLD 1-2', class: 'level-interests', title: 'Interests' },
  'projects': { label: 'WORLD 1-3', class: 'level-projects', title: 'My World' },
  'gallery': { label: 'WORLD 1-4', class: 'level-gallery', title: 'Gallery' },
  'contact': { label: 'WORLD 1-5', class: 'level-contact', title: 'Contact' }
};

function empty(el) { while (el && el.firstChild) el.removeChild(el.firstChild); }

function showLevel(sectionId) {
  const src = document.getElementById(sectionId);
  if (!src) return;
  try { if (transitionSfx && transitionSfx.readyState >= 2) { transitionSfx.currentTime = 0; transitionSfx.play().catch(()=>{}); } } catch(e){}

  const info = sectionToLevel[sectionId] || { label: '', class: '' };
  levelBadge.textContent = info.label || '';
  levelPanel.className = 'level-panel ' + (info.class || '');
  const clone = src.cloneNode(true);
  clone.querySelectorAll('[id]').forEach(n => n.removeAttribute('id'));

  empty(levelInner);
  const title = document.createElement('h2');
  title.textContent = info.title || '';
  levelInner.appendChild(title);
  levelInner.appendChild(clone);

    // Re-bind "View" buttons inside overlay clone
  const familyBtn = clone.querySelector('#viewFamilyBtn');
  const loveBtn = clone.querySelector('#viewLoveBtn');
  const lifeBtn = clone.querySelector('#viewLifeBtn');

  if (familyBtn) {
    familyBtn.addEventListener('click', (e) => {
      e.preventDefault();
      levelBadge.textContent = 'WORLD 1-3A';
      levelPanel.className = 'level-panel level-projects';
      levelInner.innerHTML = `
        <h2>Family Time</h2>
        <p>Family is my ultimate power-up. They’re the reason I keep moving forward, no matter how many challenges come my way. Every laugh, every story, and every simple moment with them feels like the best level in life.</p>
        <div class="family-overlay-gallery">
          <img src="assets/familytime1.jpg" alt="Family photo 1">
          <img src="assets/familytime2.jpg" alt="Family photo 2">
          <img src="assets/familytime3.jpg" alt="Family photo 3">
          <img src="assets/familytime4.jpg" alt="Family photo 4">
          <img src="assets/familytime5.jpg" alt="Family photo 5">
          <img src="assets/familytime6.jpg" alt="Family photo 6">
          <img src="assets/familytime7.jpg" alt="Family photo 7">
          <img src="assets/familytime8.jpg" alt="Family photo 8">
        </div>
      `;
    });
  }

  if (loveBtn) {
    loveBtn.addEventListener('click', (e) => {
      e.preventDefault();
      levelBadge.textContent = 'WORLD 1-3B';
      levelPanel.className = 'level-panel level-projects';
      levelInner.innerHTML = `
        <h2>Love & Growth</h2>
        <p>Being with someone who truly supports your dreams makes every challenge easier. Love teaches me patience, understanding, and the beauty of growing together 🌹</p>
        <div class="love-gallery">
          <img src="assets/love&growth1.jpg" alt="Love & Growth 1">
          <img src="assets/love&growth2.jpg" alt="Love & Growth 2">
          <img src="assets/love&growth3.jpg" alt="Love & Growth 3">
        </div>
      `;
    });
  }

  if (lifeBtn) {
    lifeBtn.addEventListener('click', (e) => {
      e.preventDefault();
      levelBadge.textContent = 'WORLD 1-3C';
      levelPanel.className = 'level-panel level-projects';
      levelInner.innerHTML = `
        <h2>Life Beyond School</h2>
        <p>Outside the classroom is where I collect the best power-ups — laughter, memories, and lessons from real life. Every adventure beyond school adds a new level to my story. 🌟</p>
        <div class="life-video-gallery">
          <div class="video-card">
            <video preload="metadata"><source src="assets/lifebeyondschool1.mp4" type="video/mp4"></video>
            <button class="video-play-btn">▶ Play</button>
          </div>
          <div class="video-card">
            <video preload="metadata"><source src="assets/lifebeyondschool2.mp4" type="video/mp4"></video>
            <button class="video-play-btn">▶ Play</button>
          </div>
          <div class="video-card">
            <video preload="metadata"><source src="assets/lifebeyondschool3.mp4" type="video/mp4"></video>
            <button class="video-play-btn">▶ Play</button>
          </div>
        </div>
      `;

      // Attach play/pause logic
      setTimeout(() => {
        document.querySelectorAll('.video-play-btn').forEach((b) => {
          b.addEventListener('click', () => {
            const video = b.previousElementSibling;
            if (video.paused) {
              video.play();
              b.textContent = '⏸ Pause';
            } else {
              video.pause();
              b.textContent = '▶ Play';
            }
          });
        });
      }, 100);
    });
  }


  overlay.classList.add('active');
  overlay.style.zIndex = 10005;
  floatingBack.classList.remove('hidden');
  floatingBack.setAttribute('aria-hidden', 'false');

  document.documentElement.style.overflow = 'hidden';
}

function closeLevel() {
  overlay.classList.remove('active');
  floatingBack.classList.add('hidden');
  floatingBack.setAttribute('aria-hidden', 'true');
  document.documentElement.style.overflow = '';
  setTimeout(()=> { empty(levelInner); levelBadge.textContent = ''; levelPanel.className = 'level-panel'; }, 350);
  try { if (transitionSfx && transitionSfx.readyState >= 2) { transitionSfx.currentTime = 0; transitionSfx.play().catch(()=>{}); } } catch(e){}
}
document.querySelectorAll('.nav-link').forEach(a => {
  a.addEventListener('click', (ev) => {
    ev.preventDefault();
    const target = a.dataset.target || a.getAttribute('href')?.replace('#','');
    if (!target) return;
    setTimeout(()=> showLevel(target), 90);
  });
});

if (floatingBack) {
  floatingBack.addEventListener('click', closeLevel);
}
window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && overlay.classList.contains('active')) closeLevel();
});
overlay.addEventListener('click', (ev) => {
  if (ev.target === overlay) closeLevel();
});

document.addEventListener('pointermove', (e)=> {
  const cx = window.innerWidth/2, cy = window.innerHeight/2;
  const dx = (e.clientX - cx)/cx;
  const dy = (e.clientY - cy)/cy;
  if (hero) {
    const base = walkDirection === -1 ? 'scaleX(-1)' : 'scaleX(1)';
    hero.style.transform = `${base} translate(${dx*6}px,${dy*4}px)`;
  }
  clearTimeout(window._pp);
  window._pp = setTimeout(()=> {
    if (hero) hero.style.transform = walkDirection === -1 ? 'scaleX(-1)' : 'scaleX(1)';
  }, 120);
});

window.addEventListener('resize', ()=> {
  if (hero) hero.style.transform = walkDirection === -1 ? 'scaleX(-1)' : 'scaleX(1)';
});
if (localStorage.getItem('musicOn') === 'true') musicOn = true;
if (musicOn) updateMusicButton();
console.log('Super Mario theme script ready — Hanz! Fullscreen levels enabled.');
const playBtn = document.getElementById('playBtn');
if (playBtn) {
  playBtn.addEventListener('click', () => {
    if (bgMusic) {
      bgMusic.pause();
      bgMusic.currentTime = 0;
      musicOn = false;
      localStorage.setItem('musicOn', 'false');
    }
    if (warpAudio && warpAudio.readyState >= 2) {
      warpAudio.currentTime = 0;
      warpAudio.play().catch(() => {});
    }
    setTimeout(() => {
      window.location.href = 'game.html#mainHero';
    }, 700);
  });
}

// === Love & Growth Overlay ===
const viewLoveBtn = document.getElementById('viewLoveBtn');
if (viewLoveBtn) {
  viewLoveBtn.addEventListener('click', (e) => {
    e.preventDefault();

    levelInner.innerHTML = `
      <h2>Love & Growth</h2>
      <p>Being with someone who truly supports your dreams makes every challenge easier. Love teaches me patience, understanding, and the beauty of growing together 🌹</p>
      <div class="love-gallery">
        <img src="assets/love&growth1.jpg" alt="Love & Growth 1">
        <img src="assets/love&growth2.jpg" alt="Love & Growth 2">
        <img src="assets/love&growth3.jpg" alt="Love & Growth 3">
      </div>
    `;

    overlay.classList.add('active');
    overlay.style.zIndex = 10005;
    floatingBack.classList.remove('hidden');
    floatingBack.setAttribute('aria-hidden', 'false');
    document.documentElement.style.overflow = 'hidden';
  });
}

// === Life Beyond School Overlay (Click to Play Videos) ===
const viewLifeBtn = document.getElementById('viewLifeBtn');
if (viewLifeBtn) {
  viewLifeBtn.addEventListener('click', (e) => {
    e.preventDefault();

    levelInner.innerHTML = `
      <h2>Life Beyond School</h2>
      <p>Outside the classroom is where I collect the best power-ups — laughter, memories, and lessons from real life. Every adventure beyond school adds a new level to my story. 🌟</p>
      <div class="life-video-gallery">
        <div class="video-card">
          <video preload="metadata"
            <source src="assets/lifebeyondschool1.mp4" type="video/mp4">
          </video>
          <button class="video-play-btn">▶ Play</button>
        </div>
        <div class="video-card">
          <video preload="metadata" 
            <source src="assets/lifebeyondschool2.mp4" type="video/mp4">
          </video>
          <button class="video-play-btn">▶ Play</button>
        </div>
        <div class="video-card">
          <video preload="metadata" 
            <source src="assets/lifebeyondschool3.mp4" type="video/mp4">
          </video>
          <button class="video-play-btn">▶ Play</button>
        </div>
      </div>
    `;

    // show overlay
    overlay.classList.add('active');
    overlay.style.zIndex = 10005;
    floatingBack.classList.remove('hidden');
    floatingBack.setAttribute('aria-hidden', 'false');
    document.documentElement.style.overflow = 'hidden';

    // make play buttons work
    document.querySelectorAll('.video-play-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const video = btn.previousElementSibling;
        if (video.paused) {
          video.play();
          btn.textContent = '⏸ Pause';
        } else {
          video.pause();
          btn.textContent = '▶ Play';
        }
      });
    });
  });
}


// === Family Time Fullscreen Gallery ===
const viewFamilyBtn = document.getElementById('viewFamilyBtn');
if (viewFamilyBtn) {
  viewFamilyBtn.addEventListener('click', () => {
    const overlay = document.querySelector('.level-overlay');
    const levelBadge = document.getElementById('levelBadge');
    const levelPanel = document.getElementById('levelPanel');
    const levelInner = document.getElementById('levelInner');
    const floatingBack = document.getElementById('floatingBack');

    // Set overlay design
    levelBadge.textContent = 'WORLD 1-3A';
    levelPanel.className = 'level-panel level-projects';
    
    // Clear and insert custom gallery
    levelInner.innerHTML = `
      <h2>Family Time</h2>
      <p> Family is my ultimate power-up. They’re the reason I keep moving forward, no matter how many challenges come my way. Every laugh, every story, and every simple moment with them feels like the best level in life.</p>
      <div class="family-overlay-gallery">
        <img src="assets/familytime1.jpg" alt="Family photo 1">
        <img src="assets/familytime2.jpg" alt="Family photo 2">
        <img src="assets/familytime3.jpg" alt="Family photo 3">
        <img src="assets/familytime4.jpg" alt="Family photo 4">
        <img src="assets/familytime5.jpg" alt="Family photo 5">
        <img src="assets/familytime6.jpg" alt="Family photo 6">
        <img src="assets/familytime7.jpg" alt="Family photo 7">
        <img src="assets/familytime8.jpg" alt="Family photo 8">
      </div>
    `;

    overlay.classList.add('active');
    floatingBack.classList.remove('hidden');
    floatingBack.setAttribute('aria-hidden', 'false');
    document.documentElement.style.overflow = 'hidden';
  });
}
// === Family Photo Lightbox ===
document.addEventListener('click', (e) => {
  const clickedImg = e.target.closest('.family-overlay-gallery img');
  if (!clickedImg) return;

  // Create lightbox container
  const lightbox = document.createElement('div');
  lightbox.className = 'lightbox-overlay';
  lightbox.innerHTML = `<img src="${clickedImg.src}" alt="Family Photo Enlarged">`;
  document.body.appendChild(lightbox);

  // Activate lightbox
  setTimeout(() => lightbox.classList.add('active'), 10);

  lightbox.addEventListener('click', () => {
    lightbox.classList.remove('active');
    setTimeout(() => lightbox.remove(), 300);
  });
});

document.querySelectorAll('.gallery-video').forEach(video => {
  video.addEventListener('click', () => {
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.top = 0;
    overlay.style.left = 0;
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.background = 'rgba(0,0,0,0.85)';
    overlay.style.display = 'flex';
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';
    overlay.style.zIndex = 999999;
    overlay.style.backdropFilter = 'blur(3px)';

    const container = document.createElement('div');
    container.style.position = 'relative';
    container.style.display = 'flex';
    container.style.alignItems = 'center';
    container.style.gap = '20px';

    const fullVideo = document.createElement('video');
    fullVideo.src = video.querySelector('source').src;
    fullVideo.style.maxWidth = '70%';
    fullVideo.style.maxHeight = '80vh';
    fullVideo.style.borderRadius = '14px';
    fullVideo.style.boxShadow = '0 0 30px rgba(0,0,0,0.6)';
    fullVideo.autoplay = false;

    // Control Buttons
    const controls = document.createElement('div');
    controls.style.display = 'flex';
    controls.style.flexDirection = 'column';
    controls.style.gap = '12px';

    const playBtn = document.createElement('button');
    playBtn.textContent = '▶ PLAY';
    playBtn.className = 'gallery-play-btn';

    const pauseBtn = document.createElement('button');
    pauseBtn.textContent = '⏸ PAUSE';
    pauseBtn.className = 'gallery-pause-btn';

    // Button Styles
    [playBtn, pauseBtn].forEach(btn => {
      btn.style.background = 'linear-gradient(180deg,#fff7c9,#ffd46b)';
      btn.style.border = '2px solid rgba(0,0,0,0.15)';
      btn.style.fontFamily = "'Press Start 2P', monospace";
      btn.style.fontSize = '11px';
      btn.style.padding = '10px 12px';
      btn.style.borderRadius = '10px';
      btn.style.cursor = 'pointer';
      btn.style.boxShadow = '0 3px 6px rgba(0,0,0,0.3)';
      btn.style.transition = 'transform .1s ease';
      btn.addEventListener('mousedown', () => btn.style.transform = 'scale(0.95)');
      btn.addEventListener('mouseup', () => btn.style.transform = 'scale(1)');
    });

    playBtn.addEventListener('click', () => fullVideo.play());
    pauseBtn.addEventListener('click', () => fullVideo.pause());

    controls.appendChild(playBtn);
    controls.appendChild(pauseBtn);
    container.appendChild(fullVideo);
    container.appendChild(controls);
    overlay.appendChild(container);
    document.body.appendChild(overlay);

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        fullVideo.pause();
        overlay.remove();
      }
    });
  });
});

const testPlayBtn = document.getElementById('playBtn');
if (testPlayBtn) {
  testPlayBtn.addEventListener('click', () => {
    document.getElementById('playTest').textContent = "✅ Play button works! Redirecting...";
  });
} else {
  console.log("⚠️ Play button not found in DOM.");
}

