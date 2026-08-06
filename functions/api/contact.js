import { Resend } from 'resend';

function esc(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function buildNotificationHtml({ name, contact, service, budget, message }) {
    const row = (label, val) => val
        ? `<tr>
            <td style="padding:6px 14px;color:#888;white-space:nowrap;width:110px;vertical-align:top">${label}</td>
            <td style="padding:6px 14px;border-bottom:1px solid #f0f0f0">${val}</td>
           </tr>`
        : '';

    return `
<html><body style="font-family:sans-serif;color:#222;max-width:680px;margin:0 auto">
<h2 style="background:#1a1a1a;color:#FFD600;padding:1rem 1.5rem;margin:0">
    官網詢問：${esc(name)}
</h2>
<table style="width:100%;border-collapse:collapse;margin-top:0.5rem">
    ${row('姓名', esc(name))}
    ${row('聯絡方式', esc(contact))}
    ${row('服務項目', esc(service))}
    ${row('預算範圍', esc(budget) || '未填寫')}
    ${row('需求描述', esc(message).replace(/\n/g, '<br>'))}
</table>
<p style="color:#aaa;font-size:0.82rem;padding:1rem 1.5rem 0">
    此郵件由官網聯絡表單自動發送。
</p>
</body></html>`;
}

function buildConfirmationHtml({ name, service }) {
    return `
<html>
<body style="font-family:sans-serif;color:#222;max-width:580px;margin:0 auto;padding:0 16px">
    <div style="background:#1a1a1a;padding:1.5rem 2rem;border-radius:8px 8px 0 0;margin-top:2rem">
        <p style="margin:0 0 4px;font-size:0.78rem;letter-spacing:2px;opacity:0.7;color:#00c8ff">
            NEST DIGITAL · 創巢數位
        </p>
        <h2 style="margin:0;font-size:1.4rem;color:#e8f0ff">
            訊息已收到，我們會盡快回覆！
        </h2>
    </div>
    <div style="border:1px solid #e0e0e0;border-top:none;border-radius:0 0 8px 8px;padding:2rem">
        <p style="color:#444;line-height:1.8">
            嗨，<strong>${esc(name)}</strong>！<br>
            感謝你詢問「<strong>${esc(service)}</strong>」，<br>
            我們將在 <strong>1–2 個工作天</strong>內與你聯繫。
        </p>
        <div style="background:#f0fcff;border:1px solid #00c8ff;border-radius:6px;padding:1rem 1.5rem;margin-top:1.5rem">
            <p style="margin:0;color:#555;font-size:0.88rem">
                有急事也可以直接 LINE 我們：<br>
                <a href="https://line.me/R/ti/p/@604vqsva"
                   style="color:#1a1a1a;font-weight:bold">@604vqsva</a>
            </p>
        </div>
        <p style="color:#ccc;font-size:0.78rem;margin-top:2rem">
            此為系統自動發送的確認信，請勿直接回覆此郵件。
        </p>
    </div>
</body>
</html>`;
}

export async function onRequestPost(context) {
    const { request, env } = context;

    try {
        const formData = await request.formData();

        // Honeypot：機器人填了這個欄位就靜默丟掉
        if (formData.get('_url')) {
            return new Response(JSON.stringify({ success: true }), {
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const name    = (formData.get('name')    || '').trim();
        const contact = (formData.get('contact')  || '').trim();
        const service = (formData.get('service')  || '').trim();
        const budget  = (formData.get('budget')   || '').trim();
        const message = (formData.get('message')  || '').trim();

        if (!name || !contact || !service || !message) {
            return new Response(JSON.stringify({ error: '必填欄位不完整' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const resend = new Resend(env.RESEND_API_KEY);
        const FROM   = env.MAIL_FROM || 'onboarding@resend.dev';

        const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact);

        const sends = [
            resend.emails.send({
                from:    `官網詢問 <${FROM}>`,
                to:      [env.NOTIFY_EMAIL],
                subject: `[詢問] ${name}｜${service}`,
                html:    buildNotificationHtml({ name, contact, service, budget, message }),
            }),
        ];

        if (isEmail) {
            sends.push(
                resend.emails.send({
                    from:    `創巢數位 Nest Digital <${FROM}>`,
                    to:      [contact],
                    subject: '【收到了！】創巢數位 Nest Digital 訊息確認',
                    html:    buildConfirmationHtml({ name, service }),
                })
            );
        }

        await Promise.all(sends);

        return new Response(JSON.stringify({ success: true }), {
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (err) {
        console.error('[/api/contact]', err);
        return new Response(JSON.stringify({ error: err.message || 'Submit failed' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
