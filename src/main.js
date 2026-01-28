import './style.css';
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
    this.sidebarOverlay.addEventListener('click', () => {
      if (this.isMobile) {
        e.stopPropagation();
        this.collapseSidebar();
      }
    });
    document.addEventListener('click', (e) => {
      if (this.isMobile &&
        this.sidebar.classList.contains('expanded') &&
        !this.sidebar.contains(e.target) &&
        !this.menuToggle.contains(e.target) &&
        !this.sidebarOverlay.contains(e.target)) {
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
        !this.menuToggle.contains(e.target)) {
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
document.addEventListener('DOMContentLoaded', () => {
  new SidebarManager();
  document.body.style.opacity = '0';
  setTimeout(() => {
    document.body.style.transition = 'opacity 0.3s ease';
    document.body.style.opacity = '1';
  }, 50);
});
window.addEventListener('beforeunload', () => {
  document.body.style.opacity = '0';
});