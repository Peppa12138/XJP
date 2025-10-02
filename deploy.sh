#!/bin/bash

# 习思想AI智能问答系统 - 一键部署脚本
# 使用方法: sudo bash deploy.sh

set -e  # 出错时退出

echo "======================================="
echo "习思想AI智能问答系统 - VPS部署脚本"
echo "======================================="

# 检查是否为root用户
if [ "$EUID" -ne 0 ]; then
    echo "请使用sudo运行此脚本"
    exit 1
fi

# 获取当前用户
DEPLOY_USER=${SUDO_USER:-$USER}
PROJECT_DIR="/opt/xjp-ai"

echo "1. 更新系统包..."
if command -v apt &> /dev/null; then
    apt update && apt upgrade -y
    apt install python3 python3-pip python3-venv git nginx software-properties-common -y
elif command -v yum &> /dev/null; then
    yum update -y
    yum install python3 python3-pip git nginx -y
else
    echo "不支持的操作系统"
    exit 1
fi

echo "2. 创建项目目录..."
mkdir -p $PROJECT_DIR
chown -R $DEPLOY_USER:$DEPLOY_USER $PROJECT_DIR

echo "3. 设置Python虚拟环境..."
cd $PROJECT_DIR
sudo -u $DEPLOY_USER python3 -m venv venv
sudo -u $DEPLOY_USER $PROJECT_DIR/venv/bin/pip install --upgrade pip

echo "4. 提示用户上传文件..."
echo "请将项目文件上传到: $PROJECT_DIR"
echo "然后安装Python依赖: $PROJECT_DIR/venv/bin/pip install -r requirements.txt"

echo "5. 配置系统服务..."
if [ -f "$PROJECT_DIR/xjp-ai.service" ]; then
    cp $PROJECT_DIR/xjp-ai.service /etc/systemd/system/
    systemctl daemon-reload
    systemctl enable xjp-ai
    echo "Systemd服务已配置"
else
    echo "警告: 未找到xjp-ai.service文件"
fi

echo "6. 配置Nginx..."
if [ -f "$PROJECT_DIR/nginx.conf" ]; then
    cp $PROJECT_DIR/nginx.conf /etc/nginx/sites-available/xjp-ai
    ln -sf /etc/nginx/sites-available/xjp-ai /etc/nginx/sites-enabled/
    
    # 删除默认站点
    rm -f /etc/nginx/sites-enabled/default
    
    # 测试Nginx配置
    nginx -t && systemctl reload nginx
    echo "Nginx配置已完成"
else
    echo "警告: 未找到nginx.conf文件"
fi

echo "7. 配置防火墙..."
if command -v ufw &> /dev/null; then
    ufw --force enable
    ufw allow 80
    ufw allow 443
    ufw allow ssh
    echo "UFW防火墙已配置"
elif command -v firewall-cmd &> /dev/null; then
    systemctl enable firewalld
    systemctl start firewalld
    firewall-cmd --permanent --add-service=http
    firewall-cmd --permanent --add-service=https
    firewall-cmd --reload
    echo "Firewalld防火墙已配置"
fi

echo "8. 创建日志目录..."
mkdir -p /var/log/xjp-ai
chown -R www-data:www-data /var/log/xjp-ai

echo "======================================="
echo "部署脚本执行完成！"
echo "======================================="
echo ""
echo "接下来的步骤："
echo "1. 将项目文件上传到: $PROJECT_DIR"
echo "2. 配置.env文件中的API密钥"
echo "3. 安装Python依赖: cd $PROJECT_DIR && venv/bin/pip install -r requirements.txt"
echo "4. 修改nginx配置中的域名: /etc/nginx/sites-available/xjp-ai"
echo "5. 启动服务: systemctl start xjp-ai"
echo "6. 检查状态: systemctl status xjp-ai"
echo ""
echo "可选步骤："
echo "- 配置SSL证书: certbot --nginx -d your-domain.com"
echo "- 查看日志: journalctl -u xjp-ai -f"
echo ""
