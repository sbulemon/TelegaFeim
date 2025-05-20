let currentFilter = 'all';
let currentSearchQuery = '';
let isInitialLoad = true;

const categories = [
    { id: 'top', title: 'медийки' },
    { id: 'fame', title: 'Фейм' },
    { id: 'mid', title: 'Средний фейм' },
    { id: 'small', title: 'Малый фейм' },
    { id: 'coder', title: 'Кодеры' },
    { id: 'bomg', title: 'скам/бомжи' },
    { id: 'product', title: 'Товары' },
    { id: 'admin', title: 'Админы' },
];

let currentPage = 1;
const totalPages = categories.length;

function shortenDescription(username, info) {
    const prefix = `${username} – `;
    const maxLength = 40;
    let shortInfo = info.substring(0, maxLength);
    if (info.length > maxLength) {
        shortInfo = shortInfo.substring(0, shortInfo.lastIndexOf(' ')) + '...';
    }
    return `${prefix} ${shortInfo}`;
}

function createCard(username, data) {
    const shortDesc = shortenDescription(username, data.info);
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
        <div class="card-badge ${data.badge}">${data.badgeText}</div>
        <div class="card-img-container">
            <img src="${data.img}" alt="${username}" class="card-img">
        </div>
        <div class="card-content">
            <h3 class="card-title">${username}</h3>
            <p class="card-desc">${shortDesc}</p>
        </div>
    `;
    card.addEventListener('click', () => openModal(username, data));
    return card;
}

function showSkeletonLoader(count = 6) {
    const grid = document.getElementById('card-grid');
    grid.innerHTML = '';
    for (let i = 0; i < count; i++) {
        const skeleton = document.createElement('div');
        skeleton.className = 'card skeleton-card';
        skeleton.innerHTML = `
            <div class="skeleton-img"></div>
            <div class="skeleton-title"></div>
            <div class="skeleton-desc"></div>
        `;
        grid.appendChild(skeleton);
    }
}

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

    if (typeof personalities === 'undefined') {
        console.error('Personalities data is not loaded!');
        grid.innerHTML = '<div class="no-results">Ошибка загрузки данных</div>';
        return;
    }

    if (isInitialLoad) {
        showSkeletonLoader();
        setTimeout(() => {
            isInitialLoad = false;
            renderCards(filter, searchQuery);
        }, 700);
        return;
    }

    grid.innerHTML = '';
    let currentCategory = categories[currentPage - 1].id;
    sectionTitle.textContent = searchQuery ? 'Результаты поиска' : categories[currentPage - 1].title;

    // Если выбран фильтр (не 'all'), обновляем currentPage
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

    let hasResults = false;
    Object.entries(personalities).forEach(([username, data]) => {
        const searchMatch = searchQuery ?
            (username.toLowerCase().includes(searchQuery.toLowerCase()) ||
             data.info.toLowerCase().includes(searchQuery.toLowerCase())) :
            true;
        const categoryMatch = searchQuery ? true :
            filter === 'all' ? data.category === currentCategory :
            data.category.toLowerCase() === filter.toLowerCase();

        if (categoryMatch && searchMatch) {
            const card = createCard(username, data);
            grid.appendChild(card);
            hasResults = true;
        }
    });

    if (!hasResults) {
        const noResults = document.createElement('div');
        noResults.className = 'no-results';
        noResults.textContent = 'Ничего не найдено';
        grid.appendChild(noResults);
    }

    const isMobile = window.innerWidth <= 768;
    if (isMobile) {
        const cardImg = grid.querySelectorAll('.card-img-container');
        cardImg.forEach(img => img.style.height = window.innerWidth <= 480 ? '140px' : '160px');
    }
}

function changePage(direction) {
    currentPage += direction;
    if (currentPage < 1) currentPage = 1;
    if (currentPage > totalPages) currentPage = totalPages;
    currentFilter = 'all'; // Сбрасываем фильтр при пагинации
    renderCards(currentFilter, currentSearchQuery);
}

function setTheme(theme) {
    document.body.className = theme;
    localStorage.setItem('theme', theme);
    renderCards(currentFilter, currentSearchQuery);
}

function openModal(username, data) {
    const modal = document.getElementById('modal');
    const modalUsername = document.getElementById('modal-username');
    const modalInfo = document.getElementById('modal-info');
    const modalPrice = document.getElementById('modal-price');
    const modalChannel = document.getElementById('modal-channel');
    const modalDm = document.getElementById('modal-dm');
    const modalShare = document.getElementById('modal-share');
    const modalImg = document.getElementById('modal-img');

    if (!modal || !modalUsername || !modalInfo || !modalPrice || !modalChannel || !modalDm || !modalShare) {
        console.error('Modal elements not found! Check HTML for IDs: modal, modal-username, modal-info, modal-price, modal-channel, modal-dm, modal-share');
        return;
    }

    // Устанавливаем фотографию
    if (modalImg) {
        modalImg.src = data.img || '';
        modalImg.alt = username;
        modalImg.style.display = data.img ? 'block' : 'none';
    }

    modalUsername.textContent = username;
    modalInfo.textContent = data.info || 'Нет описания';
    modalPrice.innerHTML = '';

    if (data.category === 'product') {
        if (data.prices && typeof data.prices === 'object') {
            const prices = {
                usd: data.prices.usd || 'N/A',
                uah: data.prices.uah || 'N/A',
                rub: data.prices.rub || 'N/A'
            };
            modalPrice.innerHTML = `
                <div class="modal-price-item">
                    <img src="https://img.icons8.com/color/48/000000/us-dollar--v1.png" alt="USD" onerror="console.error('Failed to load USD icon')">
                    <span>${prices.usd}</span>
                </div>
                <div class="modal-price-item">
                    <img src="https://img.icons8.com/color/48/000000/hryvnia-2--v1.png" alt="UAH" 
                         onerror="this.src='https://cdn.flaticon.com/png/128/149/premium/149074.png'; console.error('Failed to load UAH icon')">
                    <span>${prices.uah}</span>
                </div>
                <div class="modal-price-item">
                    <img src="https://img.icons8.com/color/48/000000/ruble--v1.png" alt="RUB" onerror="console.error('Failed to load RUB icon')">
                    <span>${prices.rub}</span>
                </div>
                <p>Продавец: ${data.seller || 'Не указан'}</p>
            `;
        } else {
            modalPrice.innerHTML = '<p>Цены не указаны</p>';
            console.warn(`No valid prices for ${username}. Expected data.prices to be an object with usd, uah, rub. Got:`, data.prices);
        }
    } else {
        modalPrice.innerHTML = '';
    }

    modalChannel.href = data.channel || '#';
    modalDm.href = data.dm || '#';
    const shareLink = (data.category === 'product')
        ? `${window.location.origin}/?product=${encodeURIComponent(username)}`
        : `${window.location.origin}/?profile=${encodeURIComponent(username)}`;
    modalShare.href = shareLink;
    // Автоматическое копирование ссылки при клике
    modalShare.onclick = function(e) {
        e.preventDefault();
        navigator.clipboard.writeText(shareLink).then(() => {
            showCopyNotification();
        });
    };

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    const modal = document.getElementById('modal');
    modal.classList.remove('active');
    document.body.style.overflow = '';
}

function openFAQModal() {
    const faqModal = document.getElementById('faq-modal');
    faqModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeFAQModal() {
    const faqModal = document.getElementById('faq-modal');
    faqModal.classList.remove('active');
    document.body.style.overflow = '';
}

function openForumModal() {
    const forumModal = document.getElementById('forum-modal');
    forumModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeForumModal() {
    const forumModal = document.getElementById('forum-modal');
    forumModal.classList.remove('active');
    document.body.style.overflow = '';
}

function showWelcomeModal() {
    const hasSeenWelcome = sessionStorage.getItem('hasSeenWelcome');
    if (!hasSeenWelcome) {
        const welcomeModal = document.getElementById('welcome-modal');
        welcomeModal.classList.add('active');
        document.body.style.overflow = 'hidden';
        sessionStorage.setItem('hasSeenWelcome', 'true');
    }
}

function closeWelcomeModal() {
    const welcomeModal = document.getElementById('welcome-modal');
    welcomeModal.classList.remove('active');
    document.body.style.overflow = '';
}

// Добавляю функцию для показа уведомления о копировании
function showCopyNotification() {
    let notif = document.getElementById('copy-notification');
    if (!notif) {
        notif = document.createElement('div');
        notif.id = 'copy-notification';
        notif.textContent = 'Ссылка скопирована!';
        notif.style.position = 'fixed';
        notif.style.bottom = '40px';
        notif.style.left = '50%';
        notif.style.transform = 'translateX(-50%)';
        notif.style.background = 'var(--primary)';
        notif.style.color = 'var(--secondary)';
        notif.style.padding = '12px 28px';
        notif.style.borderRadius = '12px';
        notif.style.fontWeight = '700';
        notif.style.fontSize = '1.1rem';
        notif.style.boxShadow = '0 4px 16px rgba(0,0,0,0.18)';
        notif.style.zIndex = '9999';
        notif.style.opacity = '0';
        notif.style.transition = 'opacity 0.3s';
        document.body.appendChild(notif);
    }
    notif.style.opacity = '1';
    setTimeout(() => { notif.style.opacity = '0'; }, 1500);
}

// --- Свайпы для пагинации на мобильных ---
let touchStartX = 0;
let touchEndX = 0;
function handleTouchStart(e) {
    touchStartX = e.changedTouches[0].screenX;
}
function handleTouchEnd(e) {
    touchEndX = e.changedTouches[0].screenX;
    if (touchEndX - touchStartX > 60) {
        // свайп вправо — предыдущая страница
        const prevBtn = document.getElementById('prev-page');
        if (prevBtn && !prevBtn.disabled) prevBtn.click();
    } else if (touchStartX - touchEndX > 60) {
        // свайп влево — следующая страница
        const nextBtn = document.getElementById('next-page');
        if (nextBtn && !nextBtn.disabled) nextBtn.click();
    }
}
document.addEventListener('touchstart', handleTouchStart, false);
document.addEventListener('touchend', handleTouchEnd, false);

document.addEventListener('DOMContentLoaded', () => {
    const faqBtn = document.querySelector('.faq-btn');
    if (faqBtn) {
        faqBtn.addEventListener('click', openFAQModal);
    }

    const forumBtn = document.querySelector('.forum-btn');
    if (forumBtn) {
        forumBtn.addEventListener('click', openForumModal);
    }

    showWelcomeModal();

    if (typeof personalities !== 'undefined') {
        renderCards();
    } else {
        console.error('Personalities not defined. Check personalities.js');
        document.getElementById('card-grid').innerHTML = '<div class="no-results">Ошибка загрузки данных</div>';
    }

    document.querySelectorAll('.dropdown-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const dropdownContent = btn.nextElementSibling;
            const isOpen = dropdownContent.classList.contains('active');
            document.querySelectorAll('.dropdown-content').forEach(d => {
                d.classList.remove('active');
            });
            if (!isOpen) {
                dropdownContent.classList.add('active');
            }
        });
    });

    document.addEventListener('click', () => {
        document.querySelectorAll('.dropdown-content').forEach(d => {
            d.classList.remove('active');
        });
    });

    document.querySelectorAll('.dropdown-item[data-category]').forEach(item => {
        item.addEventListener('click', (e) => {
            e.stopPropagation();
            currentFilter = item.getAttribute('data-category');
            currentSearchQuery = document.getElementById('search-input').value;
            renderCards(currentFilter, currentSearchQuery);
        });
    });

    document.querySelectorAll('.dropdown-item[data-theme]').forEach(item => {
        item.addEventListener('click', (e) => {
            e.stopPropagation();
            const theme = item.getAttribute('data-theme');
            setTheme(theme);
        });
    });

    document.getElementById('search-input').addEventListener('input', (e) => {
        currentSearchQuery = e.target.value;
        renderCards(currentFilter, currentSearchQuery);
    });

    document.querySelector('.search-btn').addEventListener('click', () => {
        currentSearchQuery = document.getElementById('search-input').value;
        renderCards(currentFilter, currentSearchQuery);
    });

    document.getElementById('prev-page').addEventListener('click', () => changePage(-1));
    document.getElementById('next-page').addEventListener('click', () => changePage(1));

    const params = new URLSearchParams(window.location.search);
    if (params.has('profile')) {
        const username = params.get('profile');
        if (typeof personalities !== 'undefined' && personalities[username]) {
            openModal(username, personalities[username]);
        }
    }
    if (params.has('product')) {
        const product = params.get('product');
        if (typeof personalities !== 'undefined' && personalities[product]) {
            openModal(product, personalities[product]);
        }
    }

    // --- Кнопка включения/отключения анимаций ---
    const toggleAnimBtn = document.getElementById('toggle-animations-btn');
    function setAnimationsState(enabled) {
        if (enabled) {
            document.body.classList.remove('no-animations');
            if (toggleAnimBtn) toggleAnimBtn.innerHTML = '<img src="https://img.icons8.com/ios-filled/24/stop-circled.png" alt="Anim" class="icon"> Отключить анимации';
            localStorage.setItem('animationsEnabled', 'true');
        } else {
            document.body.classList.add('no-animations');
            if (toggleAnimBtn) toggleAnimBtn.innerHTML = '<img src="https://img.icons8.com/ios-filled/24/ok.png" alt="Anim" class="icon"> Включить анимации';
            localStorage.setItem('animationsEnabled', 'false');
        }
    }
    if (toggleAnimBtn) {
        toggleAnimBtn.addEventListener('click', () => {
            const enabled = !document.body.classList.contains('no-animations');
            setAnimationsState(!enabled);
        });
    }
    // Восстановление состояния при загрузке
    const animState = localStorage.getItem('animationsEnabled');
    if (animState === 'false') {
        setAnimationsState(false);
    } else {
        setAnimationsState(true);
    }

    // --- Горячие клавиши ---
    document.addEventListener('keydown', function(e) {
        // Фокус на поиск по /
        if (e.key === '/' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
            const searchInput = document.getElementById('search-input');
            if (searchInput) {
                e.preventDefault();
                searchInput.focus();
            }
        }
        // Esc — закрыть модальные окна
        if (e.key === 'Escape') {
            const modals = document.querySelectorAll('.modal.active, .welcome-modal.active');
            modals.forEach(m => m.classList.remove('active'));
            document.body.style.overflow = '';
        }
        // ←/→ — листать страницы
        if ((e.key === 'ArrowLeft' || e.key === 'ArrowRight') && !document.body.classList.contains('no-animations')) {
            if (e.key === 'ArrowLeft') {
                const prevBtn = document.getElementById('prev-page');
                if (prevBtn && !prevBtn.disabled) prevBtn.click();
            }
            if (e.key === 'ArrowRight') {
                const nextBtn = document.getElementById('next-page');
                if (nextBtn && !nextBtn.disabled) nextBtn.click();
            }
        }
    });

    // Восстановление темы при загрузке
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        document.body.className = savedTheme;
    }
});
