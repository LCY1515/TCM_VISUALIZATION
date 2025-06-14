<template>
<div class="info-sidebar">
  <div v-if="!hoveredFormula && !hoveredHerb" class="empty-state">
    <p>悬停在药材或方剂上以查看相关信息</p>
  </div>
  
  <div v-if="hoveredFormula" class="formula-info">
    <h2>{{ hoveredFormula }}</h2>
    
    <div class="formula-summary" v-if="formulaInfo">
      <div v-if="formulaInfo.功效" class="info-section">
        <h3>功效</h3>
        <p>{{ formulaInfo.功效 }}</p>
      </div>
      <div v-if="formulaInfo.主治" class="info-section">
        <h3>主治</h3>
        <p>{{ formulaInfo.主治 }}</p>
      </div>
    </div>
    
    <div class="related-herbs">
      <h3>组成药材 ({{ relatedHerbs.length }})</h3>
      <ul class="herb-list">
        <li 
          v-for="herb in relatedHerbs" 
          :key="herb"
          @click="selectHerb(herb)"
          class="herb-item"
        >
          <span class="herb-name">{{ herb }}</span>
          <span class="herb-meridian" v-if="herbInfo(herb)?.归经?.length">
            {{ herbInfo(herb).归经[0] }}
          </span>
        </li>
      </ul>
    </div>
    
    <button class="detail-button" @click="selectFormula(hoveredFormula)">
      查看方剂详情
    </button>
  </div>
  
  <div v-if="hoveredHerb" class="herb-info">
    <h2>{{ hoveredHerb }}</h2>
    
    <div class="herb-summary" v-if="herbData">
      <div v-if="herbData.性味归经" class="info-section">
        <h3>性味归经</h3>
        <p>{{ herbData.性味归经 }}</p>
      </div>
      <div v-if="herbData.功效与作用" class="info-section">
        <h3>功效与作用</h3>
        <p>{{ herbData.功效与作用 }}</p>
      </div>
    </div>
    
    <div class="related-formulas">
      <h3>相关方剂 ({{ relatedFormulas.length }})</h3>
      <ul class="formula-list">
        <li 
          v-for="formula in relatedFormulas" 
          :key="formula"
          @click="selectFormula(formula)"
          class="formula-item"
        >
          {{ formula }}
        </li>
      </ul>
    </div>
    
    <button class="detail-button" @click="selectHerb(hoveredHerb)">
      查看药材详情
    </button>
  </div>
</div>
</template>

<script>
import { computed } from 'vue';

export default {
name: 'InfoSidebar',
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
setup(props, { emit }) {
  const formulaInfo = computed(() => {
    return props.hoveredFormula ? props.formulas[props.hoveredFormula] : null;
  });
  
  const herbData = computed(() => {
    return props.hoveredHerb ? props.medicines[props.hoveredHerb] : null;
  });
  
  const relatedHerbs = computed(() => {
    if (!props.hoveredFormula) return [];
    return props.links[props.hoveredFormula] || [];
  });
  
  const relatedFormulas = computed(() => {
    if (!props.hoveredHerb) return [];
    
    const formulas = [];
    Object.entries(props.links).forEach(([formula, herbs]) => {
      if (herbs.includes(props.hoveredHerb)) {
        formulas.push(formula);
      }
    });
    
    return formulas;
  });
  
  const herbInfo = (herbName) => {
    return props.medicines[herbName] || {};
  };
  
  const selectFormula = (formula) => {
    emit('select-formula', formula);
  };
  
  const selectHerb = (herb) => {
    emit('select-herb', herb);
  };
  
  return {
    formulaInfo,
    herbData,
    relatedHerbs,
    relatedFormulas,
    herbInfo,
    selectFormula,
    selectHerb
  };
}
}
</script>

<style scoped>
.info-sidebar {
padding: 1rem;
height: 100%;
overflow-y: auto;
}

.empty-state {
height: 100%;
display: flex;
align-items: center;
justify-content: center;
color: #888;
font-style: italic;
text-align: center;
padding: 2rem;
}

h2 {
margin-top: 0;
font-size: 1.4rem;
color: #333;
border-bottom: 1px solid #e0e0e0;
padding-bottom: 0.5rem;
margin-bottom: 1rem;
}

.info-section {
margin-bottom: 1.5rem;
}

.info-section h3 {
font-size: 1rem;
color: #666;
margin-bottom: 0.5rem;
}

.info-section p {
margin: 0;
font-size: 0.95rem;
line-height: 1.5;
}

.related-herbs, .related-formulas {
margin-top: 1.5rem;
}

.related-herbs h3, .related-formulas h3 {
font-size: 1.1rem;
color: #444;
margin-bottom: 0.75rem;
}

.herb-list, .formula-list {
list-style: none;
padding: 0;
margin: 0;
display: flex;
flex-wrap: wrap;
gap: 0.5rem;
}

.herb-item, .formula-item {
background-color: #f0f0f0;
padding: 0.25rem 0.75rem;
border-radius: 16px;
font-size: 0.9rem;
cursor: pointer;
transition: background-color 0.2s;
display: flex;
align-items: center;
}

.herb-item:hover, .formula-item:hover {
background-color: #e0e0e0;
}

.herb-meridian {
font-size: 0.8rem;
color: #666;
margin-left: 0.4rem;
padding-left: 0.4rem;
border-left: 1px solid #ccc;
}

.detail-button {
margin-top: 2rem;
display: block;
padding: 0.5rem 1rem;
background-color: #4a6daf;
color: white;
border: none;
border-radius: 4px;
cursor: pointer;
font-size: 0.9rem;
width: 100%;
transition: background-color 0.2s;
}

.detail-button:hover {
background-color: #3a5a9a;
}
</style>