# 清醒行动 (Sober Action) — 完整自我澄清工具 (MVP)

清醒行动是一个面向大学生的自我澄清与行动推进工具。它并不是心理治疗、职业测评或人生预测，不替用户定义人格、职业或未来。它的目标是：帮助用户从一件具体的迷茫或拖延事件出发，分清客观事实、主观解释、现实限制和能动尝试的部分，最终设计出一个可以在两周内完成、能获取真实世界反馈的探索性小实验。

## 🌟 核心理念与设计特点
- **事实与解释分离**：引导用户将客观的事实（无争议的事物和进展）从主观的信念解释（自我批评、未来焦虑、灾难化担忧）中抽离。
- **限制与能动对齐**：理清不可改变的硬性现实（如时间窗口、已有基础），聚焦于可行动和可设计的主动开口。
- **两周实验探索**：设计低成本、周期短、具备【外部世界高交互性、有真实对象/产出】的行动。
- **克制温暖的美学**：采用温暖沉静的白沙/暖白背景、高对比度深灰色正文，搭配克制的森林绿强调色与干练的几何圆角，摒弃花哨的渐变与过度商业化的鸡汤口号。
- **隐私即本地**：用户的对话梳理记录、实验行动卡全量通过 `version 1` 数据结构保存在浏览器 `localStorage` 中。网站提供“清空本地记录”按钮，且绝不在服务端持久化存储任何个人输入隐私。

---

## 🛠️ 技术实现
- **前端核心**：React 19 + TypeScript + Tailwind CSS (Vite 6 构建)
- **后端框架**：Express.js — 完全用于在服务端安全代理解析 DeepSeek API，确保 `DEEPSEEK_API_KEY` 永不泄露到前端浏览器。
- **大模型驱动**：
  - OpenAI 兼容的 chat completions 接口（模型：`deepseek-chat`）
  - 支持 **Demonstration Mode（演示模式）**：当系统检测不到 `DEEPSEEK_API_KEY` 环境变量时，网站能自动检测并降级到由本地智能生成的事实整理和澄清问答中，确保在任何预览环境下，5步流程和两周复盘也都能无缝走通并生成行动卡。
- **数据校验**：使用 `Zod` 进行大模型返回 JSON 的严格解析校验与一次自动修复（Retry）重试机制，防止模型输出乱序。

---

## 🚀 本地运行与配置步骤

### 1. 安装依赖
克隆或拉取代码到本地，并在项目根目录下运行依赖安装指令：
```bash
npm install
```

### 2. 配置环境变量
在项目根目录下创建一个 `.env` 文件（或参考 `.env.example`）：
```env
DEEPSEEK_API_KEY="你的_DEEPSEEK_API_KEY"
```
> *注：如果不填写或不创建此环境变量，网站将自动进入“演示模式”，展示精美预设案例，可流畅完成一整套5步实验创建与复盘归档。*

### 3. 本地启动开发服务器
使用下述指令启动全栈开发环境：
```bash
npm run dev
```
启动成功后，浏览器打开 `http://localhost:3000` 即可开始自我澄清流程。

---

## ☁️ 部署到 Vercel 的步骤

由于本项目采用了 Express.js 代理解析 API，在 Vercel 部署时可以通过 **Vercel Serverless Functions** (或将接口改造为 `api/chat.ts` 形式的 Serverless 函数) 来进行托管。

### 方式 A：标准 Vercel JSON 全栈托管
1. **安装 Vercel CLI** (若尚未安装)：
   ```bash
   npm i -g vercel
   ```
2. **在项目根目录下创建 `vercel.json` 配置文件**：
   ```json
   {
     "version": 2,
     "builds": [
       { "src": "server.ts", "use": "@vercel/node" },
       { "src": "package.json", "use": "@vercel/static-build", "config": { "distDir": "dist" } }
     ],
     "routes": [
       { "src": "/api/(.*)", "dest": "server.ts" },
       { "src": "/assets/(.*)", "dest": "/assets/$1" },
       { "src": "/(.*)", "dest": "/index.html" }
     ]
   }
   ```
3. **部署至 Vercel**：
   在根目录下执行 `vercel`，并按照终端提示绑定项目。
4. **添加环境变量**：
   在 Vercel 控制台的项目设置 (Settings -> Environment Variables) 中，添加名为 `DEEPSEEK_API_KEY` 的变量，值为你的真实 DeepSeek 密钥，并重新触发部署 (Redeploy) 即可。
