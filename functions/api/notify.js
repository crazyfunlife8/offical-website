import { Resend } from 'resend';

function esc(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function json(body, status = 200) {
    return new Response(JSON.stringify(body), {
        status,
        headers: { 'Content-Type': 'application/json' }
    });
}

function buildNotificationHtml({ email }) {
    return `
<html><body style="font-family:sans-serif;color:#222;max-width:680px;margin:0 auto">
<h2 style="background:#1a1a1a;color:#FFD600;padding:1rem 1.5rem;margin:0">
    預約系統：有人登記搶先通知
</h2>
<table style="width:100%;border-collapse:collapse;margin-top:0.5rem">
    <tr>
        <td style="padding:6px 14px;color:#888;white-space:nowrap;width:110px">Email</td>
        <td style="padding:6px 14px;border-bottom:1px solid #f0f0f0">${esc(email)}</td>
    </tr>
</table>
<p style="color:#aaa;font-size:0.82rem;padding:1rem 1.5rem 0">
    此郵件由官網預約系統頁（/services/booking）的 Email 登記自動發送。
</p>
</body></html>`;
}

export async function onRequestPost(context) {
    const { request, env } = context;

    try {
        const body  = await request.json().catch(() => ({}));
        const email = String(body.email || '').trim();

        if (!email || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return json({ error: 'Email 格式不正確' }, 400);
        }

        const resend = new Resend(env.RESEND_API_KEY);
        const FROM   = env.MAIL_FROM || 'onboarding@resend.dev';

        const { error } = await resend.emails.send({
            from:    `官網預約登記 <${FROM}>`,
            to:      [env.NOTIFY_EMAIL],
            subject: `[預約系統登記] ${email}`,
            html:    buildNotificationHtml({ email }),
        });
        if (error) throw new Error(error.message || 'Send failed');

        return json({ success: true });

    } catch (err) {
        console.error('[/api/notify]', err);
        return json({ error: err.message || 'Submit failed' }, 500);
    }
}
