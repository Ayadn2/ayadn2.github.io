/**
 * Portfolio – main.js
 * Etappe 1: Mobile Navigation, Theme-Toggle, aktiver Menüpunkt, Jahr im Footer
 */

document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initThemeToggle();
  initActiveLinks();
  setFooterYear();
});

/* ---------- Mobile Navigation ---------- */
function initNavigation() {
  const toggle = document.querySelector('.nav__toggle');
  const menu = document.getElementById('nav-menu');
  if (!toggle || !menu) return;

  const setOpen = (open) => {
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Menü schliessen' : 'Menü öffnen');
    menu.classList.toggle('is-open', open);
  };

  toggle.addEventListener('click', () => {
    setOpen(toggle.getAttribute('aria-expanded') !== 'true');
  });

  // Menü schliessen, wenn ein Link angeklickt wird
  menu.querySelectorAll('.nav__link').forEach((link) => {
    link.addEventListener('click', () => setOpen(false));
  });

  // Menü mit Escape schliessen
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') setOpen(false);
  });

  // Beim Wechsel auf Desktop-Breite zurücksetzen
  matchMedia('(min-width: 769px)').addEventListener('change', (e) => {
    if (e.matches) setOpen(false);
  });
}

/* ---------- Theme (hell / dunkel) ---------- */
function initThemeToggle() {
  const button = document.querySelector('.theme-toggle');
  if (!button) return;

  const root = document.documentElement;

  const applyTheme = (theme) => {
    root.dataset.theme = theme;
    button.setAttribute(
      'aria-label',
      theme === 'dark' ? 'Helles Theme aktivieren' : 'Dunkles Theme aktivieren'
    );
  };

  applyTheme(root.dataset.theme || 'light');

  button.addEventListener('click', () => {
    const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    try {
      localStorage.setItem('theme', next);
    } catch (e) {
      /* Speichern nicht möglich (z. B. privater Modus) */
    }
  });
}

/* ---------- Aktiven Menüpunkt beim Scrollen markieren ---------- */
function initActiveLinks() {
  const links = document.querySelectorAll('.nav__link');
  const sections = [...links]
    .map((link) => document.querySelector(link.getAttribute('href')))
    .filter(Boolean);

  // Auch den Startbereich beobachten: dort ist kein Menüpunkt aktiv
  const hero = document.getElementById('top');
  if (hero) sections.push(hero);

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        links.forEach((link) => {
          link.classList.toggle('is-active', link.getAttribute('href') === `#${entry.target.id}`);
        });
      });
    },
    { rootMargin: '-45% 0px -50% 0px' }
  );

  sections.forEach((section) => observer.observe(section));
}

/* ---------- Footer-Jahr ---------- */
function setFooterYear() {
  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();
}
