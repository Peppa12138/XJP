#!/bin/bash

# 习思想AI智能问答系统 - 管理脚本

PROJECT_DIR="/opt/xjp-ai"
SERVICE_NAME="xjp-ai"

case "$1" in
    start)
        echo "启动服务..."
        sudo systemctl start $SERVICE_NAME
        sudo systemctl status $SERVICE_NAME --no-pager
        ;;
    stop)
        echo "停止服务..."
        sudo systemctl stop $SERVICE_NAME
        ;;
    restart)
        echo "重启服务..."
        sudo systemctl restart $SERVICE_NAME
        sudo systemctl status $SERVICE_NAME --no-pager
        ;;
    status)
        echo "查看服务状态..."
        sudo systemctl status $SERVICE_NAME --no-pager
        ;;
    logs)
        echo "查看实时日志..."
        sudo journalctl -u $SERVICE_NAME -f
        ;;
    update)
        echo "更新应用..."
        cd $PROJECT_DIR
        git pull origin main
        source venv/bin/activate
        pip install -r requirements.txt
        sudo systemctl restart $SERVICE_NAME
        echo "更新完成"
        ;;
    backup)
        echo "备份配置文件..."
        BACKUP_DIR="/opt/backup/xjp-ai-$(date +%Y%m%d-%H%M%S)"
        sudo mkdir -p $BACKUP_DIR
        sudo cp -r $PROJECT_DIR/.env $BACKUP_DIR/
        sudo cp /etc/nginx/sites-available/xjp-ai $BACKUP_DIR/
        sudo cp /etc/systemd/system/xjp-ai.service $BACKUP_DIR/
        echo "备份保存在: $BACKUP_DIR"
        ;;
    check)
        echo "系统检查..."
        echo "1. 检查Python虚拟环境..."
        if [ -d "$PROJECT_DIR/venv" ]; then
            echo "✓ 虚拟环境存在"
        else
            echo "✗ 虚拟环境不存在"
        fi
        
        echo "2. 检查配置文件..."
        if [ -f "$PROJECT_DIR/.env" ]; then
            echo "✓ 环境配置文件存在"
        else
            echo "✗ 环境配置文件不存在"
        fi
        
        echo "3. 检查服务状态..."
        sudo systemctl is-active $SERVICE_NAME --quiet && echo "✓ 服务正在运行" || echo "✗ 服务未运行"
        
        echo "4. 检查Nginx配置..."
        sudo nginx -t &>/dev/null && echo "✓ Nginx配置正确" || echo "✗ Nginx配置有误"
        
        echo "5. 检查端口占用..."
        if netstat -tlnp 2>/dev/null | grep -q :8000; then
            echo "✓ 端口8000正在使用"
        else
            echo "✗ 端口8000未使用"
        fi
        ;;
    *)
        echo "用法: $0 {start|stop|restart|status|logs|update|backup|check}"
        echo ""
        echo "命令说明:"
        echo "  start   - 启动服务"
        echo "  stop    - 停止服务"
        echo "  restart - 重启服务"
        echo "  status  - 查看服务状态"
        echo "  logs    - 查看实时日志"
        echo "  update  - 更新应用代码"
        echo "  backup  - 备份配置文件"
        echo "  check   - 系统检查"
        exit 1
        ;;
esac
