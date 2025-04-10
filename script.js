(function() {
    // Переменные для фильтра, поиска и пагинации
    let currentFilter = 'all';
    let currentSearchQuery = '';
    const categories = [
        { id: 'top', title: 'Топ медийки' },
        { id: 'fame', title: 'Фейм' },
        { id: 'mid', title: 'Средний фейм' },
        { id: 'coder', title: 'Кодеры' },
        { id: 'bomg', title: 'БОМЖеры' }
    ];
    let currentPage = 1;
    const totalPages = categories.length;

    // Функция создания карточки с эмодзи
    function createCard(username, data) {
        const card = document.createElement('div');
        card.classList.add('card');
        
        let emoji;
        switch (data.category) {
            case 'top': emoji = '👑'; break;
            case 'fame': emoji = '🎖️'; break;
            case 'mid': emoji = '🌟'; break;
            case 'coder': emoji = '💻'; break;
            case 'bomg': emoji = '💩'; break;
            default: emoji = '❓';
        }

        card.innerHTML = `
            <div class="card-badge ${data.badge}">${data.badgeText}</div>
            <div class="card-img-container">
                <img src="${data.img}" alt="${username}" class="card-img">
            </div>
            <div class="card-content">
                <h3 class="card-title">${username} <span class="card-emoji">${emoji}</span></h3>
                <p class="card-desc">${data.info.substring(0, 100)}...</p>
            </div>
        `;
        card.addEventListener('click', () => openModal(username, data));
        return card;
    }

    // Функция рендеринга карточек (с пагинацией)
    function renderCards(filter = 'all', searchQuery = '') {
        const grid = document.getElementById('card-grid');
        const sectionTitle = document.getElementById('section-title');
        const paginationInfo = document.getElementById('pagination-info');
        const prevButton = document.getElementById('prev-page');
        const nextButton = document.getElementById('next-page');

        if (!grid || !sectionTitle || !paginationInfo || !prevButton || !nextButton) {
            console.error('Required elements not found!');
            return;
        }

        console.log('Rendering cards with filter:', filter, 'and search:', searchQuery);
        console.log('Personalities available:', personalities);

        grid.innerHTML = '';

        let currentCategory = categories[currentPage - 1].id;
        sectionTitle.textContent = categories[currentPage - 1].title;

        if (filter !== 'all') {
            currentCategory = filter;
            const categoryIndex = categories.findIndex(cat => cat.id === filter);
            if (categoryIndex !== -1) {
                currentPage = categoryIndex + 1;
            }
        }

        paginationInfo.textContent = `Страница ${currentPage} из ${totalPages}`;
        prevButton.disabled = currentPage === 1;
        nextButton.disabled = currentPage === totalPages;

        if (!personalities) {
            console.error('Personalities object is not defined!');
            grid.innerHTML = '<p>Ошибка: данные личностей не загружены.</p>';
            return;
        }

        Object.entries(personalities).forEach(([username, data]) => {
            const categoryMatch = filter === 'all' ? data.category === currentCategory : data.category.toLowerCase() === filter.toLowerCase();
            const searchMatch = username.toLowerCase().includes(searchQuery.toLowerCase()) || 
                               data.info.toLowerCase().includes(searchQuery.toLowerCase());

            if (categoryMatch && searchMatch) {
                console.log('Adding card for:', username);
                const card = createCard(username, data);
                grid.appendChild(card);
            }
        });

        // Адаптация высоты изображения на мобильных
        const isMobile = window.innerWidth <= 768;
        if (isMobile) {
            const cardImg = grid.querySelectorAll('.card-img-container');
            cardImg.forEach(img => img.style.height = window.innerWidth <= 480 ? '150px' : '180px');
        }
    }

    // Функция смены страницы
    function changePage(direction) {
        currentPage += direction;
        if (currentPage < 1) currentPage = 1;
        if (currentPage > totalPages) currentPage = totalPages;
        console.log('Page changed to:', currentPage);
        renderCards('all', currentSearchQuery);
    }

    // Функция открытия модального окна
    function openModal(username, data) {
        const modal = document.getElementById('modal');
        document.getElementById('modal-username').textContent = username;
        document.getElementById('modal-info').textContent = data.info;
        document.getElementById('modal-channel').href = data.channel;
        document.getElementById('modal-dm').href = data.dm;
        const profileUrl = `https://telega-feim.vercel.app/?username=${encodeURIComponent(username)}`;
        document.getElementById('modal-share').href = `https://t.me/share/url?url=${encodeURIComponent(profileUrl)}&text=${encodeURIComponent(`проверь есть ли ты! ${username}'s профиль c сайта, фейм листа @fametgkm`)}`;
        modal.classList.add('active');
    }

    // Функция закрытия модального окна
    function closeModal() {
        const modal = document.getElementById('modal');
        if (modal) {
            modal.classList.remove('active');
        }
    }

    // Функция открытия FAQ
    function openFAQModal() {
        const faqModal = document.getElementById('faq-modal');
        if (!faqModal) {
            console.error('FAQ modal not found!');
            return;
        }
        faqModal.classList.add('active');
    }

    // Функция закрытия FAQ
    function closeFAQModal() {
        const faqModal = document.getElementById('faq-modal');
        if (faqModal) {
            faqModal.classList.remove('active');
        }
    }

    // Функция смены темы
    function setTheme(theme) {
        document.body.className = theme;
        localStorage.setItem('theme', theme);
        renderCards(currentFilter, currentSearchQuery);
    }

    // Обновление статистики
    function updateStats() {
        const counts = {
            top: Object.values(personalities).filter(p => p.category === 'top').length,
            fame: Object.values(personalities).filter(p => p.category === 'fame').length,
            mid: Object.values(personalities).filter(p => p.category === 'mid').length,
            coder: Object.values(personalities).filter(p => p.category === 'coder').length,
            bomg: Object.values(personalities).filter(p => p.category === 'bomg').length
        };
        document.getElementById('top-count').textContent = `Топ: ${counts.top}`;
        document.getElementById('fame-count').textContent = `Фейм: ${counts.fame}`;
        document.getElementById('mid-count').textContent = `Средний: ${counts.mid}`;
        document.getElementById('coder-count').textContent = `Кодеры: ${counts.coder}`;
        document.getElementById('bomg-count').textContent = `БОМЖеры: ${counts.bomg}`;
    }

    // Прокрутка наверх
    function scrollToTop() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // Обработчики событий
    document.addEventListener('DOMContentLoaded', () => {
        console.log('DOM loaded, initializing...');

        // Проверка кнопок пагинации
        const prevButton = document.getElementById('prev-page');
        const nextButton = document.getElementById('next-page');
        if (!prevButton || !nextButton) {
            console.error('Pagination buttons not found!');
            return;
        }

        // Инициализация
        renderCards();
        updateStats();

        // Поиск
        document.querySelector('.search-btn').addEventListener('click', () => {
            currentSearchQuery = document.getElementById('search-input').value;
            console.log('Search button clicked, query:', currentSearchQuery);
            renderCards(currentFilter, currentSearchQuery);
        });

        document.getElementById('search-input').addEventListener('input', (e) => {
            currentSearchQuery = e.target.value;
            console.log('Search input changed, query:', currentSearchQuery);
            renderCards(currentFilter, currentSearchQuery);
        });

        // Фильтры
        document.querySelectorAll('.dropdown-item[data-category]').forEach(item => {
            item.addEventListener('click', (e) => {
                e.stopPropagation();
                currentFilter = item.getAttribute('data-category');
                currentSearchQuery = document.getElementById('search-input').value;
                console.log('Filter selected:', currentFilter);
                renderCards(currentFilter, currentSearchQuery);
            });
        });

        // Темы
        document.querySelectorAll('.dropdown-item[data-theme]').forEach(item => {
            item.addEventListener('click', (e) => {
                e.stopPropagation();
                const theme = item.getAttribute('data-theme');
                console.log('Theme selected:', theme);
                setTheme(theme);
            });
        });

        // Пагинация
        prevButton.addEventListener('click', () => {
            console.log('Prev page clicked');
            changePage(-1);
        });
        nextButton.addEventListener('click', () => {
            console.log('Next page clicked');
            changePage(1);
        });

        // FAQ
        document.querySelector('.faq-btn').addEventListener('click', () => {
            console.log('FAQ button clicked');
            openFAQModal();
        });

        // Закрытие модальных окон крестиком
        document.querySelector('#modal .modal-close').addEventListener('click', () => {
            console.log('Closing profile modal');
            closeModal();
        });
        document.querySelector('#faq-modal .modal-close').addEventListener('click', () => {
            console.log('Closing FAQ modal');
            closeFAQModal();
        });

        // Закрытие выпадающих меню и модальных окон при клике вне
        document.addEventListener('click', (e) => {
            document.querySelectorAll('.dropdown-content').forEach(d => {
                d.classList.remove('active');
            });
            const modal = document.getElementById('modal');
            const faqModal = document.getElementById('faq-modal');
            if (modal && e.target === modal && modal.classList.contains('active')) {
                closeModal();
            }
            if (faqModal && e.target === faqModal && faqModal.classList.contains('active')) {
                closeFAQModal();
            }
        });

        // Открытие/закрытие выпадающих меню
        document.querySelectorAll('.dropdown-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const dropdownContent = btn.nextElementSibling;
                dropdownContent.classList.toggle('active');
                console.log('Dropdown toggled');
            });
        });

        // Закрытие модальных окон при нажатии Esc
        document.addEventListener('keydown', (e) => {
            const modal = document.getElementById('modal');
            const faqModal = document.getElementById('faq-modal');
            if (e.key === 'Escape') {
                if (modal && modal.classList.contains('active')) {
                    closeModal();
                }
                if (faqModal && faqModal.classList.contains('active')) {
                    closeFAQModal();
                }
            }
        });

        // Прокрутка наверх
        const scrollBtn = document.querySelector('.scroll-top-btn');
        if (scrollBtn) {
            scrollBtn.addEventListener('click', scrollToTop);
        }
        window.addEventListener('scroll', () => {
            if (scrollBtn) {
                if (window.scrollY > 300) {
                    scrollBtn.classList.add('visible');
                } else {
                    scrollBtn.classList.remove('visible');
                }
            }
        });

        // Обработка изменения размера окна
        window.addEventListener('resize', () => {
            renderCards(currentFilter, currentSearchQuery);
        });
    });
})();