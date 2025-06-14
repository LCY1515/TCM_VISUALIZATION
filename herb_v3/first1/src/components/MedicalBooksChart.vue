<template>
  <div class="chart-container">
    <h1 class="title"></h1>
    <div ref="chartRef" class="chart"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import * as echarts from 'echarts'

const chartRef = ref(null)
let myChart = null

const props = defineProps({
  direction: {
    type: String,
    default: 'horizontal'
  }
})

// 定义固定的颜色映射（简化并确保唯一性）
const categoryColors = [
  '#EDD1D8', // 藕色
  '#B0A4E3', // 雪青
  '#A1AFC9', // 蓝灰
  '#88ADA6', // 水色
  '#426666', // 黛绿
  '#D3B17D', // 枯黄
  '#75878A', // 苍色
  '#4C8DAE', // 群青
  '#EEDEB0', // 牙色
  '#BACAC6', // 老银
  '#D2F0F4' // 水蓝
]

// 定义朝代顺序（从古至今）
const dynastyOrder = [
  '汉',
  '三国',
  '晋',
  '南北朝',
  '隋',
  '唐',
  '五代十国',
  '宋',
  '金',
  '元',
  '明',
  '清'
]

// 配置项
const getOption = (dynasties, categories, series) => ({
  color: categoryColors,
  tooltip: {
    trigger: 'item',
    formatter: function(params) {
      return `${params.name}朝<br/>${params.seriesName}：${params.value}部`
    },
    backgroundColor: 'rgba(255, 250, 240, 0.9)',
    borderColor: '#B88A67',
    borderWidth: 1,
    padding: [8, 12],
    textStyle: {
      fontFamily: '"Ma Shan Zheng", "STZhongsong", serif',
      color: '#333'
    }
  },
  legend: {
    data: categories,
    top: 10,
    type: 'scroll',
    pageButtonPosition: 'end',
    textStyle: {
      fontFamily: '"Ma Shan Zheng", "STZhongsong", serif',
      color: '#333'
    },
    itemGap: 16,
    itemWidth: 18,
    itemHeight: 12,
    borderRadius: 2
  },
  grid: {
    left: props.direction === 'horizontal' ? '3%' : '10%',
    right: '4%',
    bottom: props.direction === 'horizontal' ? '3%' : '10%',
    containLabel: true
  },
  [props.direction === 'horizontal' ? 'xAxis' : 'yAxis']: {
    type: 'value',
    name: '书籍数量',
    nameLocation: 'middle',
    nameGap: 30,
    axisLabel: {
      formatter: '{value}部',
      fontFamily: '"Ma Shan Zheng", "STZhongsong", serif',
      color: '#666'
    },
    splitLine: {
      lineStyle: {
        color: '#E9F1F6'
      }
    }
  },
  [props.direction === 'horizontal' ? 'yAxis' : 'xAxis']: {
    type: 'category',
    data: dynasties,
    name: ' ',
    nameLocation: 'middle',
    nameGap: 50,
    axisLabel: {
      formatter: '{value}',
      fontFamily: '"Ma Shan Zheng", "STZhongsong", serif',
      color: '#666'
    },
    axisLine: {
      lineStyle: {
        color: '#B88A67'
      }
    }
  },
  series: series.map(s => ({
    ...s,
    barWidth: '60%',
    barGap: '10%',
    label: {
      show: false
    },
    itemStyle: {
      ...s.itemStyle,
      borderRadius: [2, 2, 0, 0],
      borderColor: '#B88A67',
      borderWidth: 1
    }
  }))
})

// 初始化图表
const initChart = async () => {
  try {
    const response = await fetch('/medical_books.json')
    const data = await response.json()

    // 处理数据
    const dynastyMap = new Map()
    const categorySet = new Set()

    // 收集所有朝代和类别
    data.forEach(item => {
      if (item.category !== '未分') { // 过滤掉"未分"类别
        categorySet.add(item.category)
        if (!dynastyMap.has(item.dynasty)) {
          dynastyMap.set(item.dynasty, new Map())
        }
        const categoryCount = dynastyMap.get(item.dynasty)
        categoryCount.set(item.category, (categoryCount.get(item.category) || 0) + 1)
      }
    })

    // 准备数据
    const categories = Array.from(categorySet)
    // 按朝代顺序排序
    const dynasties = Array.from(dynastyMap.keys())
      .filter(dynasty => dynastyOrder.includes(dynasty))
      .sort((a, b) => dynastyOrder.indexOf(a) - dynastyOrder.indexOf(b))
      .reverse() // 反转顺序，使最早的朝代在上面

    const series = categories.map((category, index) => ({
      name: category,
      type: 'bar',
      stack: 'total',
      emphasis: {
        focus: 'series'
      },
      itemStyle: {
        color: categoryColors[index % categoryColors.length],
        borderColor: '#B88A67',
        borderWidth: 1
      },
      data: dynasties.map(dynasty => {
        const count = dynastyMap.get(dynasty)?.get(category) || 0
        return count === 0 ? null : {  // 当值为0时返回null，这样就不会显示在图表上
          value: count
        }
      })
    }))

    // 设置配置项
    myChart.setOption(getOption(dynasties, categories, series))

    // 添加点击事件
    myChart.on('click', function(params) {
      const dynasty = params.name
      const category = params.seriesName
      const count = params.value
      alert(`${dynasty}朝${category}类典籍共有${count}部`)
    })

  } catch (error) {
    console.error('Error loading data:', error)
  }
}

// 监听方向变化
watch(() => props.direction, () => {
  initChart()
})

onMounted(() => {
  myChart = echarts.init(chartRef.value)
  initChart()

  // 响应式调整
  window.addEventListener('resize', () => {
    myChart && myChart.resize()
  })
})

onUnmounted(() => {
  if (myChart) {
    myChart.dispose()
    myChart = null
  }
})
</script>

<style scoped>
.chart-container {
  width: 100%;
  height: 100%;
  padding: 20px;
  background-color: #FDF5E6;  /* 浅米色背景 */
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(184, 138, 103, 0.2);  /* 淡棕色阴影 */
  transition: all 0.3s ease;
}

.title {
  text-align: center;
  color: #333;
  margin-bottom: 20px;
  font-family: "Ma Shan Zheng", "STZhongsong", serif;
  font-size: 28px;
}

.chart {
  width: 100%;
  height: 800px;
  background-color: #FFFAF0;  /* 花白色背景 */
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(184, 138, 103, 0.2);  /* 淡棕色阴影 */
  padding: 20px;
  border: 1px solid #E9F1F6;  /* 霜边框 */
}

/* 响应式布局 */
@media (max-width: 1200px) {
  .chart {
    height: 600px;
  }
}

@media (max-width: 768px) {
  .chart {
    height: 400px;
  }
  
  .title {
    font-size: 20px;
  }
}

</style> 