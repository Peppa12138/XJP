# 创建更新脚本
cat > /opt/xjp-ai/update.sh << 'EOF'
#!/bin/bash
echo "正在更新习思想AI智能问答系统..."

# 拉取最新代码
git pull origin main

# 检查是否需要安装新依赖
if [ -f "requirements.txt" ]; then
    source venv/bin/activate
    pip install -r requirements.txt
fi

# 重启服务
sudo systemctl restart xjp-ai

# 检查服务状态
sudo systemctl status xjp-ai

echo "更新完成！"
EOF

# 给脚本执行权限
chmod +x /opt/xjp-ai/update.sh