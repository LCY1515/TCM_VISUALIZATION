<template>
  <div>
    <div class="map-card">
      <div class="map-title">📍 点状图：中药材产地分布</div>
      <div class="map-wrapper">
        <div id="dotMap" class="map-container"></div>
        <div class="map-info">
          <div class="map-approval">审图号：GS（2024）0650号</div>
          <div class="map-source">来源：国家地理信息公共服务平台</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import * as echarts from 'echarts'

const geoCoordMap = {
  "云南": [102.7123, 25.0406], "四川": [104.0657, 30.6595], "贵州": [106.7135, 26.5783],
  "西藏": [91.1172, 29.6473], "广西": [108.3275, 22.815], "广东": [113.2806, 23.1252],
  "湖北": [114.3419, 30.5465], "湖南": [112.9823, 28.1941], "河南": [113.6654, 34.757],
  "海南": [110.1983, 20.044], "江苏": [118.7674, 32.0415], "安徽": [117.283, 31.8612],
  "浙江": [120.1536, 30.2656], "福建": [119.3062, 26.0753], "江西": [115.8164, 28.6367],
  "山东": [117.0009, 36.6758], "上海": [121.4726, 31.2317], "陕西": [108.948, 34.2632],
  "新疆": [87.6177, 43.7928], "青海": [101.7789, 36.6232], "甘肃": [103.8236, 36.058],
  "宁夏": [106.2782, 38.4664], "吉林": [125.3245, 43.8868], "辽宁": [123.4291, 41.7968],
  "黑龙江": [126.6425, 45.756], "河北": [114.5303, 38.0371], "内蒙古": [111.6708, 40.8183],
  "山西": [112.5492, 37.857], "北京": [116.4074, 39.9042], "天津": [117.1902, 39.1256]
}

onMounted(async () => {
  const dotChart = echarts.init(document.getElementById('dotMap'))
  
  try {
    // 读取本地的地图JSON文件
    const chinaGeo = await fetch('/data/中国_省.geojson').then(res => res.json())
    echarts.registerMap('china', chinaGeo)
    
    // 读取药材数据
    const response = await fetch('/data/herb-data.json')
    const data = await response.json()
    const scatterData = []

    for (const [province, herbs] of Object.entries(data)) {
      const coord = geoCoordMap[province]
      if (coord) {
        scatterData.push({
          name: province,
          value: coord.concat(herbs.length),
          herbs
        })
      }
    }

    const option = {
      tooltip: {
        trigger: 'item',
        backgroundColor: '#fefcf9',
        borderColor: '#a3865e',
        borderWidth: 1,
        textStyle: {
          color: '#5b3e31',
          fontFamily: 'KaiTi',
          fontSize: 14
        },
        formatter(params) {
          const herbList = params.data.herbs.slice(0, 10).join('、')
          return `<b>${params.name}</b><br/>🌿 种类：${params.data.herbs.length} 种<br/>📋 药材：${herbList}${params.data.herbs.length > 10 ? '…' : ''}`
        }
      },
      geo: {
        map: 'china',
        roam: true,
        label: {
          show: false,
          fontFamily: 'KaiTi',
          color: '#5b3e31',
          fontSize: 12
        },
        itemStyle: {
          areaColor: '#f9f4ef',
          borderColor: '#5F9EA0'
        },
        emphasis: {
          areaColor: '#ffe5b4'
        }
      },
      series: [{
        type: 'scatter',
        coordinateSystem: 'geo',
        data: scatterData,
        symbolSize: val => Math.sqrt(val[2]) * 2.2,
        itemStyle: {
          color: '#6b8a76',
          shadowBlur: 12,
          shadowColor: 'rgba(160, 82, 45, 0.5)'
        },
        label: {
          show: false,
          fontFamily: 'KaiTi',
          color: '#5b3e31',
          fontSize: 12,
          distance: 10,
          position: 'top'
        },
        emphasis: {
          scale: true,
          label: {
            show: true,
            formatter: '{b}',
            position: 'top'
          }
        }
      }]
    }

    dotChart.setOption(option)
    window.addEventListener('resize', () => dotChart.resize())

    dotChart.on('click', function (params) {
      alert(`📍 ${params.name} 共 ${params.data.herbs.length} 种中药材：\n\n${params.data.herbs.join('、')}`)
    })

    // 标签轮播逻辑
    let currentIndex = 0
    const labelInterval = setInterval(() => {
      const series = option.series[0]
      if (series.data[currentIndex]) {
        series.data[currentIndex].label = { show: false }
      }
      currentIndex = (currentIndex + 1) % series.data.length
      series.data[currentIndex].label = { show: true }
      dotChart.setOption(option)
      console.log(`当前显示标签: ${series.data[currentIndex].name}`)
    }, 2000)

    // 清除定时器
    dotChart.on('finished', () => {
      clearInterval(labelInterval)
    })
    
  } catch (error) {
    console.error('加载地图数据失败:', error)
  }
})
</script>

<style scoped>
.map-card {
  background: #fdfaf5;
  width: 92%;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  padding: 24px;
  font-family: 'KaiTi', 'STKaiti', serif;
}

.map-title {
  font-size: 22px;
  font-weight: bold;
  color: #7b3f00;
  text-align: center;
  margin-bottom: 16px;
}

.map-wrapper {
  position: relative;
  width: 100%;
}

.map-container {
  width: 100%;
  height: 370px;
}

.map-info {
  position: absolute;
  bottom: 8px;
  right: 12px;
  z-index: 1000;
  pointer-events: none;
}

.map-source {
  font-size: 11px;
  color: #666;
  background: rgba(255, 255, 255, 0.8);
  padding: 3px 6px;
  border-radius: 3px;
  font-family: 'Arial', sans-serif;
  margin-bottom: 4px;
  text-align: right;
}

.map-approval {
  font-size: 11px;
  color: #666;
  background: rgba(255, 255, 255, 0.8);
  padding: 3px 6px;
  border-radius: 3px;
  font-family: 'Arial', sans-serif;
  text-align: right;
}
</style>