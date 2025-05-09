let currentFilter = 'all';
let currentSearchQuery = '';
let isInitialLoad = true;

const categories = [
    { id: 'top', title: 'Топ медийки' },
    { id: 'fame', title: 'Фейм' },
    { id: 'mid', title: 'Средний фейм' },
    { id: 'coder', title: 'Кодеры' },
    { id: 'bomg', title: 'БОМЖеры' },
    { id: 'product', title: 'Товары' }
];

let currentPage = 1;
const totalPages = categories.length;

function shortenDescription(username, info) {
    const prefix = `${username} – один из известных`;
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

function renderCards(filter = 'all', searchQuery = '') {
    const grid = document.getElementById('card-grid');
    const sectionTitle = document.getElementById('section-title');
    const paginationInfo = document.getElementById('pagination-info');
    const prevButton = document.getElementById('prev-page');
    const nextButton = document.getElementById('next-page');
    const announcementModal = document.getElementById('announcement-modal');

    if (!grid || !sectionTitle || !paginationInfo || !prevButton || !nextButton) {
        console.error('Required elements not found!');
        return;
    }

    if (typeof personalities === 'undefined') {
        console.error('Personalities data is not loaded!');
        grid.innerHTML = '<div class="no-results">Ошибка загрузки данных</div>';
        return;
    }

    // Показываем объявление на 6-й странице или при начальной загрузке
    if ((currentPage === 6 || (isInitialLoad && filter === 'all' && currentPage === 1)) && !sessionStorage.getItem('hasSeenAnnouncement')) {
        announcementModal.classList.add('active');
        document.body.style.overflow = 'hidden';
        sessionStorage.setItem('hasSeenAnnouncement', 'true');
    } else {
        announcementModal.classList.remove('active');
        document.body.style.overflow = '';
    }

    isInitialLoad = false;

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
    sessionStorage.removeItem('hasSeenAnnouncement');
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

    if (!modal || !modalUsername || !modalInfo || !modalPrice || !modalChannel || !modalDm || !modalShare) {
        console.error('Modal elements not found! Check HTML for IDs: modal, modal-username, modal-info, modal-price, modal-channel, modal-dm, modal-share');
        return;
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
        modalPrice.innerHTML = '<p>Цены доступны только для товаров</p>';
        console.warn(`Category for ${username} is not 'product'. Got: ${data.category}`);
    }

    modalChannel.href = data.channel || '#';
    modalDm.href = data.dm || '#';
    modalShare.href = `https://t.me/share/url?url=${encodeURIComponent(data.channel || '#')}&text=${encodeURIComponent(username)}`;

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

function openAnnouncementModal() {
    const announcementModal = document.getElementById('announcement-modal');
    announcementModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeAnnouncementModal() {
    const announcementModal = document.getElementById('announcement-modal');
    announcementModal.classList.remove('active');
    document.body.style.overflow = '';
    renderCards(currentFilter, currentSearchQuery);
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
});
