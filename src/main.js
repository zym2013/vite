import './style.css';

// 侧边栏交互逻辑
class SidebarManager {
  constructor() {
    this.sidebar = document.getElementById('sidebar');
    this.menuToggle = document.getElementById('menuToggle');
    this.sidebarOverlay = document.getElementById('sidebarOverlay');
    this.isMobile = this.checkIfMobile();

    this.touchStartX = 0;
    this.touchEndX = 0;
    this.isTouching = false;

    this.hoverTimeout = null;
    this.leaveTimeout = null;
    this.isManuallyCollapsed = false;

    this.init();
  }

  checkIfMobile() {
    return window.innerWidth <= 768;
  }

  expandSidebar() {
    if (this.sidebar) {
      this.sidebar.classList.add('expanded');
      if (this.isMobile) {
        this.sidebarOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
      }
      this.isManuallyCollapsed = false;
    }
  }

  collapseSidebar() {
    if (this.sidebar) {
      this.sidebar.classList.remove('expanded');
      if (this.isMobile) {
        this.sidebarOverlay.classList.remove('active');
        document.body.style.overflow = '';
      }
    }
  }

  manuallyCollapseSidebar() {
    if (!this.isMobile && this.sidebar.classList.contains('expanded')) {
      this.collapseSidebar();
      this.isManuallyCollapsed = true;

      setTimeout(() => {
        this.isManuallyCollapsed = false;
      }, 5000);
    }
  }

  toggleSidebar() {
    if (this.isMobile) {
      if (this.sidebar.classList.contains('expanded')) {
        this.collapseSidebar();
      } else {
        this.expandSidebar();
      }
    } else {
      if (this.sidebar.classList.contains('expanded')) {
        this.manuallyCollapseSidebar();
      } else {
        this.expandSidebar();
      }
    }
  }

  handleTouchStart(e) {
    if (this.isMobile) return;

    this.touchStartX = e.touches[0].clientX;
    this.isTouching = true;

    if (e.target.closest('.sidebar')) {
      this.expandSidebar();
    }
  }

  handleTouchEnd(e) {
    if (this.isMobile) return;

    this.touchEndX = e.changedTouches[0].clientX;
    this.isTouching = false;

    if (e.target.closest('.sidebar')) {
      const touchDistance = Math.abs(this.touchEndX - this.touchStartX);
      if (touchDistance < 10) {
        setTimeout(() => {
          if (!this.sidebar.matches(':hover') && !this.isManuallyCollapsed) {
            this.collapseSidebar();
          }
        }, 300);
      }
    }
  }

  handleTouchLeave() {
    if (this.isMobile) return;

    if (this.isTouching) {
      this.collapseSidebar();
      this.isTouching = false;
    }
  }

  handleTouchCancel() {
    if (this.isMobile) return;

    this.isTouching = false;
    this.collapseSidebar();
  }

  handleMouseEnter() {
    if (this.isMobile) return;

    if (this.leaveTimeout) {
      clearTimeout(this.leaveTimeout);
      this.leaveTimeout = null;
    }

    if (!this.isManuallyCollapsed) {
      if (this.hoverTimeout) clearTimeout(this.hoverTimeout);
      this.hoverTimeout = setTimeout(() => {
        if (!this.isManuallyCollapsed) {
          this.expandSidebar();
        }
      }, 100);
    }
  }

  handleMouseLeave(e) {
    if (this.isMobile) return;

    if (this.hoverTimeout) {
      clearTimeout(this.hoverTimeout);
      this.hoverTimeout = null;
    }

    const relatedTarget = e.relatedTarget;
    if (!this.sidebar.contains(relatedTarget)) {
      if (!this.isManuallyCollapsed) {
        if (this.leaveTimeout) clearTimeout(this.leaveTimeout);
        this.leaveTimeout = setTimeout(() => {
          if (!this.sidebar.matches(':hover') && !this.isManuallyCollapsed) {
            this.collapseSidebar();
          }
        }, 300);
      }
    }
  }

  handleResize() {
    const wasMobile = this.isMobile;
    this.isMobile = this.checkIfMobile();

    if (wasMobile && !this.isMobile) {
      this.collapseSidebar();
      this.sidebarOverlay.classList.remove('active');
      document.body.style.overflow = '';
      this.isManuallyCollapsed = false;
      this.sidebar.style.transform = '';
    } else if (!wasMobile && this.isMobile) {
      this.collapseSidebar();
      this.isManuallyCollapsed = false;
    }
  }

  handleSidebarClick(e) {
    if (this.isMobile) return;

    if (e.target.closest('.nav-item')) {
      e.preventDefault();
      this.expandSidebar();
      this.isManuallyCollapsed = false;
    }
  }

  initEventListeners() {
    this.menuToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggleSidebar();
    });

    this.sidebarOverlay.addEventListener('click', (e) => {
      if (this.isMobile) {
        e.stopPropagation();
        this.collapseSidebar();
      }
    });

    this.sidebar.addEventListener('touchstart', (e) => this.handleTouchStart(e));
    this.sidebar.addEventListener('touchend', (e) => this.handleTouchEnd(e));
    this.sidebar.addEventListener('touchleave', () => this.handleTouchLeave());
    this.sidebar.addEventListener('touchcancel', () => this.handleTouchCancel());

    this.sidebar.addEventListener('mouseenter', () => this.handleMouseEnter());
    this.sidebar.addEventListener('mouseleave', (e) => this.handleMouseLeave(e));

    this.sidebar.addEventListener('click', (e) => this.handleSidebarClick(e));

    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
      item.addEventListener('click', (e) => {
        if (this.isMobile) {
          this.collapseSidebar();
        } else {
          e.preventDefault();
          this.expandSidebar();
          this.isManuallyCollapsed = false;
        }
      });
    });

    window.addEventListener('resize', () => this.handleResize());

    document.addEventListener('click', (e) => {
      if (this.isMobile &&
        this.sidebar.classList.contains('expanded') &&
        !this.sidebar.contains(e.target) &&
        !this.menuToggle.contains(e.target) &&
        !this.sidebarOverlay.contains(e.target)) {
        this.collapseSidebar();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (this.isMobile && this.sidebar.classList.contains('expanded')) {
          this.collapseSidebar();
        } else if (!this.isMobile) {
          this.manuallyCollapseSidebar();
        }
      }
    });
  }

  init() {
    if (!this.sidebar) return;

    if (this.isMobile) {
      this.collapseSidebar();
    } else {
      this.collapseSidebar();
      this.isManuallyCollapsed = false;
    }

    this.initEventListeners();
  }
}

// 页面导航管理器 - 本地加载版本
class PageManager {
  constructor() {
    this.currentPage = 'home';
    this.breadcrumb = document.getElementById('breadcrumb');

    // 本地数据文件路径
    this.websitesJsonPath = '/data/websites.json';
    this.scriptsJsonPath = '/data/scripts.json';

    // 数据
    this.websiteData = [];
    this.scriptData = [];

    this.activeWebsiteTag = 'all';
    this.activeScriptTag = 'all';
    this.activeFilter = 'all';
    this.searchKeyword = '';

    // 数据缓存和状态
    this.dataCache = {
      websites: null,
      scripts: null,
      timestamp: null,
      cacheDuration: 5 * 60 * 1000 // 5分钟缓存
    };

    this.isLoading = false;

    // 用户相关状态
    this.usersData = [];
    this.usersPage = 1;
    this.usersPerPage = 10;
    this.usersView = 'all';
    this.usersSearch = '';

    this.SUPABASE_URL = 'https://ktwhwvafywwekfkvskbk.supabase.co';
    this.SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt0d2h3dmFmeXd3ZWtma3Zza2JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg2OTU1NDgsImV4cCI6MjA4NDI3MTU0OH0.tSCRz7ENeCT3NXt891equmSBfW_UsXHUdKSVMoxveKQ';

    this.init();
  }

  async init() {
    this.setupNavigation();
    this.setupExplorePage();
    this.setupUsersPage();
    this.loadInitialPage();
    this.setupHashChange();

    // 预加载数据
    this.preloadData();
  }

  // 3. 添加用户页面初始化方法
  setupUsersPage() {
    // 搜索功能
    const searchInput = document.getElementById('userSearch');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.usersSearch = e.target.value.toLowerCase();
        this.usersPage = 1;
        this.renderUsersContent();
      });
    }

    // 视图切换
    const viewToggles = document.querySelectorAll('.view-toggle');
    viewToggles.forEach(toggle => {
      toggle.addEventListener('click', () => {
        viewToggles.forEach(t => t.classList.remove('active'));
        toggle.classList.add('active');
        this.usersView = toggle.getAttribute('data-view');
        this.usersPage = 1;
        this.renderUsersContent();
      });
    });

    // 刷新按钮
    const refreshBtn = document.getElementById('refreshUsers');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => {
        this.refreshUsersData();
      });
    }
  }

  // 6. 添加用户数据获取方法
  async fetchUsersData() {
    try {
      const resp = await fetch(this.SUPABASE_URL + '/rest/v1/user_status?select=uid,last_seen', {
        headers: {
          'apikey': this.SUPABASE_ANON_KEY,
          'Authorization': 'Bearer ' + this.SUPABASE_ANON_KEY
        }
      });

      if (!resp.ok) throw new Error('HTTP ' + resp.status);
      return await resp.json();

    } catch (error) {
      console.error('获取用户数据失败:', error);
      throw error;
    }
  }

  // 7. 加载用户数据
  async loadUsersData() {
    const userList = document.getElementById('userList');
    if (userList) {
      userList.innerHTML = `
      <div class="loading-container">
        <div class="loading-spinner"></div>
        <div class="loading-text">正在加载用户数据...</div>
        <div class="loading-subtext">从服务器获取最新状态</div>
      </div>
    `;
    }

    try {
      const users = await this.fetchUsersData();
      this.processUsersData(users);
      this.renderUsersContent();
    } catch (error) {
      this.showUsersError('加载用户数据失败，请稍后重试');
    }
  }

  // 8. 刷新用户数据
  async refreshUsersData() {
    const refreshBtn = document.getElementById('refreshUsers');
    if (refreshBtn) {
      refreshBtn.classList.add('loading');
      refreshBtn.disabled = true;
    }

    try {
      const users = await this.fetchUsersData();
      this.processUsersData(users);
      this.renderUsersContent();
      this.showNotification('用户数据刷新成功！', 'success');
    } catch (error) {
      this.showNotification('刷新用户数据失败', 'error');
    } finally {
      if (refreshBtn) {
        setTimeout(() => {
          refreshBtn.classList.remove('loading');
          refreshBtn.disabled = false;
        }, 500);
      }
    }
  }

  // 9. 处理用户数据
  processUsersData(users) {
    const now = Date.now();
    const fiveMin = 5 * 60 * 1000;

    // 去重并排序
    const seen = new Set();
    const uniqueUsers = users.filter(u => {
      if (seen.has(u.uid)) return false;
      seen.add(u.uid);
      return true;
    }).map(user => {
      const lastSeen = new Date(user.last_seen).getTime();
      return {
        uid: String(user.uid),
        lastSeen: lastSeen,
        isOnline: (now - lastSeen) <= fiveMin,
        lastSeenFormatted: this.formatLastSeen(lastSeen)
      };
    }).sort((a, b) => a.uid - b.uid);

    this.usersData = uniqueUsers;
  }

  // 10. 格式化最后在线时间
  formatLastSeen(timestamp) {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (diff <= 5 * 60 * 1000) {
      return '刚刚在线';
    } else if (minutes < 60) {
      return `${minutes}分钟前`;
    } else if (hours < 24) {
      return `${hours}小时前`;
    } else if (days < 30) {
      return `${days}天前`;
    } else {
      return new Date(timestamp).toLocaleDateString('zh-CN');
    }
  }

  // 11. 渲染用户内容
  renderUsersContent() {
    // 更新统计数据
    const total = this.usersData.length;
    const online = this.usersData.filter(u => u.isOnline).length;

    document.getElementById('total-users').textContent = total;
    document.getElementById('online-users').textContent = online;
    document.getElementById('last-updated').textContent = new Date().toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit'
    });

    // 筛选用户
    let filteredUsers = this.usersData.filter(user => {
      // 搜索筛选
      if (this.usersSearch && !user.uid.includes(this.usersSearch)) {
        return false;
      }

      // 视图筛选
      if (this.usersView === 'online' && !user.isOnline) return false;
      if (this.usersView === 'offline' && user.isOnline) return false;

      return true;
    });

    // 分页
    const totalPages = Math.ceil(filteredUsers.length / this.usersPerPage);
    const startIndex = (this.usersPage - 1) * this.usersPerPage;
    const paginatedUsers = filteredUsers.slice(startIndex, startIndex + this.usersPerPage);

    // 渲染用户列表
    this.renderUserList(paginatedUsers);

    // 渲染分页信息
    this.renderPaginationInfo(filteredUsers.length);
    this.renderPaginationControls(totalPages);
  }

  // 12. 渲染用户列表
  renderUserList(users) {
    const container = document.getElementById('userList');

    if (!users || users.length === 0) {
      container.innerHTML = `
      <div class="empty">
        <i class="fas fa-search"></i>
        <p>${this.usersSearch ? '未找到匹配的用户' : '暂无用户数据'}</p>
        <p class="loading-subtext">${this.usersSearch ? '尝试搜索其他UID' : '请稍后刷新页面'}</p>
      </div>
    `;
      return;
    }

    container.innerHTML = users.map(user => `
    <div class="user-item">
      <img src="https://cdn.luogu.com.cn/upload/usericon/${user.uid}.png" 
           alt="UID ${user.uid}" 
           class="user-avatar">
      <div class="user-info">
        <a href="https://www.luogu.com.cn/user/${user.uid}" 
           target="_blank" 
           rel="noopener noreferrer" 
           class="user-link">
          UID ${user.uid}
          <i class="fas fa-external-link-alt"></i>
        </a>
        <div class="user-meta">
          <span class="user-status ${user.isOnline ? 'status-online' : 'status-offline'}">
            <i class="fas fa-${user.isOnline ? 'wifi' : 'power-off'} status-icon"></i>
            ${user.isOnline ? '在线' : '离线'}
          </span>
          <span class="last-seen">
            <i class="far fa-clock"></i>
            ${user.lastSeenFormatted}
          </span>
        </div>
      </div>
    </div>
  `).join('');
  }

  // 13. 渲染分页信息
  renderPaginationInfo(totalUsers) {
    const start = (this.usersPage - 1) * this.usersPerPage + 1;
    const end = Math.min(this.usersPage * this.usersPerPage, totalUsers);

    document.getElementById('paginationInfo').innerHTML = `
    显示第 ${start}–${end} 个用户，共 ${totalUsers} 个用户
  `;
  }

  // 14. 渲染分页控件
  renderPaginationControls(totalPages) {
    const container = document.getElementById('paginationControls');

    if (totalPages <= 1) {
      container.innerHTML = '';
      return;
    }

    let controls = '';

    // 上一页按钮
    controls += `
    <button class="pagination-btn" onclick="window.pageManager.changeUsersPage(${this.usersPage - 1})" 
            ${this.usersPage === 1 ? 'disabled' : ''}>
      <i class="fas fa-chevron-left"></i>
      上一页
    </button>
  `;

    // 页码按钮
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= this.usersPage - 2 && i <= this.usersPage + 2)) {
        controls += `
        <button class="pagination-btn ${i === this.usersPage ? 'active' : ''}" 
                onclick="window.pageManager.changeUsersPage(${i})">
          ${i}
        </button>
      `;
      } else if (i === this.usersPage - 3 || i === this.usersPage + 3) {
        controls += `<span class="pagination-btn" style="border: none; cursor: default;">...</span>`;
      }
    }

    // 下一页按钮
    controls += `
    <button class="pagination-btn" onclick="window.pageManager.changeUsersPage(${this.usersPage + 1})" 
            ${this.usersPage === totalPages ? 'disabled' : ''}>
      下一页
      <i class="fas fa-chevron-right"></i>
    </button>
  `;

    container.innerHTML = controls;
  }

  // 15. 切换页码
  changeUsersPage(page) {
    this.usersPage = page;
    this.renderUsersContent();
  }

  // 16. 显示用户错误
  showUsersError(message) {
    const container = document.getElementById('userList');
    if (container) {
      container.innerHTML = `
      <div class="error">
        <i class="fas fa-exclamation-triangle"></i>
        <p>${message}</p>
        <button class="retry-btn" onclick="window.pageManager.loadUsersData()">
          重试
        </button>
      </div>
    `;
    }
  }

  // 17. 添加删除用户功能（可选，供管理员使用）
  async deleteUsersByUID(uids) {
    const uidsStr = uids.join(',');
    const url = `${this.SUPABASE_URL}/rest/v1/user_status?uid=in.(${uidsStr})`;

    try {
      const resp = await fetch(url, {
        method: 'DELETE',
        headers: {
          'apikey': this.SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${this.SUPABASE_ANON_KEY}`,
          'Accept': 'application/json'
        }
      });

      if (resp.ok) {
        console.log('删除成功:', uids);
        return true;
      } else {
        console.error('删除失败:', resp.status, await resp.text());
        return false;
      }
    } catch (error) {
      console.error('删除用户失败:', error);
      return false;
    }
  }

  // 预加载数据
  async preloadData() {
    if (this.websiteData.length === 0) {
      await this.loadData('website');
    }
    if (this.scriptData.length === 0) {
      await this.loadData('script');
    }
  }

  // 数据获取方法 - 本地版本
  async fetchData(type) {
    const cacheKey = type === 'website' ? 'websites' : 'scripts';
    const path = type === 'website' ? this.websitesJsonPath : this.scriptsJsonPath;

    // 检查缓存
    if (this.dataCache[cacheKey] &&
      this.dataCache.timestamp &&
      (Date.now() - this.dataCache.timestamp) < this.dataCache.cacheDuration) {
      console.log(`使用缓存的${type}数据`);
      return this.dataCache[cacheKey];
    }

    try {
      this.showLoading(type);

      const response = await fetch(`${path}?t=${Date.now()}`, {
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status} - ${response.statusText}`);
      }

      const data = await response.json();
      const items = type === 'website' ? data.websites || data : data.scripts || data;

      // 验证数据格式
      if (!items || !Array.isArray(items)) {
        console.warn(`数据格式不符合预期，尝试解析原始数据`);
        // 尝试直接使用返回的数据
        return data;
      }

      // 更新缓存
      this.dataCache[cacheKey] = items;
      this.dataCache.timestamp = Date.now();

      console.log(`成功加载${type}数据`, items);
      return items;

    } catch (error) {
      console.error(`加载${type}数据失败:`, error);

      // 返回默认数据作为备份
      const defaultData = this.getDefaultData(type);
      this.dataCache[cacheKey] = defaultData;
      this.dataCache.timestamp = Date.now();
      return defaultData;
    }
  }

  // 获取默认数据
  getDefaultData(type) {
    if (type === 'website') {
      return [
        {
          id: 1,
          name: '洛谷',
          url: 'https://www.luogu.com.cn',
          avatar: 'https://cdn.luogu.com.cn/upload/usericon/1.png',
          description: '专业的在线编程学习和竞赛平台，提供丰富的算法题目和社区讨论',
          tags: ['学习', '编程', '算法', '社区'],
          type: 'website'
        },
        {
          id: 2,
          name: 'GitHub',
          url: 'https://github.com',
          avatar: 'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png',
          description: '全球最大的代码托管平台，开源项目的聚集地',
          tags: ['编程', '工具', '社区'],
          type: 'website'
        },
        {
          id: 3,
          name: 'Stack Overflow',
          url: 'https://stackoverflow.com',
          avatar: 'https://cdn.sstatic.net/Sites/stackoverflow/Img/apple-touch-icon.png',
          description: '程序员问答社区，解决编程难题的最佳去处',
          tags: ['学习', '编程', '社区'],
          type: 'website'
        }
      ];
    } else {
      return [
        {
          id: 1,
          name: 'Violentmonkey',
          url: 'https://violentmonkey.github.io',
          downloadUrl: 'https://violentmonkey.github.io/get-it/',
          avatar: 'https://violentmonkey.github.io/icons/icon-48.png',
          description: '强大的用户脚本管理器，支持 Greasemonkey、Tampermonkey 脚本',
          tags: ['工具', '增强', '自动化'],
          type: 'script'
        },
        {
          id: 2,
          name: 'Tampermonkey',
          url: 'https://www.tampermonkey.net',
          downloadUrl: 'https://www.tampermonkey.net',
          avatar: 'https://www.tampermonkey.net/favicon.ico',
          description: '最流行的用户脚本管理器，支持 Chrome、Firefox、Safari 等浏览器',
          tags: ['工具', '增强', '自动化'],
          type: 'script'
        }
      ];
    }
  }

  // 显示加载状态
  showLoading(type) {
    const container = document.getElementById(`${type}-grid`);
    if (container) {
      container.innerHTML = `
        <div class="loading-container">
          <div class="loading-spinner"></div>
          <div class="loading-text">正在加载${type === 'website' ? '网站' : '脚本'}数据...</div>
          <div class="loading-subtext">从本地文件加载推荐数据</div>
        </div>
      `;
    }
  }

  // 显示错误状态
  showError(type, message) {
    const container = document.getElementById(`${type}-grid`);
    if (container) {
      container.innerHTML = `
        <div class="error-message">
          <i class="fas fa-exclamation-triangle"></i>
          <p>加载${type === 'website' ? '网站' : '脚本'}数据失败</p>
          <p>${message}</p>
          <button class="retry-btn" onclick="window.pageManager.retryLoad('${type}')">
            重试
          </button>
        </div>
      `;
    }
  }

  // 显示空数据状态
  showEmptyState(type) {
    const container = document.getElementById(`${type}-grid`);
    if (container) {
      container.innerHTML = `
        <div class="no-results">
          <i class="fas fa-database"></i>
          <p>暂无${type === 'website' ? '网站' : '脚本'}推荐数据</p>
          <p class="loading-subtext">请检查数据文件或稍后重试</p>
        </div>
      `;
    }
  }

  // 重试加载
  async retryLoad(type) {
    await this.loadData(type);
  }

  // 加载数据
  async loadData(type) {
    try {
      const data = await this.fetchData(type);
      if (type === 'website') {
        this.websiteData = data;
        this.renderWebsiteContent();
      } else {
        this.scriptData = data;
        this.renderScriptContent();
      }
    } catch (error) {
      this.showError(type, error.message);
    }
  }

  // 刷新所有数据
  async refreshAllData() {
    const refreshBtn = document.getElementById('refreshBtn');
    if (refreshBtn) {
      refreshBtn.classList.add('loading');
      refreshBtn.disabled = true;
    }

    try {
      // 清除缓存
      this.dataCache.websites = null;
      this.dataCache.scripts = null;
      this.dataCache.timestamp = null;

      // 重新加载数据
      await Promise.all([
        this.loadData('website'),
        this.loadData('script')
      ]);

      // 显示成功提示
      this.showNotification('数据刷新成功！', 'success');

    } catch (error) {
      console.error('刷新数据失败:', error);
      this.showNotification('刷新数据失败，请检查数据文件', 'error');
    } finally {
      if (refreshBtn) {
        setTimeout(() => {
          refreshBtn.classList.remove('loading');
          refreshBtn.disabled = false;
        }, 500);
      }
    }
  }

  // 显示通知
  showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
      <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
      <span>${message}</span>
    `;

    // 添加样式
    Object.assign(notification.style, {
      position: 'fixed',
      top: '80px',
      right: '20px',
      background: type === 'success' ? 'var(--success-color)' : 'var(--danger-color)',
      color: 'white',
      padding: '12px 20px',
      borderRadius: '8px',
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      zIndex: '10000',
      animation: 'slideIn 0.3s ease',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
    });

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.animation = 'slideOut 0.3s ease';
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }, 3000);
  }

  setupNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const page = item.getAttribute('data-page');
        if (page !== 'none') {
          this.navigateTo(page);
        }
      });
    });
  }

  navigateTo(page) {
    this.currentPage = page;

    document.getElementById('home-page').style.display = 'none';
    document.getElementById('explore-page').style.display = 'none';
    document.getElementById('users-page').style.display = 'none';
    document.getElementById('about-page').style.display = 'none'; // 新增

    if (page === 'home') {
      document.getElementById('home-page').style.display = 'block';
      this.updateBreadcrumb('首页');
      this.updateNavActive('home');
    } else if (page === 'explore') {
      document.getElementById('explore-page').style.display = 'block';
      this.updateBreadcrumb('探索');
      this.updateNavActive('explore');

      // 如果数据为空，则加载数据
      if (!this.websiteData || this.websiteData.length === 0) {
        this.loadData('website');
      } else {
        this.renderWebsiteContent();
      }

      if (!this.scriptData || this.scriptData.length === 0) {
        this.loadData('script');
      } else {
        this.renderScriptContent();
      }
    } else if (page === 'users') {
      document.getElementById('users-page').style.display = 'block';
      this.updateBreadcrumb('用户');
      this.updateNavActive('users');

      // 加载用户数据
      if (this.usersData.length === 0) {
        this.loadUsersData();
      } else {
        this.renderUsersContent();
      }
    } else if (page === 'about') { // 新增
      document.getElementById('about-page').style.display = 'block';
      this.updateBreadcrumb('关于');
      this.updateNavActive('about');
    }

    window.location.hash = page;
  }

  updateBreadcrumb(pageName) {
    let iconHtml;

    if (this.currentPage === 'home') {
      iconHtml = '<i class="fas fa-home"></i>';
    } else if (this.currentPage === 'explore') {
      // 使用SVG望远镜图标
      iconHtml = `
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
           fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
           stroke-linejoin="round" class="breadcrumb-svg-icon" aria-hidden="true">
        <path d="m10.065 12.493-6.18 1.318a.934.934 0 0 1-1.108-.702l-.537-2.15a1.07 1.07 0 0 1 .691-1.265l13.504-4.44"></path>
        <path d="m13.56 11.747 4.332-.924"></path>
        <path d="m16 21-3.105-6.21"></path>
        <path d="M16.485 5.94a2 2 0 0 1 1.455-2.425l1.09-.272a1 1 0 0 1 1.212.727l1.515 6.06a1 1 0 0 1-.727 1.213l-1.09.272a2 2 0 0 1-2.425-1.455z"></path>
        <path d="m6.158 8.633 1.114 4.456"></path>
        <path d="m8 21 3.105-6.21"></path>
        <circle cx="12" cy="13" r="2"></circle>
      </svg>
    `;
    } else if (this.currentPage === 'users') {
      iconHtml = '<i class="fas fa-users"></i>';
    } else if (this.currentPage === 'about') {
      iconHtml = '<i class="fas fa-info-circle"></i>';
    }

    this.breadcrumb.innerHTML = `
    <a href="#${this.currentPage}" class="breadcrumb-item">
      ${iconHtml}
      <span>${pageName}</span>
    </a>
  `;
  }

  updateNavActive(activePage) {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
      item.classList.remove('active');
      if (item.getAttribute('data-page') === activePage) {
        item.classList.add('active');
      }
    });
  }

  loadInitialPage() {
    const hash = window.location.hash.replace('#', '');
    if (hash === 'explore') {
      this.navigateTo('explore');
    } else if (hash === 'users') {
      this.navigateTo('users');
    } else if (hash === 'about') {
      this.navigateTo('about');
    } else {
      this.navigateTo('home');
    }
  }

  setupHashChange() {
    window.addEventListener('hashchange', () => {
      const hash = window.location.hash.replace('#', '');
      if (hash === 'explore') {
        this.navigateTo('explore');
      } else if (hash === 'users') {
        this.navigateTo('users');
      } else if (hash === 'about') {
        this.navigateTo('about');
      } else {
        this.navigateTo('home');
      }
    });
  }

  setupExplorePage() {
    // 搜索功能
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');

    const performSearch = () => {
      this.searchKeyword = searchInput.value.toLowerCase();
      this.renderExploreContent();
    };

    searchInput.addEventListener('input', performSearch);
    searchBtn.addEventListener('click', performSearch);
    searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        performSearch();
      }
    });

    // 筛选标签
    const filterTabs = document.querySelectorAll('.filter-tab');
    filterTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        filterTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        this.activeFilter = tab.getAttribute('data-filter');
        this.renderExploreContent();
      });
    });

    // 网站标签筛选
    const websiteTags = document.querySelectorAll('#website-tags .tag-filter-item');
    websiteTags.forEach(tag => {
      tag.addEventListener('click', () => {
        websiteTags.forEach(t => t.classList.remove('active'));
        tag.classList.add('active');
        this.activeWebsiteTag = tag.getAttribute('data-tag');
        this.renderWebsiteContent();
      });
    });

    // 脚本标签筛选
    const scriptTags = document.querySelectorAll('#script-tags .tag-filter-item');
    scriptTags.forEach(tag => {
      tag.addEventListener('click', () => {
        scriptTags.forEach(t => t.classList.remove('active'));
        tag.classList.add('active');
        this.activeScriptTag = tag.getAttribute('data-tag');
        this.renderScriptContent();
      });
    });

    // 刷新按钮
    const refreshBtn = document.getElementById('refreshBtn');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => {
        this.refreshAllData();
      });
    }
  }

  renderExploreContent() {
    this.renderWebsiteContent();
    this.renderScriptContent();
  }

  renderWebsiteContent() {
    const container = document.getElementById('website-grid');
    const countElement = document.getElementById('website-count');

    if (!this.websiteData || this.websiteData.length === 0) {
      this.showEmptyState('website');
      if (countElement) countElement.textContent = '0';
      return;
    }

    // 筛选数据
    let filteredData = this.websiteData.filter(item => {
      // 根据主筛选器筛选
      if (this.activeFilter === 'script') return false;

      // 根据标签筛选
      if (this.activeWebsiteTag !== 'all' && !item.tags.includes(this.activeWebsiteTag)) {
        return false;
      }

      // 根据搜索词筛选
      if (this.searchKeyword) {
        const searchInName = item.name.toLowerCase().includes(this.searchKeyword);
        const searchInDesc = item.description.toLowerCase().includes(this.searchKeyword);
        const searchInTags = item.tags.some(tag => tag.toLowerCase().includes(this.searchKeyword));
        if (!searchInName && !searchInDesc && !searchInTags) {
          return false;
        }
      }

      return true;
    });

    // 更新计数
    if (countElement) countElement.textContent = filteredData.length;

    // 渲染卡片
    if (filteredData.length === 0) {
      container.innerHTML = `
        <div class="no-results">
          <i class="fas fa-search"></i>
          <p>未找到匹配的网站</p>
          <p class="loading-subtext">尝试更换搜索词或筛选标签</p>
        </div>
      `;
      return;
    }

    container.innerHTML = filteredData.map(item => `
      <div class="recommendation-card" data-type="website">
        <div class="card-header">
          <img src="${item.avatar}" alt="${item.name}" class="card-avatar">
          <div class="card-title-info">
            <div>
              <h3 class="card-title">${item.name}</h3>
            </div>
            <p class="card-url">${item.url}</p>
          </div>
        </div>
        <p class="card-desc">${item.description}</p>
        <div class="card-footer">
          <div class="card-tags">
            ${item.tags.map(tag => `<span class="card-tag">${tag}</span>`).join('')}
          </div>
          <a href="${item.url}" target="_blank" rel="noopener noreferrer" class="card-action">
            <i class="fas fa-external-link-alt"></i>
            前往网站
          </a>
        </div>
      </div>
    `).join('');
  }

  renderScriptContent() {
    const container = document.getElementById('script-grid');
    const countElement = document.getElementById('script-count');

    if (!this.scriptData || this.scriptData.length === 0) {
      this.showEmptyState('script');
      if (countElement) countElement.textContent = '0';
      return;
    }

    // 筛选数据
    let filteredData = this.scriptData.filter(item => {
      // 根据主筛选器筛选
      if (this.activeFilter === 'website') return false;

      // 根据标签筛选
      if (this.activeScriptTag !== 'all' && !item.tags.includes(this.activeScriptTag)) {
        return false;
      }

      // 根据搜索词筛选
      if (this.searchKeyword) {
        const searchInName = item.name.toLowerCase().includes(this.searchKeyword);
        const searchInDesc = item.description.toLowerCase().includes(this.searchKeyword);
        const searchInTags = item.tags.some(tag => tag.toLowerCase().includes(this.searchKeyword));
        if (!searchInName && !searchInDesc && !searchInTags) {
          return false;
        }
      }

      return true;
    });

    // 更新计数
    if (countElement) countElement.textContent = filteredData.length;

    // 渲染卡片
    if (filteredData.length === 0) {
      container.innerHTML = `
        <div class="no-results">
          <i class="fas fa-search"></i>
          <p>未找到匹配的脚本</p>
          <p class="loading-subtext">尝试更换搜索词或筛选标签</p>
        </div>
      `;
      return;
    }

    container.innerHTML = filteredData.map(item => `
      <div class="recommendation-card" data-type="script">
        <div class="card-header">
          <img src="${item.avatar}" alt="${item.name}" class="card-avatar">
          <div class="card-title-info">
            <div>
              <h3 class="card-title">${item.name}</h3>
            </div>
            <p class="card-url">${item.url}</p>
          </div>
        </div>
        <p class="card-desc">${item.description}</p>
        <div class="card-footer">
          <div class="card-tags">
            ${item.tags.map(tag => `<span class="card-tag">${tag}</span>`).join('')}
          </div>
          <a href="${item.downloadUrl || item.url}" target="_blank" rel="noopener noreferrer" class="card-action">
            <i class="fas fa-download"></i>
            下载安装
          </a>
        </div>
      </div>
    `).join('');
  }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
  new SidebarManager();
  window.pageManager = new PageManager();

  // 添加页面加载动画
  document.body.style.opacity = '0';
  setTimeout(() => {
    document.body.style.transition = 'opacity 0.3s ease';
    document.body.style.opacity = '1';
  }, 50);
});

// 页面卸载前清理
window.addEventListener('beforeunload', () => {
  document.body.style.opacity = '0';
});