document.addEventListener('DOMContentLoaded', () => {
  const header = document.querySelector('.site-header');
  const toggle = header?.querySelector('.mobile-menu-toggle');
  const controls = document.getElementById('site-header-panel');
  const mobileQuery = window.matchMedia('(max-width: 768px)');
  if (!header || !toggle || !controls) return;

  if (!header.classList.contains('detail-header')) {
    const updateScrollShadow = () => header.classList.toggle('is-scrolled', window.scrollY > 0);
    window.addEventListener('scroll', updateScrollShadow, { passive: true });
    window.addEventListener('pageshow', updateScrollShadow);
    updateScrollShadow();
  }

  function isOpen() {
    return header.classList.contains('menu-open');
  }

  function setMenuOpen(open) {
    const expanded = mobileQuery.matches && open;
    header.classList.toggle('menu-open', expanded);
    toggle.setAttribute('aria-expanded', String(expanded));
    toggle.setAttribute('aria-label', expanded ? 'Close navigation menu' : 'Open navigation menu');
    controls.toggleAttribute('inert', mobileQuery.matches && !expanded);
    if (mobileQuery.matches) controls.setAttribute('aria-hidden', String(!expanded));
    else controls.removeAttribute('aria-hidden');
  }

  toggle.addEventListener('click', () => setMenuOpen(!isOpen()));
  controls.addEventListener('click', (event) => {
    if (event.target.closest('a')) setMenuOpen(false);
  });
  document.addEventListener('click', (event) => {
    if (isOpen() && !header.contains(event.target)) setMenuOpen(false);
  });
  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape' || !isOpen()) return;
    setMenuOpen(false);
    toggle.focus();
  });
  mobileQuery.addEventListener('change', () => setMenuOpen(false));
  setMenuOpen(false);
});
