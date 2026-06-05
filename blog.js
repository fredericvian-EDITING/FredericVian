// Year
document.getElementById('year').textContent = new Date().getFullYear();

// Nav scroll
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 60);
}, { passive: true });

// Mobile burger
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

// Filtre (blog.html uniquement)
const filterBtns = document.querySelectorAll('.blog-filter-btn');
const blogCards  = document.querySelectorAll('.blog-card');

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const cat = btn.dataset.filter;
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    blogCards.forEach(card => {
      const show = cat === 'all' || card.dataset.category === cat;
      card.style.display = show ? '' : 'none';
    });
  });
});

// Scroll reveal
const revealEls = document.querySelectorAll(
  '.section-label, .section-title, .blog-hero-sub, .blog-filter, ' +
  '.blog-card, .article-back, .article-meta, .article-title'
);
revealEls.forEach(el => el.classList.add('reveal'));

const blogGrid = document.getElementById('blogGrid');
if (blogGrid) {
  blogGrid.querySelectorAll('.reveal').forEach((el, i) => {
    el.dataset.delay = i * 100;
  });
}

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const delay = +(entry.target.dataset.delay || 0);
      setTimeout(() => entry.target.classList.add('visible'), delay);
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

revealEls.forEach(el => observer.observe(el));
