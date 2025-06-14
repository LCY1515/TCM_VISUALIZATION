<template>
  <div style="display: flex; width: 100%; height: 100%;">
    <!-- 饼图容器 -->
    <div id="herb-pie-chart" style="flex: 1; height: 100%; max-width: 70%;"></div>

    <div v-if="selectedHerb"  
         style="width: 30%; padding: 20px; overflow-y: auto; 
                background-color: #fdfaf5; 
                font-family: 'KaiTi', 'STKaiti', serif;
                border-radius: 10px;
                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);">
      <img :src="selectedHerb.图片" alt="药材图片" style="width: 100%; height: auto; border-radius: 8px; margin-bottom: 10px;">
      <p><strong>药名:</strong> {{ selectedHerb.药名 }}</p>
      <p><strong>药性:</strong> {{ selectedHerb.药性 }}</p>
      <p><strong>功效:</strong> {{ selectedHerb.功效 }}</p>
    </div>
    
    <!-- 当没有选中药材时显示的占位区 -->
    <div v-else style="width: 30%; padding: 20px; overflow-y: auto; 
                background-color: #fdfaf5; 
                font-family: 'KaiTi', 'STKaiti', serif;
                border-radius: 10px;
                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);"></div>
  </div>
</template>

<script>
import * as echarts from 'echarts';

export default {
  props: {
    herbs: Array,
  },
  data() {
    return {
      selectedHerb: null, // 存储当前选中的药材
    };
  },
  mounted() {
    this.renderChart();
    // 确保图表尺寸在窗口大小变化时自适应
    window.addEventListener('resize', this.resizeChart);
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.resizeChart);
  },
  methods: {
    renderChart() {
      const chartData = this.prepareChartData();
      const myChart = echarts.init(document.getElementById('herb-pie-chart'));

      const colorPalette = ['#8c4a32', '#a6754f', '#c59d7b', '#6b8a76', '#b76c4d', '#c4ad90', '#896a45'];

      const option = {
        tooltip: {
          trigger: 'item',
          formatter: '{b}: {c} ({d}%)',
        },
        series: [
          {
            name: '属性占比',
            type: 'pie',
            radius: ['30%', '50%'],
            color: colorPalette,
            data: chartData.innerRing,
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.3)',
              },
            },
            label: {
              formatter: '{b}',
              position: 'inside',
              color: '#fff',
              fontsize: 20,
              fontFamily: 'KaiTi',
            },
          },
          {
            name: '药材',
            type: 'pie',
            radius: ['50%', '70%'],
            color: colorPalette,
            data: chartData.outerRing,
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.3)',
              },
            },
            label: {
              formatter: '{b}',
              fontFamily: 'KaiTi', // 设置字体为楷体
              color: '#5b3e31',   // 设置字体颜色
              fontSize: 16,       // 设置字体大小
            },
          },
        ],
      };

      myChart.setOption(option);

      // 点击事件：选择药材后显示详细信息
      myChart.on('click', (params) => {
        if (params.seriesIndex === 1) { // 判断是否点击了药材系列
          this.selectedHerb = this.herbs.find((herb) => herb.药名 === params.name);
        }
      });
    },
    resizeChart() {
      const myChart = echarts.getInstanceByDom(document.getElementById('herb-pie-chart'));
      if (myChart) {
        myChart.resize();
      }
    },
    prepareChartData() {
      const attributes = ['寒性', '凉性', '温性', '热性', '平性'];
      const outerRingData = [];
      const innerRingData = [];
      const herbCounts = { '寒性': 0, '凉性': 0, '温性': 0, '热性': 0, '平性': 0 };

      this.herbs.forEach((herb) => {
        attributes.forEach((attr) => {
          if (herb.属性[attr] > 0) {
            herbCounts[attr]++;
          }
        });
      });

      attributes.forEach((attr) => {
        innerRingData.push({
          name: attr,
          value: herbCounts[attr],
        });
      });

      this.herbs.forEach((herb) => {
        attributes.forEach((attr) => {
          if (herb.属性[attr] > 0) {
            outerRingData.push({
              name: herb.药名,
              value: herbCounts[attr],
            });
          }
        });
      });

      return {
        innerRing: innerRingData,
        outerRing: outerRingData,
      };
    },
  },
};
</script>

<style scoped>
#herb-pie-chart {
  width: 70%;
  height: 100%; /* 确保饼图充满其父容器 */
  background-color: #fdfaf5; 
  font-family: 'KaiTi', 'STKaiti', serif;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); /* 轻微阴影效果 */
}
</style>
