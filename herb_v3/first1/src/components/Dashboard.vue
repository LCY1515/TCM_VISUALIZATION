<template>
  <div class="dashboard-container" :class="{ 'dark-theme': isDarkMode }">
    <header class="dashboard-header">
      <h1 class="main-title">中医传统理论可视化系统</h1>
      <div class="controls">
        <button class="theme-toggle" @click="toggleTheme">
          <span v-if="isDarkMode">☀️ 亮色模式</span>
          <span v-else>🌙 暗色模式</span>
        </button>
        <button class="fullscreen-toggle" @click="toggleFullscreen">
          <span v-if="isFullscreen">⛶ 退出全屏</span>
          <span v-else>⛶ 全屏</span>
        </button>
      </div>
    </header>
    
    <div class="dashboard-content">
      <!-- 顶部区域 - 时间轴 -->
      <section class="timeline-section">
        <div class="section-header">
          <h2>中医发展历史时间轴</h2>
        </div>
        <div class="timeline-wrapper">
          <TcmTimeline 
            ref="timelineComp" 
            :theme-mode="currentTheme" 
            @theme-changed="handleThemeChange"
          />
        </div>
      </section>
      
      <!-- 中间区域 - 图表 -->
      <section class="charts-section">
        <div class="chart-container left">
          <div class="section-header">
            <h2>中医典籍分类分布</h2>
            <div class="view-controls">
              <button 
                @click="treemapViewType = 'treemap'"
                :class="{ active: treemapViewType === 'treemap' }"
              >
                矩形树图
              </button>
              <button 
                @click="treemapViewType = 'sunburst'"
                :class="{ active: treemapViewType === 'sunburst' }"
              >
                旭日图
              </button>
            </div>
          </div>
          <div class="chart-wrapper">
            <MedicalBooksTreemap 
              :view-type="treemapViewType" 
              :theme-mode="currentTheme" 
              ref="treemapComp"
              @theme-changed="handleThemeChange"
            />
          </div>
        </div>
        
        <div class="chart-container right">
          <div class="section-header">
            <h2>历代中医典籍分类与数量</h2>
            <div class="view-controls">
              <button 
                @click="barChartDirection = 'horizontal'"
                :class="{ active: barChartDirection === 'horizontal' }"
              >
                横向图表
              </button>
              <button 
                @click="barChartDirection = 'vertical'"
                :class="{ active: barChartDirection === 'vertical' }"
              >
                纵向图表
              </button>
            </div>
          </div>
          <div class="chart-wrapper">
            <MedicalBooksChart 
              :direction="barChartDirection" 
              :theme-mode="currentTheme" 
              ref="barChartComp"
              @theme-changed="handleThemeChange"
            />
          </div>
        </div>
      </section>
      
      <!-- 底部区域 - 学派关系图 -->
      <section class="relation-section">
        <div class="section-header">
          <h2>中医学派传承关系图谱</h2>
          <div class="view-controls">
            <button 
              @click="relationLayout = 'force'"
              :class="{ active: relationLayout === 'force' }"
            >
              力导向图
            </button>
            <button 
              @click="relationLayout = 'circular'"
              :class="{ active: relationLayout === 'circular' }"
            >
              环形布局
            </button>
          </div>
        </div>
        <div class="relation-wrapper">
          <SchoolRelationChart 
            ref="relationChartComp"
            :layout="relationLayout"
            :theme-mode="currentTheme"
            @theme-changed="handleThemeChange"
          />
        </div>
      </section>
    </div>
    
    <footer class="dashboard-footer">
      <p>中医理论可视化大屏 | 基于Vue3开发</p>
      <p>数据来源：中医药传统理论文献整理</p>
    </footer>
  </div>
</template>

<script>
import TcmTimeline from './TcmTimeline.vue'
import MedicalBooksTreemap from './MedicalBooksTreemap.vue'
import MedicalBooksChart from './MedicalBooksChart.vue'
import SchoolRelationChart from './SchoolRelationChart.vue'

export default {
  name: 'TCMVisualizationDashboard',
  components: {
    TcmTimeline,
    MedicalBooksTreemap,
    MedicalBooksChart,
    SchoolRelationChart
  },
  
  data() {
    return {
      isDarkMode: false,
      isFullscreen: false,
      timelineViewMode: 'timeline',
      treemapViewType: 'treemap',
      barChartDirection: 'horizontal',
      relationLayout: 'force',
      themeChangeInProgress: false
    }
  },
  
  computed: {
    // 为组件提供当前主题的计算属性
    currentTheme() {
      return this.isDarkMode ? 'dark' : 'light';
    }
  },
  
  methods: {
    // 处理来自子组件的主题变更通知
    handleThemeChange() {
      // 防止主题切换时的重复刷新
      if (!this.themeChangeInProgress) {
        console.log('主题变更事件接收成功');
      }
    },
    
    // 切换主题模式
    toggleTheme() {
      // 设置标志，防止重复刷新
      this.themeChangeInProgress = true;
      
      this.isDarkMode = !this.isDarkMode;
      
      // 保存用户主题偏好到本地存储
      localStorage.setItem('tcm-dashboard-theme', this.isDarkMode ? 'dark' : 'light');
      
      // 更新document的class以支持全局CSS变量
      if (this.isDarkMode) {
        document.documentElement.classList.add('dark-theme');
      } else {
        document.documentElement.classList.remove('dark-theme');
      }
      
      // 使用nextTick确保DOM更新后再刷新图表
      this.$nextTick(() => {
        this.refreshAllCharts();
        
        // 延迟重置标志，确保所有刷新操作完成
        setTimeout(() => {
          this.themeChangeInProgress = false;
        }, 300);
      });
    },
    
    // 刷新所有图表
    refreshAllCharts() {
      // 创建一个包含所有图表组件引用的数组
      const chartComponents = [
        this.$refs.timelineComp,
        this.$refs.treemapComp,
        this.$refs.barChartComp,
        this.$refs.relationChartComp
      ];
      
      // 遍历所有图表组件并调用它们的刷新方法
      chartComponents.forEach(comp => {
        if (comp && typeof comp.refreshChart === 'function') {
          try {
            comp.refreshChart(true); // 传递 true 表示这是主题变更触发的刷新
          } catch (error) {
            console.error('刷新图表时出错:', error);
          }
        }
      });
    },
    
    // 切换全屏模式
    toggleFullscreen() {
      if (!this.isFullscreen) {
        // 进入全屏模式
        const elem = document.documentElement;
        if (elem.requestFullscreen) {
          elem.requestFullscreen();
        } else if (elem.mozRequestFullScreen) { // Firefox
          elem.mozRequestFullScreen();
        } else if (elem.webkitRequestFullscreen) { // Chrome, Safari, Opera
          elem.webkitRequestFullscreen();
        } else if (elem.msRequestFullscreen) { // IE/Edge
          elem.msRequestFullscreen();
        }
      } else {
        // 退出全屏模式
        if (document.exitFullscreen) {
          document.exitFullscreen();
        } else if (document.mozCancelFullScreen) {
          document.mozCancelFullScreen();
        } else if (document.webkitExitFullscreen) {
          document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) {
          document.msExitFullscreen();
        }
      }
    },
    
    // 处理全屏事件
    handleFullscreenChange() {
      this.isFullscreen = !!document.fullscreenElement || 
                          !!document.webkitFullscreenElement || 
                          !!document.mozFullScreenElement ||
                          !!document.msFullscreenElement;
    },
    
    // 检查和应用系统偏好
    checkSystemPreference() {
      // 检查系统是否偏好暗色主题
      const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
      
      // 如果用户没有显式设置主题偏好，则遵循系统偏好
      const savedTheme = localStorage.getItem('tcm-dashboard-theme');
      
      if (!savedTheme) {
        this.isDarkMode = prefersDarkScheme.matches;
        
        // 更新document的class
        if (this.isDarkMode) {
          document.documentElement.classList.add('dark-theme');
        }
      } else {
        // 应用用户保存的主题偏好
        this.isDarkMode = savedTheme === 'dark';
        
        // 更新document的class
        if (this.isDarkMode) {
          document.documentElement.classList.add('dark-theme');
        }
      }
      
      // 监听系统主题变化
      prefersDarkScheme.addEventListener('change', (e) => {
        // 只有当用户没有明确设置主题偏好时，才跟随系统变化
        if (!localStorage.getItem('tcm-dashboard-theme')) {
          this.isDarkMode = e.matches;
          
          // 更新document的class
          if (this.isDarkMode) {
            document.documentElement.classList.add('dark-theme');
          } else {
            document.documentElement.classList.remove('dark-theme');
          }
          
          // 刷新所有图表
          this.$nextTick(() => {
            this.refreshAllCharts();
          });
        }
      });
    },
    
    // 监听窗口大小变化
    handleResize() {
      // 当窗口宽度小于特定值时，自动调整视图模式
      if (window.innerWidth < 768) {
        this.timelineViewMode = 'list';
        this.barChartDirection = 'vertical';
      }
    },
    
    // 重置关系图
    resetRelationChart() {
      if (this.$refs.relationChartComp && this.$refs.relationChartComp.resetZoom) {
        this.$refs.relationChartComp.resetZoom();
      }
    }
  },
  
  mounted() {
    // 检查主题偏好
    this.checkSystemPreference();
    
    // 添加窗口大小变化监听器
    window.addEventListener('resize', this.handleResize);
    
    // 初始检查窗口大小
    this.handleResize();
    
    // 监听全屏变化事件
    document.addEventListener('fullscreenchange', this.handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', this.handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', this.handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', this.handleFullscreenChange);
  },
  
  beforeUnmount() {
    // 移除窗口大小变化监听器
    window.removeEventListener('resize', this.handleResize);
    
    // 移除全屏变化事件监听器
    document.removeEventListener('fullscreenchange', this.handleFullscreenChange);
    document.removeEventListener('webkitfullscreenchange', this.handleFullscreenChange);
    document.removeEventListener('mozfullscreenchange', this.handleFullscreenChange);
    document.removeEventListener('MSFullscreenChange', this.handleFullscreenChange);
  }
}
</script>

<style>
/* 基础样式 */
:root {
  --primary-color: #A77E58;
  --primary-light: #D2B48C;
  --primary-dark: #73472B;
  --background-color: #FBF3E4;
  --card-bg: #FFFAF0;
  --text-color: #333333;
  --text-secondary: #666666;
  --border-color: #E9F1F6;
  --shadow-color: rgba(184, 138, 103, 0.2);
  --highlight-color: #F2C462;
  --chart-color-1: #D2B48C;
  --chart-color-2: #A77E58;
  --chart-color-3: #73472B;
  --chart-color-4: #C9A66B;
  --chart-color-5: #E6CCB3;
  --chart-color-6: #8A5A44;
  --chart-text-color: #333333;
  --tooltip-background: rgba(255, 250, 240, 0.9);
  --tooltip-border: #D2B48C;
}

/* 暗色主题变量 */
:root.dark-theme, .dark-theme {
  --primary-color: #826048;
  --primary-light: #A67C52;
  --primary-dark: #5B4334;
  --background-color: #2A2A2A;
  --card-bg: #3A3A3A;
  --text-color: #E0E0E0;
  --text-secondary: #AAAAAA;
  --border-color: #555555;
  --shadow-color: rgba(0, 0, 0, 0.3);
  --highlight-color: #D5A74C;
  --chart-color-1: #A67C52;
  --chart-color-2: #826048;
  --chart-color-3: #5B4334;
  --chart-color-4: #C9A66B;
  --chart-color-5: #8D7966;
  --chart-color-6: #D5A74C;
  --chart-text-color: #E0E0E0;
  --tooltip-background: rgba(58, 58, 58, 0.9);
  --tooltip-border: #826048;
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: 'Microsoft YaHei', 'STZhongsong', 'Heiti SC', 'SimSun', sans-serif;
  background-color: var(--background-color);
  color: var(--text-color);
  transition: background-color 0.3s ease, color 0.3s ease;
}

.dashboard-container {
  width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: var(--background-color);
  transition: background-color 0.3s ease, color 0.3s ease;
}

/* 头部样式 */
.dashboard-header {
  background: linear-gradient(to right, var(--primary-dark), var(--primary-color));
  color: white;
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 10px var(--shadow-color);
  transition: background 0.3s ease, box-shadow 0.3s ease;
}

.main-title {
  font-family: "Ma Shan Zheng", "STZhongsong", serif;
  font-size: 28px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.controls {
  display: flex;
  gap: 12px;
}

.controls button {
  background-color: rgba(255, 255, 255, 0.2);
  border: none;
  border-radius: 4px;
  padding: 8px 12px;
  color: white;
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.2s ease;
}

.controls button:hover {
  background-color: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
}

.theme-toggle {
  display: flex;
  align-items: center;
  gap: 6px;
}

/* 内容区域样式 */
.dashboard-content {
  flex: 1;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  height: calc(100vh - 120px);
  overflow-y: auto;
  transition: background-color 0.3s ease;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 2px solid var(--primary-light);
  transition: border-color 0.3s ease;
}

.section-header h2 {
  font-family: "STZhongsong", serif;
  color: var(--primary-color);
  font-size: 20px;
  transition: color 0.3s ease;
}

.view-controls {
  display: flex;
  gap: 8px;
}

.view-controls button {
  display: flex;
  align-items: center;
  gap: 6px;
  background-color: var(--card-bg);
  border: 1px solid var(--primary-light);
  border-radius: 4px;
  padding: 8px 12px;
  font-size: 0.875rem;
  color: var(--text-color);
  cursor: pointer;
  transition: all 0.3s ease;
}

.view-controls button svg-icon {
  width: 16px;
  height: 16px;
}

.view-controls button.active {
  background-color: var(--primary-color);
  color: white;
}

.view-controls button:hover:not(.active) {
  background-color: var(--primary-light);
  color: var(--text-color);
}

/* 时间轴区域 */
.timeline-section {
  min-height: 500px;
  background-color: var(--card-bg);
  border-radius: 8px;
  box-shadow: 0 4px 12px var(--shadow-color);
  padding: 20px;
  border: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  transition: background-color 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease;
}

.timeline-wrapper {
  flex: 1;
  min-height: 420px;
  width: 100%;
  overflow: visible;
  position: relative;
}

/* 图表区域 */
.charts-section {
  display: flex;
  gap: 20px;
  min-height: 600px;
}

.chart-container {
  flex: 1;
  background-color: var(--card-bg);
  border-radius: 8px;
  box-shadow: 0 4px 12px var(--shadow-color);
  padding: 16px;
  border: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  transition: background-color 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease;
}

.chart-wrapper {
  flex: 1;
  min-height: 500px;
  width: 100%;
}

/* 关系图区域 */
.relation-section {
  min-height: 800px;
  background-color: var(--card-bg);
  border-radius: 8px;
  box-shadow: 0 4px 12px var(--shadow-color);
  padding: 20px;
  border: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  transition: background-color 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease;
}

.relation-wrapper {
  flex: 1;
  min-height: 720px;
  width: 100%;
  overflow: visible;
}

/* 页脚样式 */
.dashboard-footer {
  margin-top: 20px;
  background-color: var(--primary-dark);
  color: white;
  padding: 16px;
  text-align: center;
  font-size: 0.875rem;
  transition: background-color 0.3s ease;
}

.dashboard-footer p:last-child {
  margin-top: 8px;
  font-size: 0.75rem;
  opacity: 0.8;
}

/* 动画过渡效果 */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.5s;
}
.fade-enter, .fade-leave-to {
  opacity: 0;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .timeline-section,
  .relation-section {
    min-height: 600px;
  }
  
  .timeline-wrapper,
  .relation-wrapper {
    min-height: 520px;
  }
  
  .charts-section {
    flex-direction: column;
  }
  
  .chart-container {
    min-height: 500px;
  }
  
  .chart-wrapper {
    min-height: 400px;
  }
}

@media (max-width: 768px) {
  .timeline-section,
  .relation-section {
    min-height: 500px;
  }
  
  .timeline-wrapper,
  .relation-wrapper {
    min-height: 420px;
  }
  
  .dashboard-content {
    height: calc(100vh - 160px); /* 调整移动端高度 */
  }
  
  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .main-title {
    font-size: 24px;
  }
  
  .controls {
    flex-direction: column;
    gap: 8px;
  }
}

/* 暗色主题覆盖样式 - 确保特定元素正确显示 */
.dark-theme .section-header h2 {
  color: var(--primary-light);
}
.dark-theme .tcm-timeline-container .footer {
  color: #E0E0E0 !important; /* 使用较亮的颜色 */
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5); /* 添加文字阴影增强可读性 */
}

.dark-theme .tcm-timeline-container .tips {
  color: #E0E0E0 !important;
}

/* 增强时间轴事件卡片在暗色模式下的可读性 */
.dark-theme .tcm-timeline-container .era-info,
.dark-theme .tcm-timeline-container .event-card,
.dark-theme .tcm-timeline-container .list-event {
  border-color: #5B4334 !important;
  background-color: #3A3A3A !important;
}

.dark-theme .tcm-timeline-container .event-title,
.dark-theme .tcm-timeline-container .event-description,
.dark-theme .tcm-timeline-container .event-meta,
.dark-theme .tcm-timeline-container .event-date,
.dark-theme .tcm-timeline-container .era-summary {
  color: #E0E0E0 !important; /* 提高文字亮度 */
}

/* 增强暗色模式下的事件卡片边框和阴影 */
.dark-theme .tcm-timeline-container .event-card {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3) !important;
}

/* 增强点击时的高亮效果 */
.dark-theme .tcm-timeline-container .event-card.active {
  border-color: var(--primary-light) !important;
  box-shadow: 0 0 12px var(--primary-color) !important;
}

/* 增强暗色模式下的控制按钮样式 */
.dark-theme .tcm-timeline-container .control-btn,
.dark-theme .tcm-timeline-container .view-btn,
.dark-theme .tcm-timeline-container .filter-btn {
  background-color: #444444 !important;
  color: #E0E0E0 !important;
  border-color: #555555 !important;
}

.dark-theme .tcm-timeline-container .control-btn:hover,
.dark-theme .tcm-timeline-container .view-btn:hover,
.dark-theme .tcm-timeline-container .filter-btn:hover {
  background-color: #555555 !important;
}

/* 确保筛选按钮和搜索框在暗色模式下清晰可见 */
.dark-theme .tcm-timeline-container .search-input {
  background-color: #444444 !important;
  color: #E0E0E0 !important;
  border-color: #555555 !important;
}

/* 提高滤镜按钮在点击时的可见性 */
.dark-theme .tcm-timeline-container .filter-btn.active {
  background-color: var(--primary-color) !important;
  color: white !important;
  border-color: var(--primary-light) !important;
}
</style>