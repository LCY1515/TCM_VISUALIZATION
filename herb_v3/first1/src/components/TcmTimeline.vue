<!-- TCMTimeline.vue -->
<template>
  <div class="tcm-timeline-container" :class="theme">
    <!-- 加载状态 -->
    <div v-if="loading" class="loading-overlay">
      <div class="loading-spinner"></div>
      <p>正在加载中医历史数据...</p>
    </div>

    <!-- 错误提示 -->
    <div v-else-if="error" class="error-message">
      <p>{{ error }}</p>
      <button @click="loadData" class="retry-button">重试</button>
    </div>

    <template v-else>
      <!-- 顶部控制区 -->
      <div class="header">
        <div class="header-left">
          <div class="view-controls">
            <button 
              :class="['view-btn', { active: viewMode === 'timeline' }]" 
              @click="viewMode = 'timeline'"
              title="时间轴视图"
            >
              <svg-icon name="timeline" />
              <span>时间轴</span>
            </button>
            <button 
              :class="['view-btn', { active: viewMode === 'list' }]" 
              @click="viewMode = 'list'"
              title="列表视图"
            >
              <svg-icon name="list" />
              <span>列表</span>
            </button>
          </div>
        </div>
        
        <!-- 添加主题切换按钮 -->
        <div class="theme-toggle">
          <button @click="toggleTheme()" class="theme-btn" :title="theme === 'light' ? '切换到暗色模式' : '切换到亮色模式'">
            <svg-icon :name="theme === 'light' ? 'moon' : 'sun'" />
          </button>
        </div>
      </div>

      <!-- 过滤器 -->
      <div class="filters">
        <div class="filter-buttons">
          <button 
  v-for="type in eventTypes" 
  :key="type"
  :class="['filter-btn', type, { active: activeFilters.includes(type) }]"
  @click="toggleFilter(type)"
  :style="{ 
    backgroundColor: activeFilters.includes(type) ? '#fff !important' : typeColorMap[type] + ' !important', 
    color: activeFilters.includes(type) ? typeColorMap[type] + ' !important' : '#fff !important',
    borderColor: typeColorMap[type] + ' !important'
  }"
>
  <svg-icon :name="typeIconMap[type]" :size="16" />
  <span>{{ type }}</span>
</button>
        </div>
        <div class="search-container">
          <input 
            type="text" 
            v-model="searchQuery" 
            placeholder="搜索事件..." 
            class="search-input"
          />
          <button v-if="searchQuery" @click="searchQuery = ''" class="clear-search">
            <svg-icon name="x" :size="16" />
          </button>
        </div>
      </div>

      <!-- 时间轴视图 -->
      <div v-if="viewMode === 'timeline'" class="timeline-view">
        <div class="timeline-controls">
          <div class="control-group">
            <button @click="pan('left')" class="control-btn" title="向左平移">
              <svg-icon name="chevron-left" :size="20" />
              <span>向左</span>
            </button>
            <button @click="pan('right')" class="control-btn" title="向右平移">
              <svg-icon name="chevron-right" :size="20" />
              <span>向右</span>
            </button>
            <button @click="zoom('in')" class="control-btn" title="放大">
              <svg-icon name="zoom-in" :size="20" />
              <span>放大</span>
            </button>
            <button @click="zoom('out')" class="control-btn" title="缩小">
              <svg-icon name="zoom-out" :size="20" />
              <span>缩小</span>
            </button>
            <button @click="resetView" class="control-btn" title="重置视图">
              <svg-icon name="refresh-cw" :size="20" />
              <span>重置</span>
            </button>
          </div>
        </div>

        <div class="timeline-container" ref="timelineContainer">
          <div 
            class="timeline-wrapper" 
            :style="{ 
              transform: `translateX(${translate}px) scale(${scale})`,
              width: `${eras.length * 200}px` 
            }"
          >
            <div class="timeline-line"></div>
            
            <!-- 时代节点 -->
            <div 
              v-for="(era, index) in eras" 
              :key="era.era" 
              class="era-node"
              :class="{ active: selectedEra && selectedEra.era === era.era }"
              :style="{ left: `${index * 200 + 100}px` }"
              @click="selectEra(era)"
            >
              <div class="era-point"></div>
              <div class="era-label">
                <div class="era-name">{{ era.era }}</div>
                <div class="era-time">{{ era.time_range }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- 选中时代信息 -->
        <div v-if="selectedEra" class="era-info">
          <h2>{{ selectedEra.era }}</h2>
          <div class="era-time-range">{{ selectedEra.time_range }}</div>
          <div class="era-summary">{{ selectedEra.summary }}</div>
        </div>

        <!-- 事件列表 -->
        <div v-if="selectedEra" class="events-grid">
          <div v-if="filteredEvents.length === 0" class="no-events">
            没有找到符合条件的事件
          </div>
          <div 
            v-for="event in filteredEvents" 
            :key="event.id"
            class="event-card"
            :class="[
              event.type, 
              { active: selectedEvent && selectedEvent.id === event.id }
            ]"
            :style="{ borderLeftColor: typeColorMap[event.type] }"
            @click="selectEvent(event)"
          >
            <div class="event-header">
              <h3 class="event-title">{{ event.title }}</h3>
              <span class="event-type" :style="{ backgroundColor: typeColorMap[event.type] }">
                <svg-icon :name="typeIconMap[event.type]" :size="14" />
                {{ event.type }}
              </span>
            </div>
            <div class="event-date">{{ formatDate(event.date) }}</div>
            <div class="event-description">{{ event.details.description }}</div>
            
            <div v-if="selectedEvent && selectedEvent.id === event.id" class="event-details">
              <div class="theories">
                <h4>核心理论:</h4>
                <ul>
                  <li v-for="(theory, idx) in event.details.core_theories" :key="idx">
                    {{ theory }}
                  </li>
                </ul>
              </div>
              <div class="influence">
                <h4>历史影响:</h4>
                <p>{{ event.details.influence }}</p>
              </div>
            </div>
            
            <div v-else class="event-more">点击查看详情</div>
          </div>
        </div>
      </div>

      <!-- 列表视图 -->
      <div v-else class="list-view">
        <h2>中医发展大事记</h2>
        <div class="events-list">
          <div 
            v-for="(event, index) in sortedAllEvents" 
            :key="event.id"
            v-show="activeFilters.includes(event.type) && matchesSearch(event)"
            class="list-event"
            :class="event.type"
            :style="{ borderLeftColor: typeColorMap[event.type] }"
          >
            <div class="event-content">
              <div class="event-header">
                <div>
                  <h3 class="event-title">{{ event.title }}</h3>
                  <div class="event-meta">
                    {{ event.era }} · {{ formatDate(event.date) }}
                  </div>
                </div>
                <span class="event-type" :style="{ backgroundColor: typeColorMap[event.type] }">
                  <svg-icon :name="typeIconMap[event.type]" :size="14" />
                  {{ event.type }}
                </span>
              </div>
              
              <div class="event-description">{{ event.details.description }}</div>
              
              <button 
                class="details-toggle"
                :style="{ color: typeColorMap[event.type] }"
                @click.stop="selectEvent(event)"
              >
                {{ selectedEvent && selectedEvent.id === event.id ? '收起详情' : '查看详情' }}
              </button>
              
              <div 
                v-if="selectedEvent && selectedEvent.id === event.id" 
                class="details-panel"
              >
                <div class="theories">
                  <h4>核心理论:</h4>
                  <ul>
                    <li v-for="(theory, idx) in event.details.core_theories" :key="idx">
                      {{ theory }}
                    </li>
                  </ul>
                </div>
                <div class="influence">
                  <h4>历史影响:</h4>
                  <p>{{ event.details.influence }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="footer">
        <p>中医发展历史交互式时间轴</p>
        <p class="tips">提示: 可使用顶部按钮切换视图模式，通过筛选器过滤事件类型</p>
        
        <!-- 添加调试按钮 -->
        <button @click="downloadData" class="debug-btn" title="下载数据">
          下载数据
        </button>
      </div>
    </template>
  </div>
</template>

<script>
export default {
  name: 'TCMTimeline',
  components: {
    SvgIcon: {
      props: {
        name: String,
        size: {
          type: Number,
          default: 20
        }
      },
      template: `
        <svg :width="size" :height="size" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <template v-if="name === 'timeline'">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </template>
          <template v-else-if="name === 'list'">
            <line x1="8" y1="6" x2="21" y2="6"></line>
            <line x1="8" y1="12" x2="21" y2="12"></line>
            <line x1="8" y1="18" x2="21" y2="18"></line>
            <line x1="3" y1="6" x2="3.01" y2="6"></line>
            <line x1="3" y1="12" x2="3.01" y2="12"></line>
            <line x1="3" y1="18" x2="3.01" y2="18"></line>
          </template>
          <template v-else-if="name === 'book'">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
          </template>
          <template v-else-if="name === 'flask'">
            <path d="M9 3l6 0"></path>
            <path d="M10 9l4 0"></path>
            <path d="M14 16.5l-4 -3l-4 3V3h12v13.5l-4 -3"></path>
            <path d="M6 20c0 -1.5 1.5 -3 6 -3s6 1.5 6 3"></path>
          </template>
          <template v-else-if="name === 'building'">
            <rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect>
            <line x1="12" y1="6" x2="12" y2="6.01"></line>
            <line x1="12" y1="10" x2="12" y2="10.01"></line>
            <line x1="12" y1="14" x2="12" y2="14.01"></line>
            <line x1="12" y1="18" x2="12" y2="18.01"></line>
          </template>
          <template v-else-if="name === 'sun'">
            <circle cx="12" cy="12" r="5"></circle>
            <line x1="12" y1="1" x2="12" y2="3"></line>
            <line x1="12" y1="21" x2="12" y2="23"></line>
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
            <line x1="1" y1="12" x2="3" y2="12"></line>
            <line x1="21" y1="12" x2="23" y2="12"></line>
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
          </template>
          <template v-else-if="name === 'moon'">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
          </template>
          <template v-else-if="name === 'chevron-left'">
            <polyline points="15 18 9 12 15 6"></polyline>
          </template>
          <template v-else-if="name === 'chevron-right'">
            <polyline points="9 18 15 12 9 6"></polyline>
          </template>
          <template v-else-if="name === 'zoom-in'">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            <line x1="11" y1="8" x2="11" y2="14"></line>
            <line x1="8" y1="11" x2="14" y2="11"></line>
          </template>
          <template v-else-if="name === 'zoom-out'">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            <line x1="8" y1="11" x2="14" y2="11"></line>
          </template>
          <template v-else-if="name === 'refresh-cw'">
            <polyline points="23 4 23 10 17 10"></polyline>
            <polyline points="1 20 1 14 7 14"></polyline>
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
          </template>
          <template v-else-if="name === 'x'">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </template>
        </svg>
      `
    }
  },
  
  data() {
    return {
      eras: [],
      loading: true,
      error: null,
      selectedEra: null,
      selectedEvent: null,
      activeFilters: ['理论突破', '技术创新', '制度发展'],
      searchQuery: '',
      viewMode: 'timeline',
      scale: 1,
      translate: 0,
      theme: 'light',
      
      // 事件类型图标映射
      typeIconMap: {
        '理论突破': 'book',
        '技术创新': 'flask',
        '制度发展': 'building',
      },
      
      // 事件类型颜色映射（添加不同颜色）
      typeColorMap: {
        '理论突破': '#C2715B', // 红棕色
        '技术创新': '#5B8C5A', // 绿色
        '制度发展': '#6A6A9F' // 蓝紫色
      },
      
      zoomLevels: [0.5, 0.75, 1, 1.25, 1.5, 2],
      currentZoomIndex: 2,
      isAnimating: false,
      touchStartX: 0,
      touchStartY: 0,
      lastPinchDistance: 0
    };
  },
  
  computed: {
    // 可用的事件类型
    eventTypes() {
      const types = new Set();
      this.eras.forEach(era => {
        era.key_events.forEach(event => {
          types.add(event.type);
        });
      });
      return Array.from(types);
    },
    
    // 所有时间轴上要显示的事件
    timelineEvents() {
      // 从所有时代中收集事件
      const allEvents = this.eras.flatMap(era => 
        era.key_events.map(event => ({
          ...event,
          era: era.era,
          eraIndex: this.eras.findIndex(e => e.era === era.era),
          timePosition: this.getTimePosition(event.date)
        }))
      );
      
      // 按照时间位置排序
      const sortedEvents = [...allEvents].sort((a, b) => a.timePosition - b.timePosition);
      
      // 计算事件位置并处理重叠
      const OVERLAP_THRESHOLD = 40; // 事件之间的最小间距（像素）
      const positionedEvents = [];
      const usedPositions = new Map(); // 跟踪已使用的位置
      
      for (const event of sortedEvents) {
        // 获取事件的基础位置
        const basePosition = this.calculateBaseEventPosition(event);
        
        // 检查是否与现有事件重叠
        let offset = 0;
        let position = basePosition;
        let attempts = 0;
        const MAX_ATTEMPTS = 5; // 最大尝试次数
        
        // 尝试找到一个没有重叠的位置
        while (this.isPositionOverlapping(position, usedPositions, OVERLAP_THRESHOLD) && attempts < MAX_ATTEMPTS) {
          // 在基础位置的基础上添加一个小的水平偏移
          offset = (attempts + 1) * 25 * (Math.random() > 0.5 ? 1 : -1);
          position = basePosition + offset;
          attempts++;
        }
        
        // 保存最终位置
        usedPositions.set(event.id, position);
        positionedEvents.push({
          ...event,
          displayPosition: position,
          offset: offset
        });
      }
      
      return positionedEvents;
    },
    
    // 根据选择和筛选条件过滤事件
    filteredEvents() {
      if (!this.selectedEra) return [];
      
      return this.selectedEra.key_events.filter(event => {
        return this.activeFilters.includes(event.type) && this.matchesSearch(event);
      });
    },
    
    // 所有事件按时间排序
    sortedAllEvents() {
      const allEvents = this.eras.flatMap(era => 
        era.key_events.map(event => ({
          ...event,
          era: era.era,
          timePosition: this.getTimePosition(event.date)
        }))
      );
      
      return allEvents.sort((a, b) => a.timePosition - b.timePosition);
    }
  },
  
  mounted() {
    // 确保在组件挂载后再加载数据
    this.$nextTick(() => {
      this.loadData();
    });
    
    // 添加拖拽和触摸事件监听器
    this.$nextTick(() => {
      this.initDrag();
      window.addEventListener('resize', this.handleResize);
      window.addEventListener('keydown', this.handleKeyDown);
      
      const timeline = this.$refs.timelineContainer;
      if (timeline) {
        timeline.addEventListener('touchstart', this.handleTouchStart);
        timeline.addEventListener('touchmove', this.handleTouchMove);
        timeline.addEventListener('touchend', this.handleTouchEnd);
      } else {
        console.warn('Timeline container not found in the DOM');
      }
    });
  },
  
  beforeUnmount() {
    window.removeEventListener('resize', this.handleResize);
    window.removeEventListener('keydown', this.handleKeyDown);
    
    const timeline = this.$refs.timelineContainer;
    if (timeline) {
      timeline.removeEventListener('touchstart', this.handleTouchStart);
      timeline.removeEventListener('touchmove', this.handleTouchMove);
      timeline.removeEventListener('touchend', this.handleTouchEnd);
    }
  },
  
  methods: {
    // 添加一个辅助调试的方法，用于下载当前加载的数据
    downloadData() {
      if (!this.eras || this.eras.length === 0) {
        alert('没有可下载的数据');
        return;
      }
      
      const dataStr = JSON.stringify(this.eras, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = 'tcm_timeline_data.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    },
    
    // 加载数据
    async loadData() {
      this.loading = true;
      this.error = null;
      
      try {
        const response = await fetch('/tcm_history.json');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        
        // 确保数据格式正确
        if (!Array.isArray(data)) {
          throw new Error('数据格式不正确');
        }
        
        console.log('原始数据:', data);
        
        // 检查数据编码是否正确，对于乱码进行处理
        const processedData = data.map(era => {
          // 处理时代信息
          const processedEra = {
            ...era,
            era: this.fixEncoding(era.era),
            time_range: this.fixEncoding(era.time_range),
            summary: this.fixEncoding(era.summary),
          };
          
          // 处理事件信息
          if (era.key_events && Array.isArray(era.key_events)) {
            processedEra.key_events = era.key_events.map(event => ({
              ...event,
              title: this.fixEncoding(event.title),
              type: this.fixEncoding(event.type),
              date: this.fixEncoding(event.date),
              details: {
                ...event.details,
                description: this.fixEncoding(event.details.description),
                core_theories: event.details.core_theories.map(theory => 
                  this.fixEncoding(theory)
                ),
                influence: this.fixEncoding(event.details.influence)
              }
            }));
          } else {
            // 如果没有事件数据，初始化为空数组
            processedEra.key_events = [];
          }
          
          return processedEra;
        });
        
        this.eras = processedData;
        console.log('处理后的数据:', this.eras);
        
        // 检查事件类型
        const allTypes = new Set();
        this.eras.forEach(era => {
          if (era.key_events && Array.isArray(era.key_events)) {
            era.key_events.forEach(event => {
              if (event.type) {
                allTypes.add(event.type);
              }
            });
          }
        });
        console.log('所有事件类型:', Array.from(allTypes));
        
        // 初始化过滤器
        this.activeFilters = Array.from(allTypes);
        
        // 选择第一个时代
        if (this.eras.length > 0) {
          this.selectEra(this.eras[0]);
          console.log('选择的时代:', this.selectedEra);
          console.log('过滤后的事件:', this.filteredEvents);
        } else {
          console.warn('没有找到时代数据');
        }
        
        this.loading = false;
      } catch (error) {
        console.error('加载数据失败:', error);
        this.error = '无法加载中医历史数据，请重试。';
        this.loading = false;
      }
    },
    
    // 添加一个修复编码问题的方法
    fixEncoding(text) {
      if (!text) return '';
      
      // 尝试检测是否是乱码并修复
      try {
        // 如果文本已经是正常的中文，直接返回
        if (/[\u4e00-\u9fa5]/.test(text)) {
          return text;
        }
        
        // 尝试多种解码方法
        let decodedText;
        
        // 方法1: UTF-8编码
        try {
          decodedText = decodeURIComponent(escape(text));
          if (/[\u4e00-\u9fa5]/.test(decodedText)) {
            return decodedText;
          }
        } catch (e) {
          console.log('UTF-8解码失败');
        }
        
        // 方法2: GBK/GB2312可能的情况
        try {
          // 注意：这需要第三方库支持，这里只是示例
          // 实际使用可能需要专门的编码转换库
          if (window.TextDecoder) {
            const decoder = new TextDecoder('gbk', { fatal: false });
            const encoder = new TextEncoder();
            const bytes = encoder.encode(text);
            decodedText = decoder.decode(bytes);
            if (/[\u4e00-\u9fa5]/.test(decodedText)) {
              return decodedText;
            }
          }
        } catch (e) {
          console.log('GBK解码失败');
        }
        
        // 如果所有方法都失败，返回原始文本
        return text;
      } catch (e) {
        console.error('编码转换失败:', e);
        return text;
      }
    },
    
    // 处理窗口大小变化
    handleResize() {
      // 可以实现响应式调整，例如在移动设备上自动切换到列表视图
      if (window.innerWidth < 768 && this.viewMode === 'timeline') {
        this.viewMode = 'list';
      }
    },
    
    // 选择时代
    selectEra(era) {
      if (!era) return;
      
      this.selectedEra = era;
      this.selectedEvent = null;
      
      // 计算滚动位置
      const index = this.eras.findIndex(e => e.era === era.era);
      if (index === -1) return;
      
      // 等待 DOM 更新
      this.$nextTick(() => {
        const container = this.$refs.timelineContainer;
        if (!container) return;
        
        const containerWidth = container.offsetWidth;
        const targetPosition = -(index * 200 - containerWidth / 2 + 100);
        
        // 使用动画平滑滚动
        const startPosition = this.translate;
        const distance = targetPosition - startPosition;
        const duration = 500;
        const startTime = performance.now();
        
        const animate = (currentTime) => {
          const elapsed = currentTime - startTime;
          const progress = Math.min(elapsed / duration, 1);
          
          const easing = progress < 0.5
            ? 4 * progress * progress * progress
            : 1 - Math.pow(-2 * progress + 2, 3) / 2;
          
          this.translate = startPosition + distance * easing;
          
          if (progress < 1) {
            requestAnimationFrame(animate);
          }
        };
        
        requestAnimationFrame(animate);
      });
    },
    
    // 选择/切换事件
    selectEvent(event) {
      // 更新选中的事件
      if (this.selectedEvent && this.selectedEvent.id === event.id) {
        this.selectedEvent = null;
      } else {
        this.selectedEvent = event;
        
        // 如果事件所属的时代不是当前选中的时代，需要切换
        const eventEra = this.eras.find(era => era.era === event.era);
        if (eventEra && (!this.selectedEra || this.selectedEra.era !== eventEra.era)) {
          this.selectEra(eventEra);
        }
      }
    },
    
    // 切换筛选器
    toggleFilter(type) {
      if (this.activeFilters.includes(type)) {
        this.activeFilters = this.activeFilters.filter(t => t !== type);
      } else {
        this.activeFilters.push(type);
      }
    },
    
    // 搜索匹配
    matchesSearch(event) {
      if (!this.searchQuery) return true;
      
      const query = this.searchQuery.toLowerCase();
      return (
        event.title.toLowerCase().includes(query) ||
        event.details.description.toLowerCase().includes(query)
      );
    },
    
    // 格式化日期显示
    formatDate(dateStr) {
      // 处理各种时间格式
      if (dateStr.match(/\d+年/)) {
        const yearMatch = dateStr.match(/(-?\d+)年/);
        if (yearMatch) {
          const year = parseInt(yearMatch[1]);
          return year < 0 ? `公元前${-year}年` : `公元${year}年`;
        }
      }
      return dateStr;
    },
    
    // 将时间字符串转换为数值位置（用于排序和定位）
    getTimePosition(timeStr) {
      // 预定义时期的大致年份映射
      const timeMap = {
        '远古时代': -5000,
        '夏商时期': -2070,
        '西周时期': -1046,
        '春秋战国': -770,
        '战国时期': -475,
        '秦汉时期': -221,
        '西汉时期': -206,
        '东汉时期': 25,
        '魏晋南北朝': 220,
        '隋唐时期': 581,
        '宋代': 960,
        '金元时期': 1115,
        '明代': 1368,
        '清代': 1644
      };
      
      // 提取具体年份
      const yearMatch = timeStr.match(/(-?\d+)年/);
      if (yearMatch) {
        return parseInt(yearMatch[1]);
      }
      
      // 使用映射表
      for (const [key, value] of Object.entries(timeMap)) {
        if (timeStr.includes(key)) {
          return value;
        }
      }
      
      return 0;
    },

    // 计算事件在时间轴上的基础位置
    calculateBaseEventPosition(event) {
      const timePosition = this.getTimePosition(event.date);
      const timeRange = this.getTimeRange();
      const totalWidth = this.$refs.timelineContainer ? this.$refs.timelineContainer.offsetWidth * 2 : 1000;
      
      // 计算相对位置，考虑边距
      const padding = (timeRange.end - timeRange.start) * 0.1;
      const adjustedStart = timeRange.start - padding;
      const adjustedEnd = timeRange.end + padding;
      const relativePosition = (timePosition - adjustedStart) / (adjustedEnd - adjustedStart);
      
      // 计算基础位置，考虑时间轴的总宽度
      const basePosition = relativePosition * totalWidth;
      
      return basePosition;
    },

    // 获取整个时间轴的时间范围
    getTimeRange() {
      let start = Infinity;
      let end = -Infinity;
      
      // 考虑时代范围
      this.eras.forEach(era => {
        const timeRangeParts = era.time_range.split('-');
        const startTime = this.getTimePosition(timeRangeParts[0].trim());
        const endTime = timeRangeParts.length > 1 
          ? this.getTimePosition(timeRangeParts[1].trim())
          : startTime + 100;
          
        start = Math.min(start, startTime);
        end = Math.max(end, endTime);
      });
      
      // 考虑事件时间点
      this.eras.forEach(era => {
        era.key_events.forEach(event => {
          const eventTime = this.getTimePosition(event.date);
          start = Math.min(start, eventTime);
          end = Math.max(end, eventTime);
        });
      });
      
      return { start, end };
    },

    // 检查位置是否与现有事件重叠
    isPositionOverlapping(position, usedPositions, threshold) {
      for (const [_, existingPosition] of usedPositions) {
        if (Math.abs(position - existingPosition) < threshold) {
          return true;
        }
      }
      return false;
    },
    
    // 获取事件在时间轴上的显示位置
    getEventPosition(event) {
      const basePosition = this.calculateBaseEventPosition(event);
      const OVERLAP_THRESHOLD = 80; // 增加事件之间的最小间距
      const usedPositions = new Map();
      
      // 检查是否与现有事件重叠
      let offset = 0;
      let position = basePosition;
      let attempts = 0;
      const MAX_ATTEMPTS = 10; // 增加最大尝试次数
      
      // 尝试找到一个没有重叠的位置
      while (this.isPositionOverlapping(position, usedPositions, OVERLAP_THRESHOLD) && attempts < MAX_ATTEMPTS) {
        // 在基础位置的基础上添加一个更大的水平偏移
        offset = (attempts + 1) * 60 * (Math.random() > 0.5 ? 1 : -1);
        position = basePosition + offset;
        attempts++;
      }
      
      // 保存最终位置
      usedPositions.set(event.id, position);
      
      // 应用当前的平移和缩放
      const scaledPosition = position * this.scale;
      const translatedPosition = scaledPosition + this.translate;
      
      return translatedPosition;
    },

    // 重置视图
    resetView() {
      this.scale = 1;
      this.translate = 0;
      this.currentZoomIndex = 2; // 重置缩放级别索引
    },

    // 添加触摸手势支持
    handleTouchStart(e) {
      if (!e || !e.touches) return;
      
      if (e.touches.length === 2) {
        this.lastPinchDistance = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
      }
    },

    handleTouchMove(e) {
      if (!e || !e.touches) return;
      
      if (e.touches.length === 2) {
        const distance = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        
        if (this.lastPinchDistance) {
          const delta = distance - this.lastPinchDistance;
          if (Math.abs(delta) > 10) {
            this.zoom(delta > 0 ? 'in' : 'out');
            this.lastPinchDistance = distance;
          }
        }
      }
    },

    handleTouchEnd() {
      this.lastPinchDistance = 0;
    },

    // 添加键盘导航支持
    handleKeyDown(e) {
      switch(e.key) {
        case 'ArrowLeft':
          this.pan('left');
          break;
        case 'ArrowRight':
          this.pan('right');
          break;
        case '+':
          this.zoom('in');
          break;
        case '-':
          this.zoom('out');
          break;
      }
    },

    // 时间轴平移
    pan(direction) {
      const step = 200 * this.scale; // 考虑缩放因素
      this.translate += direction === 'left' ? step : -step;
    },
    
    // 切换主题
    toggleTheme() {
      this.theme = this.theme === 'light' ? 'dark' : 'light';
    },

    // 添加拖拽相关方法
    initDrag() {
      const timeline = this.$refs.timelineContainer;
      if (!timeline) {
        console.warn('Cannot initialize drag: timeline container not found');
        return;
      }
      
      let isDragging = false;
      let startX = 0;
      let startTranslate = 0;

      const startDragging = (e) => {
        isDragging = true;
        timeline.style.cursor = 'grabbing';
        startX = e.type === 'mousedown' ? e.pageX : e.touches[0].pageX;
        startTranslate = this.translate;
      };

      const stopDragging = () => {
        isDragging = false;
        timeline.style.cursor = 'grab';
      };

      const onDrag = (e) => {
        if (!isDragging) return;
        e.preventDefault();
        const x = e.type === 'mousemove' ? e.pageX : e.touches[0].pageX;
        const walk = (x - startX) * this.scale; // 考虑缩放因素
        this.translate = startTranslate + walk;
      };

      timeline.addEventListener('mousedown', startDragging);
      timeline.addEventListener('touchstart', startDragging);
      window.addEventListener('mousemove', onDrag);
      window.addEventListener('touchmove', onDrag);
      window.addEventListener('mouseup', stopDragging);
      window.addEventListener('touchend', stopDragging);
    },

    // 修改缩放方法
    zoom(direction) {
      if (this.isAnimating) return;
      
      const newIndex = direction === 'in' 
        ? Math.min(this.currentZoomIndex + 1, this.zoomLevels.length - 1)
        : Math.max(this.currentZoomIndex - 1, 0);
      
      if (newIndex === this.currentZoomIndex) return;
      
      const startScale = this.scale;
      const targetScale = this.zoomLevels[newIndex];
      const startTime = performance.now();
      const duration = 300;
      this.isAnimating = true;
      
      // 计算缩放中心点
      const timeline = this.$refs.timelineContainer;
      const centerX = timeline ? timeline.offsetWidth / 2 : 0;
      
      const animate = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        const easing = progress < 0.5
          ? 4 * progress * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 3) / 2;
        
        const newScale = startScale + (targetScale - startScale) * easing;
        
        // 计算新的平移值，保持缩放中心点不变
        const scaleChange = newScale / this.scale;
        this.translate = (this.translate + centerX) * scaleChange - centerX;
        this.scale = newScale;
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          this.currentZoomIndex = newIndex;
          this.isAnimating = false;
        }
      };
      
      requestAnimationFrame(animate);
    }
  }
};
</script>

<style scoped>
/* 时间轴容器 */
.timeline-container {
  position: relative;
  width: 100%;
  height: 380px;
  overflow: hidden;
  margin: 20px 0;
  background-color: var(--bg-color);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 20px 0;
  cursor: grab;
}

.timeline-controls {
  display: flex;
  justify-content: center;
  gap: 20px;
  padding: 12px;
  background-color: var(--card-bg);
  border-bottom: 1px solid var(--border-color);
}

.control-group {
  display: flex;
  gap: 8px;
}

.control-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background-color: var(--bg-color);
  color: var(--text-color);
  cursor: pointer;
  transition: all 0.3s ease;
}

.control-btn:hover {
  background-color: var(--hover-color);
  border-color: var(--point-color);
}

.control-btn span {
  font-size: 14px;
}

.timeline-wrapper {
  position: absolute;
  height: 100%;
  transform-origin: center;
  transition: transform 0.3s ease;
  min-width: 200%;
  padding: 0 100px;
}

.timeline-wrapper:active {
  cursor: grabbing;
}

.timeline-line {
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, 
    var(--point-color) 0%, 
    var(--point-color) 100%
  );
  opacity: 0.8;
}

/* 时代节点样式 */
.era-node {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  cursor: pointer;
  z-index: 2;
}

.era-point {
  width: 12px;
  height: 12px;
  background: var(--point-color);
  border: 2px solid var(--bg-color);
  border-radius: 50%;
  margin: 0 auto;
  box-shadow: 0 0 0 4px rgba(139, 107, 77, 0.1);
  transition: all 0.3s ease;
}

.era-label {
  position: absolute;
  left: 50%;
  transform: translateX(-50%) rotate(-45deg);
  margin-top: 20px;
  white-space: nowrap;
  font-size: 14px;
  color: var(--text-color);
  transition: all 0.3s ease;
  opacity: 0.7;
}

.era-node:hover .era-point {
  transform: scale(1.3);
  box-shadow: 0 0 0 6px rgba(139, 107, 77, 0.2);
}

.era-node:hover .era-label {
  opacity: 1;
  transform: translateX(-50%) rotate(-45deg) scale(1.1);
}

.era-node.active .era-point {
  transform: scale(1.5);
  background: var(--point-color);
  box-shadow: 0 0 0 8px rgba(139, 107, 77, 0.3);
}

.era-node.active .era-label {
  opacity: 1;
  font-weight: bold;
  color: var(--point-color);
}

/* 时代信息 */
.era-info {
  background: var(--bg-color);
  border-radius: 12px;
  padding: 20px;
  margin: 20px 0;
  border: 1px solid var(--border-color);
  text-align: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.era-info h2 {
  color: var(--point-color);
  margin-bottom: 8px;
}

.era-time-range {
  font-style: italic;
  color: var(--text-color);
  opacity: 0.8;
  margin-bottom: 10px;
}

.era-summary {
  font-size: 16px;
  line-height: 1.6;
}

/* 事件网格 */
.events-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin: 30px 0;
}

.no-events {
  grid-column: 1 / -1;
  text-align: center;
  padding: 40px;
  color: var(--text-color);
  opacity: 0.7;
  font-style: italic;
}

/* 事件卡片样式 */
.event-card {
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 20px;
  background: var(--bg-color);
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  border-left-width: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.event-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.event-card.active {
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
}

.event-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 10px;
}

.event-title {
  margin: 0 0 5px 0;
  font-size: 18px;
}

.event-type {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  color: white;
  white-space: nowrap;
}

.event-date {
  font-size: 14px;
  color: var(--text-color);
  opacity: 0.7;
  margin-bottom: 10px;
}

.event-description {
  font-size: 14px;
  line-height: 1.6;
  margin-bottom: 15px;
}

.event-more {
  text-align: center;
  font-size: 13px;
  color: var(--point-color);
  opacity: 0.8;
  padding-top: 5px;
  border-top: 1px dashed var(--border-color);
}

.event-details {
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px dashed var(--border-color);
  animation: fadeIn 0.3s ease;
}

.theories, .influence {
  margin-bottom: 15px;
}

.theories h4, .influence h4 {
  margin-bottom: 8px;
  font-size: 16px;
  color: var(--point-color);
}

.theories ul {
  padding-left: 20px;
}

.theories li {
  margin-bottom: 5px;
  font-size: 14px;
}

/* 过滤器按钮样式 */
.filters {
  margin: 20px 0;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.filter-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

/* 过滤器按钮样式 */
.filter-btn {
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
  transition: all 0.3s ease;
  border: 2px solid !important;
  display: flex;
  align-items: center;
  gap: 6px;
}

.filter-btn:hover {
  transform: translateY(-1px);
  opacity: 0.9;
}

/* 激活样式 - 确保更高优先级 */
.filter-btn.active {
  background-color: #fff !important;
}

.search-container {
  position: relative;
}

.search-input {
  width: 100%;
  padding: 10px 35px 10px 15px;
  border-radius: 20px;
  border: 2px solid var(--border-color);
  font-size: 14px;
  background: var(--bg-color);
  color: var(--text-color);
}

.clear-search {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  color: var(--text-color);
  opacity: 0.6;
}

.clear-search:hover {
  opacity: 1;
}

/* 主题变量 */
.light {
  --bg-color: #ffffff;
  --text-color: #333333;
  --border-color: #e0e0e0;
  --card-bg: #f9f9f9;
  --point-color: #8B6B4D;
  --hover-color: #f5f5f5;
  --active-color: #eee6dd;
}

.dark {
  --bg-color: #1a1a1a;
  --text-color: #ffffff;
  --border-color: #333333;
  --card-bg: #242424;
  --point-color: #d4b895;
  --hover-color: #2a2a2a;
  --active-color: #333333;
}

/* 列表视图样式 */
.list-view {
  padding: 20px 0;
}

.list-view h2 {
  text-align: center;
  margin-bottom: 30px;
  color: var(--point-color);
}

.events-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.list-event {
  display: flex;
  background: var(--bg-color);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s ease;
  border-left-width: 4px;
}

.list-event:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.event-content {
  padding: 20px;
  flex-grow: 1;
}

.details-toggle {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  font-size: 14px;
  text-decoration: underline;
  margin-top: 10px;
}

.details-panel {
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px dashed var(--border-color);
  animation: fadeIn 0.3s ease;
}

/* 页头和页脚 */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 20px;
  border-bottom: 1px solid var(--border-color);
  background-color: var(--card-bg);
  border-radius: 8px;
  margin-bottom: 20px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.view-controls {
  display: flex;
  gap: 8px;
}

.view-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background-color: var(--bg-color);
  color: var(--text-color);
  cursor: pointer;
  transition: all 0.3s ease;
}

.view-btn:hover {
  background-color: var(--hover-color);
  border-color: var(--point-color);
}

.view-btn.active {
  background-color: var(--point-color);
  color: white;
  border-color: var(--point-color);
}

.theme-toggle {
  display: flex;
}

.theme-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--text-color);
  padding: 8px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.theme-btn:hover {
  background-color: var(--hover-color);
}

.footer {
  margin-top: 40px;
  padding: 20px;
  text-align: center;
  border-top: 1px solid var(--border-color);
  font-size: 14px;
  color: var(--text-color);
  opacity: 0.8;
}

.tips {
  font-style: italic;
  margin-top: 8px;
}

.debug-btn {
  margin-top: 15px;
  padding: 8px 16px;
  background: var(--bg-color);
  border: 1px solid var(--border-color);
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  opacity: 0.7;
  transition: all 0.3s ease;
}

.debug-btn:hover {
  opacity: 1;
  background: var(--hover-color);
}

/* 加载和错误状态 */
.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: var(--bg-color);
  opacity: 0.9;
  z-index: 10;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 5px solid var(--border-color);
  border-top-color: var(--point-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error-message {
  padding: 40px;
  text-align: center;
  color: #e74c3c;
}

.retry-button {
  margin-top: 20px;
  padding: 10px 20px;
  background: var(--point-color);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

/* 动画效果 */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* 响应式调整 */
@media (max-width: 768px) {
  .control-btn span {
    display: none;
  }
  
  .control-btn {
    padding: 8px;
  }
  
  .timeline-container {
    height: 300px;
  }
  
  .events-grid {
    grid-template-columns: 1fr;
  }
  
  .era-node .era-label {
    font-size: 12px;
  }
}
</style>