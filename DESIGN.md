# Design System：gas-auth-spa-template

本文件定義專案的設計語言與元件規範。所有 UI 開發應遵循以下規則。

---

## 1. 設計原則

- **清晰優先**：身分認證流程必須直覺無障礙
- **品牌一致性**：以青色為核心，傳達信任與安全
- **輕量優雅**：無多餘裝飾，glassmorphism 點綴提升層次感
- **角色可識別**：各角色儀表板透過佈局差異傳達權限層級

---

## 2. 色彩系統

| Token | Tailwind 類別 | HEX | 用途 |
|-------|--------------|-----|------|
| `primary` | `bg-primary` / `text-primary` | `#0891B2` | 品牌色、主要按鈕、連結 |
| `secondary` | `bg-secondary` / `text-secondary` | `#22D3EE` | 次要元素、hover 強化 |
| `cta` | `bg-cta` / `text-cta` | `#22C55E` | 呼籲動作（新增帳號等） |
| `background` | `bg-background` | `#ECFEFF` | 頁面背景 |
| `darkText` | `text-darkText` | `#164E63` | 標題、強調文字 |
| `white` | `bg-white` | `#FFFFFF` | 卡片、輸入框背景 |
| `gray-900` | `text-gray-900` | `#111827` | 主要內文 |
| `gray-500` | `text-gray-500` | `#6B7280` | 次要說明文字 |
| `gray-400` | `text-gray-400` | `#9CA3AF` | 頁尾、disabled |
| `red-500` | `text-red-500` | `#EF4444` | 錯誤、未授權 |
| `red-50` / `red-700` | `bg-red-50` / `text-red-700` | `#FEF2F2` / `#B91C1C` | 錯誤訊息區塊 |

**漸層**：登入頁面背景使用 `from-primary to-darkText`（`#0891B2 → #164E63`）

---

## 3. 字體系統

- **字體家族**：`Fira Sans`（Google Font），fallback `sans-serif`
- **字重**：300 (light)、400 (regular)、500 (medium)、600 (semibold)、700 (bold)
- **階層**：

| 元素 | 尺寸 | 字重 | 顏色 |
|------|------|------|------|
| 頁面標題 (h1) | `text-3xl` (1.875rem) | `font-extrabold` | `text-darkText` |
| 登入標題 | `text-3xl` | `font-bold italic` | `text-gray-900` |
| 區塊標題 (h3) | `text-xl` (1.25rem) / `text-lg` (1.125rem) | `font-bold` | `text-darkText` |
| 品牌名稱 | `text-xl` (1.25rem) | `font-bold tracking-tight` | `text-primary` |
| 內文 | `text-sm` (0.875rem) / `text-base` | `leading-relaxed` | `text-gray-500` |
| 角色徽章 | `text-xs` (0.75rem) | `font-medium` | `text-cyan-600` |
| 版權頁尾 | `text-xs` (0.75rem) | normal | `text-gray-400` |

---

## 4. 間距系統

使用 Tailwind 預設間距，關鍵值：

| Token | 值 | 常用場景 |
|-------|----|---------|
| `p-4` | 1rem (16px) | 區塊內距 |
| `p-6` | 1.5rem (24px) | 卡片內距 |
| `p-8` | 2rem (32px) | 大卡片內距 |
| `p-10` | 2.5rem (40px) | 登入/未授權卡片 |
| `gap-3` | 0.75rem (12px) | 水平項目間距 |
| `gap-4` | 1rem (16px) | 按鈕組間距 |
| `gap-6` | 1.5rem (24px) | 網格間距 |
| `gap-8` | 2rem (32px) | 區塊間距 |
| `space-y-8` | 2rem (32px) | 垂直區塊堆疊 |
| `mb-8` | 2rem (32px) | 區段底部間距 |

---

## 5. 圓角系統

| Tailwind | 值 | 用途 |
|----------|----|------|
| `rounded-lg` | 8px | 按鈕、小元件 |
| `rounded-xl` | 12px | 一般元件 |
| `rounded-2xl` | 16px | 卡片、輸入框、圖示容器 |
| `rounded-3xl` | 24px | 大卡片、登入面板 |
| `rounded-full` | 9999px | 徽章、頭像 |

---

## 6. 陰影系統

| Tailwind | 值 | 用途 |
|----------|----|------|
| `shadow-lg` | `0 10px 15px -3px rgb(0 0 0 / 0.1)` | 導覽列、卡片 hover |
| `shadow-xl` | `0 20px 25px -5px rgb(0 0 0 / 0.1)` | 登入卡片 |
| `shadow-2xl` | `0 25px 50px -12px rgb(0 0 0 / 0.25)` | 登入卡片（強化） |
| `shadow-cyan-200` | 搭配 `shadow-lg` 彩色陰影 | CTA 按鈕 |

---

## 7. 關鍵元件規格

### 7.1 Glass Card（玻璃卡片）
```
背景: rgba(255, 255, 255, 0.8)
backdrop-filter: blur(12px)
邊框: 1px solid rgba(8, 145, 178, 0.1)
圓角: rounded-2xl
陰影: shadow-lg
Hover: shadow-xl
```

### 7.2 導覽列 (Navbar)
```
定位: fixed top-4 left-4 right-4 (z-40)
容器: glass-card + rounded-2xl + shadow-lg
內距: px-6 py-3
品牌圖示: 24x24 bg-primary rounded-lg
品牌文字: text-xl font-bold tracking-tight text-primary
角色徽章: text-xs + bg-cyan-100 + rounded-full + px-2 py-0.5
登出按鈕: hover:text-red-500 + hover:bg-red-50 + rounded-xl
```

### 7.3 登入卡片
```
容器: max-w-md, bg-white, rounded-3xl, shadow-2xl, p-8
圖示區: 48x48, bg-cyan-50, rounded-2xl, text-primary
標題: text-3xl, font-bold, text-gray-900, italic
描述: text-gray-500, mb-8
Google 按鈕容器: flex justify-center
```

### 7.4 儀表板卡片
```
容器: glass-card, p-6, rounded-3xl
Hover: shadow-xl, transition-shadow
圖示容器: p-3, rounded-2xl (依情境著色)
數值: text-2xl, font-bold, text-gray-900
標籤: text-gray-500, text-sm
CTA 卡片: bg-cta, text-white, border-none
```

### 7.5 未授權頁面
```
容器: max-w-md, glass-card, rounded-3xl, p-10
頂部邊框: border-t-8, border-red-500
圖示: w-16 h-16, text-red-500
訊息區塊: bg-red-50, text-red-700, rounded-2xl, p-4
按鈕: bg-primary, text-white, rounded-2xl, font-bold, shadow-cyan-200
```

### 7.6 骨架載入 (Skeleton)
```
背景漸層: linear-gradient(90deg, #CFFAFE 25%, #A5F3FC 50%, #CFFAFE 75%)
背景尺寸: 200% 100%
動畫: loading 1.5s infinite (水平滑動)
圓角: rounded-2xl
```

### 7.7 載入遮罩 (Loading Overlay)
```
定位: fixed inset-0 (z-50)
背景: bg-white/80
容器: flex items-center justify-center
旋轉器: w-12 h-12, border-4 border-cyan-100 border-t-primary, animate-spin
```

---

## 8. 互動行為

| 互動 | 規則 |
|------|------|
| Hover 過渡 | `transition-all duration-200` 或 `transition-shadow` |
| 按鈕 hover | `opacity-90`（或特定 hover 背景色） |
| 卡片 hover | `shadow-xl`（提升陰影） |
| 游標 | 所有可點擊元素加 `cursor-pointer` |
| 圖示 | 使用 Lucide Icons（`data-lucide` 屬性），初始化呼叫 `lucide.createIcons()` |

---

## 9. 響應式中斷點

| 斷點 | Tailwind | 行為 |
|------|----------|------|
| 行動 (<640px) | 預設 | 單欄、隱藏使用者名稱 |
| 平板 (≥768px) | `md:` | 儀表板 2 欄網格、顯示使用者名稱 |
| 桌面 (≥1024px) | `lg:` | 儀表板 4 欄網格 |
| 寬螢幕 (≥1280px) | `xl:` | 最大寬度 `max-w-7xl` 置中 |

---

## 10. 圖示系統

- **圖示庫**：Lucide Icons（CDN: `https://unpkg.com/lucide@latest`）
- **使用方式**：`<i data-lucide="icon-name" class="w-5 h-5"></i>`
- **初始化**：`lucide.createIcons()`（在 `load` 事件及動態內容渲染後呼叫）
- **常用圖示**：`shield-check`、`layout-dashboard`、`users`、`activity`、`settings`、`plus-circle`、`log-out`、`database`、`book-open`、`award`、`lock`、`refresh-cw`

---

## 11. 禁止模式 (Anti-Patterns)

- ❌ **禁用 emoji 作為圖示** — 一律使用 Lucide SVG 圖示
- ❌ **避免 raw CSS 覆蓋 Tailwind 工具類別** — 全域樣式僅限於 `body`、`.spa-section`、`.active`、`.skeleton`、`.glass-card`
- ❌ **不可即時切換狀態無過渡** — 所有 hover/focus 狀態需有 `transition-*`
- ❌ **避免低對比文字** — 維持 4.5:1 最小對比度
- ❌ **避免遺漏 `cursor-pointer`** — 所有 `onclick` 元素必須設定
- ❌ **避免在專案中引入第二套圖示庫** — 統一使用 Lucide

---

> 本文件為專案設計語言的唯一權威來源。如有異議以此文件為準。
