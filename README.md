# 乌东文旅 - 行·线路订票模块 运行指南

## 项目结构

```
zy5/
├── server/          # 后端API (Midway.js + TypeORM)
├── web/             # PC Web前端 (React + Ant Design)
├── miniapp/         # 微信小程序 (原生框架)
├── admin/           # 管理后台 (React + Ant Design)
├── 乌东文旅_衣食住行_需求规格说明书_完整版.docx
├── 乌东文旅_衣食住行_视觉设计规范.docx
└── 人工智能工程实践-课程设计大作业报告_已完成.docx
```

---

## 一、环境准备

需要先安装以下软件：

| 软件 | 版本要求 | 下载地址 |
|------|----------|----------|
| Node.js | v18+ 或 v20 LTS | https://nodejs.org |
| MySQL | 8.0+ | https://dev.mysql.com/downloads/mysql/ |
| Redis | 6.0+ (可选，缓存用) | https://redis.io/download |
| 微信开发者工具 | 最新稳定版 | https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html |

---

## 二、后端服务启动

### Step 1: 创建数据库

打开 MySQL 客户端，执行：

```sql
CREATE DATABASE IF NOT EXISTS wudong_travel
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
```

### Step 2: 配置环境变量

修改 `server/src/config/config.default.ts` 中的数据库连接信息，或设置系统环境变量：

```bash
# Windows PowerShell
$env:DB_HOST="localhost"
$env:DB_PORT="3306"
$env:DB_USER="root"
$env:DB_PASSWORD="你的密码"
$env:DB_NAME="wudong_travel"
```

### Step 3: 安装依赖并启动

```bash
cd server
npm install                    # 安装依赖（首次需要网络）
npm run dev                    # 开发模式启动
```

启动成功后：
- API 服务: http://localhost:7001
- Swagger 文档: http://localhost:7001/swagger-ui/index.html

`npm run dev` 会自动同步数据库表结构（TypeORM synchronize: true），无需手动建表。

---

## 三、PC Web前端启动

```bash
cd web
npm install                    # 安装依赖
npm start                      # 启动开发服务器
```

启动成功后：http://localhost:3000

前端开发服务器已配置代理（package.json 中 `"proxy": "http://localhost:7001"`），
API请求会自动转发到后端。

---

## 四、管理后台启动

```bash
cd admin
npm install                    # 安装依赖
npm start                      # 启动开发服务器
```

启动成功后：http://localhost:3001（通常是3001端口，因为3000被web占用）

管理后台同样已配置后端代理。

---

## 五、微信小程序启动

### Step 1: 配置AppID

1. 打开 `miniapp/app.json`
2. 在微信公众平台注册小程序获取 AppID
3. 或使用微信开发者工具的"测试号"模式

### Step 2: 修改API地址

编辑 `miniapp/app.js`，将 `baseUrl` 改为你的后端地址：

```javascript
globalData: {
  baseUrl: 'http://localhost:7001'  // 本地开发
  // 或 'https://your-domain.com'   // 线上部署
}
```

### Step 3: 导入项目

1. 打开微信开发者工具
2. 选择「导入项目」
3. 项目目录选择 `zy5/miniapp`
4. AppID 填写或选择测试号
5. 点击「确定」即可预览

### 注意事项

小程序调用本地后端需在开发者工具中：
- 点击右上角「详情」→「本地设置」→ 勾选「不校验合法域名」

---

## 六、快速验证

后端启动后，可以直接在浏览器测试以下接口：

| 接口 | 说明 |
|------|------|
| http://localhost:7001/api/scenic/list?page=1&pageSize=5 | 景区列表 |
| http://localhost:7001/api/route/list?duration=一日游 | 路线列表 |
| http://localhost:7001/api/guide/list | 交通攻略 |
| http://localhost:7001/swagger-ui/index.html | API文档（可视化） |

---

## 七、一键启动脚本（Windows）

将以下内容保存为 `start.bat`，放到 `zy5/` 目录下：

```batch
@echo off
echo ========================================
echo   乌东文旅 - 行·线路订票 一键启动
echo ========================================

echo.
echo [1/3] 启动后端服务...
start "乌东文旅-后端" cmd /c "cd server && npm run dev"

echo [2/3] 启动PC Web前端...
start "乌东文旅-Web" cmd /c "cd web && npm start"

echo [3/3] 启动管理后台...
start "乌东文旅-Admin" cmd /c "cd admin && npm start"

echo.
echo ========================================
echo   启动完成！
echo   后端:     http://localhost:7001
echo   Swagger:  http://localhost:7001/swagger-ui
echo   Web前端:  http://localhost:3000
echo   管理后台: http://localhost:3001
echo ========================================
pause
```

---

## 八、常见问题

**Q: `npm install` 失败？**
A: 检查网络代理设置。如果用的是校园网，可能需要配置 npm 镜像：
```bash
npm config set registry https://registry.npmmirror.com
```

**Q: 数据库连接失败？**
A: 确认 MySQL 服务已启动，检查 `config.default.ts` 中的数据库密码是否正确。

**Q: 小程序请求不到数据？**
A: 确认后端已启动，并在开发者工具中勾选「不校验合法域名」。
