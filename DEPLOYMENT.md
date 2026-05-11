# 創巢數位官網 nestdigitalai.com 部署紀錄

**最後更新：2026-05-11 18:55 +0800**

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
| 部署方式 | 手動（Wrangler Direct Upload，尚未啟用 GitHub CI/CD） |

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

## 四、重新部署步驟（目前手動模式）

每次程式碼更新到 GitHub main 後，網站**不會自動更新**，需手動執行以下流程：

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
  --commit-dirty=true
```

或若需從 GitHub main 最新版部署（確保跟 GitHub 同步）：
```bash
set -a; source "/c/Users/user-45664/Desktop/Claude AI相關/部落格/.claude/secrets.local.env"; set +a
cd /tmp && rm -rf cf-deploy && mkdir cf-deploy && cd cf-deploy
gh repo clone crazyfunlife8/offical-website repo -- --depth=1 --branch=main
cd repo
npx --yes wrangler@latest pages deploy . --project-name=nestdigitalai --branch=main --commit-dirty=true
```

部署完成後，Wrangler 會輸出新的 deployment 子網址（如 `https://xxxxxxxx.nestdigitalai.pages.dev`），自訂網域 `nestdigitalai.com` 會自動指向最新一次部署。

**未來 session 部署指引（避免重複提問 token）：**
- token 永遠從上述部落格 secrets.local.env 路徑讀取（不複製、不另存）
- NEW創巢官網 本地 `.claude/secrets.local.env` **不存在也不該建**，避免 token 散落多處增加洩漏風險
- 此規範同步寫進 `~/.claude/projects/.../memory/project_nestdigital.md`，未來 session 自動知道

## 五、啟用自動部署（未來可選）

要做到「push 到 main 自動觸發部署」需要建立 GitHub App OAuth 連線。此步驟**必須本人用瀏覽器操作**（GitHub OAuth 流程不能 API 代做）。

**步驟：**
1. Discipline0305 用瀏覽器登入 Cloudflare
2. 進 Workers 和 Pages → 點 `nestdigitalai` 專案 → Settings → Builds & deployments → Connect to Git
3. 跳到 GitHub 授權頁，用 `Crazypig0305` 帳號 Authorize「Cloudflare Workers and Pages」App
4. 安裝範圍勾 `offical-website`
5. 之後每次 push 到 main 自動觸發 build & deploy

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
