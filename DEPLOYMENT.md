# 創巢數位官網 nestdigitalai.com 部署紀錄

**最後更新：2026-06-24 02:30 +0800**

---

## 一、目前部署事實（持續更新）

| 項目 | 內容 |
|---|---|
| 線上網址 | https://nestdigitalai.com（apex）、https://www.nestdigitalai.com |
| 部署平台 | Cloudflare Pages |
| Pages 專案名稱 | `nestdigitalai` |
| Cloudflare 子網域 | `nestdigitalai.pages.dev` |
| 來源 Repo | https://github.com/crazyfunlife8/offical-website（main 分支） |
| HTTPS 憑證 | Cloudflare Universal SSL（自動續約） |
| CDN Proxy | 開啟（橙雲） |
| 部署方式 | **GitHub Actions 自動部署**（push main 觸發、底層仍走 Wrangler Direct Upload）；本地手動 `wrangler pages deploy` 仍可並用 |

## 二、Cloudflare 帳戶資源

- **帳戶**：Discipline0305@gmail.com（Super Administrator）
- **Account ID**：`ddec233d5df4739ab8d5ec9567756ffd`
- **Zone ID（nestdigitalai.com）**：`b7561c811d18762105d02ac412029243`

**DNS 紀錄（皆為 proxied CDN 模式）：**

| 名稱 | 類型 | 指向 |
|---|---|---|
| `nestdigitalai.com` | CNAME | `nestdigitalai.pages.dev` |
| `www.nestdigitalai.com` | CNAME | `nestdigitalai.pages.dev` |

## 三、部署架構決策

**為什麼選 Cloudflare Pages（非繼續用 GitHub Pages）：**

- 自訂網域 `nestdigitalai.com` 的 DNS 本來就託管於 Cloudflare
- 與其用 GitHub Pages 設 CNAME 再讓 Cloudflare 反代，不如直接由 Cloudflare 一條龍：原始檔案儲存、CDN 分發、SSL、DNS 全在同一平台
- 部署速度、快取規則、未來擴充（如要加 Workers 動態邏輯）都更直接

**GitHub Pages 現況：**
- 仍可訪問 https://crazyfunlife8.github.io/offical-website/（作為備援）
- 無自訂網域（CNAME 檔案已於 commit `006ec1c Delete CNAME` 刪除）
- 如要關閉：repo Settings → Pages → Source 設為 None

## 四、手動部署（fallback：GHA 失敗時 retry／本地測試用）

現在 push 到 GitHub `main` 由 **GitHub Actions 自動部署**（見 §一）、無需手動。以下手動流程**僅在 GHA 失敗需 retry、或要從本地 working tree 直接測試部署時**使用：

**API Token 統一來源（單一事實）：**
```
C:\Users\user-45664\Desktop\Claude AI相關\部落格\.claude\secrets.local.env
```
（與部落格代管事業共用同一 Cloudflare 帳號 Discipline0305@gmail.com；token rotate 時更新該檔即可、所有 Cloudflare Pages 專案共享）

**部署指令：**
```bash
# 1. 載入 token + account ID（從部落格 secrets 單一來源讀取，token 不會出現在指令裡）
set -a
source "/c/Users/user-45664/Desktop/Claude AI相關/部落格/.claude/secrets.local.env"
set +a

# 2. 從本地 working tree 直接部署（已是 main 最新內容、不需 clone）
cd "/c/Users/user-45664/Desktop/Claude AI相關/數位印鈔機/NEW創巢官網"
npx --yes wrangler@latest pages deploy . \
  --project-name=nestdigitalai \
  --branch=main \
  --commit-dirty=true \
  --commit-message="ASCII-only summary here"
```

**⚠️ 必加 `--commit-message="ASCII 純英文摘要"`**——wrangler 預設把 git HEAD commit message 連同中文 body 傳給 Cloudflare API；API 用 UTF-8 嚴格驗證、含中文一律回 `code: 8000111 Invalid commit message`。即使 git commit 首行純 ASCII、body 中文仍會觸發。解法：用 `--commit-message` 覆寫成純 ASCII 短句（git commit 本身仍可繁中、僅 deploy 訊息要 ASCII）。

或若需從 GitHub main 最新版部署（確保跟 GitHub 同步）：
```bash
set -a; source "/c/Users/user-45664/Desktop/Claude AI相關/部落格/.claude/secrets.local.env"; set +a
cd /tmp && rm -rf cf-deploy && mkdir cf-deploy && cd cf-deploy
gh repo clone crazyfunlife8/offical-website repo -- --depth=1 --branch=main
cd repo
npx --yes wrangler@latest pages deploy . --project-name=nestdigitalai --branch=main --commit-dirty=true --commit-message="ASCII summary"
```

部署完成後，Wrangler 會輸出新的 deployment 子網址（如 `https://xxxxxxxx.nestdigitalai.pages.dev`），自訂網域 `nestdigitalai.com` 會自動指向最新一次部署。

**未來 session 部署指引（避免重複提問 token）：**
- token 永遠從上述部落格 secrets.local.env 路徑讀取（不複製、不另存）
- NEW創巢官網 本地 `.claude/secrets.local.env` **不存在也不該建**，避免 token 散落多處增加洩漏風險
- 此規範同步寫進 `~/.claude/projects/.../memory/project_nestdigital.md`，未來 session 自動知道

## 五、自動部署（2026-05-12 啟用：GitHub Actions + wrangler）

**為什麼不走 Cloudflare 原生 Git Integration**：`nestdigitalai` project 當初用 Direct Upload mode 建立、官方規定 Direct Upload 與 Git Integration mode **不可互轉**（[Cloudflare docs](https://developers.cloudflare.com/pages/get-started/direct-upload/)）。若要 Git Integration 必須砍掉重建 project + 移轉自訂網域 + 失去現有 8 個 deployment 快照（a25dbace 等永久 URL 全失效）—— 切換代價過大。

**替代方案**：用 GitHub Actions + `cloudflare/wrangler-action@v3` 自動跑 wrangler pages deploy。完全不動 Cloudflare project、保留所有歷史快照、效果跟原生 git integration 一樣（push main → 自動 deploy production）。

**Workflow 檔案**：`.github/workflows/deploy.yml`（main branch push 或 workflow_dispatch 觸發）

**所需 GitHub Repo Secrets**（一次性設定）：
1. 開 https://github.com/crazyfunlife8/offical-website/settings/secrets/actions
2. 點 **New repository secret**，加兩個：
   - Name: `CLOUDFLARE_API_TOKEN` / Value: 從部落格 `.claude/secrets.local.env` 複製 `cfut_xxx` token
   - Name: `CLOUDFLARE_ACCOUNT_ID` / Value: `ddec233d5df4739ab8d5ec9567756ffd`

**驗證流程**：
1. 加完 secrets 後、push 任何 commit 到 main → GitHub Actions tab 自動跑 deploy job
2. job 完成後 nestdigitalai.com 即生效（通常 1-2 分鐘）
3. 若 secrets 設定前已有 workflow run 失敗、可在 GitHub Actions UI 點該 run → Re-run（無需重新 push）

**Preview branch 工作流**（C 方案限制）：
- 推到非 main branch **不會** trigger GitHub Actions 部署
- 若需要 preview URL（同事 review 用），仍由本人在本地跑：
  ```bash
  npx --yes wrangler@latest pages deploy . --project-name=nestdigitalai --branch=preview-xxx --commit-dirty=true --commit-message="preview xxx"
  ```
- 跑完會給獨立 deployment URL、不影響主網域

## 六、權限配置

**Cloudflare 帳戶成員：**

| 成員 | 角色 / 權限原則 |
|---|---|
| Discipline0305@gmail.com | Super Administrator（帳戶擁有者） |
| crazyfunlife8@gmail.com | 個別網域 `nestdigitalai.com` + Domain Administrator 等網域級角色；帳戶層級 + Workers Platform Admin |

**已知限制：** Cloudflare 規定「建立 Workers Builds / Pages Git Connection」需要 Administrator 等級權限，Workers Platform Admin 不足。crazyfunlife8 若要自行啟用 GitHub CI/CD，需主帳號代為完成 OAuth 連線（一次性設定）。

**GitHub Repo 協作者：**

| 帳號 | 角色 |
|---|---|
| crazyfunlife8 | Owner |
| Crazypig0305 | Collaborator (write) |

## 七、部署歷史

| 時間（UTC+8） | 部署 ID | 變更內容 |
|---|---|---|
| 2026-05-11 19:30 | `40ebbf39` | 初次部署：從 GitHub Pages 遷移至 Cloudflare Pages，綁定 `nestdigitalai.com` + `www.nestdigitalai.com`，HTTPS 自動啟用 |

---

## 文件性質說明

本文件為**持續更新型**——每次重新部署或調整架構時需更新「最後更新時間」、「部署歷史」表，必要時更新「目前部署事實」欄位。
