<template>
  <div class="treemap-container">
    <h1 class="title">中医典籍可视化</h1>
    <div ref="chartRef" class="chart"></div>
    
    <!-- 增加详情展示面板 -->
    <div v-if="showDetails" class="book-details">
      <div class="details-header">
        <h2>{{ selectedBook.book_name }}</h2>
        <button class="close-btn" @click="closeDetails">×</button>
      </div>
      <div class="details-content">
        <div class="section">
          <h3>书籍信息</h3>
          <p><strong>分类：</strong>{{ selectedBook.category }}</p>
          <p><strong>朝代：</strong>{{ selectedBook.dynasty }}</p>
          <p><strong>作者：</strong>{{ selectedBook.author || '佚名' }}</p>
        </div>
        <div class="section">
          <h3>书籍简介</h3>
          <div class="text-content">{{ selectedBook.book_intro || '暂无简介' }}</div>
        </div>
        <div class="section">
          <h3>作者简介</h3>
          <div class="text-content">{{ selectedBook.author_intro || '暂无作者信息' }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import * as echarts from 'echarts'

const chartRef = ref(null)
let myChart = null
const showDetails = ref(false)
const selectedBook = ref({})

const props = defineProps({
  viewType: {
    type: String,
    default: 'treemap'
  }
})

// 定义中国风配色方案
const chineseColors = [
  '#EDD1D8', // 藕色
  '#B0A4E3', // 雪青
  '#A1AFC9', // 蓝灰
  '#88ADA6', // 水色
  '#426666', // 黛绿
  '#D3B17D', // 枯黄
  '#75878A', // 苍色
  '#4C8DAE', // 群青
  '#EEDEB0', // 牙色
  '#BACAC6' , // 老银
  '#D2F0F4' // 水蓝
]

// 处理数据，构建树形结构
const processData = (data) => {
  // 按类别和朝代分组
  const categoryMap = new Map()
  
  data.forEach(item => {
    if (item.category !== '未分') {
      if (!categoryMap.has(item.category)) {
        categoryMap.set(item.category, new Map())
      }
      const dynastyMap = categoryMap.get(item.category)
      if (!dynastyMap.has(item.dynasty)) {
        dynastyMap.set(item.dynasty, [])
      }
      dynastyMap.get(item.dynasty).push(item)
    }
  })

  // 构建树状图数据（只包含类别和朝代）
  const treemapData = {
    name: '中医典籍',
    children: Array.from(categoryMap.entries()).map(([category, dynastyMap], index) => {
      const categoryColor = chineseColors[index % chineseColors.length]
      return {
        name: category,
        value: Array.from(dynastyMap.values()).reduce((sum, books) => sum + books.length, 0),
        itemStyle: { color: categoryColor },
        children: Array.from(dynastyMap.entries()).map(([dynasty, books]) => ({
          name: dynasty,
          value: books.length,
          itemStyle: { color: categoryColor }
        }))
      }
    })
  }

  // 构建旭日图数据（包含完整书籍信息，但明确禁用书籍标签）
  const sunburstData = {
    name: '中医典籍',
    children: Array.from(categoryMap.entries()).map(([category, dynastyMap], index) => {
      const categoryColor = chineseColors[index % chineseColors.length]
      return {
        name: category,
        value: Array.from(dynastyMap.values()).reduce((sum, books) => sum + books.length, 0),
        itemStyle: { color: categoryColor },
        children: Array.from(dynastyMap.entries()).map(([dynasty, books]) => ({
          name: dynasty,
          value: books.length,
          itemStyle: { color: categoryColor },
          children: books.map(book => ({
            name: book.book_name,
            value: 1,
            itemStyle: { 
              color: categoryColor,
              // 在每个书籍节点上直接禁用标签
              label: {
                show: false
              }
            },
            // 额外设置，确保不显示标签
            label: {
              show: false
            },
            bookInfo: book
          }))
        }))
      }
    })
  }

  return { treemapData, sunburstData }
}

// 关闭详情面板
const closeDetails = () => {
  showDetails.value = false
}

// 直接更新整个图表，从零开始创建
const updateChart = async () => {
  try {
    // 销毁旧图表实例
    if (myChart) {
      myChart.dispose()
    }
    
    // 创建新的图表实例
    myChart = echarts.init(chartRef.value)
    
    // 获取数据
    const response = await fetch('/medical_books.json')
    const data = await response.json()
    const { treemapData, sunburstData } = processData(data)

    // 基础配置
    const baseOption = {
      title: {
        show: false
      },
      tooltip: {
        formatter: function(info) {
          const value = info.value
          const name = info.name
          if (info.data.children) {
            return `${name}<br/>数量：${value}部`
          } else if (info.data.bookInfo) {
            const book = info.data.bookInfo
            return `${book.book_name}<br/>作者：${book.author || '佚名'}<br/>朝代：${book.dynasty}`
          } else {
            return `${name}<br/>数量：${value}部`
          }
        },
        backgroundColor: 'rgba(255, 250, 240, 0.9)',
        borderColor: '#B88A67',
        textStyle: {
          fontFamily: '"STZhongsong", serif',
          color: '#333'
        }
      },
      legend: {
        type: 'scroll',
        orient: 'horizontal',
        top: 10,
        data: treemapData.children.map(item => item.name),
        textStyle: {
          fontFamily: '"STZhongsong", serif',
          color: '#333'
        }
      }
    }

    // 树状图配置
    const treemapOption = {
      ...baseOption,
      series: [
        {
          type: 'treemap',
          id: 'medical-books',
          animationDurationUpdate: 1000,
          roam: false,
          data: treemapData.children,
          universalTransition: true,
          label: {
            show: true,
            formatter: function(params) {
              return params.data.children ? '' : params.name
            },
            fontFamily: '"STZhongsong", serif'
          },
          breadcrumb: {
            show: true,
            emptyItemWidth: 25,
            itemStyle: {
              color: '#F5F5F5',
              borderColor: '#B88A67',
              textStyle: {
                fontFamily: '"STZhongsong", serif',
                color: '#333'
              }
            }
          },
          levels: [
            {
              itemStyle: {
                borderColor: '#B88A67',
                borderWidth: 0,
                gapWidth: 1
              },
              upperLabel: {
                show: false
              }
            },
            {
              itemStyle: {
                borderColor: '#B88A67',
                borderWidth: 5,
                gapWidth: 1
              },
              emphasis: {
                itemStyle: {
                  borderColor: '#D4B08C'
                }
              }
            }
          ],
          itemStyle: {
            color: params => params.data.itemStyle?.color
          }
        }
      ]
    }

    // 旭日图配置 - 简化并明确设置不显示第三层标签
    const sunburstOption = {
      ...baseOption,
      series: [
        {
          type: 'sunburst',
          id: 'medical-books',
          radius: ['20%', '90%'],
          animationDurationUpdate: 1000,
          data: sunburstData.children,
          universalTransition: true,
          itemStyle: {
            borderWidth: 1,
            borderColor: 'rgba(255,255,255,.5)',
            color: params => params.data.itemStyle?.color
          },
          // 基础标签配置
          label: {
            formatter: function(params) {
              return params.name;
            },
            fontFamily: '"STZhongsong", serif'
          },
          // 关键：分层设置，确保最外层不显示标签
          levels: [
            {}, // 第一层（类别）- 默认配置
            {   // 第二层（朝代）
              r0: '15%',
              r: '45%',
              itemStyle: {
                borderWidth: 2
              },
              label: {
                rotate: 'tangential',
                show: true
              }
            },
            {   // 第三层（书籍）- 关键配置
              r0: '45%',
              r: '80%',
              label: {
                // 直接在这里禁用标签显示
                show: false
              }
            }
          ],
          // 悬停状态配置
          emphasis: {
            focus: 'ancestor',
            label: {
              // 悬停时也不显示最外层
              formatter: function(params) {
                if (params.depth <= 1) {
                  return params.name;
                }
                return '';
              }
            }
          }
        }
      ]
    }

    // 根据视图类型应用对应配置
    if (props.viewType === 'treemap') {
      myChart.setOption(treemapOption, true); // 添加 true 参数，完全覆盖之前的配置
    } else {
      myChart.setOption(sunburstOption, true); // 添加 true 参数，完全覆盖之前的配置
    }
    
    // 添加点击事件，显示书籍详情
    myChart.on('click', function(params) {
      // 如果是书籍节点（包含bookInfo属性）
      if (params.data.bookInfo) {
        selectedBook.value = params.data.bookInfo
        showDetails.value = true
      }
    })
    
    // 调试输出，确认标签配置正确
    console.log('当前图表配置:', myChart.getOption());

  } catch (error) {
    console.error('Error loading data:', error)
  }
}

// 监听视图类型变化
watch(() => props.viewType, () => {
  updateChart()
})

onMounted(() => {
  updateChart()

  window.addEventListener('resize', () => {
    myChart && myChart.resize()
  })
})

onUnmounted(() => {
  if (myChart) {
    myChart.dispose()
    myChart = null
  }
  
  window.removeEventListener('resize', () => {
    myChart && myChart.resize()
  })
})
</script>

<style scoped>
.treemap-container {
  width: 100%;
  height: 100%;
  padding: 20px;
  background-color: #FDF5E6;  /* 浅米色背景 */
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(184, 138, 103, 0.2);  /* 淡棕色阴影 */
  transition: all 0.3s ease;
  border: 1px solid #E9F1F6;  /* 霜边框 */
  position: relative;
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

/* 书籍详情面板样式 */
.book-details {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 80%;
  max-width: 800px;
  max-height: 90vh;
  background-color: #FFFAF0;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.25);
  z-index: 1000;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  border: 2px solid #B88A67;
}

.details-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  background-color: #B88A67;
  border-bottom: 1px solid #D4B08C;
}

.details-header h2 {
  margin: 0;
  color: #FFF5E1;
  font-family: "STZhongsong", serif;
  font-size: 22px;
}

.close-btn {
  background: none;
  border: none;
  color: #FFF5E1;
  font-size: 24px;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  transition: background-color 0.2s;
}

.close-btn:hover {
  background-color: rgba(255, 255, 255, 0.2);
}

.details-content {
  padding: 20px;
  overflow-y: auto;
  max-height: calc(90vh - 60px);
}

.section {
  margin-bottom: 20px;
}

.section h3 {
  color: #704214;
  font-family: "STZhongsong", serif;
  margin-top: 0;
  margin-bottom: 10px;
  padding-bottom: 5px;
  border-bottom: 1px solid #D4B08C;
}

.text-content {
  white-space: pre-line;
  line-height: 1.6;
  color: #333;
}

.section a {
  color: #4C8DAE;
  text-decoration: none;
}

.section a:hover {
  text-decoration: underline;
}
</style>