document.addEventListener('DOMContentLoaded', () => {
  const cases = window.CASE_STUDIES;
  const assets = window.FIGMA_ASSETS;
  if (!cases || !assets) return;
  const requested = new URLSearchParams(location.search).get('id');
  const id = Object.prototype.hasOwnProperty.call(cases, requested) ? requested : 'roamline';
  const study = cases[id];
  const byId = (name) => document.getElementById(name);
  document.body.dataset.case = id;

  function element(tag, className, value) {
    const item = document.createElement(tag);
    if (className) item.className = className;
    if (value !== undefined) item.textContent = value;
    return item;
  }

  function appendImage(parent, nodeId, alt) {
    if (!assets[nodeId]) return;
    const image = element('img');
    image.src = assets[nodeId];
    image.alt = alt;
    image.loading = 'lazy';
    image.decoding = 'async';
    parent.append(image);
  }

  const phoneFrames = {
    '65:107': '66:116', '65:108': '66:117', '65:109': '66:118',
    '65:86': '66:119', '65:87': '66:120', '65:88': '66:121',
    '71:241': '71:242', '71:244': '71:245',
    '71:253': '71:254', '71:256': '71:257'
  };

  function appendPhone(parent, screenId, frameId, alt) {
    if (!assets[screenId] || !assets[frameId]) return;
    const phone = element('span', 'phone-stack');
    appendImage(phone, screenId, alt);
    appendImage(phone, frameId, '');
    phone.lastElementChild.className = 'phone-stack__frame';
    phone.lastElementChild.setAttribute('aria-hidden', 'true');
    parent.append(phone);
  }

  function renderHero() {
    const container = byId('case-hero');
    container.replaceChildren();
    const copy = study.intro;
    if (id === 'roamline') {
      const cover = element('div', 'case-hero-roamline');
      cover.append(element('span', 'micro', copy[0]), element('strong', '', copy[1]), element('p', '', copy[2]));
      const phones = element('div', 'case-hero-roamline__phones');
      [['75:42', '75:43'], ['75:71', '75:47'], ['75:50', '75:51']].forEach(([screenId, frameId], index) => {
        appendPhone(phones, screenId, frameId, `${copy[1]} — ${index + 1}`);
      });
      cover.append(phones, element('span', 'micro', 'FROM INSPIRATION TO ITINERARY'));
      container.append(cover);
    } else {
      appendImage(container, study.hero, `${copy[1]} — ${copy[2]}`);
      container.querySelector('img')?.classList.add('case-hero');
    }
  }

  function renderSection(section) {
    const texts = section.texts;
    const shell = element('section', 'case-section');
    shell.id = section.slug;
    const inner = element('div', 'shell');
    const head = element('div', 'case-section__header');
    head.append(element('span', 'detail-kicker', texts[0]), element('h2', '', texts[1]), element('p', 'case-section__intro', texts[2]));
    inner.append(head);

    const wide = element('figure', 'case-section__wide');
    if (section.wide) appendImage(wide, section.wide, texts[1]);
    const wideFirst = id !== 'roamline';
    if (section.wide && wideFirst) inner.append(wide);

    const cards = element('div', `case-section__grid${section.groups.length === 2 ? ' case-section__grid--two' : ''}`);
    let headingAdded = false;
    section.groups.forEach((group, index) => {
      if (section.extraHeading !== undefined && !headingAdded && group[0] > section.extraHeading) {
        const heading = element('h3', 'case-section__subheading', texts[section.extraHeading]);
        cards.append(heading);
        headingAdded = true;
      }
      const content = group.map((textIndex) => texts[textIndex]).join('\n');
      const lines = content.split(/\n+/).map((part) => part.trim()).filter(Boolean);
      const card = element('article', 'case-section__item');
      const nodeId = section.images[index];
      if (nodeId && phoneFrames[nodeId]) appendPhone(card, nodeId, phoneFrames[nodeId], lines[0] || texts[1]);
      else if (nodeId) appendImage(card, nodeId, lines[0] || texts[1]);
      card.append(element('h3', '', lines[0] || ''), element('p', '', lines.slice(1).join('\n')));
      cards.append(card);
    });
    if (section.groups.length) inner.append(cards);
    if (section.wide && !wideFirst) inner.append(wide);
    if (section.question !== undefined) {
      inner.append(element('p', 'case-section__question', texts[section.question]));
    }
    const consumed = new Set([0, 1, 2, section.extraHeading, section.question]);
    section.groups.flat().forEach((index) => consumed.add(index));
    const relatedSections = id === 'roamline' && section.slug === 'system' ? ['#research', '#interfaces'] : [];
    texts.forEach((value, index) => {
      if (consumed.has(index)) return;
      if (/→$/.test(value.trim())) {
        const destination = relatedSections.shift() || assets[section.wide] || assets[section.images[0]];
        if (!destination) return;
        const link = element('a', 'text-link', value);
        link.href = destination;
        if (!destination.startsWith('#')) {
          link.target = '_blank';
          link.rel = 'noopener';
        }
        inner.append(link);
      } else {
        inner.append(element('p', 'micro case-section__note', value));
      }
    });
    shell.append(inner);
    return shell;
  }

  function render() {
    const intro = study.intro;
    byId('case-kicker').textContent = intro[0];
    byId('case-title').textContent = intro[1];
    byId('case-tagline').textContent = intro[2];
    byId('case-summary').textContent = intro[3];
    byId('case-meta').textContent = intro[4];
    renderHero();
    const contents = byId('case-contents');
    contents.replaceChildren(...study.sections.map((section) => {
      const link = element('a', '', `${study.labels[section.slug]} ↓`);
      link.href = `#${section.slug}`;
      return link;
    }));
    byId('case-sections').replaceChildren(...study.sections.map(renderSection));
    const next = cases[study.next];
    byId('case-next-kicker').textContent = `NEXT PROJECT / ${next.intro[0].slice(0, 2)}`;
    byId('case-next-link').href = `case-study.html?id=${study.next}`;
    byId('case-next-link').textContent = `${next.intro[1]} →`;
    document.title = `${intro[1]} — Jerry Shen`;
    const meta = document.querySelector('meta[name=description]');
    if (meta) meta.content = intro[3];
  }

  render();
});
