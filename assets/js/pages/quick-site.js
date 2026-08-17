/* ============================================================
   pages/quick-site.js — 一鍵架站完整互動邏輯
   創巢數位 Nest Digital
   ============================================================ */

const API_GENERATE = '/api/generate';
const API_ENHANCE  = '/api/enhance';
const API_SUBMIT   = '/api/submit';


let stepTimers       = [];
let generatedDesigns = [];   // 後端回傳的 3 份設計
let selectedIndex    = null; // 用戶選定的樣板
let enhancedHtml     = null; // Step 3 加入選配後的最終 HTML
let form1Data        = {};   // 表單 1 資料（送出表單 2 時一起帶）
let iframeObserver   = null;
let selectedImages   = [];   // 用戶選取的圖片 File 物件陣列

// ════════════════════════════════════════════════
// 表單 1 送出 → 生成樣板
// ════════════════════════════════════════════════

document.getElementById('siteForm').addEventListener('submit', async function (e) {
    e.preventDefault();
    if (!validateForm1()) return;

    form1Data = collectForm1();
    clearCache();
    disableGuard();
    showOverlayPhase('generate');
    startStepAnimation();

    try {
        const response = await fetch(API_GENERATE, {
            method: 'POST',
            body: buildForm1FormData()
        });

        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const result = await response.json();
        if (!result.designs || result.designs.length < 3) {
            throw new Error('Invalid response: missing designs');
        }

        generatedDesigns = result.designs;
        saveCache();
        enableGuard();
        finishSteps(() => {
            hideOverlay();
            switchView('viewPreview');
            renderPreviewCards(generatedDesigns);
        });

    } catch (err) {
        console.error(err);
        hideOverlay();
        showToast('生成失敗，請檢查網路後再試。');
    }
});

function collectForm1() {
    return {
        siteName:     document.getElementById('siteName').value.trim(),
        industry:     document.getElementById('industry').value.trim(),
        businessDesc: document.getElementById('businessDesc').value.trim(),
        services:     document.getElementById('services').value.trim(),
        email:        document.getElementById('email').value.trim(),
        phone:        document.getElementById('phone').value.trim(),
        address:      document.getElementById('address').value.trim(),
    };
}

function buildForm1FormData() {
    const fd = new FormData();
    Object.entries(form1Data).forEach(([k, v]) => fd.append(k, v));
    selectedImages.forEach(img => fd.append('images', img));
    return fd;
}

// ── 表單 1 驗證 ──────────────────────────────────────────────

function validateForm1() {
    const textFields = ['siteName', 'industry', 'businessDesc', 'services', 'phone'];
    let valid = true;

    textFields.forEach(id => {
        const el = document.getElementById(id);
        setFieldError(el, !el.value.trim());
        if (!el.value.trim()) valid = false;
    });

    const emailEl = document.getElementById('email');
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailEl.value.trim());
    setFieldError(emailEl, !emailOk);
    if (!emailOk) valid = false;

    if (!valid) {
        document.querySelector('.qs-field.has-error')
            ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    return valid;
}

function setFieldError(el, isError) {
    el.closest('.qs-field')?.classList.toggle('has-error', isError);
}

document.querySelectorAll('#siteForm input, #siteForm textarea')
    .forEach(el => el.addEventListener('input', () => setFieldError(el, false)));

// ════════════════════════════════════════════════
// 圖片上傳管理
// ════════════════════════════════════════════════

const imageInput = document.getElementById('imageUpload');
const imageGrid  = document.getElementById('imageGrid');

imageInput.addEventListener('change', function () {
    const incoming = Array.from(this.files);
    const slots    = 5 - selectedImages.length;

    if (incoming.length > slots) {
        showToast(`最多上傳 5 張，已略過 ${incoming.length - slots} 張。`);
    }

    incoming.slice(0, slots).forEach(file => {
        if (file.size > 5 * 1024 * 1024) {
            showToast(`「${file.name}」超過 5MB，已略過。`);
            return;
        }
        // 簡單去重：同名同大小視為重複
        if (selectedImages.some(f => f.name === file.name && f.size === file.size)) return;

        selectedImages.push(file);
        appendThumb(file);
    });

    imageGrid.hidden = selectedImages.length === 0;
    this.value = ''; // 重置讓同檔可再選
});

function appendThumb(file) {
    const url   = URL.createObjectURL(file);
    const thumb = document.createElement('div');
    thumb.className = 'qs-image-thumb';

    thumb.innerHTML = `
        <img src="${url}" alt="${file.name}" loading="lazy">
        <button type="button" class="qs-image-thumb__remove" aria-label="移除">
            <i class="fas fa-times"></i>
        </button>
    `;

    thumb.querySelector('.qs-image-thumb__remove').addEventListener('click', () => {
        URL.revokeObjectURL(url);
        const idx = selectedImages.indexOf(file);
        if (idx > -1) selectedImages.splice(idx, 1);
        thumb.remove();
        imageGrid.hidden = selectedImages.length === 0;
    });

    imageGrid.appendChild(thumb);
}

// ════════════════════════════════════════════════
// 表單 2 送出 → Step 3 生成最終 HTML → 最終預覽
// ════════════════════════════════════════════════

document.getElementById('enhanceForm').addEventListener('submit', async function (e) {
    e.preventDefault();
    showOverlayPhase('enhance');

    try {
        const fd = buildEnhanceFormData();
        const response = await fetch(API_ENHANCE, { method: 'POST', body: fd });

        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const result = await response.json();
        if (!result.html) throw new Error('Invalid response: missing html');

        enhancedHtml = result.html;
        saveCache();
        hideOverlay();
        showFinalPreview();

    } catch (err) {
        console.error(err);
        hideOverlay();
        showToast('生成失敗，請檢查網路後再試。');
    }
});

function buildEnhanceFormData() {
    const fd = new FormData();

    // 選定的原始 HTML
    const design = generatedDesigns[selectedIndex];
    fd.append('selectedHtml', design.html);
    fd.append('selectedStyleName', design.style_name || `樣板 ${selectedIndex + 1}`);

    // 表單 1 商家資料（Step 3 需要地址做地圖 embed）
    Object.entries(form1Data).forEach(([k, v]) => fd.append(k, v));

    // 表單 2 選配資料
    const optionalFields = [
        'lineUrl', 'facebookUrl', 'instagramUrl', 'youtubeUrl',
        'businessHours', 'announcement', 'bookingUrl', 'orderUrl'
    ];
    optionalFields.forEach(id => {
        const el = document.getElementById(id);
        if (el && el.value.trim()) fd.append(id, el.value.trim());
    });

    fd.append('includeMap', document.getElementById('includeMap').checked ? '1' : '0');

    const pdfFile = document.getElementById('menuPdf').files[0];
    if (pdfFile) fd.append('menuPdf', pdfFile);

    return fd;
}

function showFinalPreview() {
    const design = generatedDesigns[selectedIndex];
    document.getElementById('finalPreviewName').textContent =
        design.style_name || `樣板 ${selectedIndex + 1}`;
    document.getElementById('finalPreviewFrame').srcdoc = enhancedHtml || design.html;
    switchView('viewPreviewFinal');
}

// 最終預覽 → 返回表單 2
document.getElementById('backToForm2').addEventListener('click', () => {
    document.getElementById('finalPreviewFrame').srcdoc = '';
    switchView('viewForm2');
});

// 最終預覽 → 確認送出
document.getElementById('confirmSubmit').addEventListener('click', async function () {
    showOverlayPhase('submit');

    try {
        const response = await fetch(API_SUBMIT, {
            method: 'POST',
            body: buildSubmitFormData()
        });

        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        hideOverlay();
        showResult(true);

    } catch (err) {
        console.error(err);
        hideOverlay();
        showResult(false, err.message);
    }
});

function buildSubmitFormData() {
    const fd = new FormData();

    // 表單 1 資料
    Object.entries(form1Data).forEach(([k, v]) => fd.append(k, v));

    // 選定樣板（使用 Step 3 強化後的 HTML）
    if (selectedIndex !== null) {
        const design = generatedDesigns[selectedIndex];
        fd.append('selectedStyleName', design.style_name || `樣板 ${selectedIndex + 1}`);
        fd.append('selectedHtml', enhancedHtml || design.html);
    }

    // 表單 2 資料（選填，只帶有值的欄位）
    const optionalFields = [
        'lineUrl', 'facebookUrl', 'instagramUrl', 'youtubeUrl',
        'businessHours', 'announcement', 'bookingUrl', 'orderUrl'
    ];
    optionalFields.forEach(id => {
        const el = document.getElementById(id);
        if (el && el.value.trim()) fd.append(id, el.value.trim());
    });

    fd.append('includeMap', document.getElementById('includeMap').checked ? '1' : '0');

    const pdfFile = document.getElementById('menuPdf').files[0];
    if (pdfFile) fd.append('menuPdf', pdfFile);

    return fd;
}

// ── PDF 檔名顯示 ──────────────────────────────────────────────

document.getElementById('menuPdf').addEventListener('change', function () {
    const file   = this.files[0];
    const nameEl = document.getElementById('menuFileName');
    const textEl = document.querySelector('.qs-file-label__text');

    if (file) {
        if (file.size > 10 * 1024 * 1024) {
            showToast('PDF 超過 10MB，請重新選擇。');
            this.value = '';
            nameEl.style.display = 'none';
            textEl.textContent   = '點擊上傳 PDF 檔案';
            return;
        }
        nameEl.textContent   = `已選擇：${file.name}`;
        nameEl.style.display = 'flex';
        textEl.textContent   = '重新選擇檔案';
    } else {
        nameEl.style.display = 'none';
        textEl.textContent   = '點擊上傳 PDF 檔案';
    }
});

// ════════════════════════════════════════════════
// View 切換
// ════════════════════════════════════════════════

const VIEWS = ['viewForm', 'viewPreview', 'viewForm2', 'viewPreviewFinal'];

function switchView(targetId) {
    VIEWS.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.hidden = (id !== targetId);
    });
    window.scrollTo({ top: 0, behavior: 'instant' });
}

// 回填寫
document.getElementById('backToForm').addEventListener('click', () => {
    if (iframeObserver) iframeObserver.disconnect();
    switchView('viewForm');
});

// 重新生成三款
document.getElementById('regenBtn').addEventListener('click', async function () {
    clearCache();
    disableGuard();
    showOverlayPhase('generate');
    startStepAnimation();

    try {
        const response = await fetch(API_GENERATE, {
            method: 'POST',
            body: buildForm1FormData()
        });

        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const result = await response.json();
        if (!result.designs || result.designs.length < 3) {
            throw new Error('Invalid response: missing designs');
        }

        generatedDesigns = result.designs;
        selectedIndex    = null;
        enhancedHtml     = null;
        saveCache();
        enableGuard();
        finishSteps(() => {
            hideOverlay();
            renderPreviewCards(generatedDesigns);
        });

    } catch (err) {
        console.error(err);
        hideOverlay();
        showToast('生成失敗，請檢查網路後再試。');
    }
});

// 回樣板選擇
document.getElementById('backToPreview').addEventListener('click', () => {
    switchView('viewPreview');
});

// ════════════════════════════════════════════════
// 樣板預覽區
// ════════════════════════════════════════════════

function renderPreviewCards(designs) {
    const grid = document.getElementById('previewGrid');
    grid.innerHTML = '';
    designs.forEach((design, i) => grid.appendChild(createCard(design, i)));

    requestAnimationFrame(() => requestAnimationFrame(scaleAllIframes));

    if (iframeObserver) iframeObserver.disconnect();
    iframeObserver = new ResizeObserver(scaleAllIframes);
    document.querySelectorAll('.qs-preview-wrap').forEach(el => iframeObserver.observe(el));
}

function createCard(design, index) {
    const num = String(index + 1).padStart(2, '0');
    const paletteKeys = ['primary', 'accent', 'secondary', 'background', 'text'];
    const swatches = paletteKeys
        .map(k => design.palette?.[k])
        .filter(Boolean)
        .map(c => `<span class="qs-swatch" style="background:${c}" title="${c}"></span>`)
        .join('');

    const card = document.createElement('div');
    card.className = 'qs-preview-card';
    card.dataset.index = index;

    card.innerHTML = `
        <div class="qs-preview-card__header">
            <span class="qs-preview-card__num">${num}</span>
            <span class="qs-preview-card__name">${design.style_name || `樣板 ${num}`}</span>
        </div>
        <div class="qs-preview-wrap" id="wrap${index}">
            <iframe id="previewFrame${index}" title="樣板${num}預覽" sandbox="allow-scripts"></iframe>
        </div>
        <div class="qs-preview-palette">${swatches}</div>
        <div class="qs-preview-card__actions">
            <button type="button" class="qs-btn-expand" data-index="${index}">
                <i class="fas fa-expand-alt" aria-hidden="true"></i> 放大預覽
            </button>
            <button type="button" class="btn btn--yellow qs-btn-select" data-index="${index}">
                選擇這個 <span class="btn-arrow" aria-hidden="true">→</span>
            </button>
        </div>
    `;

    setTimeout(() => {
        const iframe = document.getElementById(`previewFrame${index}`);
        if (iframe) iframe.srcdoc = design.html;
    }, 0);

    card.querySelector('.qs-btn-expand').addEventListener('click', () => openFullscreen(index));
    card.querySelector('.qs-btn-select').addEventListener('click', () => selectDesign(index));

    return card;
}

function scaleAllIframes() {
    document.querySelectorAll('.qs-preview-wrap').forEach(wrap => {
        const iframe = wrap.querySelector('iframe');
        if (!iframe) return;
        const scale = wrap.clientWidth / 1280;
        iframe.style.transform = `scale(${scale})`;
        wrap.style.height      = `${Math.round(800 * scale)}px`;
    });
}

// ── 選定樣板 → 進入表單 2 ────────────────────────────────────

function selectDesign(index) {
    selectedIndex = index;
    saveCache();

    // 高亮選中卡片
    document.querySelectorAll('.qs-preview-card').forEach((card, i) => {
        card.classList.toggle('is-selected', i === index);
    });

    // 短暫延遲後切換到表單 2，讓用戶看到選中效果
    setTimeout(() => switchView('viewForm2'), 300);
}

// ════════════════════════════════════════════════
// 全屏預覽 Overlay
// ════════════════════════════════════════════════

function openFullscreen(index) {
    const design  = generatedDesigns[index];
    const overlay = document.getElementById('fullscreenOverlay');
    const frame   = document.getElementById('fullscreenFrame');

    document.getElementById('fullscreenTitle').textContent =
        design.style_name || `樣板 ${index + 1}`;

    frame.srcdoc = design.html;
    overlay.classList.add('visible');
    document.body.style.overflow = 'hidden';
}

function closeFullscreen() {
    document.getElementById('fullscreenOverlay').classList.remove('visible');
    document.getElementById('fullscreenFrame').srcdoc = '';
    document.body.style.overflow = '';
}

document.getElementById('fullscreenClose').addEventListener('click', closeFullscreen);

document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && document.getElementById('fullscreenOverlay').classList.contains('visible')) {
        closeFullscreen();
    }
});


// ════════════════════════════════════════════════
// Loading Overlay
// ════════════════════════════════════════════════

function showOverlayPhase(phase) {
    document.getElementById('phaseProcess').style.display = phase === 'generate' ? '' : 'none';
    document.getElementById('phaseEnhance').style.display = phase === 'enhance'  ? '' : 'none';
    document.getElementById('phaseSubmit').style.display  = phase === 'submit'   ? '' : 'none';
    document.getElementById('loadingOverlay').classList.add('visible');
    document.body.style.overflow = 'hidden';
}

function hideOverlay() {
    document.getElementById('loadingOverlay').classList.remove('visible');
    document.body.style.overflow = '';
}

// ── 步驟動畫（生成樣板時使用）────────────────────────────────

const STEP_DELAYS = [5000, 12000, 20000, 28000];

function startStepAnimation() {
    stepTimers.forEach(clearTimeout);
    stepTimers = [];

    // 重置步驟狀態
    const initialStates = ['qs-step--done', 'qs-step--active', 'qs-step--pending', 'qs-step--pending', 'qs-step--pending'];
    const initialIcons  = ['fa-check', 'fa-spinner fa-spin', 'fa-circle', 'fa-circle', 'fa-circle'];
    ['step1','step2','step3','step4','step5'].forEach((id, i) => {
        const el = document.getElementById(id);
        if (!el) return;
        el.className = `qs-step ${initialStates[i]}`;
        el.querySelector('.qs-step__icon').innerHTML = `<i class="fas ${initialIcons[i]}"></i>`;
    });

    const stepIds = ['step2', 'step3', 'step4', 'step5'];
    stepIds.forEach((id, i) => {
        const t = setTimeout(() => advanceStep(id), STEP_DELAYS[i]);
        stepTimers.push(t);
    });
}

function advanceStep(activeId) {
    const el = document.getElementById(activeId);
    if (!el) return;
    const prev = el.previousElementSibling;
    if (prev) {
        prev.className = 'qs-step qs-step--done';
        prev.querySelector('.qs-step__icon').innerHTML = '<i class="fas fa-check"></i>';
    }
    el.className = 'qs-step qs-step--active';
    el.querySelector('.qs-step__icon').innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
}

function finishSteps(callback) {
    stepTimers.forEach(clearTimeout);
    stepTimers = [];
    ['step2', 'step3', 'step4', 'step5'].forEach(id => {
        const el = document.getElementById(id);
        if (!el) return;
        el.className = 'qs-step qs-step--done';
        el.querySelector('.qs-step__icon').innerHTML = '<i class="fas fa-check"></i>';
    });
    setTimeout(callback, 600);
}

// ════════════════════════════════════════════════
// 結果畫面
// ════════════════════════════════════════════════

function showResult(success, errorMsg = '') {
    if (success) { clearCache(); disableGuard(); }
    document.getElementById('resultSuccess').style.display = success ? '' : 'none';
    document.getElementById('resultFail').style.display    = success ? 'none' : '';
    if (!success && errorMsg) {
        document.getElementById('resultFailMsg').textContent = errorMsg;
    }
    document.getElementById('resultOverlay').classList.add('visible');
    document.body.style.overflow = '';
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ════════════════════════════════════════════════
// Toast
// ════════════════════════════════════════════════

function showToast(msg) {
    const toast = document.getElementById('errorToast');
    document.getElementById('toastMsg').textContent = msg;
    toast.classList.add('visible');
    setTimeout(() => toast.classList.remove('visible'), 4000);
}

// ════════════════════════════════════════════════
// 離開警告 + Session 快取
// ════════════════════════════════════════════════

const SESSION_KEY = 'qs_cache';

function enableGuard()  { window.addEventListener('beforeunload', onBeforeUnload); }
function disableGuard() { window.removeEventListener('beforeunload', onBeforeUnload); }
function onBeforeUnload(e) { e.preventDefault(); e.returnValue = ''; }

function saveCache() {
    try {
        sessionStorage.setItem(SESSION_KEY, JSON.stringify({
            designs:  generatedDesigns,
            selected: selectedIndex,
            form1:    form1Data,
            enhanced: enhancedHtml,
        }));
    } catch (_) {}
}

function clearCache() { sessionStorage.removeItem(SESSION_KEY); }

function restoreCache() {
    try {
        const raw = sessionStorage.getItem(SESSION_KEY);
        if (!raw) return false;
        const d = JSON.parse(raw);
        if (!d.designs?.length) return false;
        generatedDesigns = d.designs;
        selectedIndex    = d.selected ?? null;
        form1Data        = d.form1 ?? {};
        enhancedHtml     = d.enhanced ?? null;
        return d;
    } catch (_) { return false; }
}

// ════════════════════════════════════════════════
// 預覽模式（?preview=loading|preview|form2|result）
// ════════════════════════════════════════════════

window.addEventListener('load', function () {
    const p = new URLSearchParams(location.search).get('preview');

    if (!p) {
        const cached = restoreCache();
        if (cached) {
            enableGuard();
            if (cached.enhanced && cached.selected !== null) {
                showFinalPreview();
            } else if (cached.selected !== null) {
                switchView('viewForm2');
            } else {
                switchView('viewPreview');
                renderPreviewCards(generatedDesigns);
            }
        }
        return;
    }

    const mockDesigns = [
        {
            style_name: '現代簡約',
            palette: { primary: '#1a73e8', secondary: '#e8f0fe', accent: '#34a853', background: '#ffffff', text: '#202124' },
            html: `<!DOCTYPE html><html><body style="font-family:sans-serif;padding:3rem;background:#f8f9fa">
                <h1 style="color:#1a73e8">現代簡約樣板</h1><p style="color:#5f6368">預覽模式測試內容。</p>
                </body></html>`
        },
        {
            style_name: '復古溫暖',
            palette: { primary: '#8B4513', secondary: '#F5DEB3', accent: '#DAA520', background: '#FFF8DC', text: '#3E2723' },
            html: `<!DOCTYPE html><html><body style="font-family:Georgia,serif;padding:3rem;background:#FFF8DC">
                <h1 style="color:#8B4513">復古溫暖樣板</h1><p style="color:#6D4C41">預覽模式測試內容。</p>
                </body></html>`
        },
        {
            style_name: '大膽鮮明',
            palette: { primary: '#FF4081', secondary: '#1A1A2E', accent: '#00E5FF', background: '#0D0D1A', text: '#FFFFFF' },
            html: `<!DOCTYPE html><html><body style="font-family:sans-serif;padding:3rem;background:#0D0D1A;color:#fff">
                <h1 style="color:#FF4081">大膽鮮明樣板</h1><p style="color:#b0bec5">預覽模式測試內容。</p>
                </body></html>`
        }
    ];

    if (p === 'loading') {
        showOverlayPhase('generate');
        startStepAnimation();
    } else if (p === 'preview') {
        generatedDesigns = mockDesigns;
        switchView('viewPreview');
        renderPreviewCards(mockDesigns);
    } else if (p === 'form2') {
        generatedDesigns = mockDesigns;
        selectedIndex = 0;
        form1Data = { siteName: '測試商家', industry: '餐飲業', email: 'test@gmail.com', phone: '0912345678', address: '台北市', businessDesc: '測試', services: '測試服務' };
        switchView('viewForm2');
    } else if (p === 'finalpreview') {
        generatedDesigns = mockDesigns;
        selectedIndex = 0;
        enhancedHtml = mockDesigns[0].html;
        form1Data = { siteName: '測試商家', industry: '餐飲業', email: 'test@gmail.com', phone: '0912345678', address: '台北市', businessDesc: '測試', services: '測試服務' };
        showFinalPreview();
    } else if (p === 'result') {
        showResult(true);
    } else if (p === 'submit') {
        showOverlayPhase('submit');
    }
});
