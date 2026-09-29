document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('projects-list');
  const projects = window.ARCH_PROJECTS;
  const assets = window.FIGMA_ASSETS;
  if (!container || !Array.isArray(projects)) return;

  const covers = ['56:174', '56:211', '56:212', '56:213'];
  const types = ['LIBRARY', 'HOUSING', 'HOSPITALITY', 'CULTURE'];

  container.replaceChildren(...projects.map((project, index) => {
      const link = document.createElement('a');
      link.className = 'listing-card';
      link.href = `project.html?id=${encodeURIComponent(project.id)}`;
      link.setAttribute('aria-label', `View project: ${project.title}`);

      const top = document.createElement('div');
      top.className = 'listing-card__top micro';
      const category = document.createElement('span');
      category.textContent = `${project.id} / ${types[index]}`;
      const date = document.createElement('span');
      date.textContent = project.time || '';
      top.append(category, date);

      const cover = document.createElement('span');
      cover.className = 'listing-card__cover';
      const image = document.createElement('img');
      image.src = assets?.[covers[index]] || project.images[0];
      image.alt = `Preview of ${project.title}`;
      image.loading = 'lazy';
      image.decoding = 'async';
      image.width = 620;
      image.height = 400;
      cover.append(image);

      const title = document.createElement('h2');
      title.textContent = `${project.title} →`;
      const subtitle = document.createElement('p');
      subtitle.className = 'listing-card__subtitle';
      subtitle.textContent = project.subtitle || '';
      const meta = document.createElement('div');
      meta.className = 'listing-card__meta micro';
      const location = document.createElement('span');
      location.textContent = 'Chengdu, China';
      const area = document.createElement('span');
      area.textContent = project.area || '';
      const action = document.createElement('span');
      action.textContent = 'View project →';
      meta.append(location, area, action);
      link.append(top, cover, title, subtitle, meta);
      return link;
    }));
});
