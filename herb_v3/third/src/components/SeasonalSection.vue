<template>
  <div class="content-section">
    <h2 class="section-title">四季养生环</h2>
    
    <!-- 五行养生关系图 -->
    <div class="wuxing-relation-chart" ref="wuxingChart"></div>
    
    <h2 class="section-title">二十四节气养生</h2>
    
    <!-- 二十四节气养生环 -->
    <div class="solar-terms-wheel-container">
      <div class="solar-terms-chart" ref="solarTermsChart"></div>
      
      <!-- 季节聚焦按钮 -->
      <div class="season-focus-btns">
        <button class="season-btn spring-btn" @click="focusSeason('spring')">聚焦春季</button>
        <button class="season-btn summer-btn" @click="focusSeason('summer')">聚焦夏季</button>
        <button class="season-btn autumn-btn" @click="focusSeason('autumn')">聚焦秋季</button>
        <button class="season-btn winter-btn" @click="focusSeason('winter')">聚焦冬季</button>
        <button class="season-btn all-btn" @click="focusSeason('all')">显示全部</button>
      </div>
      
      <div class="solar-terms-tooltip" v-if="selectedTerm" :style="tooltipStyle">
        <h3>{{ selectedTerm.name }}</h3>
        <p class="term-time">{{ selectedTerm.timing }}</p>
        <p class="term-focus">养生重点：{{ selectedTerm.focus }}</p>
        <p class="term-tip">养生建议：{{ selectedTerm.tip }}</p>
      </div>
    </div>
    
    <!-- 节气养生卡片布局 -->
    <div class="solar-terms-container">
      <div class="season-block spring">
        <h4 class="season-title">春季养生</h4>
        <div class="solar-terms-list">
          <div class="solar-term" v-for="term in springTerms" :key="term.name">
            <div class="solar-term-name">{{ term.name }}</div>
            <div class="solar-term-focus">{{ term.focus }}</div>
            <div class="solar-term-tips">{{ term.tip }}</div>
          </div>
        </div>
      </div>
      
      <div class="season-block summer">
        <h4 class="season-title">夏季养生</h4>
        <div class="solar-terms-list">
          <div class="solar-term" v-for="term in summerTerms" :key="term.name">
            <div class="solar-term-name">{{ term.name }}</div>
            <div class="solar-term-focus">{{ term.focus }}</div>
            <div class="solar-term-tips">{{ term.tip }}</div>
          </div>
        </div>
      </div>
      
      <div class="season-block autumn">
        <h4 class="season-title">秋季养生</h4>
        <div class="solar-terms-list">
          <div class="solar-term" v-for="term in autumnTerms" :key="term.name">
            <div class="solar-term-name">{{ term.name }}</div>
            <div class="solar-term-focus">{{ term.focus }}</div>
            <div class="solar-term-tips">{{ term.tip }}</div>
          </div>
        </div>
      </div>
      
      <div class="season-block winter">
        <h4 class="season-title">冬季养生</h4>
        <div class="solar-terms-list">
          <div class="solar-term" v-for="term in winterTerms" :key="term.name">
            <div class="solar-term-name">{{ term.name }}</div>
            <div class="solar-term-focus">{{ term.focus }}</div>
            <div class="solar-term-tips">{{ term.tip }}</div>
          </div>
        </div>
      </div>
    </div>
    
    <div class="seasonal-tips">
      <h3 class="section-subtitle">四季养生总览</h3>
      <div class="seasons-grid">
        <div class="season-card" v-for="(season, index) in seasonalTips" :key="index">
          <div class="season-header">{{ season.season }}养生</div>
          <div class="season-body">
            <div class="season-organ">对应脏腑：{{ season.organ }}</div>
            <h4>养生原则：</h4>
            <ul>
              <li v-for="(principle, i) in season.principles" :key="i">{{ principle }}</li>
            </ul>
            <h4>推荐食材：</h4>
            <div class="season-foods">
              <span v-for="(food, i) in season.foods" :key="i" class="food-tag">{{ food }}</span>
            </div>
            <h4>适宜活动：</h4>
            <div class="season-activities">
              <span v-for="(activity, i) in season.activities" :key="i" class="activity-tag">{{ activity }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted } from 'vue';
import * as echarts from 'echarts';
import { seasonalTips } from '@/stores/data.js';

export default {
  name: 'SeasonalSection',
  props: {
    searchQuery: {
      type: String,
      default: ''
    }
  },
  setup() {
    const wuxingChart = ref(null);
    const solarTermsChart = ref(null);
    
    // 状态变量
    const selectedTerm = ref(null);
    const currentSeason = ref('all');
    const tooltipStyle = reactive({
      left: '0px',
      top: '0px',
      display: 'none'
    });
    
    // 24 solar terms data
    const solarTerms = [
      { name: '立春', season: '春', focus: '肝气升发', timing: '2月3-5日', tip: '宜升发阳气，多食青色食物，早睡早起' },
      { name: '雨水', season: '春', focus: '湿气增加', timing: '2月18-20日', tip: '宜祛湿健脾，避免过度受湿' },
      { name: '惊蛰', season: '春', focus: '阳气萌动', timing: '3月5-7日', tip: '宜疏肝理气，适度运动' },
      { name: '春分', season: '春', focus: '阴阳平衡', timing: '3月20-22日', tip: '宜平和饮食，调和阴阳' },
      { name: '清明', season: '春', focus: '气清景明', timing: '4月4-6日', tip: '宜清肝明目，踏青散步' },
      { name: '谷雨', season: '春', focus: '雨生百谷', timing: '4月19-21日', tip: '宜健脾养胃，预防湿邪' },
      { name: '立夏', season: '夏', focus: '阳气渐盛', timing: '5月5-7日', tip: '宜保养心气，避免过度劳累' },
      { name: '小满', season: '夏', focus: '阳气充盈', timing: '5月20-22日', tip: '宜清热生津，注意防暑' },
      { name: '芒种', season: '夏', focus: '阳气旺盛', timing: '6月5-7日', tip: '宜清心泻火，保持心情舒畅' },
      { name: '夏至', season: '夏', focus: '阳气最盛', timing: '6月21-22日', tip: '宜养阴潜阳，避免暴晒' },
      { name: '小暑', season: '夏', focus: '暑热渐重', timing: '7月6-8日', tip: '宜清暑解热，勿贪凉饮冷' },
      { name: '大暑', season: '夏', focus: '暑热最重', timing: '7月22-24日', tip: '宜养心安神，防暑降温' },
      { name: '立秋', season: '秋', focus: '阳消阴长', timing: '8月7-9日', tip: '宜收敛保养，防燥润肺' },
      { name: '处暑', season: '秋', focus: '暑气渐消', timing: '8月22-24日', tip: '宜清润肺胃，调整作息' },
      { name: '白露', season: '秋', focus: '阴气渐重', timing: '9月7-9日', tip: '宜润肺生津，防秋燥伤肺' },
      { name: '秋分', season: '秋', focus: '阴阳平衡', timing: '9月22-24日', tip: '宜平衡饮食，防悲伤伤肺' },
      { name: '寒露', season: '秋', focus: '寒意渐显', timing: '10月8-9日', tip: '宜温肺润燥，增添衣物' },
      { name: '霜降', season: '秋', focus: '寒气加重', timing: '10月23-24日', tip: '宜滋阴润肺，防寒保暖' },
      { name: '立冬', season: '冬', focus: '阳气内藏', timing: '11月7-8日', tip: '宜藏精蓄锐，早睡晚起' },
      { name: '小雪', season: '冬', focus: '寒气增强', timing: '11月22-23日', tip: '宜温补脾肾，防寒保暖' },
      { name: '大雪', season: '冬', focus: '寒气更盛', timing: '12月6-8日', tip: '宜温阳散寒，避免过度劳累' },
      { name: '冬至', season: '冬', focus: '阴气最盛', timing: '12月21-23日', tip: '宜温补肾阳，避寒就温' },
      { name: '小寒', season: '冬', focus: '寒气严峻', timing: '1月5-7日', tip: '宜温养肾气，滋补肾阴' },
      { name: '大寒', season: '冬', focus: '寒气极盛', timing: '1月20-21日', tip: '宜大补元气，固护阳气' }
    ];
    
    // 按季节分组节气
    const springTerms = computed(() => solarTerms.filter(term => term.season === '春'));
    const summerTerms = computed(() => solarTerms.filter(term => term.season === '夏'));
    const autumnTerms = computed(() => solarTerms.filter(term => term.season === '秋'));
    const winterTerms = computed(() => solarTerms.filter(term => term.season === '冬'));
    
    // 季节聚焦功能
    const focusSeason = (season) => {
      currentSeason.value = season;
      updateSolarTermsChart();
    };
    
    // 更新节气图表
    const updateSolarTermsChart = () => {
      if (!solarTermsChart.value) return;
      
      const chart = echarts.getInstanceByDom(solarTermsChart.value) || echarts.init(solarTermsChart.value);
      
      // 重新绘制图表
      initSolarTermsChart(chart);
    };
    
    // 初始化二十四节气图表
    const initSolarTermsChart = (chart) => {
      // 使用小代码2中的节气数据，按四季分组计算渐变色
      const calendarData = solarTerms.map((term, index) => {
        // 将二十四节气分成四季，确定颜色
        let colorStart, colorEnd;
        let season;
        
        if (index >= 0 && index < 6) {
          // 春季渐变绿色
          const springColors = [
            ['#e8f5e9', '#a5d6a7'], // 浅到中绿
            ['#c8e6c9', '#81c784'], // 浅到中绿
            ['#dcedc8', '#aed581'], // 浅到中绿
            ['#f1f8e9', '#c5e1a5'], // 浅绿到中绿
            ['#e8f5e9', '#66bb6a'], // 浅绿到深绿
            ['#c8e6c9', '#4caf50']  // 浅绿到深绿
          ];
          [colorStart, colorEnd] = springColors[index % springColors.length];
          season = 'spring';
        } else if (index >= 6 && index < 12) {
          // 夏季渐变红色
          const summerColors = [
            ['#ffebee', '#ef9a9a'], // 浅到中红
            ['#ffcdd2', '#e57373'], // 浅到中红
            ['#ffccbc', '#ff8a65'], // 浅到中橙红
            ['#ffe0b2', '#ffb74d'], // 浅橙到中橙
            ['#ffebee', '#e53935'], // 浅红到深红
            ['#ffcdd2', '#c62828']  // 浅红到深红
          ];
          [colorStart, colorEnd] = summerColors[(index - 6) % summerColors.length];
          season = 'summer';
        } else if (index >= 12 && index < 18) {
          // 秋季渐变黄色
          const autumnColors = [
            ['#fff8e1', '#ffe082'], // 浅到中黄
            ['#ffecb3', '#ffd54f'], // 浅到中黄
            ['#fff8e1', '#ffca28'], // 浅黄到深黄
            ['#fffde7', '#fff176'], // 浅黄到中黄
            ['#fff8e1', '#ffa000'], // 浅黄到琥珀色
            ['#ffecb3', '#ff8f00']  // 浅黄到深琥珀
          ];
          [colorStart, colorEnd] = autumnColors[(index - 12) % autumnColors.length];
          season = 'autumn';
        } else {
          // 冬季渐变蓝色
          const winterColors = [
            ['#e3f2fd', '#90caf9'], // 浅到中蓝
            ['#bbdefb', '#64b5f6'], // 浅到中蓝
            ['#e1f5fe', '#4fc3f7'], // 浅到中蓝
            ['#b3e5fc', '#29b6f6'], // 浅到中蓝
            ['#e3f2fd', '#1976d2'], // 浅蓝到深蓝
            ['#bbdefb', '#1565c0']  // 浅蓝到深蓝
          ];
          [colorStart, colorEnd] = winterColors[(index - 18) % winterColors.length];
          season = 'winter';
        }

        // 根据当前聚焦的季节调整样式
        const isFocused = currentSeason.value === 'all' || season === currentSeason.value;
        const opacity = isFocused ? 1 : 0.3;
        
        return {
          name: term.name,
          value: 1,
          itemStyle: {
            color: isFocused ? new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: colorStart },
              { offset: 1, color: colorEnd }
            ]) : new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#f5f5f5' },
              { offset: 1, color: '#e0e0e0' }
            ]),
            borderRadius: 8,
            borderWidth: isFocused ? 2 : 1,
            borderColor: '#fff',
            shadowBlur: isFocused ? 8 : 2,
            shadowColor: 'rgba(0, 0, 0, 0.2)',
            opacity: opacity
          },
          tooltip: {
            formatter: `<b>${term.name}</b><br/>${term.timing}<br/>${term.tip}`
          },
          season: season
        };
      });

      const option = {
        backgroundColor: 'transparent',
        title: {
          text: '二十四节气养生环',
          left: 'center',
          textStyle: {
            color: '#8b5a2b',
            fontSize: 18,
            fontWeight: 'bold'
          },
          subtext: '依据《黄帝内经》"四时养生"理论',
          subtextStyle: {
            color: '#8b5a2b',
            fontSize: 12
          }
        },
        tooltip: {
          trigger: 'item',
          formatter: function(params) {
            const term = solarTerms[params.dataIndex];
            return `<div style="text-align:center;font-weight:bold;color:#8b5a2b;">${term.name}</div>
                    <div style="margin:5px 0;font-size:12px;">${term.timing}</div>
                    <div style="margin-top:8px;font-size:13px;line-height:1.5">${term.tip}</div>`;
          },
          backgroundColor: 'rgba(255,255,255,0.9)',
          borderColor: '#d2b48c',
          borderWidth: 1,
          padding: 10,
          textStyle: {
            color: '#3c3c3c'
          }
        },
        graphic: {
          type: 'text',
          left: 'center',
          top: 'center',
          style: {
            text: '四时',
            fontSize: 30,
            fontWeight: 'bold',
            textAlign: 'center',
            fill: '#8b5a2b',
            fontFamily: 'SimSun, STSong'
          }
        },
        series: [
          {
            type: 'pie',
            radius: ['35%', '68%'],
            center: ['50%', '50%'],
            startAngle: 90,
            clockwise: true,
            avoidLabelOverlap: true,
            label: {
              show: true,
              position: 'outside',
              formatter: '{b}',
              fontSize: 12,
              backgroundColor: 'rgba(255,255,255,0.7)',
              borderRadius: 4,
              padding: [3, 5],
              color: '#333',
              alignTo: 'labelLine',
              minMargin: 5
            },
            labelLine: {
              show: true,
              length: 15,
              length2: 10,
              smooth: true,
              lineStyle: {
                width: 1,
                type: 'solid'
              }
            },
            itemStyle: {
              borderWidth: 2,
              borderColor: '#fff'
            },
            emphasis: {
              scale: true,
              scaleSize: 10,
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
              }
            },
            data: calendarData,
            animationType: 'scale',
            animationEasing: 'elasticOut',
            animationDelay: function (idx) {
              return Math.random() * 200;
            }
          }
        ]
      };
      
      chart.setOption(option);
    };
    
    // 显示节气详情
    const showTermDetail = (term, event) => {
      selectedTerm.value = term;
      
      // 计算工具提示位置
      if (event) {
        tooltipStyle.left = event.offsetX + 'px';
        tooltipStyle.top = event.offsetY + 'px';
        tooltipStyle.display = 'block';
      }
    };
    
    // 隐藏节气详情
    const hideTermDetail = () => {
      selectedTerm.value = null;
      tooltipStyle.display = 'none';
    };

    onMounted(() => {
      // 初始化五行养生关系图
      if (wuxingChart.value) {
        const chart = echarts.init(wuxingChart.value);
        
        // 定义五行相生关系
        const wuXingRelations = [
          { source: '肝 (木)', target: '心 (火)', value: 10, lineStyle: { color: '#32CD32' } },
          { source: '心 (火)', target: '脾 (土)', value: 10, lineStyle: { color: '#FF4500' } },
          { source: '脾 (土)', target: '肺 (金)', value: 10, lineStyle: { color: '#FFD700' } },
          { source: '肺 (金)', target: '肾 (水)', value: 10, lineStyle: { color: '#C0C0C0' } },
          { source: '肾 (水)', target: '肝 (木)', value: 10, lineStyle: { color: '#0000CD' } }
        ];
        
        // 五行节点数据
        const wuXingNodes = [
          { name: '肝 (木)', value: 30, symbolSize: 70, itemStyle: { color: '#32CD32' }, x: 0, y: 0 },
          { name: '心 (火)', value: 30, symbolSize: 70, itemStyle: { color: '#FF4500' }, x: 300, y: 0 },
          { name: '脾 (土)', value: 30, symbolSize: 70, itemStyle: { color: '#FFD700' }, x: 450, y: 300 },
          { name: '肺 (金)', value: 30, symbolSize: 70, itemStyle: { color: '#C0C0C0' }, x: 300, y: 600 },
          { name: '肾 (水)', value: 30, symbolSize: 70, itemStyle: { color: '#0000CD' }, x: 0, y: 450 }
        ];
        
        const option = {
          backgroundColor: 'transparent',
          title: {
            text: '四季五行相生关系',
            left: 'center',
            top: 20,
            textStyle: {
              color: '#8b5a2b',
              fontSize: 20,
              fontWeight: 'bold'
            }
          },
          tooltip: {
            formatter: function(params) {
              if (params.dataType === 'node') {
                return params.name;
              } else {
                return params.source + ' 生 ' + params.target;
              }
            }
          },
          legend: {
            orient: 'horizontal',
            bottom: 20,
            data: ['木', '火', '土', '金', '水'],
            textStyle: {
              color: '#8b5a2b'
            }
          },
          animationDurationUpdate: 1500,
          animationEasingUpdate: 'quinticInOut',
          series: [
            {
              type: 'graph',
              layout: 'circular',
              symbolSize: 70,
              roam: true,
              label: {
                show: true,
                position: 'inside',
                color: '#fff',
                fontSize: 14,
                fontWeight: 'bold'
              },
              edgeSymbol: ['circle', 'arrow'],
              edgeSymbolSize: [6, 12],
              edgeLabel: {
                fontSize: 12,
                formatter: function(params) {
                  return '相生';
                }
              },
              data: wuXingNodes,
              links: wuXingRelations,
              lineStyle: {
                opacity: 0.9,
                width: 3,
                curveness: 0.3
              },
              emphasis: {
                focus: 'adjacency',
                lineStyle: {
                  width: 6
                }
              }
            }
          ]
        };
        
        chart.setOption(option);
        
        window.addEventListener('resize', () => {
          chart.resize();
        });
      }
      
      // 初始化二十四节气环形图
      if (solarTermsChart.value) {
        const chart = echarts.init(solarTermsChart.value);
        
        initSolarTermsChart(chart);
        
        // 添加点击事件
        chart.on('click', function(params) {
          if (params.seriesIndex === 0) {
            const term = solarTerms.find(t => t.name === params.name);
            if (term) {
              showTermDetail(term, params.event.event);
            }
          }
        });
        
        window.addEventListener('resize', () => {
          chart.resize();
        });
      }
    });

    return {
      wuxingChart,
      solarTermsChart,
      seasonalTips,
      springTerms,
      summerTerms,
      autumnTerms,
      winterTerms,
      selectedTerm,
      currentSeason,
      tooltipStyle,
      showTermDetail,
      hideTermDetail,
      focusSeason
    };
  }
}
</script>

<style scoped>
.section-subtitle {
  border-left: 3px solid var(--primary-color);
  padding-left: 12px;
  margin: 35px 0 20px;
  font-size: 1.3rem;
  color: var(--primary-color);
}

/* 图表容器样式 */
.seasonal-wheel-container,
.solar-terms-wheel-container {
  position: relative;
  margin: 30px auto;
}

.wuxing-relation-chart {
  width: 100%;
  height: 450px;
  margin: 30px auto;
  background-color: rgba(248, 244, 233, 0.3);
  border-radius: var(--border-radius);
  box-shadow: 0 3px 8px rgba(0,0,0,0.1);
  padding: 20px;
}

.solar-terms-chart {
  width: 100%;
  height: 500px;
  margin: 0 auto;
}

/* 季节聚焦按钮样式 */
.season-focus-btns {
  display: flex;
  justify-content: center;
  margin-top: 20px;
  gap: 10px;
  flex-wrap: wrap;
}

.season-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  transition: var(--transition);
  font-family: inherit;
  font-weight: bold;
  color: white;
}

.spring-btn {
  background-color: #90ee90;
  color: #006400;
}

.summer-btn {
  background-color: #ff6347;
  color: #8b0000;
}

.autumn-btn {
  background-color: #f0e68c;
  color: #8b6508;
}

.winter-btn {
  background-color: #87ceeb;
  color: #00008b;
}

.all-btn {
  background-color: var(--primary-color);
  color: white;
}

.season-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.2);
}

.season-btn:active {
  transform: translateY(0);
}

/* 季节控制按钮 */
.season-controls {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 20px;
}

/* 节气提示框 */
.solar-terms-tooltip {
  position: absolute;
  padding: 15px;
  background-color: rgba(255, 255, 255, 0.95);
  border-radius: var(--border-radius);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  z-index: 100;
  min-width: 250px;
  max-width: 300px;
  border: 1px solid var(--secondary-color);
}

.solar-terms-tooltip h3 {
  margin-top: 0;
  color: var(--primary-color);
  border-bottom: 1px solid var(--secondary-color);
  padding-bottom: 5px;
}

.term-time {
  color: #666;
  font-style: italic;
  margin-bottom: 10px;
}

.term-focus {
  font-weight: bold;
  margin-bottom: 8px;
}

.term-tip {
  line-height: 1.5;
}

/* 节气卡片样式 */
.solar-terms-container {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  margin-top: 20px;
}

.season-block {
  background-color: white;
  border-radius: var(--border-radius);
  overflow: hidden;
  box-shadow: 0 3px 8px rgba(0,0,0,0.1);
  transition: var(--transition);
}

.season-block:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 12px rgba(0,0,0,0.15);
}

.season-block.spring {
  border-top: 5px solid #91c46c;
}

.season-block.summer {
  border-top: 5px solid #ff7e67;
}

.season-block.autumn {
  border-top: 5px solid #ffd56b;
}

.season-block.winter {
  border-top: 5px solid #74b9ff;
}

.season-title {
  padding: 12px 15px;
  background-color: var(--light-bg);
  color: var(--primary-color);
  text-align: center;
  font-size: 1.1rem;
  border-bottom: 1px solid var(--secondary-color);
}

.solar-terms-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  padding: 15px;
}

.solar-term {
  padding: 10px;
  background-color: var(--light-bg);
  border-radius: var(--border-radius);
  transition: var(--transition);
}

.solar-term:hover {
  transform: translateY(-3px);
  box-shadow: 0 3px 5px rgba(0,0,0,0.1);
}

.solar-term-name {
  font-weight: bold;
  color: var(--primary-color);
  text-align: center;
  margin-bottom: 5px;
  font-size: 1.1rem;
}

.solar-term-focus {
  font-size: 0.9rem;
  color: var(--text-color);
  margin-bottom: 5px;
  text-align: center;
  font-weight: bold;
}

.solar-term-tips {
  font-size: 0.85rem;
  color: var(--text-color);
  text-align: center;
}

.seasons-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  margin-top: 20px;
}

.season-card {
  background-color: white;
  border-radius: var(--border-radius);
  overflow: hidden;
  box-shadow: 0 3px 8px rgba(0,0,0,0.1);
  transition: var(--transition);
}

.season-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 12px rgba(0,0,0,0.15);
}

.season-header {
  background-color: var(--primary-color);
  color: white;
  padding: 12px;
  text-align: center;
  font-size: 1.1rem;
}

.season-body {
  padding: 15px;
}

.season-organ {
  font-weight: bold;
  margin-bottom: 10px;
  color: var(--primary-color);
  font-size: 1rem;
}

.season-body h4 {
  margin: 12px 0 8px;
  color: var(--text-color);
  font-size: 1rem;
  border-bottom: 1px dashed var(--secondary-color);
  padding-bottom: 5px;
}

.season-body ul {
  list-style-type: none;
  padding-left: 15px;
}

.season-body li {
  padding: 4px 0;
  position: relative;
  font-size: 0.9rem;
}

.season-body li::before {
  content: '•';
  color: var(--primary-color);
  position: absolute;
  left: -15px;
}

.season-foods, .season-activities {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 5px;
}

.food-tag, .activity-tag {
  display: inline-block;
  background-color: var(--light-bg);
  padding: 4px 10px;
  border-radius: 15px;
  font-size: 0.85rem;
  border: 1px solid var(--secondary-color);
}

@media (max-width: 768px) {
  .solar-terms-container,
  .seasons-grid {
    grid-template-columns: 1fr;
  }
  
  .solar-terms-list {
    grid-template-columns: 1fr;
  }
  
  .season-controls {
    flex-direction: column;
    align-items: center;
  }
  
  .season-btn {
    width: 80%;
  }
}
</style>