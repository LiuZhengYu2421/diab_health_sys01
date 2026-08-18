# 智糖健康管理平台 · Dify 对接文档

> **本文档用途：说明 AI 功能与 Dify 平台的对接方式。**
> 覆盖：总体架构、Dify 平台侧应用配置、后端 8 个代理接口的请求/响应约定、后端调用 Dify 的实现指引、医生 `chatToken` 说明。
> 后端全部接口规范见同目录 `后端接口文档.md`；前端对接说明见同目录 `前端对接说明.md`。

---

## 一、总体架构

```
┌─────────────────┐    HTTP     ┌──────────────────────┐   HTTPS    ┌──────────────┐
│    Vue 3 前端    │ ─────────▶ │  后端 SpringBoot 代理  │ ─────────▶ │  Dify 平台    │
│  src/api/dify.js│   /dify/*  │   /api/dify/* 8 个接口 │  /v1/*     │  对话/工作流   │
└─────────────────┘            └──────────────────────┘            └──────────────┘
        ▲                              │
        │                              │ 数据库表 doctor_information.chat_token
        │                              ▼ （医生对话应用的 API Key 由管理员在后台配置）
```

- **前端不直接调用 Dify**，统一走后端代理接口 `/api/dify/*`，避免暴露 Dify API Key。
- 后端负责：接收前端请求 → 组装 Dify 调用参数 → 调用 Dify → 将 Dify 返回转换为约定的统一格式。
- 前端在 `VITE_USE_MOCK=true`（默认）时使用本地模拟回复，无需后端即可演示；`VITE_USE_MOCK=false` 时请求真实代理接口。

---

## 二、Dify 平台侧需创建的应用

在 Dify 平台创建以下应用，分别对应前端 8 个 AI 功能。**对话型应用**用于多轮对话（有会话记忆），**工作流型应用**用于一次性任务生成。

### 2.1 对话型应用（Chat）

| 应用用途 | 对应接口 | 说明 |
| --- | --- | --- |
| 医师咨询助手 | `/dify/doctor/chat` | 每名医生独立一个应用（或用部门区分），API Key 存 `doctor_information.chat_token`，实现"医生角色"定制 |
| 智能助手 | `/dify/assistant/chat` | 面向用户的通用糖尿病健康助手 |

**对话型应用说明：**
- Dify 调用接口：`POST /v1/chat-messages`（使用应用 API Key，`Bearer app-xxx`）。
- 支持多轮会话：通过 `conversation_id` 延续上下文；前端传 `sessionId`，后端维护 `conversation_id ↔ sessionId` 映射（可存缓存/DB）。

### 2.2 工作流型应用（Workflow）

| 应用用途 | 对应接口 | 说明 |
| --- | --- | --- |
| 智能打卡分析 | `/dify/punch/analyze` | 输入打卡数据，输出过程/完成度/评价/建议 |
| 糖尿病风险预测 | `/dify/risk/predict` | 输入风险因子，输出风险等级/评分/建议/明细 |
| AI 数据助理 | `/dify/admin/query` | **连接数据库**，接收自然语言指令，执行增删改查，返回 `{ message, status, data }` |
| 健康咨询-标签模式 | `/dify/health/tags` | 根据用户健康档案生成四大分类咨询推荐 |
| 健康咨询-详情模式 | `/dify/health/detail` | 根据标题 + 用户档案生成文章详情 |
| 方案定制生成 | `/dify/life/scheme` | 根据个人信息 + 生活习惯 + 方案建议生成个性化方案 |

**工作流型应用说明：**
- Dify 调用接口：`POST /v1/workflows/run`（使用应用 API Key）。
- 无多轮会话，每次调用独立执行。
- AI 数据助理应用需在 Dify 中配置**数据库工具节点**（连接本平台 MySQL），最终用「结束」节点输出 JSON。

---

## 三、后端代理接口定义（共 8 个）

> 通用约定：
> - 基础路径：`/api/dify`
> - 统一响应：`{ "code": 200, "message": "ok", "data": { ... } }`，`code=401` 表示未登录。
> - 前端调用均携带登录 token。
> - 所有接口均为 `POST`。

### 3.1 医师咨询对话

**`POST /api/dify/doctor/chat`**

请求体：

```json
{
  "doctorName": "李建华",
  "department": "内分泌科",
  "userId": 1,
  "health": {
    "age": 45, "sex": "男", "height": 172, "weight": 68,
    "familyHistory": "否", "waistline": 86, "systolicPressure": 128,
    "isPregnancy": "否", "disease": "2型糖尿病"
  },
  "messages": [
    { "role": "user", "content": "我最近空腹血糖 7.8，需要注意什么？" }
  ]
}
```

成功返回 `data`：

```json
{
  "answer": "（医生口吻的回答文本）",
  "sessionId": "conv-xxx"   // 多轮会话标识，前端下轮原样传回
}
```

实现说明：
- 后端从 `doctor_information.chat_token` 读取该医生的 Dify 应用 API Key；为空时返回错误「该医生暂未开通在线咨询」。
- 组装系统提示词（医生姓名/科室/职称 + 用户健康档案），调用 `POST /v1/chat-messages`。
- 维护 `sessionId ↔ conversation_id` 映射，保证同一会话上下文连续。

### 3.2 智能打卡分析

**`POST /api/dify/punch/analyze`**

请求体：

```json
{ "userId": 1 }
```

成功返回 `data`：

```json
{
  "process": "71.4%",
  "completionStatus": "最近 7 天共计划打卡 7 次，实际完成 5 次……",
  "evaluate": "您本周控糖状态较为稳定……",
  "suggestion": "1）……；2）……；3）……"
}
```

实现说明：
- 后端查询 `punch_in` 最近打卡数据，作为工作流输入变量传入 Dify。
- Dify 工作流输出需按上述四个字段返回。

### 3.3 糖尿病风险预测

**`POST /api/dify/risk/predict`**

请求体：

```json
{
  "userId": 1,
  "age": 45,
  "sex": "男",
  "height": 172,
  "weight": 68,
  "familyHistory": "否",
  "waistline": 86,
  "systolicPressure": 128,
  "isPregnancy": "否",
  "disease": "无"
}
```

成功返回 `data`：

```json
{
  "riskLevel": "中风险",
  "riskScore": 45,
  "advice": "（建议文本）",
  "detail": {
    "bmi": "23.0",
    "waistline": "86",
    "systolicPressure": "128"
  }
}
```

### 3.4 智能助手对话

**`POST /api/dify/assistant/chat`**

请求体：

```json
{
  "userId": 1,
  "age": 45, "sex": "男", "height": 172, "weight": 68,
  "familyHistory": "否", "waistline": 86, "systolicPressure": 128,
  "isPregnancy": "否", "disease": "2型糖尿病",
  "messages": [
    { "role": "user", "content": "糖尿病患者适合什么运动？" }
  ]
}
```

成功返回 `data`：

```json
{
  "answer": "（回答文本）",
  "sessionId": "conv-xxx"
}
```

实现说明：与 3.1 类似，使用固定的「智能助手」应用（API Key 存后端配置，见 4.1 节 `dify.admin-key`），系统提示词注入用户健康档案。

### 3.5 AI 数据助理（管理员端）

**`POST /api/dify/admin/query`**

请求体：

```json
{
  "messages": ["查询全站用户数量"]
}
```

> `messages` 为字符串数组：全部历史用户提问（只包含 `role === 'user'` 的消息内容），便于 Dify 理解上下文。

成功返回 `data`（工作流输出需严格匹配此结构）：

```json
{
  "message": "查询成功",
  "status": "success",
  "data": {
    "userTotal": 128,
    "doctorTotal": 12,
    "list": [ { "id": 1, "name": "张小明", "plan": "控糖计划A", "progress": "82%" } ]
  }
}
```

字段约定：
- `message`：操作结果文案，前端展示在消息气泡下方状态徽标。
- `status`：`success` / `error`，控制徽标配色。
- `data`：查询类返回结果集（可含 `list` 数组，前端渲染为表格）；增删改类返回受影响对象/行数。

实现说明：
- Dify 工作流需连接数据库工具节点，识别「查询/新增/删除/修改」意图并执行 SQL。
- **禁止非 SELECT 语句执行**需加安全校验（白名单表、参数化），防止注入。
- 前端兼容旧格式 `{ answer }`，因此 Dify 至少返回 `message` 即可；`data` 可选。

### 3.6 健康咨询 - 标签模式

**`POST /api/dify/health/tags`**

请求体：

```json
{
  "userInfo": {
    "age": 45, "sex": "男", "height": 172, "weight": 68, "disease": "2型糖尿病"
  }
}
```

成功返回 `data`（四大分类，每类为标题数组或 `{ title, content }` 对象数组）：

```json
{
  "eat":   [ "标题1", "标题2", "标题3" ],
  "sport": [ "标题1", "标题2" ],
  "daily": [ { "title": "糖友日常注意事项", "content": "……" } ],
  "popularization": [ { "title": "认识2型糖尿病", "content": "……" } ]
}
```

前端用于：
1. 「健康咨询」页按 **一页三个** 的分页卡片列表展示，点击卡片后进入详情；
2. 「首页」全局搜索：`TeamView.vue` 调用 SpringBoot 业务接口 `GET /articles?keyword=`（复用文章列表接口，查询 `articles` 表，见《后端接口文档》11.1），点击结果跳转健康咨询详情（`/lifeadvice?open=标题`）。

### 3.7 健康咨询 - 详情模式

**`POST /api/dify/health/detail`**

请求体：

```json
{
  "title": "糖尿病饮食指南",
  "userInfo": { "age": 45, "sex": "男", "height": 172, "weight": 68, "disease": "2型糖尿病" }
}
```

成功返回 `data`：

```json
{
  "title": "糖尿病饮食指南",
  "content": "<p><strong>控制总能量</strong>……</p>",
  "tags": ["饮食指导", "控糖", "糖尿病科普"]
}
```

> `content` 为 **HTML 富文本**，前端使用 `v-html` 渲染。

### 3.8 方案定制生成

**`POST /api/dify/life/scheme`**

请求体（前端「方案定制」表单提交）：

```json
{
  "userInfo": {
    "age": 45,
    "sex": "男",
    "height": 172,
    "weight": 68,
    "disease": "2型糖尿病"
  },
  "habit": {
    "sleepTime": "规律作息",        // 早睡早起 | 规律作息 | 经常熬夜 | 作息不规律
    "cookOften": "偶尔做饭",        // 经常做饭 | 偶尔做饭 | 很少做饭 | 从不下厨
    "taste": "偏咸",               // 清淡 | 偏甜 | 偏咸 | 偏油 | 偏辣 | 无特殊偏好
    "exercise": "每周1-2次",       // 几乎不运动 | 每周1-2次 | 每周3-4次 | 每天运动
    "alcohol": "从不饮酒"          // 从不饮酒 | 偶尔饮酒 | 经常饮酒
  },
  "advice": "希望方案简单易执行，工作日午餐多为外食"
}
```

> 兼容旧调用：`{ type: '饮食' | '运动', userInfo }`（个人中心「我的方案」仍使用）。

成功返回 `data`：

```json
{
  "scheme": {
    "name": "控糖 · 个性化生活方案",
    "desc": "针对 45 岁 男、BMI 23.0、已确诊糖尿病 量身定制，结合您的作息、饮食与运动习惯",
    "items": [
      { "time": "起床 07:00", "content": "规律作息，起床后先喝一杯温水，再测一次空腹血糖", "done": true },
      { "time": "早餐 07:30", "content": "全麦面包2片 + 鸡蛋1个 + 无糖豆浆250ml（主食粗粮优先）", "done": true },
      { "time": "上午 10:00", "content": "加一次 20 分钟快走/拉伸，培养运动频率", "done": true },
      { "time": "午餐 12:00", "content": "杂粮饭1碗 + 鸡胸肉120g + 时蔬200g", "done": false },
      { "time": "下午 15:30", "content": "加餐：无糖酸奶1杯 或 苹果半个 或 坚果一小把", "done": false },
      { "time": "晚餐 18:30", "content": "晚餐以清淡为主，如小米粥 + 豆腐 + 凉拌蔬菜；应酬饮酒务必限量", "done": false }
    ]
  }
}
```

> 工作流输出需根据 `userInfo`（个人信息）、`habit`（生活习惯）、`advice`（方案建议）生成个性化 `scheme`。

> 健康咨询搜索（首页搜索栏）由 **SpringBoot 后端直接查询数据库**实现（复用 `GET /articles?keyword=`，查询 `articles` 表，见《后端接口文档》11.1），**不属于 Dify 代理接口**。

---

## 四、后端调用 Dify 的实现指引

### 4.1 通用配置（application.yml）

```yaml
dify:
  base-url: ${DIFY_BASE_URL:https://api.dify.ai/v1}   # 自建部署时指向本机
  admin-key: ${DIFY_ADMIN_KEY:}                        # 智能助手/AI 数据助理等全局应用 Key
  timeout-ms: 60000                                    # AI 接口耗时较长
```

### 4.2 调用对话型应用（chat-messages）

```java
// POST {base-url}/chat-messages
{
  "inputs": {},                              // 工作流/对话变量，如 health 档案
  "query": "患者提问内容",
  "response_mode": "blocking",
  "conversation_id": "",                     // 首次为空；后续传 conversation_id
  "user": "user-{userId}"
}
// Header: Authorization: Bearer app-xxx
// 返回：{ "answer": "...", "conversation_id": "..." }
```

后端需维护 `sessionId ↔ conversation_id` 映射（可用 Redis 或内存 Map），前端每轮传 `sessionId`，后端取出 `conversation_id` 续聊。

### 4.3 调用工作流型应用（workflows/run）

```java
// POST {base-url}/workflows/run
{
  "inputs": {
    "health": "{...}",     // 应用自定义输入变量
    "punchData": "[...]"
  },
  "response_mode": "blocking",
  "user": "user-{userId}"
}
// Header: Authorization: Bearer app-xxx
// 返回：{ "data": { "outputs": "{\"key\":\"value\"}" } }
```

工作流输出在 `data.outputs` 中，为 JSON 字符串，后端需反序列化后按第三节的字段约定映射回统一响应。

### 4.4 医生对话应用 Key 的来源

- 医生表 `doctor_information.chat_token` 存该医生 Dify 对话应用的 API Key（格式 `app-xxxx`）。
- 管理后台「医生管理」面板提供 `chatToken` 录入字段，见 `后端接口文档.md` 医生模块（新增/编辑医生时携带）。
- 后端调用 `/dify/doctor/chat` 时从 DB 读取并作为 `Authorization: Bearer <chat_token>`。

### 4.5 错误处理

| 场景 | 返回 |
| --- | --- |
| Dify 超时 / 网络异常 | `{ code: 500, message: "AI 服务暂不可用，请稍后重试" }` |
| 医生未配置 chatToken | `{ code: 400, message: "该医生暂未开通在线咨询" }` |
| AI 数据助理 SQL 执行失败 | `{ code: 200, data: { message: "执行失败：...", status: "error" } }` |

---

## 五、前端对接方式（无需改动即可生效）

前端封装位于 `src/api/dify.js`，8 个导出函数与上述接口一一对应：

| 前端函数 | 请求路径 | 页面使用 |
| --- | --- | --- |
| `doctorChat(data)` | `/dify/doctor/chat` | `DoctorConsultView.vue` 医师 AI 在线咨询 |
| `punchAnalyze(data)` | `/dify/punch/analyze` | `PunchAnalyzeView.vue` 智能打卡分析 |
| `riskPredict(data)` | `/dify/risk/predict` | `RiskPredictView.vue` 糖尿病风险预测 |
| `assistantChat(data)` | `/dify/assistant/chat` | `AiAssistantView.vue` 智能助手 |
| `adminQuery(data)` | `/dify/admin/query` | `AiDataAssistantPanel.vue` AI 数据助理 |
| `healthTags(data)` | `/dify/health/tags` | `HealthConsultView.vue` 健康咨询列表 |
| `healthDetail(data)` | `/dify/health/detail` | `HealthConsultView.vue` 健康咨询详情（底部可收藏） |
| `lifeScheme(data)` | `/dify/life/scheme` | `LifeSchemeView.vue` 方案定制 / 个人中心「我的方案」 |

> 首页搜索栏走 **SpringBoot 业务接口**（非 Dify）：复用 `GET /articles?keyword=`，前端封装在 `src/api/search.js`，见《后端接口文档》11.1。

**Mock / 真实模式切换：**

- 开发环境 `.env.development`：`VITE_USE_MOCK=true`（默认演示）；改为 `false` 即走后端代理。
- 生产环境 `.env.production`：`VITE_USE_MOCK=false`。

**健康咨询收藏：** 详情底部「收藏」将咨询内容写入 `localStorage`（key：`zhitang_consult_favorites_<userId>`，按用户隔离，工具见 `src/utils/consultFavorites.js`）。个人中心 →「我的咨询」面板展示所有收藏，支持取消收藏，无需后端接口。

**运维日志：** 上述 AI 功能在页面调用时均会写入 AI 功能运维日志（`src/utils/operationLog.js`），管理后台「AI 智能数据 → 操作日志」面板可检索查看，日志仅含 AI 相关操作类型。

---

## 六、联调 checklist

- [ ] Dify 平台已创建 2 个对话型 + 6 个工作流型应用，均发布并生成 API Key
- [ ] 后端 `application.yml` 配置 `dify.base-url` 与全局 API Key
- [ ] 智能助手 / AI 数据助理等全局应用的 Key 已配置，医师应用的 Key 已录入医生表
- [ ] `VITE_USE_MOCK` 已按环境切换；前端 8 个页面逐一验证
- [ ] AI 数据助理工作流输出严格为 `{ message, status, data }` JSON，且已做 SQL 安全校验
- [ ] 对话型应用多轮上下文（sessionId ↔ conversation_id）正常延续
- [ ] 错误场景（超时、未配置 chatToken、SQL 失败）提示符合约定
