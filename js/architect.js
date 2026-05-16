document.addEventListener('DOMContentLoaded', () => {
    // Check if map container exists to avoid errors on other pages
    if (!document.getElementById('project-map')) return;

    const map = L.map('project-map', {
        scrollWheelZoom: false // Keep it clean while scrolling page
    }).setView([30.63, 104.09], 10); // Default to Chengdu center

    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
    }).addTo(map);

    const customIcon = L.divIcon({
        className: 'custom-div-icon',
        iconSize: [14, 14],
        iconAnchor: [7, 7]
    });

    const projectsContainer = document.getElementById('projects-container');
    const modalOverlay = document.getElementById('arch-modal-overlay');
    const closeBtn = document.getElementById('modal-close-btn');

    let allProjectsData = [];

    // Load project data from global variable
    if (window.ARCH_PROJECTS) {
        allProjectsData = window.ARCH_PROJECTS;
        const bounds = [];

        window.ARCH_PROJECTS.forEach((project, index) => {
            // Add Marker to Map
            if (project.coords && project.coords.length === 2 && project.coords[0] !== 0) {
                const marker = L.marker(project.coords, { icon: customIcon }).addTo(map);
                marker.bindTooltip(project.title);
                marker.on('click', () => {
                    const cardEl = document.getElementById(`project-card-${index}`);
                    if (cardEl) {
                        cardEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                });
                bounds.push(project.coords);
            }

            // Render Project Card
            const firstImage = project.images.length > 0 ? project.images[0] : '';
            
            const card = document.createElement('div');
            card.className = 'arch-project-card';
            card.id = `project-card-${index}`;
            card.onclick = () => openModal(index);
            
            card.innerHTML = `
                <div class="card-image-wrapper">
                    <img src="${firstImage}" alt="${project.title}">
                </div>
                <div class="card-info">
                    <h3 class="arch-card-title">${project.title}</h3>
                    <p class="arch-card-subtitle">${project.subtitle}</p>
                    <div class="arch-card-grid">
                        ${project.time ? `<div class="arch-card-label">项目时间</div><div class="arch-card-value">${project.time}</div>` : ''}
                        ${project.location ? `<div class="arch-card-label">位置地点</div><div class="arch-card-value">${project.location}</div>` : ''}
                        ${project.type ? `<div class="arch-card-label">功能类型</div><div class="arch-card-value">${project.type}</div>` : ''}
                        ${project.area ? `<div class="arch-card-label">建筑面积</div><div class="arch-card-value">${project.area}</div>` : ''}
                        ${project.far ? `<div class="arch-card-label">容积率</div><div class="arch-card-value">${project.far}</div>` : ''}
                        ${project.greening ? `<div class="arch-card-label">绿地率</div><div class="arch-card-value">${project.greening}</div>` : ''}
                        ${project.designer ? `<div class="arch-card-label">设计人员</div><div class="arch-card-value">${project.designer}</div>` : ''}
                    </div>
                    <button class="more-btn">MORE +</button>
                </div>
            `;
            
            projectsContainer.appendChild(card);
        });

        if (bounds.length > 0) {
            map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
        }
    } else {
        console.error("Error loading projects: window.ARCH_PROJECTS is not defined.");
    }

    let currentGalleryImages = [];
    let currentGalleryIndex = 0;

    function renderGallery() {
        const gallery = document.getElementById('modal-gallery');
        const dotsContainer = document.getElementById('gallery-dots');
        gallery.innerHTML = '';
        dotsContainer.innerHTML = '';

        if (currentGalleryImages.length === 0) return;

        // Image
        const img = document.createElement('img');
        img.src = currentGalleryImages[currentGalleryIndex];
        img.className = 'active';
        gallery.appendChild(img);

        // Dots
        currentGalleryImages.forEach((_, idx) => {
            const dot = document.createElement('div');
            dot.className = `dot ${idx === currentGalleryIndex ? 'active' : ''}`;
            dot.onclick = () => {
                currentGalleryIndex = idx;
                renderGallery();
            };
            dotsContainer.appendChild(dot);
        });
    }

    document.getElementById('gallery-prev').addEventListener('click', () => {
        if (currentGalleryImages.length === 0) return;
        currentGalleryIndex = (currentGalleryIndex - 1 + currentGalleryImages.length) % currentGalleryImages.length;
        renderGallery();
    });

    document.getElementById('gallery-next').addEventListener('click', () => {
        if (currentGalleryImages.length === 0) return;
        currentGalleryIndex = (currentGalleryIndex + 1) % currentGalleryImages.length;
        renderGallery();
    });

    // Modal Logic
    function openModal(index) {
        const project = allProjectsData[index];
        if (!project) return;

        document.getElementById('modal-title').innerText = project.title;
        document.getElementById('modal-subtitle').innerText = project.subtitle;
        
        currentGalleryImages = project.images;
        currentGalleryIndex = 0;
        renderGallery();

        // Populate info grid
        const infoGrid = document.getElementById('modal-info-grid');
        infoGrid.innerHTML = `
            ${project.time ? `<div class="arch-card-label">项目时间</div><div class="arch-card-value">${project.time}</div>` : ''}
            ${project.location ? `<div class="arch-card-label">位置地点</div><div class="arch-card-value">${project.location}</div>` : ''}
            ${project.type ? `<div class="arch-card-label">功能类型</div><div class="arch-card-value">${project.type}</div>` : ''}
            ${project.area ? `<div class="arch-card-label">建筑面积</div><div class="arch-card-value">${project.area}</div>` : ''}
            ${project.far ? `<div class="arch-card-label">容积率</div><div class="arch-card-value">${project.far}</div>` : ''}
            ${project.greening ? `<div class="arch-card-label">绿地率</div><div class="arch-card-value">${project.greening}</div>` : ''}
            ${project.designer ? `<div class="arch-card-label">设计人员</div><div class="arch-card-value">${project.designer}</div>` : ''}
        `;

        document.getElementById('modal-desc').innerText = project.description;

        modalOverlay.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
    }

    closeBtn.addEventListener('click', () => {
        modalOverlay.classList.remove('active');
        document.body.style.overflow = '';
    });

    // Click outside modal to close
    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) {
            modalOverlay.classList.remove('active');
            document.body.style.overflow = '';
        }
    });
});
