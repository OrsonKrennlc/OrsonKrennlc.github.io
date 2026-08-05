document.addEventListener('DOMContentLoaded', () => {
    const i18n = window.SiteI18n;
    const mapContainer = document.getElementById('project-map');
    const projectsContainer = document.getElementById('projects-list');
    const projectCount = document.getElementById('arch-project-count');
    const quickNav = document.getElementById('arch-quick-nav');
    const quickToggle = document.getElementById('arch-quick-toggle');
    const quickList = document.getElementById('arch-quick-list');
    const modalOverlay = document.getElementById('arch-modal-overlay');
    const modalContent = modalOverlay?.querySelector('.arch-modal-content');
    const closeButton = document.getElementById('modal-close-btn');
    const gallery = document.getElementById('modal-gallery');
    const dotsContainer = document.getElementById('gallery-dots');
    const galleryCounter = document.getElementById('gallery-counter');
    const previousButton = document.getElementById('gallery-prev');
    const nextButton = document.getElementById('gallery-next');
    const modalTitle = document.getElementById('modal-title');
    const modalSubtitle = document.getElementById('modal-subtitle');
    const modalInfoGrid = document.getElementById('modal-info-grid');
    const modalDescription = document.getElementById('modal-desc');
    const backgroundRegions = Array.from(document.querySelectorAll('body > header, body > main, body > footer'));

    if (!i18n || !projectsContainer || !quickNav || !quickToggle || !quickList || !modalOverlay || !modalContent || !closeButton || !gallery ||
        !dotsContainer || !galleryCounter || !previousButton || !nextButton || !modalTitle || !modalSubtitle ||
        !modalInfoGrid || !modalDescription) {
        return;
    }

    const projectFields = [
        ['time', 'project.field.time'],
        ['location', 'project.field.location'],
        ['type', 'project.field.type'],
        ['area', 'project.field.area'],
        ['far', 'project.field.far'],
        ['greening', 'project.field.greening'],
        ['designer', 'project.field.designer']
    ];

    const projects = Array.isArray(window.ARCH_PROJECTS) ? window.ARCH_PROJECTS : [];
    if (projectCount) projectCount.textContent = String(projects.length).padStart(2, '0');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const markerEntries = [];
    let currentGalleryImages = [];
    let currentGalleryIndex = 0;
    let currentProjectIndex = -1;
    let currentProjectTitle = '';
    let lastFocusedElement = null;
    let previousBodyOverflow = '';

    function t(key, variables) {
        return i18n.t(key, variables);
    }

    function localizedProject(project) {
        const locales = project?.locales || {};
        const content = locales[i18n.getLocale()] || locales.zh || locales.en || {};
        return {
            ...content,
            id: project?.id || '',
            coords: project?.coords || [0, 0],
            images: Array.isArray(project?.images) ? project.images : []
        };
    }

    function createElement(tagName, className, text) {
        const element = document.createElement(tagName);
        if (className) element.className = className;
        if (typeof text === 'string') element.textContent = text;
        return element;
    }

    function renderStatus(container, messageKey) {
        container.replaceChildren(createElement('p', 'arch-status', t(messageKey)));
    }

    function appendProjectFields(container, project) {
        const fragment = document.createDocumentFragment();

        projectFields.forEach(([field, labelKey]) => {
            const value = project[field];
            if (!value) return;

            fragment.append(
                createElement('div', 'arch-card-label', t(labelKey)),
                createElement('div', 'arch-card-value', String(value))
            );
        });

        container.replaceChildren(fragment);
    }

    function renderProjects() {
        projectsContainer.setAttribute('aria-busy', 'true');

        if (projects.length === 0) {
            renderStatus(projectsContainer, 'status.projectsUnavailable');
            projectsContainer.removeAttribute('aria-busy');
            return;
        }

        const fragment = document.createDocumentFragment();

        projects.forEach((projectSource, index) => {
            const project = localizedProject(projectSource);
            const titleText = String(project.title || t('project.unnamed'));
            const card = createElement('article', 'arch-project-card');
            card.id = `project-card-${index}`;
            const cardTrigger = createElement('button', 'arch-project-trigger');
            cardTrigger.type = 'button';
            cardTrigger.setAttribute('aria-haspopup', 'dialog');
            cardTrigger.setAttribute('aria-controls', 'arch-modal-overlay');
            cardTrigger.setAttribute('aria-label', t('project.view', { title: titleText }));

            const imageWrapper = createElement('figure', 'card-image-wrapper');
            const image = document.createElement('img');
            image.src = project.images[0] || '';
            image.alt = t('project.previewAlt', { title: titleText });
            image.width = 400;
            image.height = 250;
            image.loading = 'lazy';
            image.decoding = 'async';
            imageWrapper.append(image);

            const cardInfo = createElement('div', 'card-info');
            const cardHeading = createElement('div', 'arch-card-heading');
            const cardIndex = createElement('span', 'arch-card-index', String(index + 1).padStart(2, '0'));
            cardIndex.setAttribute('aria-hidden', 'true');
            const titleGroup = createElement('div', 'arch-card-title-group');
            const title = createElement('h3', 'arch-card-title', titleText);
            const subtitle = createElement('p', 'arch-card-subtitle', String(project.subtitle || ''));
            const infoGrid = createElement('div', 'arch-card-grid');
            appendProjectFields(infoGrid, project);
            const moreLabel = createElement('span', 'more-btn', t('project.more'));
            moreLabel.setAttribute('aria-hidden', 'true');

            titleGroup.append(title, subtitle);
            cardHeading.append(cardIndex, titleGroup);
            cardInfo.append(cardHeading, infoGrid, moreLabel);
            card.append(imageWrapper, cardInfo, cardTrigger);
            cardTrigger.addEventListener('click', () => openModal(index, cardTrigger));
            fragment.append(card);
        });

        projectsContainer.replaceChildren(fragment);
        projectsContainer.removeAttribute('aria-busy');
    }

    function setQuickNavOpen(open) {
        quickNav.classList.toggle('is-open', open);
        quickToggle.setAttribute('aria-expanded', String(open));
        quickList.setAttribute('aria-hidden', String(!open));
        quickList.inert = !open;
        quickList.querySelectorAll('button').forEach((button) => {
            button.tabIndex = open ? 0 : -1;
        });
    }

    function jumpToProject(projectIndex, focusCard = false) {
        const projectCard = document.getElementById(`project-card-${projectIndex}`);
        if (!projectCard) return;

        projectCard.scrollIntoView({
            behavior: reducedMotion.matches ? 'auto' : 'smooth',
            block: 'center'
        });

        if (focusCard) {
            window.requestAnimationFrame(() => {
                projectCard.querySelector('.arch-project-trigger')?.focus({ preventScroll: true });
            });
        }
    }

    function renderQuickNav() {
        const fragment = document.createDocumentFragment();

        projects.forEach((projectSource, index) => {
            const project = localizedProject(projectSource);
            const titleText = String(project.title || t('project.unnamed'));
            const button = createElement('button', 'arch-quick-project');
            button.type = 'button';
            button.setAttribute('aria-label', t('project.quickJump', { title: titleText }));

            button.append(
                createElement('span', 'arch-quick-project-index', String(index + 1).padStart(2, '0')),
                createElement('span', 'arch-quick-project-title', titleText),
                createElement('span', 'arch-quick-project-time', String(project.time || ''))
            );
            button.addEventListener('click', () => {
                setQuickNavOpen(false);
                jumpToProject(index, true);
            });
            fragment.append(button);
        });

        quickList.replaceChildren(fragment);
        setQuickNavOpen(false);
    }

    function tooltipContent(projectIndex) {
        const project = localizedProject(projects[projectIndex]);
        const titleText = String(project.title || t('project.unnamed'));
        const preview = createElement('div', 'map-project-preview');

        if (project.images[0]) {
            const image = document.createElement('img');
            image.src = project.images[0];
            image.alt = '';
            image.width = 220;
            image.height = 124;
            image.loading = 'lazy';
            image.decoding = 'async';
            preview.append(image);
        }

        preview.append(createElement('span', 'map-project-preview-title', titleText));
        return preview;
    }

    function updateMapTranslations() {
        markerEntries.forEach(({ marker, projectIndex }) => {
            marker.setTooltipContent(tooltipContent(projectIndex));
        });
    }

    function initializeMap() {
        if (!mapContainer) return;

        if (!window.L) {
            renderStatus(mapContainer, 'status.mapUnavailable');
            return;
        }

        const map = window.L.map(mapContainer, {
            scrollWheelZoom: false
        }).setView([30.63, 104.09], 10);

        window.L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        }).addTo(map);

        const customIcon = window.L.divIcon({
            className: 'custom-div-icon',
            iconSize: [14, 14],
            iconAnchor: [7, 7]
        });
        const bounds = [];

        projects.forEach((project, index) => {
            if (!Array.isArray(project.coords) || project.coords.length !== 2 || project.coords[0] === 0) return;

            const marker = window.L.marker(project.coords, { icon: customIcon }).addTo(map);
            marker.bindTooltip(tooltipContent(index), {
                className: 'arch-project-tooltip',
                direction: 'top',
                offset: [0, -10],
                opacity: 1
            });
            marker.on('click', () => jumpToProject(index));
            markerEntries.push({ marker, projectIndex: index });
            bounds.push(project.coords);
        });

        if (bounds.length > 0) {
            map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
        }
    }

    function renderGallery(focusActiveDot = false) {
        gallery.replaceChildren();
        dotsContainer.replaceChildren();

        if (currentGalleryImages.length === 0) {
            renderStatus(gallery, 'status.noImages');
            galleryCounter.textContent = '00 / 00';
            previousButton.disabled = true;
            nextButton.disabled = true;
            return;
        }

        previousButton.disabled = currentGalleryImages.length < 2;
        nextButton.disabled = currentGalleryImages.length < 2;
        galleryCounter.textContent = `${String(currentGalleryIndex + 1).padStart(2, '0')} / ${String(currentGalleryImages.length).padStart(2, '0')}`;

        const image = document.createElement('img');
        image.src = currentGalleryImages[currentGalleryIndex];
        image.className = 'active';
        image.alt = t('project.galleryAlt', {
            title: currentProjectTitle,
            current: currentGalleryIndex + 1,
            total: currentGalleryImages.length
        });
        image.decoding = 'async';
        gallery.append(image);

        const dotsFragment = document.createDocumentFragment();
        currentGalleryImages.forEach((_, index) => {
            const dot = createElement('button', `dot${index === currentGalleryIndex ? ' active' : ''}`);
            dot.type = 'button';
            dot.setAttribute('aria-label', t('project.galleryDot', { index: index + 1 }));
            dot.setAttribute('aria-pressed', String(index === currentGalleryIndex));
            dot.addEventListener('click', () => {
                currentGalleryIndex = index;
                renderGallery(true);
            });
            dotsFragment.append(dot);
        });
        dotsContainer.append(dotsFragment);

        if (focusActiveDot) {
            dotsContainer.querySelector('.dot.active')?.focus();
        }
    }

    function showPreviousImage() {
        if (currentGalleryImages.length < 2) return;
        currentGalleryIndex = (currentGalleryIndex - 1 + currentGalleryImages.length) % currentGalleryImages.length;
        renderGallery();
    }

    function showNextImage() {
        if (currentGalleryImages.length < 2) return;
        currentGalleryIndex = (currentGalleryIndex + 1) % currentGalleryImages.length;
        renderGallery();
    }

    function setBackgroundInert(isInert) {
        backgroundRegions.forEach((region) => {
            region.inert = isInert;
        });
    }

    function populateModal(index, resetGallery = true) {
        const project = localizedProject(projects[index]);
        if (!project.id) return false;

        const titleText = String(project.title || t('project.unnamed'));
        modalTitle.textContent = titleText;
        modalSubtitle.textContent = String(project.subtitle || '');
        modalDescription.textContent = String(project.description || '');
        appendProjectFields(modalInfoGrid, project);

        currentProjectIndex = index;
        currentProjectTitle = titleText;
        currentGalleryImages = project.images;
        if (resetGallery) currentGalleryIndex = 0;
        currentGalleryIndex = Math.min(currentGalleryIndex, Math.max(currentGalleryImages.length - 1, 0));
        renderGallery();
        return true;
    }

    function openModal(index, trigger) {
        if (!populateModal(index)) return;

        lastFocusedElement = trigger || document.activeElement;
        previousBodyOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        setBackgroundInert(true);
        modalOverlay.classList.add('active');
        modalOverlay.setAttribute('aria-hidden', 'false');
        modalContent.focus({ preventScroll: true });
    }

    function closeModal() {
        if (!modalOverlay.classList.contains('active')) return;

        modalOverlay.classList.remove('active');
        modalOverlay.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = previousBodyOverflow;
        setBackgroundInert(false);

        if (lastFocusedElement instanceof HTMLElement) {
            lastFocusedElement.focus({ preventScroll: true });
        }
    }

    function trapFocus(event) {
        const focusableElements = Array.from(modalContent.querySelectorAll(
            'button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])'
        ));

        if (focusableElements.length === 0) {
            event.preventDefault();
            modalContent.focus();
            return;
        }

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (event.shiftKey && (document.activeElement === firstElement || document.activeElement === modalContent)) {
            event.preventDefault();
            lastElement.focus();
        } else if (!event.shiftKey && document.activeElement === lastElement) {
            event.preventDefault();
            firstElement.focus();
        }
    }

    previousButton.addEventListener('click', showPreviousImage);
    nextButton.addEventListener('click', showNextImage);
    closeButton.addEventListener('click', closeModal);
    quickToggle.addEventListener('click', () => {
        setQuickNavOpen(quickToggle.getAttribute('aria-expanded') !== 'true');
    });

    modalOverlay.addEventListener('click', (event) => {
        if (event.target === modalOverlay) closeModal();
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && quickNav.classList.contains('is-open') && quickNav.contains(document.activeElement)) {
            event.preventDefault();
            setQuickNavOpen(false);
            quickToggle.focus();
            return;
        }

        if (!modalOverlay.classList.contains('active')) return;

        if (event.key === 'Escape') {
            event.preventDefault();
            closeModal();
        } else if (event.key === 'Tab') {
            trapFocus(event);
        } else if (event.key === 'ArrowLeft') {
            showPreviousImage();
        } else if (event.key === 'ArrowRight') {
            showNextImage();
        }
    });

    window.addEventListener('localechange', () => {
        renderProjects();
        renderQuickNav();
        updateMapTranslations();
        if (modalOverlay.classList.contains('active') && currentProjectIndex >= 0) {
            populateModal(currentProjectIndex, false);
        }
    });

    renderProjects();
    renderQuickNav();
    initializeMap();
});
