document.addEventListener('DOMContentLoaded', () => {
    const navLinks = Array.from(document.querySelectorAll('.main-nav a[href^="#"]'));
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

    function scrollToElement(element, block = 'start') {
        element.scrollIntoView({
            behavior: prefersReducedMotion.matches ? 'auto' : 'smooth',
            block
        });
    }

    function setActiveNavLink(activeLink) {
        document.querySelectorAll('.main-nav a').forEach((link) => {
            const isActive = link === activeLink;
            link.classList.toggle('active', isActive);

            if (isActive) {
                link.setAttribute('aria-current', 'location');
            } else {
                link.removeAttribute('aria-current');
            }
        });
    }

    navLinks.forEach((link) => {
        link.addEventListener('click', (event) => {
            const targetId = link.getAttribute('href');
            const target = targetId ? document.querySelector(targetId) : null;

            if (!target) return;

            event.preventDefault();
            setActiveNavLink(link);
            scrollToElement(target);
        });
    });

    const scrollArrow = document.querySelector('.scroll-down');
    const aboutSection = document.querySelector('#about');

    if (scrollArrow && aboutSection) {
        scrollArrow.addEventListener('click', () => {
            scrollToElement(aboutSection, 'center');
        });
    }
});
