import Anthropic from '@anthropic-ai/sdk';
import { parse } from 'node-html-parser';

const STEP3_SYSTEM = `你是一位資深前端工程師。你會收到一份完整的網站 HTML 和用戶選配的功能資料。

你的任務是：分析 HTML 結構，為每個選配功能決定最佳的插入位置，並生成對應的 HTML 片段。

## 重要原則

- 你不能輸出或修改原始 HTML 的任何內容
- 你只能輸出要「新增」的 HTML 片段，以及插入的目標位置
- 生成的 HTML 片段必須沿用原 HTML 的設計語言（CSS custom properties、色彩、字型、border-radius 等）
- 先讀懂原 HTML 的設計風格，生成的片段要視覺上融入原設計

## 輸出格式（嚴格遵守）

直接輸出 JSON，不加任何說明或 markdown。格式如下：

{
  "insertions": [
    {
      "selector": "CSS選擇器（用於找到插入目標元素）",
      "method": "prepend | append | replace | before | after",
      "html": "要插入的 HTML 片段字串"
    }
  ]
}

## 各功能的插入建議

**公告/促銷 banner**
- selector: "body"，method: "prepend"
- 插在頁面最頂部，寬版橫幅，有關閉按鈕（onclick="this.parentElement.style.display='none'"）

**社群媒體連結**
- 優先尋找模板中已有社群圖標的容器（footer 內含 "fa-" 類名、或含 href="#" 的社群連結的父層 div/nav/ul），method: "replace"（用有實際 href 的連結取代全部佔位圖標）
- 若找不到，selector: "footer"，method: "append"
- 只產生用戶有提供的平台連結，不產生用戶未提供的平台
- 使用 Font Awesome 圖示（fa-brands fa-line、fa-facebook-f、fa-instagram、fa-youtube），target="_blank" rel="noopener"

**Google 地圖**
- 優先尋找模板中已有地圖佔位元素（含 "map"、"地圖"、"location" 類名或文字的 div/section，或已有 iframe[src*="maps"]），method: "replace"
- 若找不到，selector: 找聯絡/地點相關的 section 或 div，method: "append"
- 使用 <iframe> embed，src 格式：https://maps.google.com/maps?q=地址&output=embed，寬 100%，高 350px，border: none

**營業時間**
- 優先尋找模板中已有的營業時間元素（含 "時間"、"hours"、"hour"、"business" 文字的 p、div、li 等元素），method: "replace"（用實際內容取代佔位文字，保留原元素結構）
- 若找不到現有營業時間元素，selector: 找聯絡相關 section 或 footer，method: "append"，清晰排版可多行

**預約連結**
- 優先尋找模板中含 "預約"、"booking"、"appointment" 文字且 href="#" 的 a 元素，method: "replace"（直接更換整個按鈕 html，保留樣式）
- 若找不到，selector: 找 hero section 或主要 CTA 區域，method: "append"，按鈕風格沿用原設計

**線上訂購連結**
- 優先尋找模板中含 "訂購"、"order"、"shop"、"購買" 文字且 href="#" 的 a 元素，method: "replace"
- 若找不到，selector: 找 hero 或 services 附近，method: "append"，按鈕風格沿用原設計

**菜單 PDF 按鈕**
- selector: 找適合的區域（services 或 contact 附近），method: "append"
- href="#menu-pdf"，文字「查看菜單」

## 注意事項

- selector 必須是在該 HTML 中實際存在的元素
- 若某項選配資料為空，不要生成對應的 insertion
- insertions 陣列可以是空陣列（表示沒有任何需要新增的內容）
- JSON 必須完全合法，可直接被 JSON.parse() 解析`;

async function step3(selectedHtml, form2Data, siteName, apiKey) {
    const {
        lineUrl, facebookUrl, instagramUrl, youtubeUrl,
        includeMap, businessHours, announcement, bookingUrl, orderUrl,
        hasPdf, address
    } = form2Data;

    const features = [];
    if (announcement)                  features.push(`公告/促銷訊息：${announcement}`);
    if (lineUrl)                       features.push(`LINE 帳號連結：${lineUrl}`);
    if (facebookUrl)                   features.push(`Facebook 連結：${facebookUrl}`);
    if (instagramUrl)                  features.push(`Instagram 連結：${instagramUrl}`);
    if (youtubeUrl)                    features.push(`YouTube 連結：${youtubeUrl}`);
    if (includeMap === '1' && address) features.push(`Google 地圖嵌入，地址：${address}`);
    if (businessHours)                 features.push(`營業時間：\n${businessHours}`);
    if (bookingUrl)                    features.push(`線上預約連結：${bookingUrl}`);
    if (orderUrl)                      features.push(`線上訂購連結：${orderUrl}`);
    if (hasPdf)                        features.push('菜單/型錄 PDF 下載按鈕（href="#menu-pdf"）');

    if (features.length === 0) return selectedHtml;

    const client = new Anthropic({ apiKey });

    const userText = `以下是「${siteName || '商家'}」網站的完整 HTML。

請分析此 HTML 的結構與設計風格，然後為以下選配功能決定最佳插入位置，並生成對應的 HTML 片段。

## 需要新增的功能
${features.map((f, i) => `${i + 1}. ${f}`).join('\n')}

## 原始 HTML（僅供分析，不能在輸出中重複）
${selectedHtml}`;

    const response = await client.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 4096,
        system: STEP3_SYSTEM,
        messages: [{ role: 'user', content: userText }]
    });

    const text = response.content[0].text.trim();
    const jsonMatch = text.match(/```(?:json)?\s*([\s\S]+?)\s*```/) || [null, text];
    const parsed = JSON.parse(jsonMatch[1]);

    if (!Array.isArray(parsed.insertions)) {
        throw new Error('Step 3 returned invalid JSON structure');
    }

    return applyInsertions(selectedHtml, parsed.insertions);
}

function applyInsertions(baseHtml, insertions) {
    const root = parse(baseHtml, { comment: true });

    for (const { selector, method, html } of insertions) {
        if (!html || !selector) continue;
        const target = root.querySelector(selector);
        if (!target) {
            console.warn(`[Step3] selector not found: ${selector}`);
            continue;
        }
        if (method === 'prepend')      target.set_content(html + target.innerHTML);
        else if (method === 'append')  target.set_content(target.innerHTML + html);
        else if (method === 'replace') target.set_content(html);
        else if (method === 'before')  target.insertAdjacentHTML('beforebegin', html);
        else if (method === 'after')   target.insertAdjacentHTML('afterend', html);
    }

    return root.toString();
}

export async function onRequestPost(context) {
    const { request, env } = context;

    try {
        const formData = await request.formData();

        const selectedHtml = formData.get('selectedHtml');
        const siteName     = formData.get('siteName') || '';
        const address      = formData.get('address')  || '';

        if (!selectedHtml) {
            return new Response(JSON.stringify({ error: 'Missing selectedHtml' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const form2Data = {
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
            address,
        };

        const html = await step3(selectedHtml, form2Data, siteName, env.ANTHROPIC_API_KEY);

        return new Response(JSON.stringify({ html }), {
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (err) {
        console.error('[/api/enhance]', err);
        return new Response(JSON.stringify({ error: err.message || 'Enhance failed' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
