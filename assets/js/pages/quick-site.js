/* ============================================================
   pages/quick-site.js — 一鍵架站表單頁互動邏輯
   創巢數位 Nest Digital
   ============================================================ */

const WEBHOOK_URL       = 'https://crazyhousepet.app.n8n.cloud/webhook/website-builder';
const EMAIL_WEBHOOK_URL = 'https://crazyhousepet.app.n8n.cloud/webhook/send-email';
const CIRCUMFERENCE = 2 * Math.PI * 52; // r=52

let stepTimers = [];
let pendingEmailData = null; // 暫存送出後的 email / siteName / siteUrl

// ── 表單送出 ──────────────────────────────────────────────────

document.getElementById('siteForm').addEventListener('submit', async function (e) {
    e.preventDefault();
    if (!validateForm()) return;

    const payload = collectFormData();
    pendingEmailData = {
        email:    document.getElementById('email').value.trim(),
        siteName: document.getElementById('siteName').value.trim(),
    };
    showLoading();
    startStepAnimation();

    try {
        const response = await fetch(WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const result = await response.json();
        handleResult(result);

    } catch (err) {
        console.error(err);
        hideLoading();
        showToast('送出失敗，請檢查網路後再試。');
    }
});

// ── 收集表單資料 ──────────────────────────────────────────────

function collectFormData() {
    return {
        '公司名稱':   document.getElementById('siteName').value.trim(),
        '行業類別':   document.getElementById('industry').value.trim(),
        '商家描述':   document.getElementById('businessDesc').value.trim(),
        '提供的服務': document.getElementById('services').value.trim(),
        '聯絡 Email': document.getElementById('email').value.trim(),
        '聯絡電話':   document.getElementById('phone').value.trim(),
        '地址':       document.getElementById('address').value.trim(),
        '風格偏好':   document.getElementById('stylePrefs').value,
    };
}

// ── 表單驗證 ──────────────────────────────────────────────────

function validateForm() {
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

    const styleEl = document.getElementById('stylePrefs');
    setFieldError(styleEl, !styleEl.value);
    if (!styleEl.value) valid = false;

    if (!valid) {
        document.querySelector('.qs-field.has-error')
            ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    return valid;
}

function setFieldError(el, isError) {
    el.closest('.qs-field')?.classList.toggle('has-error', isError);
}

document.querySelectorAll('#siteForm input, #siteForm select, #siteForm textarea')
    .forEach(el => el.addEventListener('input', () => setFieldError(el, false)));

// ── 步驟動畫 ──────────────────────────────────────────────────

const STEP_DELAYS = [1800, 3500, 5500, 7500];

function startStepAnimation() {
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

// ── 顯示 / 隱藏等待畫面 ──────────────────────────────────────

function showLoading() {
    document.getElementById('loadingOverlay').classList.add('visible');
    document.body.style.overflow = 'hidden';
}

function hideLoading() {
    document.getElementById('loadingOverlay').classList.remove('visible');
    document.body.style.overflow = '';
}

// ── 處理結果 ──────────────────────────────────────────────────

function handleResult(data) {
    prepareResult(data);
    if (data.success && data.site_url) {
        finishSteps(() => startDeployCountdown());
    } else {
        finishSteps(() => {
            hideLoading();
            document.getElementById('resultOverlay').classList.add('visible');
            document.body.style.overflow = '';
        });
    }
}

function prepareResult(data) {
    const urlCard  = document.getElementById('resultUrlCard');
    const failCard = document.getElementById('resultFailCard');

    if (data.success && data.site_url) {
        document.getElementById('resultSiteUrl').href = data.site_url;
        document.getElementById('resultUrlText').textContent = data.site_url;
        urlCard.style.display  = '';
        failCard.style.display = 'none';
    } else {
        urlCard.style.display  = 'none';
        failCard.style.display = '';
        document.getElementById('resultFailMsg').textContent =
            data.message || '架設過程發生問題，請聯絡我們處理。';
    }
}

// ── 部署進度環 ────────────────────────────────────────────────

function startDeployCountdown() {
    document.getElementById('phaseProcess').style.display = 'none';
    document.getElementById('phaseDeploy').style.display  = '';

    const bar    = document.getElementById('countdownBar');
    const number = document.getElementById('countdownNumber');

    bar.style.strokeDasharray  = CIRCUMFERENCE;
    bar.style.strokeDashoffset = CIRCUMFERENCE;

    const totalMs   = (180 + Math.random() * 120) * 1000;
    const startTime = performance.now();
    let currentPct  = 0;

    function tick() {
        const elapsed    = performance.now() - startTime;
        const naturalPct = Math.min(elapsed / totalMs, 1) * 100;
        const stall      = Math.random() < 0.20;

        if (!stall) {
            const speed  = 0.5 + Math.random() * 1.5;
            const target = Math.min(naturalPct * speed, naturalPct + 8, 99);
            currentPct   = Math.max(currentPct, target);
        }

        number.textContent        = `${Math.floor(currentPct)}%`;
        bar.style.strokeDashoffset = CIRCUMFERENCE * (1 - currentPct / 100);

        if (elapsed >= totalMs) {
            number.textContent        = '100%';
            bar.style.strokeDashoffset = 0;
            setTimeout(revealResult, 400);
            return;
        }

        setTimeout(tick, 200 + Math.random() * 600);
    }

    tick();
}

function revealResult() {
    hideLoading();
    document.getElementById('resultOverlay').classList.add('visible');
    document.body.style.overflow = '';
    window.scrollTo({ top: 0, behavior: 'smooth' });
    sendEmailNotification();
}

function sendEmailNotification() {
    if (!pendingEmailData) return;
    const siteUrl = document.getElementById('resultSiteUrl').href;
    const form = new FormData();
    form.append('email',    pendingEmailData.email);
    form.append('siteName', pendingEmailData.siteName);
    form.append('siteUrl',  siteUrl);
    fetch(EMAIL_WEBHOOK_URL, {
        method: 'POST',
        mode: 'no-cors',
        body: form
    }).catch(err => console.error('Email webhook failed:', err));
    console.log('Email notification sent for', pendingEmailData.email, siteUrl);
}

// ── Toast ─────────────────────────────────────────────────────

function showToast(msg) {
    const toast = document.getElementById('errorToast');
    document.getElementById('toastMsg').textContent = msg;
    toast.classList.add('visible');
    setTimeout(() => toast.classList.remove('visible'), 4000);
}

// ── 預覽模式（?preview=loading|deploy|success|fail）────────────

window.addEventListener('load', function () {
    const p = new URLSearchParams(location.search).get('preview');
    if (!p) return;

    const demoData = { success: true, site_url: 'https://crazyailife03.github.io/preview-12345678/' };

    if (p === 'success') {
        prepareResult(demoData);
        document.getElementById('resultOverlay').classList.add('visible');
    } else if (p === 'fail') {
        prepareResult({ success: false, message: '架設過程發生問題，請聯絡我們處理。' });
        document.getElementById('resultOverlay').classList.add('visible');
    } else if (p === 'loading') {
        showLoading();
        startStepAnimation();
    } else if (p === 'deploy') {
        prepareResult(demoData);
        showLoading();
        startDeployCountdown();
    }
});
