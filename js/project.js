document.addEventListener('DOMContentLoaded', () => {
  const sources = window.ARCH_PROJECTS;
  const assets = window.FIGMA_ASSETS;
  if (!Array.isArray(sources) || !assets) return;

  const requested = new URLSearchParams(window.location.search).get('id') ||
    new URLSearchParams(window.location.search).get('project') || '001';
  const index = Math.max(0, sources.findIndex((item) => item.id === requested));
  const source = sources[index];
  const next = sources[(index + 1) % sources.length];
  const imageSets = {
    '001': { hero: '56:225', left: ['56:248', '56:250', '56:252'], right: ['56:249', '56:251', '56:253'] },
    '002': { hero: '56:381', left: ['56:382', '56:384', '56:386', '56:387'], right: ['56:383', '56:385'] },
    '003': { hero: '56:388', left: ['56:389', '56:392', '56:394', '56:396'], right: ['56:390', '56:391', '56:393', '56:395', '56:397'] },
    '004': { hero: '56:398', left: ['56:399', '56:401', '56:403', '56:405'], right: ['56:400', '56:402', '56:404'] }
  };
  const categories = ['LIBRARY', 'HOUSING', 'HOSPITALITY', 'CULTURE'];
  const storyHeadings = [
    'Reading, conversation and nature.',
    'Reconnecting the city at a human scale.',
    'A quiet retreat within the city.',
    'Local craft, shared memory.'
  ];
  const sets = imageSets[source.id];
  const byId = (id) => document.getElementById(id);

  function render() {
    const project = source;
    const nextProject = next;
    const title = project.title || '';
    const subtitle = project.subtitle || '';
    byId('project-kicker').textContent = `${String(index + 1).padStart(2, '0')} / ${categories[index]}`;
    byId('project-title').textContent = title;
    byId('project-subtitle').textContent = subtitle;
    const hero = byId('project-hero');
    hero.src = assets[sets.hero] || source.images[0];
    hero.alt = `Preview of ${title}`;
    byId('project-story-heading').textContent = storyHeadings[index];
    byId('project-story').replaceChildren(...String(project.description || '').split(/\n\s*\n/).filter(Boolean).map((paragraph) => {
      const element = document.createElement('p');
      element.textContent = paragraph;
      return element;
    }));

    const fields = [
      ['LOCATION', project.location],
      ['PERIOD', project.time],
      ['AREA / FAR / GREEN COVER', [project.area, project.far, project.greening].filter(Boolean).join(' / ')],
      ['DESIGNER', project.designer]
    ];
    const info = byId('project-info');
    info.replaceChildren();
    fields.forEach(([label, value]) => {
      if (!value) return;
      const dt = document.createElement('dt');
      dt.textContent = label;
      const dd = document.createElement('dd');
      dd.textContent = String(value);
      info.append(dt, dd);
    });

    const columns = byId('project-gallery');
    const nodes = [...sets.left, ...sets.right];
    columns.replaceChildren(...[sets.left, sets.right].map((column) => {
      const wrapper = document.createElement('div');
      wrapper.className = 'detail-gallery__column';
      column.forEach((nodeId) => {
        const image = document.createElement('img');
        const position = nodes.indexOf(nodeId) + 1;
        image.src = assets[nodeId];
        image.alt = `${title}, project image ${position} of ${nodes.length}`;
        image.loading = 'lazy';
        image.decoding = 'async';
        wrapper.append(image);
      });
      return wrapper;
    }));
    byId('next-project-kicker').textContent = `NEXT PROJECT / ${String((index + 1) % sources.length + 1).padStart(2, '0')}`;
    byId('next-project-link').href = `project.html?id=${encodeURIComponent(next.id)}`;
    byId('next-project-link').textContent = `${nextProject.title} →`;
    document.title = `${title} — Jerry Shen`;
    const meta = document.querySelector('meta[name=description]');
    if (meta) meta.content = `${subtitle}. ${String(project.description || '').slice(0, 125)}`;
  }

  render();
});
