// ── Year ──────────────────────────────────────────────────────
document.getElementById('year').textContent = new Date().getFullYear();

// ── Nav scroll ────────────────────────────────────────────────
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 60);
}, { passive: true });

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
  '.section-label, .section-title, .about-text p, .about-frame, ' +
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
document.querySelectorAll('.work-grid, .skills-grid, .contact-links').forEach(grid => {
  grid.querySelectorAll('.reveal').forEach((el, i) => {
    el.dataset.delay = i * 80;
  });
});

revealEls.forEach(el => observer.observe(el));
