<template>
<div class="side-panel">
  <div class="panel-header">
    <h2>详细信息</h2>
  </div>
  
  <div v-if="hoveredFormula" class="panel-section formula-info">
    <h3>方剂信息</h3>
    <div class="section-title">
      <span class="name">{{ hoveredFormula }}</span>
    </div>
    
    <div v-if="formulaDetails" class="overview">
      <p v-if="formulaDetails.功效" class="formula-effect">{{ formulaDetails.功效 }}</p>
      <div v-if="formulaDetails.组成" class="formula-composition">
        <h4>组成</h4>
        <p>{{ formulaDetails.组成 }}</p>
      </div>
    </div>
    
    <div class="related-herbs" v-if="relatedHerbs.length > 0">
      <h4>组成药材 ({{ relatedHerbs.length }})</h4>
      <ul class="herb-list">
        <li 
          v-for="herb in relatedHerbs" 
          :key="herb"
          @click="$emit('select-herb', herb)"
          class="clickable"
        >
          {{ herb }}
        </li>
      </ul>
    </div>
  </div>
  
  <div v-else-if="hoveredHerb" class="panel-section herb-info">
    <h3>药材信息</h3>
    <div class="section-title">
      <span class="name">{{ hoveredHerb }}</span>
    </div>
    
    <div v-if="herbDetails" class="overview">
      <p v-if="herbDetails.功效与作用" class="herb-effect">{{ herbDetails.功效与作用 }}</p>
      <p v-if="herbDetails.性味归经" class="herb-property">{{ herbDetails.性味归经 }}</p>
    </div>
    
    <div class="related-formulas" v-if="relatedFormulas.length > 0">
      <h4>相关方剂 ({{ relatedFormulas.length }})</h4>
      <ul class="formula-list">
        <li 
          v-for="formula in relatedFormulas" 
          :key="formula"
          @click="$emit('select-formula', formula)"
          class="clickable"
        >
          {{ formula }}
        </li>
      </ul>
    </div>
  </div>
  
  <div v-else class="empty-state">
    <p>悬停在方剂或药材上查看详细信息</p>
  </div>
</div>
</template>

<script>
import { computed } from 'vue';

export default {
name: 'SidePanel',
props: {
  hoveredFormula: {
    type: String,
    default: null
  },
  hoveredHerb: {
    type: String,
    default: null
  },
  formulas: {
    type: Object,
    required: true
  },
  medicines: {
    type: Object,
    required: true
  },
  links: {
    type: Object,
    required: true
  }
},
emits: ['select-formula', 'select-herb'],
setup(props) {
  // 获取当前悬停方剂的详细信息
  const formulaDetails = computed(() => {
    if (!props.hoveredFormula) return null;
    return props.formulas[props.hoveredFormula] || null;
  });
  
  // 获取当前悬停方剂的相关药材
  const relatedHerbs = computed(() => {
    if (!props.hoveredFormula) return [];
    return props.links[props.hoveredFormula] || [];
  });
  
  // 获取当前悬停药材的详细信息
  const herbDetails = computed(() => {
    if (!props.hoveredHerb) return null;
    return props.medicines[props.hoveredHerb] || null;
  });
  
  // 获取当前悬停药材相关的方剂
  const relatedFormulas = computed(() => {
    if (!props.hoveredHerb) return [];
    
    const results = [];
    Object.entries(props.links).forEach(([formula, herbs]) => {
      if (herbs.includes(props.hoveredHerb)) {
        results.push(formula);
      }
    });
    
    return results;
  });
  
  return {
    formulaDetails,
    relatedHerbs,
    herbDetails,
    relatedFormulas
  };
}
}
</script>

<style scoped>
.side-panel {
padding: 1rem;
height: 100%;
overflow-y: auto;
}

.panel-header {
margin-bottom: 1.5rem;
}

.panel-header h2 {
font-size: 1.5rem;
margin: 0;
color: #333;
}

.panel-section {
margin-bottom: 2rem;
}

.panel-section h3 {
font-size: 1.2rem;
margin-bottom: 1rem;
color: #333;
border-bottom: 1px solid #eee;
padding-bottom: 0.5rem;
}

.panel-section h4 {
font-size: 1rem;
margin: 1rem 0 0.5rem;
color: #555;
}

.section-title {
margin-bottom: 1rem;
}

.section-title .name {
font-size: 1.1rem;
font-weight: bold;
color: #2c3e50;
}

.overview {
margin-bottom: 1.5rem;
}

.formula-effect, .herb-effect, .herb-property {
color: #666;
margin: 0.5rem 0;
line-height: 1.4;
}

.herb-list, .formula-list {
list-style: none;
padding: 0;
margin: 0;
display: flex;
flex-wrap: wrap;
gap: 0.5rem;
}

.herb-list li, .formula-list li {
background-color: #f0f0f0;
padding: 0.25rem 0.75rem;
border-radius: 16px;
font-size: 0.9rem;
}

.clickable {
cursor: pointer;
transition: background-color 0.2s;
}

.clickable:hover {
background-color: #e0e0e0;
}

.empty-state {
display: flex;
justify-content: center;
align-items: center;
height: 200px;
color: #999;
font-style: italic;
text-align: center;
}
</style>