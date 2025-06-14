<template>
<div class="chart-container">
  <header>
  
  </header>
  <main>
    <div class="control-panel">
      <ControlPanel 
        @update-formula-count="updateFormulaCount"
        @toggle-herb-labels="toggleHerbLabels"
        @toggle-formula-labels="toggleFormulaLabels"
        :totalFormulas="Object.keys(formulas).length"
        :showHerbLabels="showHerbLabels"
        :showFormulaLabels="showFormulaLabels"
      />
    </div>
    <div class="visualization-container">
      <CircularChart 
        :formulas="processedFormulas" 
        :medicines="medicines"
        :links="processedLinks"
        :showHerbLabels="showHerbLabels"
        :showFormulaLabels="showFormulaLabels"
        @select-formula="showFormulaDetail"
        @select-herb="showHerbDetail"
        @hover-formula="updateHoveredFormula"
        @hover-herb="updateHoveredHerb"
      />
    </div>
    <div class="side-panel">
      <SidePanel 
        :hoveredFormula="hoveredFormula"
        :hoveredHerb="hoveredHerb"
        :formulas="formulas"
        :medicines="medicines"
        :links="links"
        @select-formula="showFormulaDetail"
        @select-herb="showHerbDetail"
      />
    </div>
  </main>
  
  <FormulaDetail 
    v-if="selectedFormula" 
    :formula="selectedFormula"
    :visible="!!selectedFormula"
    @close="selectedFormula = null"
  />
  
  <HerbDetail 
    v-if="selectedHerb" 
    :herb="selectedHerb"
    :visible="!!selectedHerb"
    :relatedFormulas="getRelatedFormulas(selectedHerb)"
    @close="selectedHerb = null"
    @select-formula="showFormulaDetail"
  />
</div>
</template>

<script>
import { ref, computed, defineComponent } from 'vue';
import CircularChart from './chartcomponents/CircularChart.vue';
import FormulaDetail from './chartcomponents/FormulaDetail.vue';
import HerbDetail from './chartcomponents/HerbDetail.vue';
import ControlPanel from './chartcomponents/ControlPanel.vue';
import SidePanel from './chartcomponents/SidePanel.vue';
import formulasData from '../assets/data/formulas.json';
import medicinesData from '../assets/data/medicine.json';
import linksData from '../assets/data/links.json';

export default defineComponent({
name: 'CompositeChart',
components: {
  CircularChart,
  FormulaDetail,
  HerbDetail,
  ControlPanel,
  SidePanel
},
setup() {
  const formulas = ref(formulasData);
  const medicines = ref(medicinesData);
  const links = ref(linksData);
  const selectedFormula = ref(null);
  const selectedHerb = ref(null);
  const formulaDisplayCount = ref(50); // 默认显示50个方剂
  const showHerbLabels = ref(true); // 默认显示药材标签
  const showFormulaLabels = ref(true); // 默认显示方剂标签
  
  // 悬停状态
  const hoveredFormula = ref(null);
  const hoveredHerb = ref(null);
  
  // 处理数据用于可视化
  const processedFormulas = computed(() => {
    const formulaEntries = Object.entries(formulas.value);
    const limitedFormulas = formulaEntries.slice(0, formulaDisplayCount.value);
    return Object.fromEntries(limitedFormulas);
  });
  
  const processedLinks = computed(() => {
    const result = {};
    for (const [formula, herbs] of Object.entries(links.value)) {
      if (formula in processedFormulas.value) {
        result[formula] = herbs;
      }
    }
    return result;
  });
  
  // 处理交互功能
  const showFormulaDetail = (formula) => {
    selectedFormula.value = formula;
  };
  
  const showHerbDetail = (herb) => {
    selectedHerb.value = herb;
  };
  
  const updateFormulaCount = (count) => {
    formulaDisplayCount.value = count;
  };
  
  const toggleHerbLabels = (show) => {
    showHerbLabels.value = show;
  };
  
  const toggleFormulaLabels = (show) => {
    showFormulaLabels.value = show;
  };
  
  const getRelatedFormulas = (herbName) => {
    const related = {};
    
    for (const [formula, herbs] of Object.entries(links.value)) {
      if (herbs.includes(herbName)) {
        related[formula] = formulas.value[formula];
      }
    }
    
    return related;
  };
  
  const updateHoveredFormula = (formula) => {
    hoveredFormula.value = formula;
  };
  
  const updateHoveredHerb = (herb) => {
    hoveredHerb.value = herb;
  };
  
  return {
    formulas,
    medicines,
    links,
    processedFormulas,
    processedLinks,
    selectedFormula,
    selectedHerb,
    showHerbLabels,
    showFormulaLabels,
    hoveredFormula,
    hoveredHerb,
    showFormulaDetail,
    showHerbDetail,
    updateFormulaCount,
    toggleHerbLabels,
    toggleFormulaLabels,
    getRelatedFormulas,
    updateHoveredFormula,
    updateHoveredHerb
  };
}
});
</script>

<style scoped>
.chart-container {
display: flex;
flex-direction: column;
height: 100%;
width: 100%;
font-family: 'KaiTi', sans-serif;
}

header {
padding: 1rem;
background-color: #f8f8f8;
border-bottom: 1px solid #e0e0e0;
text-align: center;
}

main {
display: flex;
flex: 1;
overflow: hidden;
}

.control-panel {
width: 250px;
padding: 1rem;
border-right: 1px solid #e0e0e0;
background-color: #fafafa;
overflow-y: auto;
}

.visualization-container {
flex: 1;
overflow: hidden;
display: flex;
justify-content: center;
align-items: center;
}

.side-panel {
width: 300px;
border-left: 1px solid #e0e0e0;
background-color: #fafafa;
overflow-y: auto;
}

h1 {
font-size: 1.8rem;
color: #333;
margin: 0;
}
</style>