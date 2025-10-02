#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
习思想AI智能问答系统 - 后端API服务
"""

import os
import asyncio
import aiohttp
import json
from datetime import datetime
from typing import List, Dict, Any
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse
from pydantic import BaseModel
from dotenv import load_dotenv

# 加载环境变量
load_dotenv()

app = FastAPI(title="习思想AI智能问答系统")

# 配置CORS中间件
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 挂载静态文件
app.mount("/static", StaticFiles(directory="static"), name="static")

# AI配置
AI_CONFIG = {
    "api_url": os.getenv("ai_api_url"),
    "api_key": os.getenv("ai_api_key"),
    "model": os.getenv("ai_model", "qwen-plus"),
    "temperature": float(os.getenv("ai_temperature", 0.7)),
    "max_tokens": int(os.getenv("ai_max_tokens", 800)),
    "top_p": float(os.getenv("ai_top_p", 0.9)),
    "timeout": float(os.getenv("ai_timeout", 30.0)),
}

# 数据模型
class ChatMessage(BaseModel):
    message: str

class ChatResponse(BaseModel):
    response: str
    timestamp: str

class NewsItem(BaseModel):
    title: str
    url: str
    description: str
    image: str = None

# 新闻数据
NEWS_DATA = [
    {
        "title": "推进数字基础设施建设 加快数字经济发展",
        "url": "https://www.bilibili.com/video/BV1zW4y1D7pJ",
        "description": "上海启动建设数据交易所国际板，央视新闻联播报道",
        "image": "https://i2.hdslb.com/bfs/archive/3c3a9c5e8b1c4d2f9e0d5c6b7a8f9e0d.jpg"
    },
    {
        "title": "奋进中国式现代化｜加快数字中国建设",
        "url": "https://www.bilibili.com/video/BV1A1421f7iT",
        "description": "为中国式现代化注入强大动力",
        "image": "https://i1.hdslb.com/bfs/archive/2b2a8c4e7b1c3d1f8e9d4c5b6a7f8e9d.jpg"
    },
    {
        "title": "稳居世界第二！数字经济更要做强做优做大",
        "url": "https://www.bilibili.com/video/BV1M3411y7wK",
        "description": "主播说联播：数字经济发展新篇章",
        "image": "https://i0.hdslb.com/bfs/archive/1a1a7c3e6b0c2d0f7e8d3c4b5a6f7e8d.jpg"
    },
    {
        "title": "三分钟解读数字经济",
        "url": "https://www.bilibili.com/video/BV1WB4y1t7fz",
        "description": "深入浅出解析数字经济发展趋势",
        "image": "https://i3.hdslb.com/bfs/archive/0a0a6c2e5a9c1d9f6e7d2c3b4a5f6e7d.jpg"
    },
    {
        "title": "央视新闻：将从六个方面做大做强数字经济",
        "url": "https://www.bilibili.com/video/BV15Ds7eFEwu",
        "description": "全面推进数字经济高质量发展",
        "image": "https://i2.hdslb.com/bfs/archive/9b9b5c1e4a8c0d8f5e6d1c2b3a4f5e6d.jpg"
    },
    {
        "title": "数字中国10周年！中国数字经济加速跑",
        "url": "https://news.cctv.com/2025/04/30/ARTIlHS2FUTlWKEQF7DnGnX3250430.shtml",
        "description": "央视网报道数字中国建设成就",
        "image": "https://p2.img.cctvpic.com/photoworkspace/2025/04/30/2025043016223456789.jpg"
    },
    {
        "title": "数字中国蓬勃脉动！9图带你“数”览最新成就",
        "url": "https://jingji.cctv.com/2025/08/16/ARTIX0GLOeRiYlNwUKwgsVzL250815.shtml",
        "description": "央视网报道数字中国建设取得显著成就",
        "image": "https://p2.img.cctvpic.com/photoworkspace/2025/04/30/2025043016223456789.jpg"
    },
    {
        "title": "《数字中国建设2025年行动方案》来了",
        "url": "https://news.cctv.com/2025/05/16/ARTI4ArRE4UJ0sAmWX4nSEPi250516.shtml",
        "description": "央视网报道数字中国建设2025年行动方案",
        "image": "https://p2.img.cctvpic.com/photoworkspace/2025/04/30/2025043016223456789.jpg"
    },
    {
        "title": "庆祝中华人民共和国成立76周年招待会在京举行 习近平发表重要讲话",
        "url": "https://tv.cctv.com/2025/09/30/VIDEpjmtERj6dbTjcILqvPaU250930.shtml?spm=C96370.PPDB2vhvSivD.ERPyWJCsPwT9.1",
        "description": "央视网报道中华人民共和国成立76周年习近平发表重要讲话",
        "image": "https://p2.img.cctvpic.com/photoworkspace/2025/04/30/2025043016223456789.jpg"
    },
    {
        "title": "听！380秒百姓畅聊“十四五”这五年新变化……",
        "url": "https://news.cctv.com/2025/10/02/ARTIo3VS8MZ1jhqLTey01iCk251002.shtml?spm=C96370.PPDB2vhvSivD.ERPyWJCsPwT9.14",
        "description": "央视网报道“十四五”收官之年",
        "image": "https://p2.img.cctvpic.com/photoworkspace/2025/04/30/2025043016223456789.jpg"
    },
    {
        "title": "在今年国庆招待会上，习近平重点谈到这两件大事",
        "url": "https://news.cctv.com/2025/10/01/ARTITYwoviKWSyWHzEGLtLEL251001.shtml?spm=C96370.PPDB2vhvSivD.EVRLyOeY7a6a.1",
        "description": "央视网报道习近平国庆招待会上谈到的两件大事",
        "image": "https://p2.img.cctvpic.com/photoworkspace/2025/04/30/2025043016223456789.jpg"
    },
    {
        "title": "奔向更美好生活 城市更新 生活焕新",
        "url": "https://tv.cctv.com/2025/10/01/VIDEpMaCov2xYHZHqMEMo3fB251001.shtml?spm=C96370.PPDB2vhvSivD.EGjfbNDqwSOr.5",
        "description": "焦点访谈20251001 奔向更美好生活 城市更新 生活焕新",
        "image": "https://p2.img.cctvpic.com/photoworkspace/2025/04/30/2025043016223456789.jpg"
    },
]

async def call_ai_api(message: str) -> str:
    """调用AI API获取回复"""
    try:
        headers = {
            "Authorization": f"Bearer {AI_CONFIG['api_key']}",
            "Content-Type": "application/json"
        }
        
        # 构建符合习思想主题的系统提示
        system_prompt = """你是一个专门解答习近平新时代中国特色社会主义思想相关问题的AI助手。
请基于习近平新时代中国特色社会主义思想的核心理念，围绕以下主题回答问题：
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

请用简洁明了、通俗易懂的语言回答，体现理论联系实际的特点。"""
        
        payload = {
            "model": AI_CONFIG["model"],
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": message}
            ],
            "temperature": AI_CONFIG["temperature"],
            "max_tokens": AI_CONFIG["max_tokens"],
            "top_p": AI_CONFIG["top_p"]
        }
        
        timeout = aiohttp.ClientTimeout(total=AI_CONFIG["timeout"])
        async with aiohttp.ClientSession(timeout=timeout) as session:
            async with session.post(AI_CONFIG["api_url"], headers=headers, json=payload) as response:
                if response.status == 200:
                    result = await response.json()
                    return result["choices"][0]["message"]["content"].strip()
                else:
                    error_text = await response.text()
                    raise HTTPException(status_code=500, detail=f"AI API调用失败: {error_text}")
                    
    except asyncio.TimeoutError:
        raise HTTPException(status_code=408, detail="AI API调用超时，请稍后重试")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI服务暂时不可用: {str(e)}")

@app.get("/", response_class=HTMLResponse)
async def read_index():
    """返回主页HTML"""
    with open("static/index.html", "r", encoding="utf-8") as f:
        return HTMLResponse(content=f.read())

@app.post("/api/chat", response_model=ChatResponse)
async def chat(message: ChatMessage):
    """聊天API接口"""
    if not message.message.strip():
        raise HTTPException(status_code=400, detail="消息不能为空")
    
    try:
        ai_response = await call_ai_api(message.message)
        return ChatResponse(
            response=ai_response,
            timestamp=datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"处理消息时发生错误: {str(e)}")

@app.get("/api/news", response_model=List[NewsItem])
async def get_news():
    """获取新闻列表"""
    return NEWS_DATA

@app.get("/health")
async def health_check():
    """健康检查接口"""
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
