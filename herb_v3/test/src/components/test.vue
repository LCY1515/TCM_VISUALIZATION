<!-- TCMFlowerTimeline.vue -->
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
              :class="['view-btn', { active: viewMode === 'flower' }]" 
              @click="viewMode = 'flower'"
              title="花形时间线视图"
            >
              <svg-icon name="flower" />
              <span>花形时间轴</span>
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
      </div>

      <!-- 过滤器 -->
      <div class="filters">
        <div class="filter-buttons">
          <button 
            v-for="type in eventTypes" 
            :key="type"
            :class="['filter-btn', type, { active: activeFilters.includes(type) }]"
            @click="toggleFilter(type)"
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

      <!-- 花形时间线视图 -->
      <div v-if="viewMode === 'flower'" class="flower-view">
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

        <div class="flower-container" ref="flowerContainer">
          <svg class="flower-svg" :viewBox="`0 0 ${svgWidth} ${svgHeight}`" :width="svgWidth" :height="svgHeight">
            <!-- 底部时间轴线 -->
            <line 
              class="timeline-axis" 
              x1="0" 
              :y1="svgHeight - 50" 
              :x2="svgWidth" 
              :y2="svgHeight - 50" 
              :transform="`translate(${translate}, 0) scale(${scale})`"
            />
            
            <!-- 时间刻度 -->
            <g class="time-markers" :transform="`translate(${translate}, 0) scale(${scale})`">
              <template v-for="(marker, index) in timeMarkers" :key="index">
                <line 
                  :x1="marker.position" 
                  :y1="svgHeight - 60" 
                  :x2="marker.position" 
                  :y2="svgHeight - 40" 
                  class="marker-line"
                />
                <text 
                  :x="marker.position" 
                  :y="svgHeight - 25" 
                  text-anchor="middle" 
                  class="marker-text"
                >
                  {{ marker.label }}
                </text>
              </template>
            </g>
            
            <!-- 弯曲的连接线 -->
            <g class="event-paths" :transform="`translate(${translate}, 0) scale(${scale})`">
              <path 
                v-for="(event, index) in filteredFlowerEvents" 
                :key="'path-' + event.id"
                :d="getEventPath(event)"
                :class="['event-path', event.type]"
              />
            </g>
            
            <!-- 事件花朵节点 -->
            <g class="event-flowers" :transform="`translate(${translate}, 0) scale(${scale})`">
              <g 
                v-for="(event, index) in filteredFlowerEvents" 
                :key="'flower-' + event.id"
                :transform="`translate(${event.x}, ${event.y})`"
                :class="['event-flower', event.type, { active: selectedEvent && selectedEvent.id === event.id }]"
                @click="selectEvent(event)"
                @mouseenter="hoveredEvent = event"
                @mouseleave="hoveredEvent = null"
              >
                <!-- 花朵外圈 -->
                <circle class="flower-outline" :r="event.significance * 20 + 18" />
                
                <!-- 花瓣 -->
                <g class="flower-petals">
                  <path 
                    v-for="i in 6" 
                    :key="'petal-' + i"
                    :d="getPetalPath(event.significance)"
                    :transform="`rotate(${i * 60})`"
                    class="flower-petal"
                  />
                </g>
                
                <!-- 花朵中心 -->
                <circle class="flower-center" :r="event.significance * 8 + 5" />
                
                <!-- 类型标识 -->
                <text 
                  text-anchor="middle" 
                  dominant-baseline="central" 
                  class="event-type-icon"
                  font-size="10"
                >
                  {{ getEventTypeSymbol(event.type) }}
                </text>
              </g>
            </g>
            
            <!-- 事件标题提示 -->
            <g 
              v-if="hoveredEvent" 
              class="event-tooltip" 
              :transform="`translate(${(hoveredEvent.x * scale) + translate + 20}, ${(hoveredEvent.y * scale) - 30})`"
            >
              <rect x="0" y="0" width="180" height="60" rx="5" ry="5" class="tooltip-bg" />
              <text x="10" y="20" class="tooltip-title">{{ hoveredEvent.title }}</text>
              <text x="10" y="40" class="tooltip-date">{{ formatDate(hoveredEvent.date) }}</text>
            </g>
          </svg>
        </div>

        <!-- 事件详情面板 -->
        <div v-if="selectedEvent" class="event-detail-panel">
          <div class="event-detail-header">
            <h3>{{ selectedEvent.title }}</h3>
            <div class="event-meta">
              <span class="event-date">{{ formatDate(selectedEvent.date) }}</span>
              <span class="event-era">{{ selectedEvent.era }}</span>
              <span class="event-type">
                <svg-icon :name="typeIconMap[selectedEvent.type]" :size="14" />
                {{ selectedEvent.type }}
              </span>
            </div>
          </div>
          
          <div class="event-detail-content">
            <div class="event-description">{{ selectedEvent.details.description }}</div>
            
            <div class="event-theories">
              <h4>核心理论:</h4>
              <ul>
                <li v-for="(theory, idx) in selectedEvent.details.core_theories" :key="idx">
                  {{ theory }}
                </li>
              </ul>
            </div>
            
            <div class="event-influence">
              <h4>历史影响:</h4>
              <p>{{ selectedEvent.details.influence }}</p>
            </div>
          </div>
          
          <button class="close-details" @click="selectedEvent = null">
            <svg-icon name="x" :size="16" />
          </button>
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
          >
            <div class="event-dot"></div>
            <div class="event-content">
              <div class="event-header">
                <div>
                  <h3 class="event-title">{{ event.title }}</h3>
                  <div class="event-meta">
                    {{ event.era }} · {{ formatDate(event.date) }}
                  </div>
                </div>
                <span class="event-type">
                  <svg-icon :name="typeIconMap[event.type]" :size="14" />
                  {{ event.type }}
                </span>
              </div>
              
              <div class="event-description">{{ event.details.description }}</div>
              
              <button 
                class="details-toggle"
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
      </div>
    </template>
  </div>
</template>

<script>
export default {
  name: 'TCMFlowerTimeline',
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
          <template v-if="name === 'flower'">
            <circle cx="12" cy="12" r="4"></circle>
            <path d="M12 2a4 10 0 0 1 0 20"></path>
            <path d="M12 2a4 10 0 0 0 0 20"></path>
            <path d="M2 12a10 4 0 0 1 20 0"></path>
            <path d="M2 12a10 4 0 0 0 20 0"></path>
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
          <template v-else-if="name === 'x'">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </template>
          <template v-else-if="name === 'refresh-cw'">
            <polyline points="23 4 23 10 17 10"></polyline>
            <polyline points="1 20 1 14 7 14"></polyline>
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
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
      hoveredEvent: null,
      activeFilters: ['理论突破', '技术创新', '制度发展', '技术突破'],
      searchQuery: '',
      viewMode: 'flower',
      scale: 1,
      translate: 0,
      theme: 'light',
      svgWidth: 1200,
      svgHeight: 600,
      
      // 事件类型图标映射
      typeIconMap: {
        '理论突破': 'book',
        '技术创新': 'flask',
        '制度发展': 'building',
        '技术突破': 'flask'
      },
      
      // 事件类型颜色映射
      typeColorMap: {
        '理论突破': '#e57373',  // 红色
        '技术创新': '#64b5f6',  // 蓝色
          '制度发展': '#81c784',  // 绿色
          '技术突破': '#ba68c8'   // 紫色
        },
        
        zoomLevels: [0.5, 0.75, 1, 1.25, 1.5, 2],
        currentZoomIndex: 2,
        isAnimating: false,
        timeMarkers: [],
        
        // 拖拽相关状态
        isDragging: false,
        dragStartX: 0,
        lastTranslate: 0
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
      
      // 花形事件数据
      flowerEvents() {
        if (!this.eras.length) return [];
        
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
        
        // 计算时间范围
        const timeRange = this.getTimeRange();
        const timeSpan = timeRange.end - timeRange.start;
        
        // 按类型分组事件
        const eventsByType = {};
        Object.keys(this.typeColorMap).forEach(type => {
          eventsByType[type] = sortedEvents.filter(event => event.type === type);
        });
        
        // 确定每个类型在Y轴上的基础位置
        const typeBasePositions = {};
        const typeCount = Object.keys(eventsByType).length;
        const verticalSpace = this.svgHeight - 250; // 给底部时间轴留出空间
        const typeSpacing = verticalSpace / (typeCount + 1);
        
        Object.keys(eventsByType).forEach((type, index) => {
          // 将每种类型分配到不同的垂直区域，避免重叠
          typeBasePositions[type] = 100 + (index + 1) * typeSpacing;
        });
        
        // 处理每种类型内的事件分布
        let processedEvents = [];
        
        Object.keys(eventsByType).forEach(type => {
          const events = eventsByType[type];
          if (!events.length) return;
          
          // 计算同一类型事件之间的最小横向间距
          const minSpacing = (this.svgWidth - 200) / Math.max(events.length * 2, 1);
          
          events.forEach((event, index) => {
            // 计算时间轴上的水平位置（基于时间点）
            const xPos = ((event.timePosition - timeRange.start) / timeSpan) * (this.svgWidth - 200) + 100;
            
            // 使用分组来避免事件重叠，每个类型有自己的垂直位置区域
            const baseY = typeBasePositions[type];
            
            // 为了避免同类型事件在时间上太靠近时的重叠，添加轻微的上下波动
            // 使用确定性公式而非随机数，确保布局一致且不会过度波动
            const waveHeight = 40; // 减小波动幅度，让布局更整齐
            const waveFactor = 0.02; // 波动频率因子
            
            // 使用余弦函数创建平滑的波动效果
            const yOffset = Math.cos(index * waveFactor * Math.PI) * waveHeight;
            
            // 计算最终的Y位置
            const yPos = baseY + yOffset;
            
            // 计算花朵大小（基于事件的重要性）
            // 使用更确定性的方法来设置重要性，避免随机性
            // 可以基于事件在其类型中的索引位置设置一个变化规律
            const baseSignificance = 0.5;
            const significance = baseSignificance + (index % 3) * 0.1; // 0.5, 0.6, 0.7 循环变化
            
            processedEvents.push({
              ...event,
              x: xPos,
              y: yPos,
              significance: significance
            });
          });
        });
        
        return processedEvents;
      },
      
      // 根据筛选条件过滤花朵事件
      filteredFlowerEvents() {
        return this.flowerEvents.filter(event => {
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
        
        // 添加事件监听器
        window.addEventListener('resize', this.handleResize);
        this.handleResize();
        
        // 初始化拖拽功能
        this.initDragHandlers();
      });
    },
    
    beforeUnmount() {
      window.removeEventListener('resize', this.handleResize);
      
      // 移除拖拽事件监听器
      const svgEl = this.$refs.flowerContainer;
      if (svgEl) {
        svgEl.removeEventListener('mousedown', this.handleDragStart);
        window.removeEventListener('mousemove', this.handleDragMove);
        window.removeEventListener('mouseup', this.handleDragEnd);
      }
    },
    
    methods: {
      // 加载数据 - 保持原始的数据加载方法
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
          
          // 处理数据编码问题
          const processedData = data.map(era => {
            const processedEra = {
              ...era,
              era: this.fixEncoding(era.era),
              time_range: this.fixEncoding(era.time_range),
              summary: this.fixEncoding(era.summary),
            };
            
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
              processedEra.key_events = [];
            }
            
            return processedEra;
          });
          
          this.eras = processedData;
          
          // 初始化过滤器
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
          this.activeFilters = Array.from(allTypes);
          
          // 初始化时间标记
          this.generateTimeMarkers();
          
          this.loading = false;
        } catch (error) {
          console.error('加载数据失败:', error);
          this.error = '无法加载中医历史数据，请重试。';
          this.loading = false;
        }
      },
      
      // 修复编码问题 - 保持原始方法
      fixEncoding(text) {
        if (!text) return '';
        
        // 直接返回文本，在实际应用中可能需要解决编码问题
        return text;
      },
      
      // 处理窗口大小变化
      handleResize() {
        const container = this.$refs.flowerContainer;
        if (container) {
          this.svgWidth = container.clientWidth || 1200;
          this.svgHeight = Math.max(600, container.clientHeight) || 600;
          this.generateTimeMarkers();
        }
      },
      
      // 生成时间轴刻度标记
      generateTimeMarkers() {
        if (!this.eras || !this.eras.length) return;
        
        const timeRange = this.getTimeRange();
        const timeSpan = timeRange.end - timeRange.start;
        
        // 根据当前缩放等级动态调整时间间隔
        let interval = 100; // 默认间隔100年
        
        // 基于缩放等级和时间跨度调整间隔
        if (this.scale <= 0.5) {
          // 缩小视图时增加间隔，减少标记密度
          if (timeSpan > 5000) interval = 1000;
          else if (timeSpan > 2000) interval = 500;
          else interval = 200;
        } else if (this.scale <= 1) {
          if (timeSpan > 5000) interval = 500;
          else if (timeSpan > 2000) interval = 200;
          else if (timeSpan > 1000) interval = 100;
          else interval = 50;
        } else {
          // 放大视图时减少间隔，增加标记密度
          if (timeSpan > 5000) interval = 200;
          else if (timeSpan > 2000) interval = 100;
          else if (timeSpan > 1000) interval = 50;
          else if (timeSpan > 500) interval = 25;
          else interval = 10;
        }
        
        // 生成时间标记
        const markers = [];
        let startYear = Math.floor(timeRange.start / interval) * interval;
        
        // 计算可见区域中的年份
        const visibleTimeStart = timeRange.start - (this.translate / this.scale / (this.svgWidth - 200)) * timeSpan;
        const visibleTimeEnd = visibleTimeStart + (timeSpan / this.scale);
        
        // 只为可见区域生成标记
        for (let year = startYear; year <= timeRange.end; year += interval) {
          // 跳过不在可见区域的标记
          if (year < visibleTimeStart - interval || year > visibleTimeEnd + interval) continue;
          
          const position = ((year - timeRange.start) / timeSpan) * (this.svgWidth - 200) + 100;
          
          // 格式化年份显示
          let label = year.toString();
          if (year < 0) {
            label = `公元前${-year}年`;
          } else {
            label = `${year}年`;
          }
          
          markers.push({ position, label });
        }
        
        this.timeMarkers = markers;
      },
      
      // 获取整个时间轴的时间范围
      getTimeRange() {
        let start = Infinity;
        let end = -Infinity;
        
        // 考虑时代范围和事件时间点
        this.eras.forEach(era => {
          const timeRangeParts = era.time_range.split('-');
          const startTime = this.getTimePosition(timeRangeParts[0].trim());
          const endTime = timeRangeParts.length > 1 
            ? this.getTimePosition(timeRangeParts[1].trim())
            : startTime + 100;
            
          start = Math.min(start, startTime);
          end = Math.max(end, endTime);
          
          // 考虑事件时间点
          era.key_events.forEach(event => {
            const eventTime = this.getTimePosition(event.date);
            start = Math.min(start, eventTime);
            end = Math.max(end, eventTime);
          });
        });
        
        // 添加边距
        const padding = (end - start) * 0.1;
        return { 
          start: start - padding, 
          end: end + padding 
        };
      },
      
      // 将时间字符串转换为数值位置
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
      
      // 获取事件路径 - 创建从时间轴到花朵的弯曲连接线
      getEventPath(event) {
        const baseY = this.svgHeight - 50; // 时间轴的Y坐标
        
        // 优化控制点位置，使线条更流畅
        // 根据事件位置与时间轴的距离动态调整控制点
        const distance = baseY - event.y;
        const controlPointYOffset = distance * 0.4; // 将控制点放在总距离的40%处
        
        // 控制点1位于事件点下方，控制点2位于时间轴上方
        const controlPoint1X = event.x;
        const controlPoint1Y = event.y + controlPointYOffset;
        const controlPoint2X = event.x;
        const controlPoint2Y = baseY - controlPointYOffset / 2;
        
        return `M ${event.x} ${baseY} C ${controlPoint2X} ${controlPoint2Y}, ${controlPoint1X} ${controlPoint1Y}, ${event.x} ${event.y + 20}`;
      },
      
      // 生成优化的花瓣路径
      getPetalPath(significance) {
        // 调整花瓣大小，确保视觉清晰
        const size = significance * 12; // 略微减小基础大小
        
        // 使用三次贝塞尔曲线创建更精细的花瓣形状
        return `M 0 0 
                C ${size/3} ${-size/2}, ${size/2} ${-size*0.8}, ${size} ${-size} 
                C ${size*1.2} ${-size*0.8}, ${size*1.2} ${-size/3}, ${size} 0 
                C ${size*1.2} ${size/3}, ${size*1.2} ${size*0.8}, ${size} ${size} 
                C ${size/2} ${size*0.8}, ${size/3} ${size/2}, 0 0 
                Z`;
      },
      
      // 选择事件
      selectEvent(event) {
        if (this.selectedEvent && this.selectedEvent.id === event.id) {
          this.selectedEvent = null;
        } else {
          this.selectedEvent = event;
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
      
      // 根据事件类型获取符号
      getEventTypeSymbol(type) {
        const symbols = {
          '理论突破': '理',
          '技术创新': '技',
          '制度发展': '制',
          '技术突破': '突'
        };
        return symbols[type] || type.charAt(0);
      },
      
      // 初始化拖拽处理器
      initDragHandlers() {
        const svgEl = this.$refs.flowerContainer;
        if (!svgEl) return;
        
        // 添加鼠标事件
        svgEl.addEventListener('mousedown', this.handleDragStart);
        window.addEventListener('mousemove', this.handleDragMove);
        window.addEventListener('mouseup', this.handleDragEnd);
        
        // 添加触摸事件
        svgEl.addEventListener('touchstart', this.handleDragStart);
        window.addEventListener('touchmove', this.handleDragMove);
        window.addEventListener('touchend', this.handleDragEnd);
        
        // 添加滚轮缩放
        svgEl.addEventListener('wheel', this.handleWheel);
      },
      
      // 拖拽开始
      handleDragStart(e) {
        this.isDragging = true;
        this.dragStartX = e.type === 'mousedown' ? e.clientX : e.touches[0].clientX;
        this.lastTranslate = this.translate;
      },
      
      // 拖拽移动
      handleDragMove(e) {
        if (!this.isDragging) return;
        
        // 阻止默认行为，避免页面滚动
        e.preventDefault();
        
        const clientX = e.type === 'mousemove' ? e.clientX : e.touches[0].clientX;
        const deltaX = clientX - this.dragStartX;
        
        // 更新平移距离
        this.translate = this.lastTranslate + deltaX;
      },
      
      // 拖拽结束
      handleDragEnd() {
        this.isDragging = false;
      },
      
      // 处理滚轮事件
      handleWheel(e) {
        e.preventDefault();
        
        // 根据滚轮方向决定缩放方向
        if (e.deltaY < 0) {
          this.zoom('in');
        } else {
          this.zoom('out');
        }
      },
      
      // 平移操作
      pan(direction) {
        const step = 100 * this.scale;
        this.translate += direction === 'left' ? step : -step;
      },
      
      // 缩放操作 - 优化版本，平滑过渡，无抽动
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
        const container = this.$refs.flowerContainer;
        const centerX = container ? container.clientWidth / 2 : 0;
        
        const animate = (currentTime) => {
          const elapsed = currentTime - startTime;
          const progress = Math.min(elapsed / duration, 1);
          
          // 使用平滑的缓动函数
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
            
            // 完成缩放后更新时间标记
            this.generateTimeMarkers();
          }
        };
        
        requestAnimationFrame(animate);
      },
      
      // 重置视图 - 优化版本，平滑过渡
      resetView() {
        const startScale = this.scale;
        const targetScale = 1;
        const startTranslate = this.translate;
        const targetTranslate = 0;
        const startTime = performance.now();
        const duration = 500;
        this.isAnimating = true;
        
        const animate = (currentTime) => {
          const elapsed = currentTime - startTime;
          const progress = Math.min(elapsed / duration, 1);
          
          // 使用平滑的缓动函数
          const easing = progress < 0.5
            ? 4 * progress * progress * progress
            : 1 - Math.pow(-2 * progress + 2, 3) / 2;
          
          this.scale = startScale + (targetScale - startScale) * easing;
          this.translate = startTranslate + (targetTranslate - startTranslate) * easing;
          
          if (progress < 1) {
            requestAnimationFrame(animate);
          } else {
            this.currentZoomIndex = 2; // 重置为默认缩放级别
            this.isAnimating = false;
            
            // 完成重置后更新时间标记
            this.generateTimeMarkers();
          }
        };
        
        requestAnimationFrame(animate);
      }
    }
  };
  </script>
  
  <style scoped>
  /* 主容器样式 */
  .tcm-timeline-container {
    width: 100%;
    height: 100%;
    min-height: 700px;
    font-family: 'Microsoft YaHei', Arial, sans-serif;
    color: var(--text-color);
    background-color: var(--bg-color);
    padding: 20px;
    box-sizing: border-box;
    position: relative;
  }
  
  /* 加载和错误状态 */
  .loading-overlay,
  .error-message {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    background-color: rgba(255, 255, 255, 0.9);
    z-index: 100;
  }
  
  .loading-spinner {
    border: 4px solid rgba(0, 0, 0, 0.1);
    border-left-color: var(--primary-color);
    border-radius: 50%;
    width: 40px;
    height: 40px;
    animation: spin 1s linear infinite;
  }
  
  .retry-button {
    margin-top: 20px;
    padding: 8px 16px;
    background-color: var(--primary-color);
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }
  
  /* 花形视图容器 */
  .flower-view {
    position: relative;
    width: 100%;
    height: calc(100vh - 250px);
    min-height: 500px;
    overflow: hidden;
    margin-bottom: 20px;
  }
  
  .flower-container {
    width: 100%;
    height: 100%;
    overflow: hidden;
    position: relative;
    cursor: grab;
  }
  
  .flower-container:active {
    cursor: grabbing;
  }
  
  .flower-svg {
    width: 100%;
    height: 100%;
    display: block;
  }
  
  /* SVG 元素样式 */
  .timeline-axis {
    stroke: #ccc;
    stroke-width: 2;
  }
  
  .marker-line {
    stroke: #aaa;
    stroke-width: 1;
  }
  
  .marker-text {
    font-size: 12px;
    fill: var(--text-color);
    text-anchor: middle;
  }
  
  .event-path {
    fill: none;
    stroke-width: 1.5;
    opacity: 0.6;
    transition: stroke-width 0.3s, opacity 0.3s;
  }
  
  .event-path:hover {
    stroke-width: 3;
    opacity: 0.8;
  }
  
  /* 花朵节点样式 */
  .event-flower {
    cursor: pointer;
    transition: transform 0.3s;
  }
  
  .event-flower:hover {
    transform: scale(1.1);
  }
  
  .event-flower.active {
    transform: scale(1.2);
  }
  
  .flower-outline {
    fill: rgba(255, 255, 255, 0.2);
    stroke: rgba(0, 0, 0, 0.1);
    stroke-width: 0.5;
  }
  
  .flower-petal {
    fill: var(--petal-color);
    stroke: var(--petal-stroke);
    stroke-width: 1;
    opacity: 0.85;
  }
  
  .flower-center {
    fill: var(--center-color);
    stroke: var(--center-stroke);
    stroke-width: 1;
  }
  
  .event-type-icon {
    fill: white;
    font-weight: bold;
    user-select: none;
  }
  
  /* 事件类型特定样式 */
  .event-flower.理论突破 .flower-petal,
  .event-path.理论突破 {
    --petal-color: #e57373;
    --petal-stroke: #c62828;
    --center-color: #ef5350;
    --center-stroke: #b71c1c;
    stroke: #e57373;
  }
  
  .event-flower.技术创新 .flower-petal,
  .event-path.技术创新 {
    --petal-color: #64b5f6;
    --petal-stroke: #1976d2;
    --center-color: #42a5f5;
    --center-stroke: #0d47a1;
    stroke: #64b5f6;
  }
  
  .event-flower.制度发展 .flower-petal,
  .event-path.制度发展 {
    --petal-color: #81c784;
    --petal-stroke: #388e3c;
    --center-color: #66bb6a;
    --center-stroke: #1b5e20;
    stroke: #81c784;
  }
  
  .event-flower.技术突破 .flower-petal,
  .event-path.技术突破 {
    --petal-color: #ba68c8;
    --petal-stroke: #7b1fa2;
    --center-color: #ab47bc;
    --center-stroke: #4a148c;
    stroke: #ba68c8;
  }
  
  /* 提示框样式 */
  .event-tooltip {
    opacity: 1;
    pointer-events: none;
  }
  
  .tooltip-bg {
    fill: rgba(255, 255, 255, 0.95);
    stroke: #ccc;
    stroke-width: 1;
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
  }
  
  .tooltip-title {
    font-size: 14px;
    font-weight: bold;
    fill: var(--text-color);
  }
  
  .tooltip-date, .tooltip-type {
    font-size: 12px;
    fill: var(--text-secondary);
  }
  
  /* 事件详情面板 */
  .event-detail-panel {
    position: absolute;
    bottom: 20px;
    right: 20px;
    width: 350px;
    max-height: 400px;
    overflow-y: auto;
    background: white;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    padding: 20px;
    z-index: 10;
  }
  
  .event-detail-header {
    margin-bottom: 15px;
    padding-bottom: 10px;
    border-bottom: 1px solid #eee;
  }
  
  .event-detail-header h3 {
    margin: 0 0 10px 0;
    font-size: 18px;
  }
  
  .event-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    font-size: 13px;
    color: var(--text-secondary);
  }
  
  .event-detail-content {
    font-size: 14px;
    line-height: 1.6;
  }
  
  .event-description {
    margin-bottom: 15px;
  }
  
  .event-theories h4, .event-influence h4 {
    margin: 15px 0 5px 0;
    font-size: 15px;
  }
  
  .event-theories ul {
    padding-left: 20px;
    margin: 5px 0;
  }
  
  .close-details {
    position: absolute;
    top: 10px;
    right: 10px;
    background: none;
    border: none;
    cursor: pointer;
    color: #999;
    padding: 5px;
  }
  
  .close-details:hover {
    color: #333;
  }
  
  /* 标题和控制区 */
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  }
  
  .view-controls {
    display: flex;
    gap: 10px;
  }
  
  .view-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 12px;
    border: 1px solid var(--border-color);
    border-radius: 4px;
    background-color: var(--bg-color);
    cursor: pointer;
    transition: all 0.3s ease;
  }
  
  .view-btn.active {
    background-color: var(--primary-color);
    color: white;
    border-color: var(--primary-color);
  }
  
  /* 过滤器样式 */
  .filters {
    margin-bottom: 20px;
  }
  
  .filter-buttons {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-bottom: 10px;
  }
  
  .filter-btn {
    padding: 6px 12px;
    border-radius: 20px;
    font-size: 14px;
    display: flex;
    align-items: center;
    gap: 6px;
    background: #f5f5f5;
    border: 1px solid #ddd;
    cursor: pointer;
  }
  
  .filter-btn.active {
    background: var(--primary-color);
    color: white;
    border-color: var(--primary-color);
  }
  
  .search-container {
    position: relative;
  }
  
  .search-input {
    width: 100%;
    padding: 8px 35px 8px 15px;
    border-radius: 20px;
    border: 1px solid #ddd;
    font-size: 14px;
  }
  
  .clear-search {
    position: absolute;
    right: 10px;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    cursor: pointer;
    opacity: 0.6;
  }
  
  /* 列表视图样式 */
  .list-view {
    padding: 20px 0;
  }
  
  .list-view h2 {
    text-align: center;
    margin-bottom: 30px;
  }
  
  .events-list {
    display: flex;
    flex-direction: column;
    gap: 15px;
  }
  
  .list-event {
    display: flex;
    border: 1px solid #eee;
    border-radius: 8px;
    overflow: hidden;
  }
  
  .event-dot {
    width: 8px;
    background-color: var(--event-color);
  }
  
  .list-event.理论突破 .event-dot {
    --event-color: #e57373;
  }
  
  .list-event.技术创新 .event-dot {
    --event-color: #64b5f6;
  }
  
  .list-event.制度发展 .event-dot {
    --event-color: #81c784;
  }
  
  .list-event.技术突破 .event-dot {
    --event-color: #ba68c8;
  }
  
  .event-content {
    flex-grow: 1;
    padding: 15px;
  }
  
  .event-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 10px;
  }
  
  .event-title {
    margin: 0 0 5px 0;
    font-size: 16px;
  }
  
  .details-toggle {
    margin-top: 10px;
    background: none;
    border: none;
    color: var(--primary-color);
    cursor: pointer;
    padding: 0;
    text-decoration: underline;
    font-size: 14px;
  }
  
  .details-panel {
    margin-top: 15px;
    padding-top: 15px;
    border-top: 1px dashed #eee;
  }
  
  /* 页脚 */
  .footer {
    margin-top: 30px;
    text-align: center;
    font-size: 14px;
    color: #999;
  }
  
  .tips {
    margin-top: 5px;
    font-style: italic;
  }
  
  /* 主题变量 */
  .light {
    --bg-color: #ffffff;
    --text-color: #333333;
    --text-secondary: #666666;
    --primary-color: #8b6b4d;
    --primary-light: #d4b895;
    --border-color: #e0e0e0;
  }
  
  .dark {
    --bg-color: #1a1a1a;
    --text-color: #ffffff;
    --text-secondary: #bbbbbb;
    --primary-color: #d4b895;
    --primary-light: #8b6b4d;
    --border-color: #333333;
  }
  
  /* 动画 */
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  /* 响应式调整 */
  @media (max-width: 768px) {
    .event-detail-panel {
      width: calc(100% - 40px);
      right: 20px;
      bottom: 20px;
      max-height: 300px;
    }
    
    .control-btn span {
      display: none;
    }
    
    .control-btn {
      padding: 8px;
    }
    
    .filter-buttons {
      flex-wrap: wrap;
    }
  }
  </style>