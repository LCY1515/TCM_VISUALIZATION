<template> 
  <div class="app-container">
    <h1 class="page-title">中药方剂可视化</h1>
    <!-- 原始布局 -->
    <div class="original-layout">
      <!-- 左侧区域 -->
      <div class="left-container">
        <!-- 上半部分：饼图 -->
        <div class="top-left">
          <div class="pie-chart-container">
            <HerbPieChart :herbs="herbs" @herb-selected="handleHerbSelection" />
          </div>
        </div>
  
        <!-- 下半部分：树状图 -->
        <div class="bottom-left">
          <div class="tree-container">
            <TreeChart :treeData="treeData" />
          </div>
        </div>
      </div>
      <!-- 右侧区域 -->
      <div class="right-container">
        <!-- 上半部分：热力图 -->
        <div class="top-right">
          <div class="map-card">
            <HeatMap/>
          </div>
        </div>
  
        <!-- 下半部分：点状图 -->
        <div class="bottom-right">
          <div class="map-card">
            <DotMap/>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 复合图表部分 -->
    <div class="composite-section">
      <CompositeChart />
    </div>
  </div>
</template>
  
<script>
import TreeChart from './TreeChart.vue';
import HerbPieChart from './PieChart.vue';
import DotMap from './DotMap.vue';
import HeatMap from './HeatMap.vue';
import CompositeChart from './CompositeChart.vue';

import treeData from '../assets/categories.json';
import herbData from '../assets/herb.json';

export default {
  name: 'Herb',
  components: {
    TreeChart,
    HerbPieChart,
    DotMap,
    HeatMap,
    CompositeChart
  },
  data() {
    return {
      treeData,
      herbs: herbData,
      selectedHerb: null,
    };
  },
  methods: {
    handleHerbSelection(herb) {
      this.selectedHerb = herb;
    },
  },
};
</script>
  
<style scoped>
.app-container {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.page-title {
  text-align: center;
  margin: 10px 0;
  font-size: 24px;
  color: #333;
}

.original-layout {
  display: flex;
  width: 100%;
  height: 100vh;
}

.left-container {
  width: 60%;
  height: 100%;
}

.top-left {
  height: 50%;
}

.bottom-left {
  height: 50%;
}

.tree-container {
  height: 100%;
}

.pie-chart-container {
  height: 100%;
}

.right-container {
  width: 40%;
  height: 100%;
}

.top-right {
  height: 50%;
}

.bottom-right {
  height: 50%;
}

.map-card {
  height: 100%;
}

.composite-section {
  width: 100%;
  height: 100vh;
}
</style>