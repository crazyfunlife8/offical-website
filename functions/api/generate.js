import Anthropic from '@anthropic-ai/sdk';

const SYSTEM_PROMPT = `你是一位資深前端工程師兼視覺設計師，專精於替中小商家打造精美的響應式單頁網站。

你將收到商家的基本資料，必須生成 3 種完全不同風格的單頁網站完整 HTML。

## 輸出規範

- 直接輸出 JSON，不加任何說明或 markdown 包裝
- 每份 HTML 必須是完整、可獨立運行的 <!DOCTYPE html> 文件
- 使用內嵌 CSS（<style> 標籤），不依賴外部 CDN
- 若有提供圖片 URL，將其嵌入 hero 或 gallery 區塊；若無，使用 CSS 漸層背景
- 必須響應式（RWD），手機優先，使用 flexbox 或 grid
- 不使用 JavaScript 動態功能（靜態 HTML 即可）
- HTML 可適當壓縮，避免過多空行

## JSON 輸出格式（嚴格遵守，不加 markdown 包裝）

{"designs":[{"style_name":"風格名稱（中文5字內）","palette":{"primary":"#hex","accent":"#hex","secondary":"#hex","background":"#hex","text":"#hex"},"html":"完整HTML字串"},{"style_name":"...","palette":{...},"html":"..."},{"style_name":"...","palette":{...},"html":"..."}]}

## 三種風格

1. **現代簡約**：白底、幾何排版、大量留白、單一強調色（藍或綠）、無襯線字體
2. **溫暖親切**：暖色系（米黃/橙/磚紅）、圓角設計、親切感、適合餐飲/生活服務
3. **專業沉穩**：深色背景（深藍/深灰）、金色或青色點綴、企業感、適合B2B/專業服務

## 每種風格必包含的區塊

- Hero：商家名稱大標 + 一句話描述 + 聯絡/預約 CTA 按鈕
- 服務/產品介紹：3 項，各有標題 + 簡短說明
- 關於我們：1-2 句話
- 聯絡資訊：電話、地址（若有）
- Footer：© 商家名稱`;

async function signCloudinary(params, apiSecret) {
    const str = Object.keys(params).sort().map(k => `${k}=${params[k]}`).join('&') + apiSecret;
    const data = new TextEncoder().encode(str);
    const hashBuffer = await crypto.subtle.digest('SHA-1', data);
    return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
}

async function uploadToCloudinary(file, env) {
    try {
        const timestamp = Math.floor(Date.now() / 1000).toString();
        const params = { timestamp };
        const signature = await signCloudinary(params, env.CLOUDINARY_API_SECRET);

        const fd = new FormData();
        fd.append('file', file);
        fd.append('api_key', env.CLOUDINARY_API_KEY);
        fd.append('timestamp', timestamp);
        fd.append('signature', signature);

        const res = await fetch(
            `https://api.cloudinary.com/v1_1/${env.CLOUDINARY_CLOUD_NAME}/image/upload`,
            { method: 'POST', body: fd }
        );
        if (!res.ok) return null;
        const data = await res.json();
        return data.secure_url || null;
    } catch {
        return null;
    }
}

async function fetchUnsplashPhoto(query, env) {
    if (!env.UNSPLASH_ACCESS_KEY) return null;
    try {
        const res = await fetch(
            `https://api.unsplash.com/photos/random?query=${encodeURIComponent(query)}&orientation=landscape&client_id=${env.UNSPLASH_ACCESS_KEY}`
        );
        if (!res.ok) return null;
        const data = await res.json();
        return data.urls?.regular || null;
    } catch {
        return null;
    }
}

export async function onRequestPost(context) {
    const { request, env } = context;

    try {
        const formData = await request.formData();

        const siteName     = (formData.get('siteName')     || '').trim();
        const industry     = (formData.get('industry')     || '').trim();
        const businessDesc = (formData.get('businessDesc') || '').trim();
        const services     = (formData.get('services')     || '').trim();
        const email        = (formData.get('email')        || '').trim();
        const phone        = (formData.get('phone')        || '').trim();
        const address      = (formData.get('address')      || '').trim();

        if (!siteName || !industry) {
            return new Response(JSON.stringify({ error: 'Missing required fields' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Upload user images to Cloudinary
        const imageUrls = [];
        if (env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET && env.CLOUDINARY_CLOUD_NAME) {
            const imageFiles = formData.getAll('images');
            for (const file of imageFiles) {
                if (file instanceof File && file.size > 0) {
                    const url = await uploadToCloudinary(file, env);
                    if (url) imageUrls.push(url);
                }
            }
        }

        // Fetch stock photo from Unsplash as fallback
        if (imageUrls.length === 0) {
            const stockPhoto = await fetchUnsplashPhoto(industry, env);
            if (stockPhoto) imageUrls.push(stockPhoto);
        }

        const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });

        const userMessage = `請為以下商家生成 3 種不同風格的完整網站 HTML。

商家名稱：${siteName}
行業類別：${industry}
商家描述：${businessDesc}
主要服務/產品：${services}
聯絡電話：${phone}
地址：${address || '未提供'}
Email：${email || '未提供'}

${imageUrls.length > 0
    ? `可用圖片（嵌入 hero 或 gallery）：\n${imageUrls.map((u, i) => `${i + 1}. ${u}`).join('\n')}`
    : '無圖片，使用 CSS 漸層背景'}

請嚴格按照系統規範的 JSON 格式輸出，直接輸出 JSON，不加任何說明。`;

        const response = await client.messages.create({
            model: 'claude-haiku-4-5-20251001',
            max_tokens: 12000,
            system: SYSTEM_PROMPT,
            messages: [{ role: 'user', content: userMessage }]
        });

        const text = response.content[0].text.trim();

        // Extract JSON (handle potential markdown wrapping)
        const jsonMatch = text.match(/\{[\s\S]*\}$/m) || text.match(/\{[\s\S]*\}/);
        const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : text);

        if (!Array.isArray(parsed.designs) || parsed.designs.length < 3) {
            throw new Error('Invalid response: less than 3 designs returned');
        }

        return new Response(JSON.stringify({ designs: parsed.designs }), {
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (err) {
        console.error('[/api/generate]', err);
        return new Response(JSON.stringify({ error: err.message || 'Generate failed' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
