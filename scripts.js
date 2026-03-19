document.addEventListener('DOMContentLoaded', () => {
    const searchEl = document.getElementById('search');
    const categoryEl = document.getElementById('category');
    const levelEl = document.getElementById('level');
    const grid = document.getElementById('courses');
    
    const dimButtons = document.querySelectorAll('.dim-btn');
    let activeDimension = '3D'; // Default view

    let courses = [];
    const coursesUrl = new URL('data/courses.json', window.location.href);
    const cacheBust = `cb=${Date.now()}`;
    const fetchUrl = `${coursesUrl.toString()}${coursesUrl.search ? '&' : '?'}${cacheBust}`;

    fetch(fetchUrl)
        .then(res => res.json())
        .then(data => {
            courses = data || [];
            populateCategories(courses);
            renderList(courses);
            
            searchEl.addEventListener('input', () => applyFilters(courses));
            categoryEl.addEventListener('change', () => applyFilters(courses));
            levelEl.addEventListener('change', () => applyFilters(courses));
            
            dimButtons.forEach(btn => {
                btn.addEventListener('click', (e) => {
                    dimButtons.forEach(b => b.classList.remove('active'));
                    e.target.classList.add('active');
                    
                    activeDimension = e.target.getAttribute('data-dim');
                    
                    applyFilters(courses);
                });
            });

            setupModal();
        })
        .catch(() => {
            grid.innerHTML = '<p class="empty">Failed to load courses.</p>';
        });

    function getCourseDimension(course) {
        if (course.dimension) return course.dimension;
        const tags = (course.tags || []).join(' ').toLowerCase();
        if (tags.includes('2d')) return '2D';
        return '3D';
    }

    function populateCategories(data) {
        const cats = Array.from(new Set(data.map(c => c.category))).sort();
        for (const c of cats) {
            const opt = document.createElement('option');
            opt.value = c;
            opt.textContent = c;
            categoryEl.appendChild(opt);
        }
    }

    function applyFilters(source) {
        const base = Array.isArray(source) ? source : courses;
        const q = (searchEl.value || '').toLowerCase().trim();
        const cat = categoryEl.value;
        const lvl = levelEl.value;
        
        const results = base.filter(course => {
            const courseDim = getCourseDimension(course);
            
            const matchCat = cat ? course.category === cat : true;
            const matchLvl = lvl ? course.level.toLowerCase() === lvl.toLowerCase() : true;
            const matchDim = courseDim === activeDimension; // New Dimension Filter

            const haystack = [
                course.title || '',
                (course.tags || []).join(' '),
                (course.software || []).join(' ')
            ]
                .join(' ')
                .toLowerCase();

            const matchText = q ? haystack.includes(q) : true;
            return matchCat && matchLvl && matchText && matchDim;
        });

        renderList(results);
    }

    function renderList(items) {
        grid.innerHTML = '';
        if (!items || items.length === 0) {
            grid.innerHTML = '<p class="empty">No courses match your filters.</p>';
            return;
        }
        for (const c of items) {
            const card = cardFor(c);
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
        img.onerror = () => {
            img.src = 'https://picsum.photos/seed/placeholder/600/400';
        };
        img.alt = course.title;
        const body = document.createElement('div');
        body.className = 'card-body';
        const title = document.createElement('h3');
        title.className = 'card-title';
        title.textContent = course.title;

        const badgeRow = document.createElement('div');
        badgeRow.className = 'badge-row';
        const cat = document.createElement('span');
        cat.className = 'badge';
        cat.textContent = course.category;
        const lvl = document.createElement('span');
        lvl.className = 'badge level';
        lvl.textContent = course.level;
        badgeRow.appendChild(cat);
        badgeRow.appendChild(lvl);

        const tagsRow = document.createElement('div');
        tagsRow.className = 'tag-row';
        (course.tags || []).slice(0, 4).forEach(tag => {
            const t = document.createElement('span');
            t.className = 'tag-pill';
            t.textContent = tag;
            tagsRow.appendChild(t);
        });

        const meta = document.createElement('div');
        meta.className = 'meta';
        meta.textContent = `Language: ${course.language} • Software: ${(course.software || []).join(', ')} • Hours: ${course.hours}`;

        const info = document.createElement('div');
        info.className = 'meta';
        info.textContent = `Subtitles: ${course.subtitles ? 'Yes' : 'No'} • Materials: ${course.materials ? 'Yes' : 'No'}`;

        const actions = document.createElement('div');
        actions.className = 'actions';
        const aSource = document.createElement('a');
        aSource.href = course.sourceLink;
        aSource.className = 'button secondary';
        aSource.target = '_blank';
        aSource.textContent = 'Source';
        const aDownload = document.createElement('a');
        aDownload.href = course.downloadLink;
        aDownload.className = 'button';
        aDownload.target = '_blank';
        aDownload.textContent = 'Download';
        actions.appendChild(aSource);
        actions.appendChild(aDownload);

        body.appendChild(title);
        body.appendChild(badgeRow);
        if (tagsRow.childElementCount) body.appendChild(tagsRow);
        body.appendChild(meta);
        body.appendChild(info);
        body.appendChild(actions);

        card.appendChild(img);
        card.appendChild(body);
        return card;
    }

    function setupModal() {
        const modal = document.getElementById('course-modal');
        if (!modal) return; 

        const closeBtn = document.getElementById('modal-close');
        const modalTitle = document.getElementById('modal-title');
        const modalDesc = document.getElementById('modal-description');
        const modalMedia = document.getElementById('modal-media');
        const modalInfo = document.getElementById('modal-info');
        const modalMaterials = document.getElementById('modal-materials');
        const modalTags = document.getElementById('modal-tags');
        const modalActions = document.getElementById('modal-actions');

        function open(course) {
            modalTitle.textContent = course.title;
            modalDesc.textContent =
                course.description ||
                `${course.title} is a ${course.level} ${course.category} course using ${(course.software || []).join(', ')}. Estimated duration: ${course.hours} hours.`;
            modalInfo.textContent = `Category: ${course.category} • Level: ${course.level} • Language: ${course.language} • Hours: ${course.hours}`;
            modalMaterials.textContent = `Subtitles: ${course.subtitles ? 'Yes' : 'No'} • Materials: ${course.materials ? 'Yes' : 'No'}`;

            modalTags.innerHTML = '';
            (course.tags || []).forEach(tag => {
                const t = document.createElement('span');
                t.className = 'tag-pill';
                t.textContent = tag;
                modalTags.appendChild(t);
            });

            modalMedia.innerHTML = '';
            if (course.screenshots && course.screenshots.length > 0) {
                for (const src of course.screenshots) {
                    const img = document.createElement('img');
                    img.src = src;
                    img.alt = course.title + ' screenshot';
                    modalMedia.appendChild(img);
                }
            }

            modalActions.innerHTML = '';
            const aSource = document.createElement('a');
            aSource.href = course.sourceLink;
            aSource.className = 'button secondary';
            aSource.target = '_blank';
            aSource.textContent = 'Source';
            const aDownload = document.createElement('a');
            aDownload.href = course.downloadLink;
            aDownload.className = 'button';
            aDownload.target = '_blank';
            aDownload.textContent = 'Download';
            modalActions.appendChild(aSource);
            modalActions.appendChild(aDownload);

            modal.classList.add('open');
            modal.setAttribute('aria-hidden', 'false');
        }

        function close() {
            modal.classList.remove('open');
            modal.setAttribute('aria-hidden', 'true');
        }

        window.openCourseModal = open;
        if(closeBtn) closeBtn.addEventListener('click', close);
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