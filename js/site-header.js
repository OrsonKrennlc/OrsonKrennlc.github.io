document.documentElement.classList.add('mobile-nav-ready');

document.addEventListener('DOMContentLoaded', () => {
    const header = document.querySelector('.site-header');
    const toggle = header?.querySelector('.mobile-menu-toggle');
    const controls = document.getElementById('site-header-panel');
    const mobileQuery = window.matchMedia('(max-width: 768px)');
    const i18n = window.SiteI18n;

    if (!header || !toggle || !controls) return;

    function isOpen() {
        return header.classList.contains('menu-open');
    }

    function updateToggleLabel(open) {
        const key = open ? 'nav.closeMenu' : 'nav.openMenu';
        toggle.setAttribute('aria-label', i18n ? i18n.t(key) : (open ? '关闭导航菜单' : '打开导航菜单'));
    }

    function setMenuOpen(open) {
        const shouldOpen = mobileQuery.matches && open;
        header.classList.toggle('menu-open', shouldOpen);
        toggle.setAttribute('aria-expanded', String(shouldOpen));
        controls.toggleAttribute('inert', mobileQuery.matches && !shouldOpen);

        if (mobileQuery.matches) {
            controls.setAttribute('aria-hidden', String(!shouldOpen));
        } else {
            controls.removeAttribute('aria-hidden');
        }

        updateToggleLabel(shouldOpen);
    }

    toggle.addEventListener('click', () => setMenuOpen(!isOpen()));

    controls.addEventListener('click', (event) => {
        if (!event.target.closest('a, [data-locale]')) return;
        setMenuOpen(false);
        if (mobileQuery.matches) {
            window.requestAnimationFrame(() => toggle.focus({ preventScroll: true }));
        }
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
    window.addEventListener('localechange', () => updateToggleLabel(isOpen()));
    setMenuOpen(false);
});
