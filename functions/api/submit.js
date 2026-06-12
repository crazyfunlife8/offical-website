import { Resend } from 'resend';

function buildCompanyHtml({ form1, selectedStyleName, form2 }) {
    const f1 = form1;
    const f2 = form2;

    const row = (label, value) => value
        ? `<tr><td style="padding:6px 12px;color:#666;white-space:nowrap">${label}</td><td style="padding:6px 12px">${value}</td></tr>`
        : '';

    return `
<html><body style="font-family:sans-serif;color:#222;max-width:700px;margin:0 auto">
<h2 style="background:#1a1a1a;color:#FFD600;padding:1rem 1.5rem;margin:0">新架站需求：${f1.siteName}</h2>

<h3 style="padding:1rem 1.5rem 0.5rem;margin:0;background:#f5f5f5">表單 1 — 商家基本資料</h3>
<table style="width:100%;border-collapse:collapse;margin-bottom:1.5rem">
${row('商家名稱', f1.siteName)}
${row('行業類別', f1.industry)}
${row('商家描述', f1.businessDesc)}
${row('主要服務', f1.services)}
${row('聯絡 Email', f1.email)}
${row('聯絡電話', f1.phone)}
${row('地址', f1.address)}
</table>

<h3 style="padding:1rem 1.5rem 0.5rem;margin:0;background:#f5f5f5">選定樣板</h3>
<table style="width:100%;border-collapse:collapse;margin-bottom:1.5rem">
${row('樣板風格', selectedStyleName)}
</table>

<h3 style="padding:1rem 1.5rem 0.5rem;margin:0;background:#f5f5f5">表單 2 — 功能性內容</h3>
<table style="width:100%;border-collapse:collapse;margin-bottom:1.5rem">
${row('LINE 帳號', f2.lineUrl)}
${row('Facebook', f2.facebookUrl)}
${row('Instagram', f2.instagramUrl)}
${row('YouTube', f2.youtubeUrl)}
${row('嵌入地圖', f2.includeMap === '1' ? '是' : '否')}
${row('營業時間', f2.businessHours)}
${row('公告/促銷', f2.announcement)}
${row('預約連結', f2.bookingUrl)}
${row('線上訂購', f2.orderUrl)}
${row('菜單 PDF', f2.hasPdf ? '已上傳（見附件）' : '無')}
</table>

<p style="color:#999;font-size:0.85rem;padding:0 1.5rem">此郵件由系統自動發送。完整網站 HTML 請見附件。</p>
</body></html>`;
}

function buildUserHtml({ form1, selectedStyleName, form2 }) {
    const f1 = form1;
    const f2 = form2;

    const row = (label, value) => value
        ? `<tr>
            <td style="padding:8px 16px;color:#888;white-space:nowrap;width:120px">${label}</td>
            <td style="padding:8px 16px;border-bottom:1px solid #f0f0f0">${value}</td>
           </tr>`
        : '';

    const socialItems = [
        f2.lineUrl      && `LINE：${f2.lineUrl}`,
        f2.facebookUrl  && `Facebook：${f2.facebookUrl}`,
        f2.instagramUrl && `Instagram：${f2.instagramUrl}`,
        f2.youtubeUrl   && `YouTube：${f2.youtubeUrl}`,
    ].filter(Boolean);

    const featureItems = [
        f2.includeMap === '1' && 'Google 地圖嵌入',
        f2.businessHours      && '營業時間',
        f2.announcement       && '公告 / 促銷訊息',
        f2.bookingUrl         && '線上預約連結',
        f2.orderUrl           && '線上訂購連結',
        f2.hasPdf             && '菜單 / 型錄 PDF',
    ].filter(Boolean);

    return `
<html>
    <body style="font-family:sans-serif;color:#222;max-width:600px;margin:0 auto;padding:0 16px">
        <div style="background:#1a1a1a;padding:1.5rem 2rem;border-radius:8px 8px 0 0;margin-top:2rem">
            <p style="margin:0 0 4px;font-size:0.8rem;letter-spacing:2px;opacity:0.7;color:#00c8ff">NEST DIGITAL · 一鍵架站</p>
            <h2 style="margin:0;font-size:1.5rem;color:#E8F0ff;">需求已收到，我們會盡快與你聯繫！</h2>
        </div>

        <div style="border:1px solid #e0e0e0;border-top:none;border-radius:0 0 8px 8px;padding:2rem">
            <p style="color:#444;line-height:1.8">嗨，<strong>${f1.siteName}</strong> 您好！<br>
            我們已收到你的架站需求，將在 <strong>1–2 個工作天</strong>內透過 Email 或電話與你確認細節，正式開始製作。</p>

            <h3 style="color:#1a1a1a;border-bottom:2px solid #00c8ff;padding-bottom:6px">你的需求摘要</h3>

            <h4 style="color:#666;margin:1.5rem 0 0.5rem">商家資料</h4>
            <table style="width:100%;border-collapse:collapse">
            ${row('商家名稱', f1.siteName)}
            ${row('行業類別', f1.industry)}
            ${row('聯絡電話', f1.phone)}
            ${row('地址', f1.address)}
            </table>

            <h4 style="color:#666;margin:1.5rem 0 0.5rem">選定樣板</h4>
            <table style="width:100%;border-collapse:collapse">
            ${row('風格名稱', selectedStyleName)}
            </table>

            ${socialItems.length > 0 ? `
            <h4 style="color:#666;margin:1.5rem 0 0.5rem">社群媒體</h4>
            <ul style="margin:0;padding-left:1.5rem;color:#444;line-height:2">
                ${socialItems.map(s => `<li>${s}</li>`).join('')}
            </ul>` : ''}

            ${featureItems.length > 0 ? `
            <h4 style="color:#666;margin:1.5rem 0 0.5rem">選配功能</h4>
            <ul style="margin:0;padding-left:1.5rem;color:#444;line-height:2">
                ${featureItems.map(f => `<li>✓ ${f}</li>`).join('')}
            </ul>` : ''}

            <div style="background:#f0fcff;border:1px solid #00c8ff;border-radius:6px;padding:1rem 1.5rem;margin-top:2rem">
                <p style="margin:0;color:#555;font-size:0.9rem">
                    如有任何問題，歡迎直接透過 LINE 聯繫我們：<br>
                    <a href="https://line.me/R/ti/p/@604vqsva" style="color:#1a1a1a;font-weight:bold">@604vqsva</a>
                </p>
            </div>

            <p style="color:#bbb;font-size:0.8rem;margin-top:2rem">此為系統自動發送的確認信，請勿直接回覆此郵件。</p>
        </div>
    </body>
</html>`;
}

export async function onRequestPost(context) {
    const { request, env } = context;

    try {
        const formData = await request.formData();

        const form1 = {
            siteName:     formData.get('siteName')     || '',
            industry:     formData.get('industry')     || '',
            businessDesc: formData.get('businessDesc') || '',
            services:     formData.get('services')     || '',
            email:        formData.get('email')        || '',
            phone:        formData.get('phone')        || '',
            address:      formData.get('address')      || '',
        };

        const form2 = {
            lineUrl:       formData.get('lineUrl')       || '',
            facebookUrl:   formData.get('facebookUrl')   || '',
            instagramUrl:  formData.get('instagramUrl')  || '',
            youtubeUrl:    formData.get('youtubeUrl')    || '',
            includeMap:    formData.get('includeMap')    || '0',
            businessHours: formData.get('businessHours') || '',
            announcement:  formData.get('announcement')  || '',
            bookingUrl:    formData.get('bookingUrl')    || '',
            orderUrl:      formData.get('orderUrl')      || '',
            hasPdf:        !!formData.get('menuPdf'),
        };

        const selectedStyleName = formData.get('selectedStyleName') || '';
        const selectedHtml      = formData.get('selectedHtml')      || '';
        const pdfFile           = formData.get('menuPdf');

        if (!form1.siteName || !form1.email || !selectedHtml) {
            return new Response(JSON.stringify({ error: 'Missing required fields' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const resend = new Resend(env.RESEND_API_KEY);
        const FROM_ADDRESS = env.MAIL_FROM || 'onboarding@resend.dev';

        const attachments = [];
        if (selectedHtml) {
            attachments.push({
                filename:    `${form1.siteName}-selected.html`,
                content:     btoa(unescape(encodeURIComponent(selectedHtml))),
                contentType: 'text/html',
            });
        }
        if (pdfFile && pdfFile instanceof File) {
            const buffer = await pdfFile.arrayBuffer();
            attachments.push({
                filename:    pdfFile.name || 'menu.pdf',
                content:     btoa(String.fromCharCode(...new Uint8Array(buffer))),
                contentType: 'application/pdf',
            });
        }

        await Promise.all([
            resend.emails.send({
                from:        `一鍵架站系統 <${FROM_ADDRESS}>`,
                to:          [env.NOTIFY_EMAIL],
                subject:     `[新需求] ${form1.siteName} — 一鍵架站`,
                html:        buildCompanyHtml({ form1, selectedStyleName, form2 }),
                attachments,
            }),
            resend.emails.send({
                from:    `創巢數位 Nest Digital <${FROM_ADDRESS}>`,
                to:      [form1.email],
                subject: `【需求確認】${form1.siteName} 的架站需求已收到`,
                html:    buildUserHtml({ form1, selectedStyleName, form2 }),
            }),
        ]);

        return new Response(JSON.stringify({ success: true }), {
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (err) {
        console.error('[/api/submit]', err);
        return new Response(JSON.stringify({ error: err.message || 'Submit failed' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
