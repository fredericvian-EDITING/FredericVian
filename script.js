// ── Year ──────────────────────────────────────────────────────
document.getElementById('year').textContent = new Date().getFullYear();

// ── Nav scroll ────────────────────────────────────────────────
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 60);
}, { passive: true });

// ── Hero showreel : vidéo de fond (desktop, hors reduced-motion) ──
// Sur mobile ou si l'utilisateur préfère moins d'animations, on garde
// uniquement l'image poster — la vidéo (~10 Mo) n'est jamais téléchargée.
const heroVideo = document.getElementById('heroVideo');
if (heroVideo) {
  const wantsVideo = window.matchMedia('(min-width: 901px)').matches
    && !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (wantsVideo) {
    const source = document.createElement('source');
    source.src  = 'showreel-header.mp4';
    source.type = 'video/mp4';
    heroVideo.appendChild(source);
    heroVideo.load();
    heroVideo.play().catch(() => {}); // ignore le rejet si l'onglet est masqué
  }
}

// ── Menu mobile (burger) ──────────────────────────────────────
const burger   = document.getElementById('navBurger');
const navLinks = document.getElementById('navLinks');
if (burger && navLinks) {
  const setMenu = open => {
    navLinks.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', String(open));
    document.body.style.overflow = open ? 'hidden' : '';
  };
  burger.addEventListener('click', () =>
    setMenu(!navLinks.classList.contains('is-open')));
  navLinks.querySelectorAll('a').forEach(a =>
    a.addEventListener('click', () => setMenu(false)));
}

// ── Language toggle ───────────────────────────────────────────
let lang = 'fr';
const toggle = document.getElementById('langToggle');

function applyLang() {
  document.querySelectorAll('[data-fr]').forEach(el => {
    el.innerHTML = lang === 'fr' ? el.dataset.fr : el.dataset.en;
  });
  // textarea placeholder
  document.querySelectorAll('[data-placeholder-fr]').forEach(el => {
    el.placeholder = lang === 'fr' ? el.dataset.placeholderFr : el.dataset.placeholderEn;
  });
  // select options
  document.querySelectorAll('select option[data-fr]').forEach(el => {
    el.textContent = lang === 'fr' ? el.dataset.fr : el.dataset.en;
  });
  document.documentElement.lang = lang === 'fr' ? 'fr' : 'en';
  toggle.textContent = lang === 'fr' ? 'EN' : 'FR';
}

toggle.addEventListener('click', () => {
  lang = lang === 'fr' ? 'en' : 'fr';
  applyLang();
});

// ── Indicateur glissant sous la nav (desktop) ────────────────
const navUnderline = document.createElement('span');
navUnderline.className = 'nav-underline';
navUnderline.setAttribute('aria-hidden', 'true');
navLinks.appendChild(navUnderline);

const spyLinks = [...navLinks.querySelectorAll('a:not(.nav-cta)')];
const spySections = spyLinks
  .map(a => document.querySelector(a.getAttribute('href')))
  .filter(Boolean);

const isDesktop = () => window.matchMedia('(min-width: 901px)').matches;
let activeLink = spyLinks[0];

function moveUnderlineTo(link) {
  if (!link || !isDesktop()) { navUnderline.style.opacity = '0'; return; }
  navUnderline.style.width = link.offsetWidth + 'px';
  navUnderline.style.transform = `translateX(${link.offsetLeft}px)`;
  navUnderline.style.opacity = '1';
}

function updateActiveSection() {
  if (!isDesktop()) { navUnderline.style.opacity = '0'; return; }
  const y = window.scrollY + 120;
  let current = spySections[0];
  spySections.forEach(sec => { if (sec.offsetTop <= y) current = sec; });
  const link = spyLinks.find(a => a.getAttribute('href') === '#' + current.id);
  if (link) { activeLink = link; moveUnderlineTo(link); }
}

// Survol : le trait suit le lien pointé, puis revient à la section active
spyLinks.forEach(a => a.addEventListener('mouseenter', () => moveUnderlineTo(a)));
navLinks.addEventListener('mouseleave', () => moveUnderlineTo(activeLink));

window.addEventListener('scroll', updateActiveSection, { passive: true });
window.addEventListener('resize', () => moveUnderlineTo(activeLink));
window.addEventListener('load', updateActiveSection);
updateActiveSection();

// ── Accordéon groupes de réalisations ────────────────────────
document.querySelectorAll('.work-group-header').forEach(btn => {
  const panel = document.getElementById(btn.dataset.target);

  btn.addEventListener('click', () => {
    const isOpen = btn.getAttribute('aria-expanded') === 'true';
    btn.setAttribute('aria-expanded', String(!isOpen));

    if (!isOpen) {
      // Ouverture : animer de 0 → hauteur réelle du contenu
      panel.classList.add('is-open');
      panel.style.maxHeight = panel.scrollHeight + 'px';
    } else {
      // Fermeture : figer à la hauteur actuelle puis animer vers 0
      panel.style.maxHeight = panel.scrollHeight + 'px';
      requestAnimationFrame(() => {
        panel.classList.remove('is-open');
        panel.style.maxHeight = '0';
      });
    }
  });
});

// ── YouTube modal ─────────────────────────────────────────────
const modal    = document.getElementById('ytModal');
const frame    = document.getElementById('ytFrame');
const backdrop = modal.querySelector('.modal-backdrop');
const closeBtn = modal.querySelector('.modal-close');

let lastFocused = null;

document.querySelectorAll('.work-card').forEach(card => {
  card.setAttribute('role', 'button');
  card.setAttribute('tabindex', '0');

  const openVideo = () => {
    const ytId     = card.dataset.yt;
    const vimeoId  = card.dataset.vimeo;
    if (!ytId && !vimeoId) return;
    if (ytId && ytId.startsWith('youtube_id')) return; // placeholder guard
    lastFocused = card;
    frame.src = ytId
      ? `https://www.youtube.com/embed/${ytId}?autoplay=1&rel=0`
      : `https://player.vimeo.com/video/${vimeoId}?autoplay=1&title=0&byline=0&portrait=0`;
    modal.hidden = false;
    document.body.style.overflow = 'hidden';
    closeBtn.focus();
  };

  card.addEventListener('click', openVideo);
  card.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openVideo(); }
  });
});

function closeModal() {
  modal.hidden = true;
  frame.src = '';
  document.body.style.overflow = '';
  if (lastFocused) { lastFocused.focus(); lastFocused = null; }
}

backdrop.addEventListener('click', closeModal);
closeBtn.addEventListener('click', closeModal);
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

// ── Contact form (Formspree AJAX) ────────────────────────────
const contactForm = document.getElementById('contactForm');
const formSuccess = document.getElementById('formSuccess');
const formError   = document.getElementById('formError');
const formSubmit  = document.getElementById('formSubmit');

if (contactForm) {
  contactForm.addEventListener('submit', async e => {
    e.preventDefault();
    formSuccess.hidden = true;
    formError.hidden   = true;
    formSubmit.disabled = true;

    try {
      const res = await fetch(contactForm.action, {
        method: 'POST',
        body: new FormData(contactForm),
        headers: { 'Accept': 'application/json' }
      });
      if (res.ok) {
        contactForm.reset();
        formSuccess.hidden = false;
        formSuccess.querySelector('p').innerHTML =
          lang === 'fr' ? 'Message envoyé. À bientôt !' : 'Message sent. Talk soon!';
      } else {
        formError.hidden = false;
      }
    } catch {
      formError.hidden = false;
    } finally {
      formSubmit.disabled = false;
    }
  });
}

// ── Scroll reveal ─────────────────────────────────────────────
const revealEls = document.querySelectorAll(
  '.section-label, .section-title, .about-text p, .about-photo, .about-stat, ' +
  '.skill-col, .work-card, .timeline-item, .contact-sub, .contact-link'
);

revealEls.forEach(el => el.classList.add('reveal'));

const observer = new IntersectionObserver(entries => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      const delay = (entry.target.dataset.delay || 0);
      setTimeout(() => entry.target.classList.add('visible'), delay);
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

// Stagger children inside grids
document.querySelectorAll('.work-featured, .work-grid, .skills-grid, .contact-links').forEach(grid => {
  grid.querySelectorAll('.reveal').forEach((el, i) => {
    el.dataset.delay = i * 80;
  });
});

revealEls.forEach(el => observer.observe(el));
