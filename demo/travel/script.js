// ==================== DATA ====================
const SPOTS = [
    { id:'s1',  name:'九份老街',       cat:'culture', tag:'文化古蹟', price:200,  photo:'https://images.unsplash.com/photo-1540187334920-54e87c2771c0?q=80' },
    { id:'s2',  name:'太魯閣國家公園', cat:'nature',  tag:'自然景觀', price:350,  photo:'https://plus.unsplash.com/premium_photo-1664360971425-8bb6065fb1c2?q=80' },
    { id:'s3',  name:'日月潭',         cat:'nature',  tag:'自然景觀', price:300,  photo:'https://images.unsplash.com/photo-1559310589-2673bfe16970?q=80' },
    { id:'s4',  name:'阿里山',         cat:'nature',  tag:'自然景觀', price:400,  photo:'https://plus.unsplash.com/premium_photo-1676464927572-045026d2a4bd?q=80' },
    { id:'s5',  name:'墾丁國家公園',   cat:'nature',  tag:'自然景觀', price:350,  photo:'https://images.unsplash.com/photo-1540979388789-6cee28a1cdc9?w=480&q=80' },
    { id:'s6',  name:'台北101',        cat:'city',    tag:'城市體驗', price:250,  photo:'https://images.unsplash.com/photo-1470004914212-05527e49370b?w=480&q=80' },
    { id:'s7',  name:'西門町',         cat:'city',    tag:'城市體驗', price:100,  photo:'https://images.unsplash.com/photo-1576422608509-27457a713964?q=80' },
    { id:'s8',  name:'士林夜市',       cat:'food',    tag:'美食區域', price:150,  photo:'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=480&q=80' },
    { id:'s9',  name:'淡水老街',       cat:'culture', tag:'文化古蹟', price:150,  photo:'https://images.unsplash.com/photo-1676381105759-e0a964bdad0d?q=80' },
    { id:'s10', name:'鹿港小鎮',       cat:'culture', tag:'文化古蹟', price:200,  photo:'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=480&q=80' },
    { id:'s11', name:'花蓮東大門夜市', cat:'food',    tag:'美食區域', price:150,  photo:'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=480&q=80' },
    { id:'s12', name:'台南安平古堡',   cat:'culture', tag:'文化古蹟', price:200,  photo:'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=480&q=80' },
    { id:'s13', name:'清境農場',       cat:'nature',  tag:'自然景觀', price:350,  photo:'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=480&q=80' },
    { id:'s14', name:'高雄駁二藝術區', cat:'city',    tag:'城市體驗', price:150,  photo:'https://images.unsplash.com/photo-1533929736458-ca588d08c8be?w=480&q=80' },
    { id:'s15', name:'嘉義檜意森活村', cat:'culture', tag:'文化古蹟', price:150,  photo:'https://images.unsplash.com/photo-1528164344705-47542687000d?w=480&q=80' },
    { id:'s16', name:'逢甲夜市',       cat:'food',    tag:'美食區域', price:100,  photo:'https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?w=480&q=80' },
    { id:'s17', name:'澎湖藍洞',       cat:'island', tag:'自然奇景', price:300, photo:'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=480&q=80' },
    { id:'s18', name:'小琉球花瓶岩',   cat:'island', tag:'熱門地標', price:150, photo:'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=480&q=80' },
    { id:'s19', name:'綠島朝日溫泉',   cat:'island', tag:'特色體驗', price:250, photo:'https://images.unsplash.com/photo-1751980002057-2564cd9bd197?q=80' },
    { id:'s20', name:'華山文創園區',   cat:'photo', tag:'文青打卡', price:0,   photo:'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSWAW0rNfEq25z1KpNoG_zzDgAtI0arBxYt0Q&s' },
    { id:'s21', name:'象山夜景',       cat:'photo', tag:'城市夜景', price:0,   photo:'https://plus.unsplash.com/premium_photo-1661963920742-f5b23a6a1b44?q=80' },
    { id:'s22', name:'審計新村',       cat:'photo', tag:'文創聚落', price:0,   photo:'https://images.unsplash.com/photo-1583654979589-aa7a6053a0d6?q=80' },
];

const PACKAGES = [
    {
        id:'p1', name:'經典北部精華一日遊',
        desc:'走訪台北最具代表性的景點，感受城市與文化的交融',
        badge:'最受歡迎', spots:['s6','s1','s9','s8'], price:1200,
        photo:'https://images.unsplash.com/photo-1470004914212-05527e49370b?w=800&q=80'
    },
    {
        id:'p2', name:'中部山林療癒之旅',
        desc:'遠離喧囂，深入山林感受大自然的療癒力量',
        badge:'自然首選', spots:['s3','s4','s13','s15'], price:1800,
        photo:'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800&q=80'
    },
    {
        id:'p3', name:'南部文化美食探索',
        desc:'品嚐道地南部美食，探訪歷史古蹟與現代藝術',
        badge:'美食推薦', spots:['s12','s14','s5','s16'], price:1500,
        photo:'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80'
    },
    {
        id:'p4', name:'東部壯闊秘境兩日遊',
        desc:'壯麗峽谷與太平洋海岸線，體驗台灣最美的東部',
        badge:'深度旅遊', spots:['s2','s11','s13','s3'], price:2500,
        photo:'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80'
    },
    {
        id:'p5',
        name:'離島海島放空度假',
        desc:'前往離島享受純淨海景與慢活步調，適合想放鬆充電的你',
        badge:'放鬆首選',
        spots:['s7','s17','s18','s19'],
        price:2200,
        photo:'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80'
    },
    {
        id:'p6',
        name:'網美打卡城市輕旅行',
        desc:'精選IG熱門打卡景點與特色咖啡廳，拍出質感生活日常',
        badge:'拍照必去',
        spots:['s1','s20','s21','22'],
        price:1300,
        photo:'https://plus.unsplash.com/premium_photo-1661963920742-f5b23a6a1b44?q=80'
    }
];

const FILTERS = [
    { key:'all', label:'全部' },
    { key:'nature', label:'自然景觀' },
    { key:'culture', label:'文化古蹟' },
    { key:'city', label:'城市體驗' },
    { key:'food', label:'美食區域' },
];

const MEAL_MAP = { none:{label:'不需要餐點',price:0}, lunch:{label:'午餐',price:300}, full:{label:'午餐 + 晚餐',price:700}, premium:{label:'豪華全餐',price:1200} };
const TRANSPORT_MAP = { none:{label:'自行前往',price:0}, station:{label:'車站定點接送',price:400}, hotel:{label:'飯店接送',price:800}, private:{label:'到府專車接送',price:1500} };

// ==================== NEWS DATA ====================
const NEWS_ITEMS = [
    {
        type: 'promo',
        icon: 'tag',
        title: '春季限定優惠！全站行程 85 折',
        desc: '即日起至 4/30，使用優惠碼 SPRING2026 享全站行程 85 折優惠，不限行程方案。',
        time: '2 小時前'
    },
    {
        type: 'new',
        icon: 'sparkles',
        title: '新上架：蘭嶼三日深度文化之旅',
        desc: '探索達悟族傳統文化，體驗飛魚季的獨特魅力，含飛機來回票及民宿住宿。',
        time: '1 天前'
    },
    {
        type: 'info',
        icon: 'info',
        title: '清明連假訂單已額滿',
        desc: '4/3 - 4/6 清明連假期間所有行程已全數售罄，感謝支持！候補名單開放中。',
        time: '2 天前'
    },
    {
        type: 'alert',
        icon: 'alert-triangle',
        title: '颱風季出行提醒',
        desc: '東部及南部行程可能因天候因素調整，我們將提前通知並提供免費改期服務。',
        time: '3 天前'
    },
    {
        type: 'promo',
        icon: 'gift',
        title: '會員獨享：生日當月 9 折',
        desc: '完成會員註冊並填寫生日資訊，即可在生日當月享有全行程 9 折優惠。',
        time: '5 天前'
    },
];

// ==================== STATE ====================
let state = {
    step: 1,
    selectedPackage: null,
    selectedSpots: [],
    meal: 'none',
    transport: 'none',
    people: 2,
    currentFilter: 'all',
};

let sortableInstance = null;
let isLoggedIn = false;
let currentUser = null;
let newsWidgetOpen = true;

// ==================== HELPERS ====================
const spotById = id => SPOTS.find(s => s.id === id);
const spotName = id => spotById(id)?.name || '';

function icons() { if (window.lucide) lucide.createIcons(); }

// ==================== TOAST ====================
function showToast(type, title, message) {
    let container = document.querySelector('.toast-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
    }
    const iconMap = { success: 'check-circle', error: 'x-circle', info: 'info' };
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <div class="toast-icon"><i data-lucide="${iconMap[type]}" style="width:18px;height:18px"></i></div>
        <div class="toast-body"><strong>${title}</strong><p>${message}</p></div>
    `;
    container.appendChild(toast);
    icons();
    setTimeout(() => {
        toast.style.animation = 'toastOut 0.3s ease forwards';
        setTimeout(() => toast.remove(), 300);
    }, 3500);
}

// ==================== RENDER ====================
function renderPackages() {
    const g = document.getElementById('packagesGrid');
    g.innerHTML = PACKAGES.map((p, i) => `
        <div class="package-card fade-up stagger-${i+1} ${state.selectedPackage===p.id?'selected':''}" onclick="selectPackage('${p.id}')">
            <div class="check-badge"><i data-lucide="check" style="width:16px;height:16px"></i></div>
            <div class="package-img-wrap">
                <img src="${p.photo}" alt="${p.name}" loading="lazy">
                <div class="package-img-overlay"></div>
                <span class="package-badge">${p.badge}</span>
            </div>
            <div class="package-body">
                <h3>${p.name}</h3>
                <p class="desc">${p.desc}</p>
                <div class="package-spots">
                    ${p.spots.map(sid => `<span class="chip">${spotName(sid)}</span>`).join('')}
                </div>
                <div class="package-footer">
                    <span class="package-price">$${p.price.toLocaleString()} <small>/每人</small></span>
                </div>
            </div>
        </div>
    `).join('');
    icons();
}

function renderFilterBar() {
    document.getElementById('filterBar').innerHTML = FILTERS.map(f =>
        `<button class="filter-chip ${state.currentFilter===f.key?'active':''}" onclick="setFilter('${f.key}')">${f.label}</button>`
    ).join('');
}

function renderSpots() {
    renderFilterBar();
    const filtered = state.currentFilter === 'all' ? SPOTS : SPOTS.filter(s => s.cat === state.currentFilter);
    const g = document.getElementById('spotsGrid');
    g.innerHTML = filtered.map(s => `
        <div class="spot-card ${state.selectedSpots.includes(s.id)?'selected':''}" onclick="toggleSpot('${s.id}')">
            <div class="spot-check">
                ${state.selectedSpots.includes(s.id) ? '<i data-lucide="check" style="width:14px;height:14px"></i>' : ''}
            </div>
            <div class="spot-img-wrap">
                <img src="${s.photo}" alt="${s.name}" loading="lazy">
            </div>
            <div class="spot-info">
                <h4>${s.name}</h4>
                <div class="spot-meta">
                    <span class="spot-tag">${s.tag}</span>
                    <span class="spot-price">$${s.price}/人</span>
                </div>
            </div>
        </div>
    `).join('');
    document.getElementById('spotCount').textContent = state.selectedSpots.length;
    icons();
}

function renderSortList() {
    const list = document.getElementById('sortList');
    if (state.selectedSpots.length === 0) {
        list.innerHTML = `
            <div class="empty-state">
                <div><i data-lucide="map-pin-off" style="width:40px;height:40px"></i></div>
                <p>尚未選擇景點，請回到上一步選擇</p>
            </div>`;
        icons();
        return;
    }
    list.innerHTML = state.selectedSpots.map((sid, i) => {
        const s = spotById(sid);
        return `
        <div class="sort-item" data-id="${sid}">
            <div class="sort-handle"><i data-lucide="grip-vertical" style="width:18px;height:18px"></i></div>
            <span class="sort-num">${i+1}</span>
            <div class="sort-spot-info">
                <div class="name">${s.name}</div>
                <div class="sub">${s.tag} · $${s.price}/人</div>
            </div>
            <button class="sort-remove" onclick="removeSpot('${sid}')">
                <i data-lucide="x" style="width:16px;height:16px"></i>
            </button>
        </div>`;
    }).join('');

    if (sortableInstance) sortableInstance.destroy();
    sortableInstance = new Sortable(list, {
        handle: '.sort-handle',
        animation: 200,
        ghostClass: 'sortable-ghost',
        chosenClass: 'sortable-chosen',
        onEnd(evt) {
            const [moved] = state.selectedSpots.splice(evt.oldIndex, 1);
            state.selectedSpots.splice(evt.newIndex, 0, moved);
            renderSortList();
        }
    });
    icons();
}

function renderSummary() {
    const pkg = PACKAGES.find(p => p.id === state.selectedPackage);
    document.getElementById('sumPackage').textContent = pkg ? pkg.name : '自訂行程';
    document.getElementById('summarySubtitle').textContent = `${state.selectedSpots.length} 個景點 · ${state.people} 人`;
    const route = document.getElementById('sumRoute');
    if (state.selectedSpots.length === 0) {
        route.innerHTML = '<span style="color:var(--text-muted)">尚未選擇景點</span>';
    } else {
        route.innerHTML = state.selectedSpots.map((sid, i) => {
            const arrow = i < state.selectedSpots.length - 1 ? '<span class="route-arrow">→</span>' : '';
            return `<span class="route-chip">${spotName(sid)}</span>${arrow}`;
        }).join('');
    }
    document.getElementById('sumMeal').textContent = MEAL_MAP[state.meal].label;
    document.getElementById('sumTransport').textContent = TRANSPORT_MAP[state.transport].label;
    document.getElementById('sumPeople').textContent = state.people + ' 人';
    document.getElementById('sumTotal').textContent = '$' + calcTotal().toLocaleString();
}

// ==================== NEWS WIDGET ====================
function renderNewsWidget() {
    const body = document.getElementById('newsWidgetBody');
    body.innerHTML = NEWS_ITEMS.map(item => `
        <div class="news-item">
            <div class="news-item-icon ${item.type}">
                <i data-lucide="${item.icon}" style="width:18px;height:18px"></i>
            </div>
            <div class="news-item-content">
                <strong>${item.title}</strong>
                <p>${item.desc}</p>
                <div class="news-item-time">${item.time}</div>
            </div>
        </div>
    `).join('');
    icons();
}

function toggleNewsWidget() {
    const panel = document.getElementById('newsPanel');
    const fab = document.getElementById('newsFab');
    newsWidgetOpen = !newsWidgetOpen;
    if (newsWidgetOpen) {
        panel.style.display = 'block';
        fab.style.display = 'none';
    } else {
        panel.style.display = 'none';
        fab.style.display = 'flex';
    }
    icons();
}

// ==================== LOGIC ====================
function calcTotal() {
    let base = 0;
    if (state.selectedPackage) {
        base = PACKAGES.find(p => p.id === state.selectedPackage)?.price || 0;
        const pkgSpots = PACKAGES.find(p => p.id === state.selectedPackage)?.spots || [];
        state.selectedSpots.forEach(sid => {
            if (!pkgSpots.includes(sid)) base += spotById(sid)?.price || 0;
        });
    } else {
        state.selectedSpots.forEach(sid => { base += spotById(sid)?.price || 0; });
    }
    base += MEAL_MAP[state.meal].price;
    base += TRANSPORT_MAP[state.transport].price;
    return base * state.people;
}

function selectPackage(id) {
    state.selectedPackage = state.selectedPackage === id ? null : id;
    if (state.selectedPackage) {
        PACKAGES.find(p => p.id === id).spots.forEach(sid => {
            if (!state.selectedSpots.includes(sid)) state.selectedSpots.push(sid);
        });
    }
    renderPackages();
}
function clearPackage() { state.selectedPackage = null; }

function toggleSpot(id) {
    const idx = state.selectedSpots.indexOf(id);
    if (idx >= 0) state.selectedSpots.splice(idx, 1);
    else state.selectedSpots.push(id);
    renderSpots();
}
function removeSpot(id) {
    state.selectedSpots = state.selectedSpots.filter(s => s !== id);
    renderSortList();
}
function setFilter(key) {
    state.currentFilter = key;
    renderSpots();
}

function selectOption(group, value, el) {
    document.querySelectorAll(`.option-item[data-group="${group}"]`).forEach(i => i.classList.remove('selected'));
    el.classList.add('selected');
    state[group] = value;
}

function changePeople(d) {
    state.people = Math.max(1, Math.min(20, state.people + d));
    document.getElementById('peopleCount').textContent = state.people;
}

// ==================== NAV ====================
function goStep(n) {
    state.step = n;
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.getElementById('step' + n).classList.add('active');

    const steps = document.querySelectorAll('.stepper-step');
    const lines = document.querySelectorAll('.stepper-line');
    steps.forEach((s, i) => {
        s.classList.remove('active', 'done');
        if (i + 1 === n) s.classList.add('active');
        else if (i + 1 < n) s.classList.add('done');
    });
    lines.forEach((l, i) => {
        l.classList.toggle('done', i + 1 < n);
    });

    if (n === 1) renderPackages();
    if (n === 2) renderSpots();
    if (n === 3) renderSortList();
    if (n === 5) renderSummary();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    icons();
}

function submitBooking() {
    document.getElementById('successModal').classList.add('show');
    if (window.confetti) {
        confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
        setTimeout(() => confetti({ particleCount: 60, spread: 100, origin: { y: 0.7 } }), 300);
    }
}

function closeModal() {
    document.getElementById('successModal').classList.remove('show');
    state = { step:1, selectedPackage:null, selectedSpots:[], meal:'none', transport:'none', people:2, currentFilter:'all' };
    document.querySelectorAll('.option-item').forEach(i => i.classList.remove('selected'));
    document.getElementById('peopleCount').textContent = 2;
    goStep(1);
}

// ==================== NAVBAR ====================
function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function scrollToSection(id) {
    const el = document.getElementById(id);
    if (el) {
        const navbarHeight = 64;
        const top = el.getBoundingClientRect().top + window.pageYOffset - navbarHeight;
        window.scrollTo({ top, behavior: 'smooth' });
    }
}

function toggleMobileMenu() {
    document.getElementById('mobileMenu').classList.toggle('show');
}

function closeMobileMenu() {
    document.getElementById('mobileMenu').classList.remove('show');
}

// ==================== AUTH SYSTEM ====================
function openAuthModal(tab) {
    document.getElementById('authModal').classList.add('show');
    switchAuthTab(tab || 'login');
    icons();
}

function closeAuthModal() {
    document.getElementById('authModal').classList.remove('show');
}

function switchAuthTab(tab) {
    document.getElementById('loginTab').style.display = tab === 'login' ? 'block' : 'none';
    document.getElementById('registerTab').style.display = tab === 'register' ? 'block' : 'none';
    icons();
}

function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    // Mock login
    setLoggedIn({
        name: email.split('@')[0],
        email: email,
        initial: email.charAt(0).toUpperCase()
    });
    closeAuthModal();
    showToast('success', '登入成功', '歡迎回來！');
}

function handleRegister(e) {
    e.preventDefault();
    const pw = document.getElementById('regPassword').value;
    const pwc = document.getElementById('regPasswordConfirm').value;
    if (pw !== pwc) {
        showToast('error', '密碼不一致', '請確認兩次輸入的密碼相同');
        return;
    }
    const lastName = document.getElementById('regLastName').value;
    const firstName = document.getElementById('regFirstName').value;
    const email = document.getElementById('regEmail').value;
    setLoggedIn({
        name: lastName + firstName,
        email: email,
        initial: lastName.charAt(0)
    });
    closeAuthModal();
    showToast('success', '註冊成功', '歡迎加入探索台灣！');
}

function handleSocialLogin(provider) {
    setLoggedIn({
        name: provider + ' 使用者',
        email: 'user@' + provider.toLowerCase() + '.com',
        initial: provider.charAt(0)
    });
    closeAuthModal();
    showToast('success', '登入成功', `已使用 ${provider} 帳號登入`);
}

function setLoggedIn(user) {
    isLoggedIn = true;
    currentUser = user;
    // Update navbar
    document.querySelector('.btn-nav-login').style.display = 'none';
    document.querySelector('.btn-nav-register').style.display = 'none';
    document.getElementById('navUserMenu').style.display = 'block';
    document.getElementById('navAvatar').textContent = user.initial;
    document.getElementById('navUserName').textContent = user.name;
    document.getElementById('dropdownAvatar').textContent = user.initial;
    document.getElementById('dropdownName').textContent = user.name;
    document.getElementById('dropdownEmail').textContent = user.email;
    // Update mobile menu
    const mobileMenu = document.getElementById('mobileMenu');
    const loginBtn = mobileMenu.querySelector('.btn-mobile-login');
    const regBtn = mobileMenu.querySelector('.btn-mobile-register');
    if (loginBtn) loginBtn.style.display = 'none';
    if (regBtn) regBtn.style.display = 'none';
    icons();
}

function handleLogout() {
    isLoggedIn = false;
    currentUser = null;
    document.querySelector('.btn-nav-login').style.display = '';
    document.querySelector('.btn-nav-register').style.display = '';
    document.getElementById('navUserMenu').style.display = 'none';
    document.getElementById('userDropdown').classList.remove('show');
    // Restore mobile menu buttons
    const mobileMenu = document.getElementById('mobileMenu');
    const loginBtn = mobileMenu.querySelector('.btn-mobile-login');
    const regBtn = mobileMenu.querySelector('.btn-mobile-register');
    if (loginBtn) loginBtn.style.display = '';
    if (regBtn) regBtn.style.display = '';
    showToast('info', '已登出', '期待您再次回來！');
}

function toggleUserDropdown() {
    document.getElementById('userDropdown').classList.toggle('show');
}

function openMyAccount() {
    document.getElementById('userDropdown').classList.remove('show');
    showToast('info', '我的帳戶', '帳戶設定頁面開發中，敬請期待！');
}
function openMyBookings() {
    document.getElementById('userDropdown').classList.remove('show');
    showToast('info', '我的行程', '行程管理功能開發中，敬請期待！');
}
function openWishlist() {
    document.getElementById('userDropdown').classList.remove('show');
    showToast('info', '收藏清單', '收藏功能開發中，敬請期待！');
}

// Close dropdown when clicking outside
document.addEventListener('click', (e) => {
    const dropdown = document.getElementById('userDropdown');
    const userMenu = document.getElementById('navUserMenu');
    if (dropdown && userMenu && !userMenu.contains(e.target)) {
        dropdown.classList.remove('show');
    }
});

// ==================== CONTACT FORM ====================
function handleContactSubmit(e) {
    e.preventDefault();
    document.getElementById('contactSuccessModal').classList.add('show');
    e.target.reset();
}

// ==================== INIT ====================
window.addEventListener('scroll', () => {
    const navbar = document.getElementById('navbar');
    const stepperWrap = document.getElementById('stepperWrap');
    if (navbar) navbar.classList.toggle('scrolled', window.scrollY > 10);
    if (stepperWrap) stepperWrap.classList.toggle('scrolled', window.scrollY > 10);
});

// Close auth modal on overlay click
document.getElementById('authModal').addEventListener('click', (e) => {
    if (e.target === document.getElementById('authModal')) {
        closeAuthModal();
    }
});

AOS.init({ duration: 600, once: true, offset: 60 });
renderPackages();
renderNewsWidget();
icons();
