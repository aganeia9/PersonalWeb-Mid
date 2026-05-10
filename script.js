'use strict';

const PAGE_ORDER = ['index.html', 'blog.html', 'gallery.html', 'contact.html'];

function getCurrentPageIndex() {
  const current = window.location.pathname.split('/').pop() || 'index.html';
  const idx = PAGE_ORDER.indexOf(current);
  return idx === -1 ? 0 : idx;
}

(function initPageTransitions() {
  const overlay = document.getElementById('page-overlay');
  if (!overlay) return;

  const currentIndex = getCurrentPageIndex();

  document.querySelectorAll('a.nav-item').forEach(link => {
    link.addEventListener('click', e => {
      const href = link.getAttribute('href');
      if (!href || href.startsWith('#') || href.startsWith('http')) return;

      e.preventDefault();

      const targetPage = href.split('/').pop() || 'index.html';
      const targetIndex = PAGE_ORDER.indexOf(targetPage);
      
      const direction = targetIndex > currentIndex ? 'left' : 'right';

      sessionStorage.setItem('slideDir', direction === 'left' ? 'right' : 'left');

      overlay.classList.add('active');

      setTimeout(() => {
        window.location.href = href;
      }, 380);
    });
  });

  const incomingDir = sessionStorage.getItem('slideDir');
  if (incomingDir) {
    document.documentElement.setAttribute('data-slide-dir', incomingDir);
    sessionStorage.removeItem('slideDir');
  }
})();

(function markActiveNav() {
  const current = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('a.nav-item').forEach(link => {
    const linkPage = link.getAttribute('href');
    if (linkPage === current) link.classList.add('active');
  });
})();

(function initParallax() {
  const bubbles = document.querySelectorAll('.bubble');
  if (!bubbles.length) return;

  let mouseX = window.innerWidth  / 2;
  let mouseY = window.innerHeight / 2;
  let rafId;

  const state = Array.from(bubbles).map(() => ({ x: 0, y: 0 }));

  document.addEventListener('mousemove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  function tick() {
    const cx = mouseX - window.innerWidth  / 2;
    const cy = mouseY - window.innerHeight / 2;

    bubbles.forEach((bubble, i) => {
      const speed  = parseFloat(bubble.dataset.parallaxSpeed  || 0.018);
      const invert = bubble.dataset.parallaxInvert === 'true' ? -1 : 1;

      const targetX = cx * speed * invert;
      const targetY = cy * speed * invert;

      state[i].x += (targetX - state[i].x) * 0.06;
      state[i].y += (targetY - state[i].y) * 0.06;

      bubble.style.setProperty('--px', `${state[i].x.toFixed(2)}px`);
      bubble.style.setProperty('--py', `${state[i].y.toFixed(2)}px`);
      bubble.style.transform = `translate(var(--px), var(--py))`;
    });

    rafId = requestAnimationFrame(tick);
  }

  tick();

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) cancelAnimationFrame(rafId);
    else tick();
  });
})();

(function initProfileParallax() {
  const profile = document.querySelector('.bubble-profile');
  if (!profile) return;

  let mx = window.innerWidth / 2, my = window.innerHeight / 2;
  let dx = 0, dy = 0;

  document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });

  function tick() {
    const targetX = (mx - window.innerWidth  / 2) * 0.012;
    const targetY = (my - window.innerHeight / 2) * 0.012;
    dx += (targetX - dx) * 0.07;
    dy += (targetY - dy) * 0.07;
    profile.style.left = `calc(50% + ${dx.toFixed(2)}px)`;
    profile.style.top  = `calc(28% + ${dy.toFixed(2)}px)`;
    requestAnimationFrame(tick);
  }
  tick();
})();

(function initVideoItems() {
  const videoItems = document.querySelectorAll('.gallery-item--video');
  if (!videoItems.length) return;

  videoItems.forEach(item => {
    const video = item.querySelector('video');
    if (!video) return;

    item.addEventListener('click', () => {
      if (video.paused) {
        video.play();
        item.classList.add('is-playing');
      } else {
        video.pause();
        item.classList.remove('is-playing');
      }
    });
  });
})();

(function initGalleryLightbox() {
  const items = document.querySelectorAll('.gallery-item:not(.gallery-item--video)');
  if (!items.length) return;

  const lb = document.createElement('div');
  lb.id = 'lightbox';
  lb.style.cssText = `
    position:fixed;inset:0;z-index:9000;
    background:rgba(0,0,0,0.92);
    display:flex;align-items:center;justify-content:center;
    cursor:zoom-out;opacity:0;
    transition:opacity 0.3s;pointer-events:none;
    padding: 20px;
  `;

  const lbImg = document.createElement('img');
  lbImg.style.cssText = `
    max-width: 90vw;
    max-height: 90vh;
    width: auto;
    height: auto;
    border-radius:12px;
    object-fit: contain;
    box-shadow:0 20px 80px rgba(0,0,0,0.8);
    transform:scale(0.9);
    transition:transform 0.35s cubic-bezier(0.22,1,0.36,1);
  `;

  lb.appendChild(lbImg);
  document.body.appendChild(lb);

  items.forEach(item => {
    item.addEventListener('click', () => {
      const img = item.querySelector('img');
      if (!img) return;
      lbImg.src = img.src;
      lbImg.alt = img.alt;
      lb.style.pointerEvents = 'all';
      lb.style.opacity = '1';
      lbImg.style.transform = 'scale(1)';
    });
  });

  lb.addEventListener('click', () => {
    lb.style.opacity = '0';
    lbImg.style.transform = 'scale(0.9)';
    setTimeout(() => { lb.style.pointerEvents = 'none'; }, 300);
  });
})();