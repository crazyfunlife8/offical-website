// ============================================================
//  script.js — 所有 UI 從 games.js 的數據動態渲染
//  gameData, featuredGames, storeGames, upcomingGames 由 games.js 提供
// ============================================================

// ===== SVG Icons (reusable) =====
const SVG = {
    cart:  '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>',
    heart: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>',
    trash: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>',
    x:     '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',
};

// ===== Utility =====
function formatPrice(num) { return 'NT$ ' + num.toLocaleString(); }
function getDateStr() {
    const d = new Date();
    return `${d.getFullYear()}.${String(d.getMonth()+1).padStart(2,'0')}.${String(d.getDate()).padStart(2,'0')}`;
}
function escAttr(s) { return s.replace(/"/g, '&quot;').replace(/'/g, '&#39;'); }

// ===== Categories definition =====
const categories = [
    { key: 'all',        icon: '&#9881;', label: '全部' },
    { key: 'action',     icon: '&#9876;', label: '動作' },
    { key: 'rpg',        icon: '&#9812;', label: '角色扮演' },
    { key: 'strategy',   icon: '&#9823;', label: '策略' },
    { key: 'adventure',  icon: '&#9978;', label: '冒險' },
    { key: 'simulation', icon: '&#9992;', label: '模擬' },
    { key: 'sports',     icon: '&#9917;', label: '運動' },
    { key: 'indie',      icon: '&#9830;', label: '獨立遊戲' },
];

// ============================================================
//  RENDER: Carousel
// ============================================================
function renderCarousel() {
    const slidesEl = document.getElementById('carouselSlides');
    const dotsEl   = document.getElementById('carouselDots');

    slidesEl.innerHTML = featuredGames.map((f, i) => {
        const g = gameData[f.name];
        if (!g) return '';
        const stars = '&#9733;'.repeat(f.rating.stars) + '&#9734;'.repeat(5 - f.rating.stars);
        const isFree = g.currentPrice === 0;

        let priceHTML;
        if (isFree) {
            priceHTML = '<span class="free-badge">免費遊玩</span>';
        } else if (g.discount > 0) {
            priceHTML = `<span class="original-price">${formatPrice(g.originalPrice)}</span>
                         <span class="discount">-${g.discount}%</span>
                         <span class="current-price">${formatPrice(g.currentPrice)}</span>`;
        } else {
            priceHTML = `<span class="current-price">${formatPrice(g.currentPrice)}</span>`;
        }

        const slideBgStyle = f.heroImage
            ? `background: ${f.slideBg};`
            : `background: ${f.slideBg};`;
        const heroImgHTML = f.heroImage
            ? `<div class="slide-hero-img" style="background-image:url('${f.heroImage}');"></div>` : '';

        return `
        <div class="carousel-slide${i === 0 ? ' active' : ''}">
            <div class="slide-bg" style="${slideBgStyle}">${heroImgHTML}<div class="slide-particles"></div></div>
            <div class="slide-content">
                <div class="slide-info">
                    <div class="game-tags">
                        <span class="tag ${f.badgeType}">${f.badgeText}</span>
                        ${g.tags.slice(0, 2).map(t => `<span class="tag">${t}</span>`).join('')}
                    </div>
                    <h1 class="slide-title">${f.name}</h1>
                    <p class="slide-desc">${g.desc}</p>
                    <div class="slide-meta">
                        <div class="rating">
                            <span class="stars">${stars}</span>
                            <span class="rating-text">${f.rating.text}</span>
                        </div>
                        <div class="price-tag">${priceHTML}</div>
                    </div>
                    <div class="slide-actions">
                        <button class="btn-primary slide-cart-btn" data-game="${escAttr(f.name)}">${isFree ? '立即遊玩' : '立即購買'}</button>
                        <button class="btn-secondary slide-wish-btn" data-game="${escAttr(f.name)}">加入願望清單</button>
                    </div>
                </div>
            </div>
        </div>`;
    }).join('');

    dotsEl.innerHTML = featuredGames.map((_, i) =>
        `<span class="dot${i === 0 ? ' active' : ''}"></span>`
    ).join('');
}

// ============================================================
//  RENDER: Category Bar
// ============================================================
function renderCategories() {
    document.getElementById('categoriesBar').innerHTML = categories.map(c =>
        `<button class="cat-btn${c.key === 'all' ? ' active' : ''}" data-category="${c.key}">
            <span class="cat-icon">${c.icon}</span>${c.label}
        </button>`
    ).join('');
}

// ============================================================
//  RENDER: Store Game Cards
// ============================================================
function renderGameGrid() {
    const grid = document.getElementById('gameGrid');
    grid.innerHTML = storeGames.map((name, i) => {
        const g = gameData[name];
        if (!g) return '';
        const platformIcons = (g.platforms || []).map(p =>
            `<span class="platform-icon" title="${p.name}">${p.icon}</span>`
        ).join('');
        const badgeHTML = g.badge
            ? `<span class="card-badge ${g.badge.type}">${g.badge.text}</span>` : '';
        const oldPriceHTML = g.discount > 0
            ? `<span class="old-price">${formatPrice(g.originalPrice)}</span>` : '';
        const priceHTML = g.currentPrice === 0
            ? '<span class="new-price" style="color:var(--accent-3)">免費遊玩</span>'
            : `${oldPriceHTML}<span class="new-price">${formatPrice(g.currentPrice)}</span>`;

        const coverImg = g.images && g.images[0];
        const artStyle = coverImg
            ? `background-image: url('${coverImg}');`
            : `background: ${g.bg};`;

        return `
        <div class="game-card" data-category="${g.category}" data-game="${escAttr(name)}" style="animation-delay:${i * 0.05}s">
            <div class="card-image">
                <div class="card-art" style="${artStyle}"></div>
                <div class="card-overlay">
                    <button class="card-cart-btn" data-game="${escAttr(name)}" title="加入購物車">
                        ${SVG.cart}<span>加入購物車</span>
                    </button>
                    <button class="card-wish-btn" data-game="${escAttr(name)}" title="加入願望清單">
                        ${SVG.heart}
                    </button>
                    <div class="overlay-icons">${platformIcons}</div>
                </div>
                ${badgeHTML}
            </div>
            <div class="card-info">
                <h3 class="card-title">${name}</h3>
                <div class="card-tags">${g.tags.slice(0,2).map(t => `<span>${t}</span>`).join('')}</div>
                <div class="card-price">${priceHTML}</div>
            </div>
        </div>`;
    }).join('');
}

// ============================================================
//  RENDER: Upcoming Games
// ============================================================
function renderUpcomingGrid() {
    document.getElementById('upcomingGrid').innerHTML = upcomingGames.map(name => {
        const g = gameData[name];
        if (!g) return '';
        return `
        <div class="upcoming-card" data-game="${escAttr(name)}">
            <div class="upcoming-art" style="${g.images ? `background-image:url('${g.images}');background-size:cover;background-position:center;` : `background:${g.bg};`}">
                <div class="upcoming-overlay">
                    <span class="release-date">${g.date}</span>
                </div>
            </div>
            <div class="upcoming-info">
                <h3>${name}</h3>
                <p>${g.desc}</p>
                <button class="btn-wishlist" data-game="${escAttr(name)}">&#9825; 加入願望清單</button>
            </div>
        </div>`;
    }).join('');
}

// ============================================================
//  INIT: Render everything from data
// ============================================================
renderCarousel();
renderCategories();
renderGameGrid();
renderUpcomingGrid();

// ============================================================
//  Toast Notifications
// ============================================================
function showToast(title, msg, type = 'success') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = 'toast';
    const iconChar = type === 'success' ? '&#10003;' : type === 'heart' ? '&#9829;' : '&#8505;';
    toast.innerHTML = `
        <div class="toast-icon ${type}">${iconChar}</div>
        <div class="toast-body"><div class="toast-title">${title}</div><div class="toast-msg">${msg}</div></div>
        <button class="toast-close">&times;</button>`;
    container.appendChild(toast);
    toast.querySelector('.toast-close').addEventListener('click', () => dismissToast(toast));
    setTimeout(() => dismissToast(toast), 3000);
}
function dismissToast(toast) {
    if (toast.classList.contains('toast-out')) return;
    toast.classList.add('toast-out');
    setTimeout(() => toast.remove(), 300);
}

// ============================================================
//  Cart State
// ============================================================
let cart = JSON.parse(localStorage.getItem('nexus_cart') || '[]');
function saveCart() { localStorage.setItem('nexus_cart', JSON.stringify(cart)); }

function addToCart(gameName) {
    if (cart.find(item => item.name === gameName)) {
        showToast('已在購物車中', `「${gameName}」已經在你的購物車裡了`, 'info'); return;
    }
    const data = gameData[gameName];
    if (!data || data.currentPrice === 0 || data.currentPrice === null) {
        if (data?.currentPrice === 0) showToast('免費遊戲', `「${gameName}」是免費遊戲，無需加入購物車`, 'info');
        if (data?.unreleased) showToast('尚未發售', `「${gameName}」尚未發售，敬請期待`, 'info');
        return;
    }
    cart.push({ name: gameName });
    saveCart(); updateCartBadge(); renderCartPage(); renderWishlistPage();
    showToast('已加入購物車', `「${gameName}」已成功加入購物車`, 'success');
}
function removeFromCart(gameName) {
    cart = cart.filter(i => i.name !== gameName);
    saveCart(); updateCartBadge(); renderCartPage(); renderWishlistPage();
}
function clearCart() { cart = []; saveCart(); updateCartBadge(); renderCartPage(); renderWishlistPage(); }
function isInCart(name) { return cart.some(i => i.name === name); }

const cartBadge = document.getElementById('cartBadge');
function updateCartBadge() {
    if (cart.length > 0) { cartBadge.textContent = cart.length; cartBadge.style.display = 'flex'; }
    else { cartBadge.style.display = 'none'; }
}
updateCartBadge();

// ============================================================
//  Wishlist State
// ============================================================
let wishlist = JSON.parse(localStorage.getItem('nexus_wishlist') || '[]');
function saveWishlist() { localStorage.setItem('nexus_wishlist', JSON.stringify(wishlist)); }

function addToWishlist(gameName) {
    if (wishlist.find(i => i.name === gameName)) {
        showToast('已在願望清單中', `「${gameName}」已經在你的願望清單裡了`, 'info'); return false;
    }
    if (!gameData[gameName]) return false;
    wishlist.push({ name: gameName, addedAt: getDateStr() });
    saveWishlist(); updateWishlistBadge(); renderWishlistPage(); syncWishlistButtons(gameName, true);
    showToast('已加入願望清單', `「${gameName}」已加入願望清單`, 'heart');
    return true;
}
function removeFromWishlist(gameName) {
    wishlist = wishlist.filter(i => i.name !== gameName);
    saveWishlist(); updateWishlistBadge(); renderWishlistPage(); syncWishlistButtons(gameName, false);
    showToast('已從願望清單移除', `「${gameName}」已移除`, 'info');
}
function toggleWishlist(gameName) { isInWishlist(gameName) ? removeFromWishlist(gameName) : addToWishlist(gameName); }
function isInWishlist(name) { return wishlist.some(i => i.name === name); }

function syncWishlistButtons(gameName, active) {
    document.querySelectorAll(`.card-wish-btn[data-game="${gameName}"]`).forEach(btn => {
        btn.classList.toggle('active', active);
        btn.title = active ? '從願望清單移除' : '加入願望清單';
    });
    document.querySelectorAll(`.btn-wishlist[data-game="${gameName}"]`).forEach(btn => {
        if (active) {
            btn.classList.add('added');
            btn.innerHTML = '&#9829; 已加入願望清單';
            btn.style.background = 'rgba(239, 68, 68, 0.15)';
            btn.style.borderColor = 'rgba(239, 68, 68, 0.4)';
            btn.style.color = '#ef4444';
        } else {
            btn.classList.remove('added');
            btn.innerHTML = '&#9825; 加入願望清單';
            btn.style.background = ''; btn.style.borderColor = ''; btn.style.color = '';
        }
    });
}

const wishlistBadge = document.getElementById('wishlistBadge');
function updateWishlistBadge() {
    if (wishlist.length > 0) { wishlistBadge.textContent = wishlist.length; wishlistBadge.style.display = 'flex'; }
    else { wishlistBadge.style.display = 'none'; }
}
updateWishlistBadge();
wishlist.forEach(item => syncWishlistButtons(item.name, true));

// ============================================================
//  Cart Page
// ============================================================
const cartPage = document.getElementById('cartPage');
function openCartPage()  { closeWishlistPage(); renderCartPage(); cartPage.classList.add('active'); document.body.style.overflow = 'hidden'; }
function closeCartPage() { cartPage.classList.remove('active'); document.body.style.overflow = ''; }

document.getElementById('cartToggleBtn').addEventListener('click', e => { e.stopPropagation(); cartPage.classList.contains('active') ? closeCartPage() : openCartPage(); });
document.getElementById('cartBackBtn').addEventListener('click', closeCartPage);
document.getElementById('cartEmptyShopBtn').addEventListener('click', closeCartPage);

function renderCartPage() {
    const listEl = document.getElementById('cartItemsList');
    const emptyEl = document.getElementById('cartEmpty');
    const summaryEl = document.getElementById('cartSummary');
    document.getElementById('cartCountLabel').textContent = `(${cart.length})`;
    if (cart.length === 0) { listEl.innerHTML = ''; emptyEl.classList.add('visible'); summaryEl.style.display = 'none'; return; }
    emptyEl.classList.remove('visible'); summaryEl.style.display = '';
    let totalOrig = 0, totalCur = 0;
    listEl.innerHTML = cart.map((item, idx) => {
        const d = gameData[item.name]; if (!d) return '';
        totalOrig += d.originalPrice; totalCur += d.currentPrice;
        const saved = d.originalPrice - d.currentPrice;
        return `<div class="cart-item" style="animation-delay:${idx*0.05}s">
            <div class="cart-item-art" style="${d.images?.[0] ? `background-image:url('${d.images[0]}');background-size:cover;background-position:center;` : `background:${d.bg};`}"></div>
            <div class="cart-item-info">
                <div class="cart-item-title">${item.name}</div>
                <div class="cart-item-tags">${d.tags.slice(0,3).map(t=>`<span>${t}</span>`).join('')}</div>
                <div class="cart-item-platform">${d.platform}</div>
            </div>
            <div class="cart-item-price">
                ${saved>0?`<div class="cart-item-discount">-${d.discount}%</div>`:''}
                ${saved>0?`<div class="cart-item-original">${formatPrice(d.originalPrice)}</div>`:''}
                <div class="cart-item-current">${formatPrice(d.currentPrice)}</div>
            </div>
            <button class="cart-item-remove" data-game="${escAttr(item.name)}" title="移除">${SVG.trash}</button>
        </div>`;
    }).join('');
    listEl.querySelectorAll('.cart-item-remove').forEach(btn => btn.addEventListener('click', () => {
        removeFromCart(btn.dataset.game); showToast('已移除', `「${btn.dataset.game}」已從購物車移除`, 'info');
    }));
    const disc = totalOrig - totalCur;
    document.getElementById('summarySubtotal').textContent = formatPrice(totalOrig);
    const dr = document.getElementById('summaryDiscountRow');
    if (disc > 0) { dr.style.display = 'flex'; document.getElementById('summaryDiscount').textContent = `-${formatPrice(disc)}`; } else { dr.style.display = 'none'; }
    document.getElementById('summaryTotal').textContent = formatPrice(totalCur);
}

document.getElementById('checkoutBtn').addEventListener('click', () => {
    if (!cart.length) return;
    const total = cart.reduce((s, i) => s + (gameData[i.name]?.currentPrice || 0), 0);
    showToast('結帳成功！', `已購買 ${cart.length} 款遊戲，共 ${formatPrice(total)}`, 'success');
    clearCart(); setTimeout(closeCartPage, 1500);
});

// ============================================================
//  Wishlist Page
// ============================================================
const wishlistPage = document.getElementById('wishlistPage');
function openWishlistPage()  { closeCartPage(); renderWishlistPage(); wishlistPage.classList.add('active'); document.body.style.overflow = 'hidden'; }
function closeWishlistPage() { wishlistPage.classList.remove('active'); document.body.style.overflow = ''; }

document.getElementById('wishlistToggleBtn').addEventListener('click', e => { e.stopPropagation(); wishlistPage.classList.contains('active') ? closeWishlistPage() : openWishlistPage(); });
document.getElementById('wishlistBackBtn').addEventListener('click', closeWishlistPage);
document.getElementById('wishlistEmptyShopBtn').addEventListener('click', closeWishlistPage);
document.getElementById('wishlistSort').addEventListener('change', () => renderWishlistPage());

function getSortedWishlist() {
    const sortBy = document.getElementById('wishlistSort').value;
    const sorted = [...wishlist];
    switch (sortBy) {
        case 'name':       sorted.sort((a,b) => a.name.localeCompare(b.name,'zh-TW')); break;
        case 'price-low':  sorted.sort((a,b) => (gameData[a.name]?.currentPrice??Infinity) - (gameData[b.name]?.currentPrice??Infinity)); break;
        case 'price-high': sorted.sort((a,b) => (gameData[b.name]?.currentPrice??-1) - (gameData[a.name]?.currentPrice??-1)); break;
        case 'discount':   sorted.sort((a,b) => (gameData[b.name]?.discount??0) - (gameData[a.name]?.discount??0)); break;
        default: sorted.reverse(); break;
    }
    return sorted;
}

function renderWishlistPage() {
    const listEl = document.getElementById('wishlistItemsList');
    const emptyEl = document.getElementById('wishlistEmpty');
    const toolbar = document.querySelector('.wishlist-toolbar');
    document.getElementById('wishlistCountLabel').textContent = `(${wishlist.length})`;
    if (!wishlist.length) { listEl.innerHTML = ''; emptyEl.classList.add('visible'); if(toolbar) toolbar.style.display='none'; return; }
    emptyEl.classList.remove('visible'); if(toolbar) toolbar.style.display='';
    const sorted = getSortedWishlist();
    const onSale = sorted.filter(i => (gameData[i.name]?.discount??0)>0).length;
    document.getElementById('wishlistStats').textContent = onSale > 0 ? `${onSale} 款正在特賣中` : '';

    listEl.innerHTML = sorted.map((item, idx) => {
        const d = gameData[item.name]; if (!d) return '';
        const isUn = d.unreleased, isFree = d.currentPrice===0, hasDis = d.discount>0&&!isUn, inC = isInCart(item.name);
        let priceHTML = isUn ? `<div class="wishlist-item-unreleased">預計 ${d.date} 發售</div>`
            : isFree ? '<div class="wishlist-item-free">免費遊玩</div>'
            : `${hasDis?`<div class="wishlist-item-discount">-${d.discount}%</div>`:''}${hasDis?`<div class="wishlist-item-original">${formatPrice(d.originalPrice)}</div>`:''}
               <div class="wishlist-item-current">${formatPrice(d.currentPrice)}</div>`;
        let cartBtn = isUn ? '<button class="wishlist-add-cart-btn in-cart" disabled>尚未發售</button>'
            : isFree ? `<button class="wishlist-add-cart-btn" data-game="${escAttr(item.name)}" data-action="play">立即遊玩</button>`
            : inC ? '<button class="wishlist-add-cart-btn in-cart" disabled>已在購物車</button>'
            : `<button class="wishlist-add-cart-btn" data-game="${escAttr(item.name)}" data-action="cart">加入購物車</button>`;
        return `<div class="wishlist-item" style="animation-delay:${idx*0.04}s">
            <div class="wishlist-item-date">加入於 ${item.addedAt||'---'}</div>
            <div class="wishlist-item-art" style="${d.images?.[0] ? `background-image:url('${d.images[0]}');background-size:cover;background-position:center;` : `background:${d.bg};`}"></div>
            <div class="wishlist-item-info">
                <div class="wishlist-item-title">${item.name}</div>
                <div class="wishlist-item-tags">${d.tags.slice(0,3).map(t=>`<span>${t}</span>`).join('')}</div>
                <div class="wishlist-item-meta"><span>${d.platform}</span><span class="meta-sep"></span><span>${d.dev}</span></div>
            </div>
            <div class="wishlist-item-price">${priceHTML}</div>
            <div class="wishlist-item-actions">
                ${cartBtn}
                <button class="wishlist-remove-btn" data-game="${escAttr(item.name)}">${SVG.x} 移除</button>
            </div>
        </div>`;
    }).join('');
    listEl.querySelectorAll('.wishlist-add-cart-btn[data-action="cart"]').forEach(b => b.addEventListener('click', () => addToCart(b.dataset.game)));
    listEl.querySelectorAll('.wishlist-remove-btn').forEach(b => b.addEventListener('click', () => removeFromWishlist(b.dataset.game)));
}

// ============================================================
//  Carousel Logic
// ============================================================
let currentSlide = 0, autoPlayTimer;
function getSlides() { return document.querySelectorAll('.carousel-slide'); }
function getDots()   { return document.querySelectorAll('.dot'); }

function goToSlide(index) {
    const slides = getSlides(), dots = getDots();
    slides[currentSlide].classList.remove('active');
    dots[currentSlide].classList.remove('active');
    currentSlide = (index + slides.length) % slides.length;
    slides[currentSlide].classList.add('active');
    dots[currentSlide].classList.add('active');
    resetAutoPlay();
}
function resetAutoPlay() { clearInterval(autoPlayTimer); autoPlayTimer = setInterval(() => goToSlide(currentSlide + 1), 6000); }

document.getElementById('prevBtn').addEventListener('click', () => goToSlide(currentSlide - 1));
document.getElementById('nextBtn').addEventListener('click', () => goToSlide(currentSlide + 1));
document.getElementById('carouselDots').addEventListener('click', e => {
    const dot = e.target.closest('.dot');
    if (dot) goToSlide([...getDots()].indexOf(dot));
});
resetAutoPlay();

// Carousel button events (delegated)
document.getElementById('carouselSlides').addEventListener('click', e => {
    const cartBtn = e.target.closest('.slide-cart-btn');
    const wishBtn = e.target.closest('.slide-wish-btn');
    if (cartBtn) { e.stopPropagation(); addToCart(cartBtn.dataset.game); }
    if (wishBtn) { e.stopPropagation(); toggleWishlist(wishBtn.dataset.game); }
});

// ============================================================
//  Category Filter (delegated)
// ============================================================
document.getElementById('categoriesBar').addEventListener('click', e => {
    const btn = e.target.closest('.cat-btn');
    if (!btn) return;
    document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const cat = btn.dataset.category;
    document.querySelectorAll('.game-card').forEach(card => {
        if (cat === 'all' || card.dataset.category === cat) {
            card.style.display = ''; card.style.animation = 'fadeInUp 0.4s ease backwards';
        } else { card.style.display = 'none'; }
    });
});

// ============================================================
//  Game Card Events (delegated on grid)
// ============================================================
document.getElementById('gameGrid').addEventListener('click', e => {
    const cartBtn = e.target.closest('.card-cart-btn');
    const wishBtn = e.target.closest('.card-wish-btn');
    if (cartBtn) { e.stopPropagation(); addToCart(cartBtn.dataset.game); return; }
    if (wishBtn) { e.stopPropagation(); toggleWishlist(wishBtn.dataset.game); return; }
    const card = e.target.closest('.game-card');
    if (card) openModal(card.dataset.game);
});

// Upcoming card wishlist buttons (delegated)
document.getElementById('upcomingGrid').addEventListener('click', e => {
    const wishBtn = e.target.closest('.btn-wishlist');
    if (wishBtn) { e.stopPropagation(); toggleWishlist(wishBtn.dataset.game); }
});

// ============================================================
//  Modal
// ============================================================
const modal = document.getElementById('gameModal');
let currentModalGame = null;

function openModal(name) {
    const data = gameData[name];
    if (!data) return;
    currentModalGame = name;
    // Hero image carousel
    const heroEl = document.getElementById('modalHero');
    const heroImg = document.getElementById('modalHeroImg');
    const hasImages = data.images && data.images.length > 0;
    modalHeroImages = hasImages ? data.images : [];
    modalHeroIndex = 0;

    if (hasImages) {
        heroEl.classList.remove('no-images');
        heroImg.style.backgroundImage = `url('${data.images[0]}')`;
        heroImg.style.background = '';
        heroImg.style.backgroundImage = `url('${data.images[0]}')`;
        heroImg.style.backgroundSize = 'cover';
        heroImg.style.backgroundPosition = 'center';
        document.getElementById('modalHeroCounter').textContent = `1 / ${data.images.length}`;
    } else {
        heroEl.classList.add('no-images');
        heroImg.style.backgroundImage = '';
        heroImg.style.background = data.bg;
    }

    document.getElementById('modalTitle').textContent = name;
    document.getElementById('modalDesc').textContent = data.desc;
    document.getElementById('modalDev').textContent = data.dev;
    document.getElementById('modalPub').textContent = data.pub;
    document.getElementById('modalDate').textContent = data.date;
    document.getElementById('modalPlatform').textContent = data.platform;
    document.getElementById('modalTags').innerHTML = data.tags.map(t => `<span class="tag">${t}</span>`).join('');

    const priceEl = document.getElementById('modalPrice');
    if (data.currentPrice === 0) { priceEl.innerHTML = '<span class="free-badge">免費遊玩</span>'; }
    else if (data.discount > 0) {
        priceEl.innerHTML = `<div class="card-price"><span class="old-price">${formatPrice(data.originalPrice)}</span><span class="new-price">${formatPrice(data.currentPrice)}</span></div>`;
    } else if (data.currentPrice) {
        priceEl.innerHTML = `<div class="card-price"><span class="new-price">${formatPrice(data.currentPrice)}</span></div>`;
    } else { priceEl.innerHTML = '<span class="wishlist-item-unreleased">尚未發售</span>'; }

    const mcb = document.getElementById('modalCartBtn');
    if (data.currentPrice === 0) mcb.textContent = '立即遊玩';
    else if (data.unreleased) mcb.textContent = '尚未發售';
    else if (isInCart(name)) mcb.textContent = '已在購物車中';
    else mcb.textContent = '加入購物車';

    const mwb = document.getElementById('modalWishBtn');
    if (isInWishlist(name)) { mwb.innerHTML = '&#9829; 已在願望清單'; mwb.classList.add('wish-active'); }
    else { mwb.innerHTML = '&#9825; 加入願望清單'; mwb.classList.remove('wish-active'); }

    // Screenshot grid
    const ssGrid = document.getElementById('screenshotGrid');
    if (hasImages) {
        ssGrid.innerHTML = data.images.map((src, i) =>
            `<div class="ss-thumb${i === 0 ? ' active' : ''}" data-index="${i}" style="background-image:url('${src}');"></div>`
        ).join('');
        ssGrid.querySelectorAll('.ss-thumb').forEach(thumb => {
            thumb.addEventListener('click', () => {
                modalGoToImage(parseInt(thumb.dataset.index));
            });
        });
    } else {
        ssGrid.innerHTML = Array(6).fill(0).map((_,i) =>
            `<div class="ss-thumb" style="background:${data.bg};opacity:${0.5+i*0.1};"></div>`
        ).join('');
    }

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';

    // Start hero auto-play if images exist
    clearInterval(modalHeroTimer);
    if (hasImages && data.images.length > 1) {
        modalHeroTimer = setInterval(() => modalGoToImage(modalHeroIndex + 1), 5000);
    }
}

function closeModal() { modal.classList.remove('active'); document.body.style.overflow = ''; currentModalGame = null; clearInterval(modalHeroTimer); }

// Modal hero image carousel state & controls
let modalHeroImages = [], modalHeroIndex = 0, modalHeroTimer;

function modalGoToImage(index) {
    if (!modalHeroImages.length) return;
    modalHeroIndex = (index + modalHeroImages.length) % modalHeroImages.length;
    const heroImg = document.getElementById('modalHeroImg');
    heroImg.style.opacity = '0';
    setTimeout(() => {
        heroImg.style.backgroundImage = `url('${modalHeroImages[modalHeroIndex]}')`;
        heroImg.style.opacity = '1';
    }, 200);
    document.getElementById('modalHeroCounter').textContent = `${modalHeroIndex + 1} / ${modalHeroImages.length}`;
    // Update active thumbnail
    document.querySelectorAll('.ss-thumb').forEach((t, i) => t.classList.toggle('active', i === modalHeroIndex));
    // Reset auto-play
    clearInterval(modalHeroTimer);
    modalHeroTimer = setInterval(() => modalGoToImage(modalHeroIndex + 1), 5000);
}

document.getElementById('modalHeroPrev').addEventListener('click', e => { e.stopPropagation(); modalGoToImage(modalHeroIndex - 1); });
document.getElementById('modalHeroNext').addEventListener('click', e => { e.stopPropagation(); modalGoToImage(modalHeroIndex + 1); });

document.getElementById('modalClose').addEventListener('click', closeModal);
modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });

document.getElementById('modalCartBtn').addEventListener('click', () => {
    if (!currentModalGame) return;
    const d = gameData[currentModalGame];
    if (d && (d.currentPrice === 0 || d.unreleased)) return;
    addToCart(currentModalGame);
    if (isInCart(currentModalGame)) document.getElementById('modalCartBtn').textContent = '已在購物車中';
});

document.getElementById('modalWishBtn').addEventListener('click', () => {
    if (!currentModalGame) return;
    toggleWishlist(currentModalGame);
    const mwb = document.getElementById('modalWishBtn');
    if (isInWishlist(currentModalGame)) { mwb.innerHTML = '&#9829; 已在願望清單'; mwb.classList.add('wish-active'); }
    else { mwb.innerHTML = '&#9825; 加入願望清單'; mwb.classList.remove('wish-active'); }
});

// ============================================================
//  Keyboard Shortcuts
// ============================================================
document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
        if (modal.classList.contains('active')) closeModal();
        else if (cartPage.classList.contains('active')) closeCartPage();
        else if (wishlistPage.classList.contains('active')) closeWishlistPage();
    }
});

// ============================================================
//  Countdown Timer
// ============================================================
(function() {
    const end = new Date(); end.setDate(end.getDate() + 2); end.setHours(23,59,59,0);
    function tick() {
        const diff = end - new Date(); if (diff <= 0) return;
        document.getElementById('days').textContent    = String(Math.floor(diff/864e5)).padStart(2,'0');
        document.getElementById('hours').textContent   = String(Math.floor((diff/36e5)%24)).padStart(2,'0');
        document.getElementById('minutes').textContent = String(Math.floor((diff/6e4)%60)).padStart(2,'0');
        document.getElementById('seconds').textContent = String(Math.floor((diff/1e3)%60)).padStart(2,'0');
    }
    tick(); setInterval(tick, 1000);
})();

// ============================================================
//  Scroll Reveal
// ============================================================
const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => { if (entry.isIntersecting) { entry.target.style.animationPlayState = 'running'; observer.unobserve(entry.target); } });
}, { threshold: 0.1 });
document.querySelectorAll('.game-card, .upcoming-card').forEach(el => { el.style.animationPlayState = 'paused'; observer.observe(el); });

// ============================================================
//  Navbar Scroll Effect
// ============================================================
window.addEventListener('scroll', () => {
    const nav = document.querySelector('.navbar');
    if (window.scrollY > 100) { nav.style.background = 'rgba(10,14,23,0.95)'; nav.style.boxShadow = '0 2px 20px rgba(0,0,0,0.3)'; }
    else { nav.style.background = 'rgba(10,14,23,0.85)'; nav.style.boxShadow = 'none'; }
});

// ============================================================
//  Search Bar Focus
// ============================================================
const searchInput = document.querySelector('.search-bar input');
searchInput.addEventListener('focus', () => { searchInput.style.width = '260px'; });
searchInput.addEventListener('blur',  () => { searchInput.style.width = '200px'; });

// ============================================================
//  Button Ripple Effect (delegated globally)
// ============================================================
document.addEventListener('click', function(e) {
    const btn = e.target.closest('.btn-primary');
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    const ripple = document.createElement('span');
    const size = Math.max(rect.width, rect.height);
    ripple.style.cssText = `position:absolute;width:${size}px;height:${size}px;border-radius:50%;background:rgba(255,255,255,0.3);left:${e.clientX-rect.left-size/2}px;top:${e.clientY-rect.top-size/2}px;transform:scale(0);animation:ripple 0.6s ease-out;pointer-events:none;`;
    btn.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
});
const rippleStyle = document.createElement('style');
rippleStyle.textContent = `@keyframes ripple { to { transform: scale(2); opacity: 0; } }`;
document.head.appendChild(rippleStyle);
