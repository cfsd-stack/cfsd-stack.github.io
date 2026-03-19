// Simple data-driven courses catalog
document.addEventListener('DOMContentLoaded', () => {
  const searchEl = document.getElementById('search');
  const categoryEl = document.getElementById('category');
  const levelEl = document.getElementById('level');
  const grid = document.getElementById('courses');

  fetch('data/courses.json')
    .then(res => res.json())
    .then(data => {
      window._courses = data;
      populateCategories(data);
      render(data);
      searchEl.addEventListener('input', render);
      categoryEl.addEventListener('change', render);
      levelEl.addEventListener('change', render);
    })
    .catch(() => {
      grid.innerHTML = '<div class="empty">Failed to load courses.</div>';
    });

  function populateCategories(data) {
    // Collect categories and populate select
    const cats = Array.from(new Set(data.map(c => c.category))).sort();
    for (const c of cats) {
      const opt = document.createElement('option');
      opt.value = c;
      opt.textContent = c;
      categoryEl.appendChild(opt);
    }
  }

  function render(list) {
    // Apply filters
    const q = (searchEl.value || '').toLowerCase();
    const cat = categoryEl.value;
    const lvl = levelEl.value;
    const results = (list || window._courses).filter(course => {
      const matchCat = cat ? course.category === cat : true;
      const matchLvl = lvl ? course.level.toLowerCase() === lvl.toLowerCase() : true;
      const text = `${course.title} ${course.software.join(' ')} ${course.language}`.toLowerCase();
      const matchText = q ? text.includes(q) : true;
      return matchCat && matchLvl && matchText;
    });
    renderList(results);
  }

  function renderList(items) {
    grid.innerHTML = '';
    if (!items || items.length === 0) {
      grid.innerHTML = '<div class="empty">No courses match your filters.</div>';
      return;
    }
    for (const c of items) {
      grid.appendChild(cardFor(c));
    }
  }

  function cardFor(course) {
    const card = document.createElement('article');
    card.className = 'card';
    const img = document.createElement('img');
    img.src = course.thumbnail || 'https://picsum.photos/seed/placeholder/600/400';
    img.alt = course.title;
    const body = document.createElement('div');
    body.className = 'card-body';

    const title = document.createElement('h3');
    title.className = 'card-title';
    title.textContent = course.title;

    const badgeRow = document.createElement('div');
    badgeRow.className = 'badge-row';
    const cat = document.createElement('span'); cat.className = 'badge'; cat.textContent = course.category;
    const lvl = document.createElement('span'); lvl.className = 'badge'; lvl.textContent = course.level;
    badgeRow.appendChild(cat);
    badgeRow.appendChild(lvl);

    const meta = document.createElement('div');
    meta.className = 'meta';
    meta.textContent = `Language: ${course.language} • Software: ${course.software.join(', ')} • Hours: ${course.hours}`;

    const info = document.createElement('div');
    info.className = 'meta';
    info.textContent = `Subtitles: ${course.subtitles ? 'Yes' : 'No'} • Materials: ${course.materials ? 'Yes' : 'No'}`;

    const actions = document.createElement('div');
    actions.className = 'actions';
    const aSource = document.createElement('a'); aSource.href = course.sourceLink; aSource.className = 'button'; aSource.target = '_blank'; aSource.textContent = 'Source';
    const aDownload = document.createElement('a'); aDownload.href = course.downloadLink; aDownload.className = 'button'; aDownload.target = '_blank'; aDownload.textContent = 'Download';
    actions.appendChild(aSource);
    actions.appendChild(aDownload);

    body.appendChild(title);
    body.appendChild(badgeRow);
    body.appendChild(meta);
    body.appendChild(info);
    body.appendChild(actions);

    card.appendChild(img);
    card.appendChild(body);
    return card;
  }
});
