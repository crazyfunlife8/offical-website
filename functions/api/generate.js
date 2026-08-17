import Anthropic from '@anthropic-ai/sdk';

// ── 風格池：每次呼叫從 8 種隨機抽 3，確保重新生成有真實差異 ──────────
const STYLE_POOL = [
    {
        name: '現代簡約',
        desc: '明亮底色（白或極淺灰）、大量留白、幾何感排版、無襯線字體、單一強調色（可自選：藍、綠、紫、橙、紅均可）、線條俐落'
    },
    {
        name: '溫暖親切',
        desc: '暖色系底調（米黃、奶油、淺橙、暖沙任選）、圓角設計、親切手感、適合餐飲/美容/生活服務；強調色可走磚紅、橘、金黃'
    },
    {
        name: '專業沉穩',
        desc: '深色背景（深藍、深灰、深墨綠、深紫任選）、高對比點綴色（金/青/白/銀）、企業感、適合 B2B/顧問/法律/金融'
    },
    {
        name: '大膽撞色',
        desc: '黑白骨架＋一到兩個高飽和爆炸色（鮮黃、螢光綠、電藍、桃紅）、雜誌感排版、超大粗標題、強烈視覺衝擊'
    },
    {
        name: '自然有機',
        desc: '大地色調（橄欖綠、赭石、沙漠棕、苔蘚、泥土）、柔和材質感（模擬紙張/布料紋理用 CSS）、手工感、適合有機/永續/健康品牌'
    },
    {
        name: '科技感',
        desc: '深黑或午夜深藍底、霓虹/螢光點綴（電青、亮紫、螢光綠）、等寬或未來感字體、細線條框架元素、適合科技/SaaS/新創'
    },
    {
        name: '典雅精品',
        desc: '米白或象牙底、金色或玫瑰金裝飾細線、有襯線大標搭配細無襯線內文、極大留白、精緻感、適合精品/婚禮/高端服務'
    },
    {
        name: '活潑創意',
        desc: '多色活潑配色（三色以上）、不對稱版面或傾斜分區、圓潤可愛元素、誇張視覺層次、適合兒童/教育/娛樂/寵物'
    },
];

// 版面結構提示：確保 Hero 不永遠是同一種排版
const LAYOUT_HINTS = [
    'Hero 全幅置中（標題 + 副標 + CTA 水平居中）',
    'Hero 左右分欄（左文字右圖片或漸層色塊）',
    'Hero 大圖背景＋疊字（圖片或漸層背景上直接放標題）',
    'Hero 偏移不對稱（標題靠左、圖片或裝飾元素延伸到右側）',
];

const SYSTEM_PROMPT_BASE = `你是一位資深前端工程師兼視覺設計師，專精於替中小商家打造精美的響應式單頁網站。

你將收到商家的基本資料，以及本次指定的 3 種風格，必須生成 3 份完全不同風格的單頁網站完整 HTML。

## 輸出規範

- 直接輸出 JSON，不加任何說明或 markdown 包裝
- 每份 HTML 必須是完整、可獨立運行的 <!DOCTYPE html> 文件
- 使用內嵌 CSS（<style> 標籤）；字型可用 Google Fonts @import，其餘不依賴外部資源
- 若有提供圖片 URL，將其嵌入 hero 或 gallery 區塊；若無，使用 CSS 漸層背景
- 必須響應式（RWD），手機優先，使用 flexbox 或 grid
- 不使用 JavaScript 動態功能（靜態 HTML 即可）
- HTML 可適當壓縮，避免過多空行
- 每份設計必須在視覺上與其他兩份有明顯差異（配色、字體、排版結構三者都要不同）

## JSON 輸出格式（嚴格遵守，不加 markdown 包裝）

{"designs":[{"style_name":"風格名稱（中文5字內）","palette":{"primary":"#hex","accent":"#hex","secondary":"#hex","background":"#hex","text":"#hex"},"html":"完整HTML字串"},{"style_name":"...","palette":{...},"html":"..."},{"style_name":"...","palette":{...},"html":"..."}]}

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

        // 隨機抽 3 種風格（Fisher-Yates shuffle 前 3 個）
        const shuffled = [...STYLE_POOL].sort(() => Math.random() - 0.5);
        const selectedStyles = shuffled.slice(0, 3);
        const variationSeed = Math.floor(Math.random() * 9999);

        // 隨機指派版面結構提示給每個風格（不重複）
        const layoutHints = [...LAYOUT_HINTS].sort(() => Math.random() - 0.5);

        const styleSection = selectedStyles.map((s, i) =>
            `${i + 1}. **${s.name}**：${s.desc}（Hero 版面建議：${layoutHints[i % layoutHints.length]}）`
        ).join('\n');

        const systemPrompt = `${SYSTEM_PROMPT_BASE}\n\n## 本次三種風格（隨機組合 #${variationSeed}）\n\n${styleSection}`;

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

生成序號 #${variationSeed}：請在各風格定義內選擇你認為最適合此商家的具體字體、配色與排版細節，確保三份設計彼此明顯不同，且不落入千篇一律的模板感。
嚴格按照系統規範的 JSON 格式輸出，直接輸出 JSON，不加任何說明。`;

        const response = await client.messages.create({
            model: 'claude-haiku-4-5-20251001',
            max_tokens: 12000,
            system: systemPrompt,
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
