<template>
  <div class="map-card">
    <div class="map-title">🌿 热力图：各省药材种类数量</div>
    <div class="map-wrapper">
      <div id="herbMap" class="map-container"></div>
      <div class="map-info">
          <div class="map-approval">审图号：GS（2024）0650号</div>
          <div class="map-source">来源：国家地理信息公共服务平台</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import * as echarts from 'echarts'

const provinceNameMap = {
  '北京': '北京市',
  '天津': '天津市',
  '上海': '上海市',
  '重庆': '重庆市',
  '河北': '河北省',
  '山西': '山西省',
  '辽宁': '辽宁省',
  '吉林': '吉林省',
  '黑龙江': '黑龙江省',
  '江苏': '江苏省',
  '浙江': '浙江省',
  '安徽': '安徽省',
  '福建': '福建省',
  '江西': '江西省',
  '山东': '山东省',
  '河南': '河南省',
  '湖北': '湖北省',
  '湖南': '湖南省',
  '广东': '广东省',
  '海南': '海南省',
  '四川': '四川省',
  '贵州': '贵州省',
  '云南': '云南省',
  '陕西': '陕西省',
  '甘肃': '甘肃省',
  '青海': '青海省',
  '台湾': '台湾省',
  '内蒙古': '内蒙古自治区',
  '广西': '广西壮族自治区',
  '西藏': '西藏自治区',
  '宁夏': '宁夏回族自治区',
  '新疆': '新疆维吾尔自治区',
  '香港': '香港特别行政区',
  '澳门': '澳门特别行政区'
}

onMounted(async () => {
  const chartDom = document.getElementById('herbMap')
  const myChart = echarts.init(chartDom)
  
  try {
    // 读取本地的地图JSON文件
    const chinaGeo = await fetch('/data/中国_省.geojson').then(res => res.json())
    echarts.registerMap('china', chinaGeo)

    // 读取药材数据
    const response = await fetch('/data/herb-data.json')
    const data = await response.json()
    
    const mapData = []
    const provinceHerbs = {}

    for (const [province, herbs] of Object.entries(data)) {
      const fullName = provinceNameMap[province] || province
      mapData.push({
        name: fullName,
        value: herbs.length
      })
      provinceHerbs[fullName] = herbs
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
        formatter: function (params) {
          const herbs = provinceHerbs[params.name] || []
          const herbsPreview = herbs.slice(0, 10).join('、')
          return `<b>${params.name}</b><br/>🌿 药材种类：${herbs.length} 种<br/>📋 示例：${herbsPreview}${herbs.length > 10 ? '…' : ''}`
        }
      },
      visualMap: {
        min: 0,
        max: 100,
        text: ['种类多', '种类少'],
        textStyle: {
          fontSize: 14,
          fontFamily: 'KaiTi',
          color: '#5b3e31'
        },
        inRange: {
          color: ['#f6ede4', '#d2b48c', '#a0522d', '#6b4226']
        },
        calculable: true
      },
      series: [{
        type: 'map',
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
          borderColor: '#a67b5b'
        },
        emphasis: {
          label: {
            color: '#000'
          },
          itemStyle: {
            areaColor: '#ffe5b4'
          }
        },
        data: mapData
      }]
    }

    myChart.setOption(option)
    window.addEventListener('resize', () => myChart.resize())

    myChart.on('click', function (params) {
      const herbs = provinceHerbs[params.name] || []
      alert(`📍 ${params.name} 共 ${herbs.length} 种中药材：\n\n${herbs.join('、')}`)
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
  height: 400px;
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