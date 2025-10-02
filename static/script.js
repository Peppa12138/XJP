// 习思想AI智能问答系统 - 前端JavaScript代码

class ChatApp {
    constructor() {
        this.messageInput = document.getElementById('messageInput');
        this.sendButton = document.getElementById('sendButton');
        this.chatMessages = document.getElementById('chatMessages');
        this.newsContainer = document.getElementById('newsContainer');
        this.backToTopBtn = document.getElementById('backToTop');

        // 分页相关
        this.newsData = [];
        this.currentPage = 1;
        this.itemsPerPage = 2;

        this.init();
    } init() {
        // 绑定事件监听器
        this.sendButton.addEventListener('click', () => this.sendMessage());
        this.messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        // 自动调整输入框高度
        this.messageInput.addEventListener('input', this.autoResizeInput.bind(this));

        // 加载新闻数据
        this.loadNews();

        // 添加一些示例问题按钮
        this.addSampleQuestions();

        // 初始化回到顶部按钮
        this.initBackToTop();

        // 初始化滚动监听
        this.initScrollListener();
    }

    autoResizeInput() {
        this.messageInput.style.height = 'auto';
        this.messageInput.style.height = this.messageInput.scrollHeight + 'px';
    }

    addSampleQuestions() {
        const sampleQuestions = [
            "什么是中国式现代化？",
            "数字经济如何推动高质量发展？",
            "如何理解人民为中心的发展思想？",
            "新发展格局的内涵是什么？"
        ];

        const questionsContainer = document.createElement('div');
        questionsContainer.className = 'sample-questions';
        questionsContainer.innerHTML = `
            <div class="questions-title">💡 您可以尝试询问：</div>
            <div class="questions-grid">
                ${sampleQuestions.map(question =>
            `<button class="question-btn" onclick="chatApp.askQuestion('${question}')">${question}</button>`
        ).join('')}
            </div>
        `;

        // 添加样式
        const style = document.createElement('style');
        style.textContent = `
            .sample-questions {
                margin: 20px 0;
                padding: 20px;
                background: rgba(102, 126, 234, 0.05);
                border-radius: 15px;
                border: 1px solid rgba(102, 126, 234, 0.1);
            }
            .questions-title {
                font-weight: 500;
                color: #667eea;
                margin-bottom: 15px;
                text-align: center;
            }
            .questions-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 10px;
            }
            .question-btn {
                padding: 10px 15px;
                background: white;
                border: 1px solid #e0e0e0;
                border-radius: 20px;
                cursor: pointer;
                transition: all 0.3s ease;
                font-size: 0.9rem;
                color: #333;
            }
            .question-btn:hover {
                background: #667eea;
                color: white;
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
            }
        `;
        document.head.appendChild(style);

        // 插入到聊天消息区域
        this.chatMessages.appendChild(questionsContainer);
    }

    askQuestion(question) {
        this.messageInput.value = question;
        this.sendMessage();
    }

    async sendMessage() {
        const message = this.messageInput.value.trim();
        if (!message) return;

        // 禁用输入和发送按钮
        this.messageInput.disabled = true;
        this.sendButton.disabled = true;
        this.sendButton.innerHTML = '<span class="spinner"></span>发送中...';

        // 修改输入框提示文字
        this.messageInput.placeholder = 'AI正在思考中，请不要退出……';

        // 添加用户消息到聊天区域
        this.addMessage(message, 'user');

        // 清空输入框
        this.messageInput.value = '';
        this.messageInput.style.height = 'auto';

        try {
            // 调用后端API
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message: message })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            // 添加AI回复到聊天区域
            this.addMessage(data.response, 'system', data.timestamp);

        } catch (error) {
            console.error('发送消息失败:', error);
            this.addMessage('抱歉，服务暂时不可用，请稍后重试。', 'system');

            // 显示错误提示
            this.showErrorToast('发送失败，请检查网络连接后重试');
        } finally {
            // 恢复输入和发送按钮
            this.messageInput.disabled = false;
            this.sendButton.disabled = false;
            this.sendButton.innerHTML = '<span class="send-icon">📤</span>发送';

            // 恢复输入框提示文字
            this.messageInput.placeholder = '请输入您想了解的问题...';

            // 重新聚焦输入框
            this.messageInput.focus();
        }
    } addMessage(content, type, timestamp = null) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}-message`;

        const now = timestamp || new Date().toLocaleString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });

        const avatar = type === 'user' ? '👤' : '🤖';
        const avatarClass = type === 'user' ? 'user-avatar' : 'system-avatar';
        const bubbleClass = type === 'user' ? 'user-bubble' : 'system-bubble';

        messageDiv.innerHTML = `
            <div class="message-content">
                <div class="message-avatar ${avatarClass}">${avatar}</div>
                <div class="message-bubble ${bubbleClass}">
                    ${this.formatMessage(content)}
                    <div class="message-time">${now}</div>
                </div>
            </div>
        `;

        this.chatMessages.appendChild(messageDiv);

        // 滚动到底部
        this.scrollToBottom();

        // 如果是第一次对话，移除示例问题
        if (this.chatMessages.children.length > 2) {
            const sampleQuestions = this.chatMessages.querySelector('.sample-questions');
            if (sampleQuestions) {
                sampleQuestions.remove();
            }
        }
    }

    formatMessage(content) {
        // 简单的文本格式化：换行、加粗、链接等
        return content
            .replace(/\n/g, '<br>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>');
    }

    scrollToBottom() {
        setTimeout(() => {
            this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
        }, 100);
    }

    async loadNews() {
        try {
            const response = await fetch('/api/news');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            this.newsData = await response.json();
            this.renderNews();
            this.updatePagination();
        } catch (error) {
            console.error('加载新闻失败:', error);
            this.renderNewsError();
        }
    } renderNews() {
        this.newsContainer.innerHTML = '';

        // 计算当前页的新闻
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        const currentNews = this.newsData.slice(startIndex, endIndex);

        currentNews.forEach((news, index) => {
            const newsItem = document.createElement('div');
            newsItem.className = 'news-item';
            newsItem.style.animationDelay = `${index * 0.2}s`;

            // 为不同类型的链接设置不同的图标
            const getNewsIcon = (url) => {
                if (url.includes('bilibili.com')) return '📺';
                if (url.includes('cctv.com')) return '📺';
                return '📰';
            };

            newsItem.innerHTML = `
                <div class="news-content">
                    <h3 class="news-title">${news.title}</h3>
                    <p class="news-description">${news.description}</p>
                    <div class="news-meta">
                        <span class="news-source">${this.getSourceName(news.url)}</span>
                    </div>
                </div>
            `;

            // 添加点击事件
            newsItem.addEventListener('click', () => {
                window.open(news.url, '_blank', 'noopener,noreferrer');
            });

            this.newsContainer.appendChild(newsItem);
        });

        // 添加新闻项动画样式
        if (!document.querySelector('style[data-news-animation]')) {
            const style = document.createElement('style');
            style.setAttribute('data-news-animation', 'true');
            style.textContent = `
                .news-item {
                    animation: newsSlideIn 0.6s ease-out both;
                }
                @keyframes newsSlideIn {
                    from {
                        opacity: 0;
                        transform: translateY(30px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
            `;
            document.head.appendChild(style);
        }
    }

    getSourceName(url) {
        if (url.includes('bilibili.com')) return 'B站视频';
        if (url.includes('cctv.com')) return '央视网';
        return '官方媒体';
    }

    renderNewsError() {
        this.newsContainer.innerHTML = `
            <div class="news-error">
                <div class="error-icon">❌</div>
                <p>暂时无法加载新闻，请稍后重试</p>
                <button onclick="chatApp.loadNews()" class="retry-btn">重新加载</button>
            </div>
        `;

        // 添加错误样式
        const style = document.createElement('style');
        style.textContent = `
            .news-error {
                text-align: center;
                padding: 40px 20px;
                color: #666;
                grid-column: 1 / -1;
            }
            .error-icon {
                font-size: 3rem;
                margin-bottom: 15px;
            }
            .retry-btn {
                margin-top: 15px;
                padding: 10px 20px;
                background: #667eea;
                color: white;
                border: none;
                border-radius: 20px;
                cursor: pointer;
                transition: all 0.3s ease;
            }
            .retry-btn:hover {
                background: #5a67d8;
                transform: translateY(-2px);
            }
        `;
        if (!document.querySelector('style[data-error-style]')) {
            style.setAttribute('data-error-style', 'true');
            document.head.appendChild(style);
        }
    }

    showErrorToast(message) {
        // 创建错误提示Toast
        const toast = document.createElement('div');
        toast.className = 'error-toast';
        toast.textContent = message;

        const toastStyle = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #ff5252;
            color: white;
            padding: 15px 20px;
            border-radius: 10px;
            box-shadow: 0 4px 12px rgba(255, 82, 82, 0.3);
            z-index: 1001;
            animation: toastSlideIn 0.3s ease-out;
        `;

        toast.style.cssText = toastStyle;
        document.body.appendChild(toast);

        // 添加动画样式
        if (!document.querySelector('style[data-toast-animation]')) {
            const style = document.createElement('style');
            style.setAttribute('data-toast-animation', 'true');
            style.textContent = `
                @keyframes toastSlideIn {
                    from {
                        opacity: 0;
                        transform: translateX(100%);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(0);
                    }
                }
                @keyframes toastSlideOut {
                    from {
                        opacity: 1;
                        transform: translateX(0);
                    }
                    to {
                        opacity: 0;
                        transform: translateX(100%);
                    }
                }
            `;
            document.head.appendChild(style);
        }

        // 3秒后自动移除
        setTimeout(() => {
            toast.style.animation = 'toastSlideOut 0.3s ease-out';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, 3000);
    }

    // 更新分页器
    updatePagination() {
        const totalPages = Math.ceil(this.newsData.length / this.itemsPerPage);
        const pagination = document.getElementById('newsPagination');
        const currentPageSpan = document.getElementById('currentPage');
        const totalPagesSpan = document.getElementById('totalPages');
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');

        if (totalPages > 1) {
            pagination.style.display = 'flex';
            currentPageSpan.textContent = this.currentPage;
            totalPagesSpan.textContent = totalPages;

            prevBtn.disabled = this.currentPage === 1;
            nextBtn.disabled = this.currentPage === totalPages;
        } else {
            pagination.style.display = 'none';
        }
    }

    // 初始化回到顶部按钮
    initBackToTop() {
        this.backToTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // 初始化滚动监听
    initScrollListener() {
        window.addEventListener('scroll', () => {
            // 回到顶部按钮显示/隐藏
            if (window.pageYOffset > 300) {
                this.backToTopBtn.classList.add('visible');
            } else {
                this.backToTopBtn.classList.remove('visible');
            }
        });
    }
}

// 全局分页函数
function changePage(direction) {
    const app = window.chatApp;
    const totalPages = Math.ceil(app.newsData.length / app.itemsPerPage);

    const newPage = app.currentPage + direction;
    if (newPage >= 1 && newPage <= totalPages) {
        app.currentPage = newPage;
        app.renderNews();
        app.updatePagination();

        // 滚动到新闻区域
        document.getElementById('newsContainer').scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// 页面加载完成后初始化应用
document.addEventListener('DOMContentLoaded', () => {
    window.chatApp = new ChatApp();

    // 添加一些全局事件监听
    window.addEventListener('online', () => {
        console.log('网络连接恢复');
    });

    window.addEventListener('offline', () => {
        console.log('网络连接断开');
        chatApp.showErrorToast('网络连接断开，请检查网络设置');
    });

    // 添加键盘快捷键支持
    document.addEventListener('keydown', (e) => {
        // Ctrl+Enter 快速发送
        if (e.ctrlKey && e.key === 'Enter') {
            chatApp.sendMessage();
        }

        // Escape 键清空输入框
        if (e.key === 'Escape' && document.activeElement === chatApp.messageInput) {
            chatApp.messageInput.value = '';
            chatApp.messageInput.style.height = 'auto';
        }
    });
});
