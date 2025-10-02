# 习思想AI智能问答系统 - VPS部署指南

## 服务器要求
- 操作系统：Ubuntu 20.04+ / CentOS 8+ / Debian 11+
- Python：3.8+
- 内存：至少512MB
- 硬盘：至少1GB可用空间
- 网络：需要访问外网（调用AI接口）

## 部署步骤

### 1. 服务器准备

```bash
# 更新系统包
sudo apt update && sudo apt upgrade -y  # Ubuntu/Debian
# 或
sudo yum update -y  # CentOS

# 安装必要的软件
sudo apt install python3 python3-pip python3-venv git nginx -y  # Ubuntu/Debian
# 或
sudo yum install python3 python3-pip git nginx -y  # CentOS
```

### 2. 上传项目文件

#### 方法一：使用Git（推荐）
```bash
# 在服务器上克隆项目
cd /opt
sudo git clone <your-repository-url> xjp-ai
sudo chown -R $USER:$USER /opt/xjp-ai
cd /opt/xjp-ai
```

#### 方法二：使用SCP上传
```bash
# 在本地执行（替换your-server-ip和username）
scp -r f:\XJP username@your-server-ip:/opt/xjp-ai
```

#### 方法三：使用FTP工具
- 使用WinSCP、FileZilla等工具上传整个项目文件夹到 `/opt/xjp-ai`

### 3. 创建Python虚拟环境

```bash
cd /opt/xjp-ai
python3 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
```

### 4. 配置环境变量

编辑 `.env` 文件：
```bash
nano .env
```

确保配置正确：
```
# AI配置
ai_api_url=https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions
ai_api_key=你的通义千问API密钥
ai_model=qwen-plus
ai_temperature=0.7
ai_max_tokens=800
ai_top_p=0.9
ai_timeout=30.0

# 服务器配置
HOST=0.0.0.0
PORT=8000
DEBUG=False

# 安全配置（生产环境必须修改）
SECRET_KEY=your-production-secret-key-change-this
ENCRYPTION_PASSWORD=your-production-encryption-password-change-this
```

### 5. 测试运行

```bash
# 测试应用是否正常启动
source venv/bin/activate
python app.py

# 如果正常，按Ctrl+C停止
```

### 6. 使用Systemd服务管理

创建系统服务文件：
```bash
sudo nano /etc/systemd/system/xjp-ai.service
```

### 7. 配置Nginx反向代理

创建Nginx配置：
```bash
sudo nano /etc/nginx/sites-available/xjp-ai
```

### 8. 启用服务

```bash
# 启用Nginx站点
sudo ln -s /etc/nginx/sites-available/xjp-ai /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# 启动应用服务
sudo systemctl daemon-reload
sudo systemctl enable xjp-ai
sudo systemctl start xjp-ai
```

### 9. 配置防火墙

```bash
# Ubuntu/Debian
sudo ufw allow 80
sudo ufw allow 443
sudo ufw allow ssh
sudo ufw enable

# CentOS
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --reload
```

### 10. SSL证书配置（可选但推荐）

使用Let's Encrypt免费SSL证书：
```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d your-domain.com
```

## 服务管理命令

```bash
# 查看服务状态
sudo systemctl status xjp-ai

# 重启服务
sudo systemctl restart xjp-ai

# 查看日志
sudo journalctl -u xjp-ai -f

# 停止服务
sudo systemctl stop xjp-ai
```

## 监控和维护

### 查看应用日志
```bash
# 实时查看应用日志
sudo journalctl -u xjp-ai -f

# 查看Nginx日志
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### 更新应用
```bash
cd /opt/xjp-ai
git pull origin main  # 如果使用Git
source venv/bin/activate
pip install -r requirements.txt
sudo systemctl restart xjp-ai
```

### 备份重要文件
```bash
# 备份配置文件
sudo cp .env .env.backup
sudo cp /etc/nginx/sites-available/xjp-ai /etc/nginx/sites-available/xjp-ai.backup
sudo cp /etc/systemd/system/xjp-ai.service /etc/systemd/system/xjp-ai.service.backup
```

## 故障排除

### 常见问题

1. **服务无法启动**
   ```bash
   sudo journalctl -u xjp-ai --no-pager
   ```

2. **端口被占用**
   ```bash
   sudo netstat -tlnp | grep :8000
   sudo fuser -k 8000/tcp
   ```

3. **权限问题**
   ```bash
   sudo chown -R www-data:www-data /opt/xjp-ai
   sudo chmod +x /opt/xjp-ai/venv/bin/python
   ```

4. **AI API调用失败**
   - 检查API密钥是否正确
   - 检查服务器网络连接
   - 查看应用日志确认错误信息

### 性能优化

1. **调整工作进程数**
   ```bash
   # 在systemd服务文件中添加
   ExecStart=/opt/xjp-ai/venv/bin/uvicorn app:app --host 0.0.0.0 --port 8000 --workers 2
   ```

2. **启用Gzip压缩**
   在Nginx配置中添加gzip配置

3. **配置缓存**
   为静态文件配置浏览器缓存

## 安全建议

1. **修改默认密钥**
   - 更换 `.env` 中的 `SECRET_KEY` 和 `ENCRYPTION_PASSWORD`

2. **定期更新**
   ```bash
   sudo apt update && sudo apt upgrade -y
   ```

3. **配置fail2ban防护**
   ```bash
   sudo apt install fail2ban -y
   sudo systemctl enable fail2ban
   ```

4. **限制访问**
   - 如需要，可以配置IP白名单
   - 使用CloudFlare等CDN服务

## 域名配置

如果您有域名，需要：
1. 在域名DNS设置中添加A记录指向服务器IP
2. 修改Nginx配置中的server_name
3. 申请SSL证书

完成以上步骤后，您的习思想AI智能问答系统就可以在VPS上稳定运行了！
