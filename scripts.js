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
      // Setup modal interactions after cards render
      setupModal(data);
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
      const card = cardFor(c);
      // attach click to open modal with more details
      card.style.cursor = 'pointer';
      card.addEventListener('click', () => openModal(c));
      grid.appendChild(card);
    }
  }

  function cardFor(course) {
    const card = document.createElement('article');
    card.className = 'card';
    const img = document.createElement('img');
    img.src = course.thumbnail || 'https://picsum.photos/seed/placeholder/600/400';
    // Fallback if image URL is invalid or blocked
    img.onerror = () => { img.src = 'https://picsum.photos/seed/placeholder/600/400'; };
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

  // Modal handling
  function setupModal(data) {
    const modal = document.getElementById('course-modal');
    const closeBtn = document.getElementById('modal-close');
    const modalTitle = document.getElementById('modal-title');
    const modalDesc = document.getElementById('modal-description');
    const modalMedia = document.getElementById('modal-media');
    const modalInfo = document.getElementById('modal-info');
    const modalMaterials = document.getElementById('modal-materials');
    const modalActions = document.getElementById('modal-actions');

    function open(course) {
      // Populate modal
      modalTitle.textContent = course.title;
      modalDesc.textContent = course.description || (course.title + ' is a ' + course.level + ' ' + course.category + ' course using ' + course.software.join(', ') + '. Estimated duration: ' + course.hours + ' hours.');
      modalInfo.textContent = `Category: ${course.category} • Level: ${course.level} • Language: ${course.language} • Hours: ${course.hours}`;
      modalMaterials.textContent = `Subtitles: ${course.subtitles ? 'Yes' : 'No'} • Materials: ${course.materials ? 'Yes' : 'No'}`;
      // media gallery
      modalMedia.innerHTML = '';
      if (course.screenshots && course.screenshots.length > 0) {
        for (const src of course.screenshots) {
          const img = document.createElement('img');
          img.src = src; img.alt = course.title + ' screenshot';
          img.style.height = '120px'; img.style.borderRadius = '6px';
          modalMedia.appendChild(img);
        }
      }
      // actions
      modalActions.innerHTML = '';
      const aSource = document.createElement('a'); aSource.href = course.sourceLink; aSource.className = 'button'; aSource.target = '_blank'; aSource.textContent = 'Source';
      const aDownload = document.createElement('a'); aDownload.href = course.downloadLink; aDownload.className = 'button'; aDownload.target = '_blank'; aDownload.textContent = 'Download';
      modalActions.appendChild(aSource);
      modalActions.appendChild(aDownload);
      // show
      modal.style.display = 'block';
      modal.classList.add('open');
      modal.setAttribute('aria-hidden', 'false');
      // trap focus basics
      modal.focus();
    }

    function close() {
      modal.style.display = 'none';
      modal.classList.remove('open');
      modal.setAttribute('aria-hidden', 'true');
    }

    // expose open for use by card click handler
    window.openCourseModal = open;
    closeBtn.addEventListener('click', close);
    modal.addEventListener('click', (e) => {
      if (e.target === modal) close();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') close();
    });
  }

  function openModal(course) {
    if (typeof window.openCourseModal === 'function') {
      window.openCourseModal(course);
    }
  }
});
