<template>
<div class="control-panel">
  <h2>控制面板</h2>
  
  <div class="control-section">
    <h3>方剂数量控制</h3>
    <div class="slider-container">
      <input 
        type="range" 
        :min="10" 
        :max="totalFormulas" 
        v-model.number="formulaCount" 
        @input="updateFormulaCount"
      />
      <span class="slider-value">{{ formulaCount }}</span>
    </div>
    <p class="slider-description">显示 {{ formulaCount }} 个方剂</p>
  </div>
  
  <div class="control-section">
    <h3>显示设置</h3>
    <div class="toggle-container">
      <label class="toggle">
        <input 
          type="checkbox" 
          v-model="showHerbLabels" 
          @change="$emit('toggle-herb-labels', showHerbLabels)"
        >
        <span class="slider"></span>
        <span class="toggle-label">显示药材名称</span>
      </label>
    </div>
    <div class="toggle-container">
      <label class="toggle">
        <input 
          type="checkbox" 
          v-model="showFormulaLabels" 
          @change="$emit('toggle-formula-labels', showFormulaLabels)"
        >
        <span class="slider"></span>
        <span class="toggle-label">显示方剂名称</span>
      </label>
    </div>
  </div>
  
  <div class="control-section">
    <h3>使用说明</h3>
    <ul class="instructions">
      <li>外环代表药材，按归经分类</li>
      <li>中心圆球代表方剂，大小与药材数量相关</li>
      <li>鼠标悬停在节点上可高亮相关连接</li>
      <li>点击节点可查看详细信息</li>
    </ul>
  </div>
  
  <div class="control-section">
    <h3>图例</h3>
    <div class="legend">
      <div class="legend-item">
        <div class="legend-color herb-color"></div>
        <span>药材</span>
      </div>
      <div class="legend-item">
        <div class="legend-color formula-color"></div>
        <span>方剂</span>
      </div>
      <div class="legend-item">
        <div class="legend-color link-color"></div>
        <span>关联连接</span>
      </div>
    </div>
  </div>
</div>
</template>

<script>
import { ref, watch } from 'vue';

export default {
name: 'ControlPanel',
props: {
  totalFormulas: {
    type: Number,
    default: 100
  },
  showHerbLabels: {
    type: Boolean,
    default: true
  },
  showFormulaLabels: {
    type: Boolean,
    default: true
  }
},
emits: ['update-formula-count', 'toggle-herb-labels', 'toggle-formula-labels'],
setup(props, { emit }) {
  const formulaCount = ref(50); // 默认值
  const showHerbLabels = ref(props.showHerbLabels);
  const showFormulaLabels = ref(props.showFormulaLabels);
  
  const updateFormulaCount = () => {
    emit('update-formula-count', formulaCount.value);
  };
  
  // 确保方剂数量不超过总可用数量
  watch(() => props.totalFormulas, (newTotal) => {
    if (formulaCount.value > newTotal) {
      formulaCount.value = newTotal;
      updateFormulaCount();
    }
  });
  
  // 同步外部属性变化
  watch(() => props.showHerbLabels, (value) => {
    showHerbLabels.value = value;
  });
  
  watch(() => props.showFormulaLabels, (value) => {
    showFormulaLabels.value = value;
  });
  
  return {
    formulaCount,
    showHerbLabels,
    showFormulaLabels,
    updateFormulaCount
  };
}
}
</script>

<style scoped>
.control-panel {
padding: 1rem;
}

h2 {
font-size: 1.5rem;
margin-top: 0;
margin-bottom: 1.5rem;
color: #333;
}

.control-section {
margin-bottom: 2rem;
}

h3 {
font-size: 1.1rem;
margin-bottom: 0.75rem;
color: #555;
}

.slider-container {
display: flex;
align-items: center;
gap: 1rem;
}

input[type="range"] {
flex: 1;
}

.slider-value {
font-weight: bold;
min-width: 2.5rem;
text-align: right;
}

.slider-description {
margin-top: 0.5rem;
color: #666;
font-size: 0.9rem;
}

.toggle-container {
margin-bottom: 1rem;
}

.toggle {
display: flex;
align-items: center;
cursor: pointer;
}

.toggle input {
opacity: 0;
width: 0;
height: 0;
}

.toggle .slider {
position: relative;
display: inline-block;
width: 40px;
height: 20px;
background-color: #ccc;
border-radius: 20px;
margin-right: 10px;
transition: .4s;
}

.toggle .slider:before {
position: absolute;
content: "";
height: 16px;
width: 16px;
left: 2px;
bottom: 2px;
background-color: white;
border-radius: 50%;
transition: .4s;
}

.toggle input:checked + .slider {
background-color: #2c3e50;
}

.toggle input:checked + .slider:before {
transform: translateX(20px);
}

.toggle-label {
font-size: 0.9rem;
color: #555;
}

.instructions {
padding-left: 1.5rem;
margin-top: 0.5rem;
color: #666;
}

.instructions li {
margin-bottom: 0.5rem;
font-size: 0.9rem;
}

.legend {
display: flex;
flex-direction: column;
gap: 0.5rem;
}

.legend-item {
display: flex;
align-items: center;
gap: 0.5rem;
}

.legend-color {
width: 1rem;
height: 1rem;
border-radius: 50%;
}

.herb-color {
background-color: #D4A373;
}

.formula-color {
background-color: #AEC5EB;
}

.link-color {
background-color: #999;
height: 2px;
width: 1.5rem;
border-radius: 0;
}
</style>