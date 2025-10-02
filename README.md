# 习思想AI智能问答系统

一个基于习近平新时代中国特色社会主义思想的智能问答系统，集成了AI对话功能和相关新闻资讯展示。

## 功能特性

- 🤖 **智能问答**: 基于通义千问AI模型，专门回答习近平新时代中国特色社会主义思想相关问题
- 📰 **新闻资讯**: 展示相关的数字经济、科技创新等主题新闻
- 💬 **实时对话**: 流畅的对话体验，支持多轮对话
- 📱 **响应式设计**: 适配各种设备屏幕
- ⚡ **高性能**: 基于FastAPI框架，异步处理请求

## 技术栈

### 后端
- **FastAPI**: 现代Python Web框架
- **通义千问API**: 阿里云大模型服务
- **Uvicorn**: ASGI服务器
- **Aiohttp**: 异步HTTP客户端

### 前端  
- **原生JavaScript**: 无框架依赖
- **CSS3**: 现代样式和动画
- **响应式设计**: 移动端适配

## 安装和运行

### 1. 克隆项目
```bash
git clone <repository-url>
cd XJP
```

### 2. 安装依赖
```bash
pip install -r requirements.txt
```

### 3. 配置环境变量
复制 `.env.example` 到 `.env` 并修改配置：
```bash
cp .env.example .env
```

主要需要配置的参数：
- `ai_api_key`: 通义千问API密钥
- `SECRET_KEY`: JWT密钥（生产环境请修改）

### 4. 运行应用
```bash
python app.py
```

或使用uvicorn：
```bash
uvicorn app:app --host 0.0.0.0 --port 8000 --reload
```

### 5. 访问应用
打开浏览器访问：http://localhost:8000

## 项目结构

```
XJP/
├── app.py                 # 主应用文件
├── .env                   # 环境变量配置
├── requirements.txt       # Python依赖包
├── README.md             # 项目说明文档
└── static/               # 静态资源目录
    ├── index.html        # 主页HTML
    ├── style.css         # 样式文件
    └── script.js         # JavaScript脚本
```

## 主要功能模块

### AI问答模块
- 基于习近平新时代中国特色社会主义思想的专业问答
- 支持的主题包括：
  - 中国式现代化
  - 数字经济发展
  - 科技创新驱动
  - 高质量发展
  - 构建新发展格局
  - 人民为中心的发展思想
  - 绿色发展理念
  - 文化自信
  - 全面从严治党
  - 人类命运共同体

### 新闻资讯模块
- 展示相关的新闻资讯
- 支持视频和文章链接
- 响应式卡片布局

### 用户界面
- 现代化的聊天界面
- 消息动画效果
- 加载状态指示
- 错误提示处理

## API接口

### POST /api/chat
发送消息给AI进行对话
```json
{
    "message": "什么是中国式现代化？"
}
```

响应：
```json
{
    "response": "AI的回复内容",
    "timestamp": "2025-10-02 10:30:00"
}
```

### GET /api/news
获取新闻列表
```json
[
    {
        "title": "新闻标题",
        "url": "新闻链接",
        "description": "新闻描述",
        "image": "新闻图片链接"
    }
]
```

### GET /health
健康检查接口
```json
{
    "status": "healthy",
    "timestamp": "2025-10-02T10:30:00"
}
```

## 配置说明

### AI配置
- `ai_api_url`: 通义千问API地址
- `ai_api_key`: API密钥
- `ai_model`: 使用的模型（推荐qwen-plus）
- `ai_temperature`: 回复随机性（0-1）
- `ai_max_tokens`: 最大回复长度
- `ai_timeout`: 请求超时时间

### 安全配置
- `SECRET_KEY`: JWT签名密钥
- `ENCRYPTION_PASSWORD`: 数据加密密码

## 部署建议

### 生产环境配置
1. 修改 `.env` 中的密钥
2. 设置 `DEBUG=False`
3. 配置反向代理（如Nginx）
4. 启用HTTPS

### Docker部署
```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
EXPOSE 8000
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]
```

## 开发说明

### 添加新功能
1. 后端API：在 `app.py` 中添加新的路由
2. 前端界面：在 `static/` 目录下修改对应文件
3. 样式调整：在 `static/style.css` 中添加样式

### 自定义AI行为
修改 `app.py` 中的 `system_prompt` 来调整AI的回复风格和知识范围。

## 许可证

本项目用于学习和研究目的，请遵守相关法律法规。

## 贡献指南

欢迎提交Issue和Pull Request来完善这个项目。

## 联系方式

如有问题请通过GitHub Issues联系。
