(() => {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let navigating = false;

  document.addEventListener('click', (event) => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const link = event.target.closest('a[href]');
    if (!link || link.hasAttribute('download') || (link.target && link.target !== '_self')) return;

    const destination = new URL(link.href, window.location.href);
    if (destination.origin !== window.location.origin || !destination.pathname.endsWith('.html')) return;
    if (destination.pathname === window.location.pathname && destination.search === window.location.search) return;
    if (reducedMotion.matches || navigating) return;

    event.preventDefault();
    navigating = true;
    document.body.classList.add('is-leaving');
    window.setTimeout(() => window.location.assign(destination.href), 220);
  });

  window.addEventListener('pageshow', () => {
    navigating = false;
    document.body.classList.remove('is-leaving');
  });
})();
