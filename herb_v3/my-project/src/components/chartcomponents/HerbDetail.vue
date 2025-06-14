<template>
<div class="modal-overlay" v-if="visible" @click.self="$emit('close')">
  <div class="detail-modal herb-detail">
    <div class="modal-header">
      <h2>{{ herbInfo?.中药名 || herb }}</h2>
      <button class="close-button" @click="$emit('close')">×</button>
    </div>
    <div class="modal-content">
      <div class="herb-details" v-if="herbInfo">
        <div class="detail-section" v-if="herbInfo.别名">
          <h3>别名</h3>
          <p>{{ herbInfo.别名 }}</p>
        </div>
        <div class="detail-section" v-if="herbInfo.性味归经">
          <h3>性味归经</h3>
          <p>{{ herbInfo.性味归经 }}</p>
        </div>
        <div class="detail-section" v-if="herbInfo.功效与作用">
          <h3>功效与作用</h3>
          <p>{{ herbInfo.功效与作用 }}</p>
        </div>
        <div class="detail-section" v-if="herbInfo.临床应用">
          <h3>临床应用</h3>
          <p>{{ herbInfo.临床应用 }}</p>
        </div>
        <div class="detail-section" v-if="herbInfo.使用禁忌">
          <h3>使用禁忌</h3>
          <p>{{ herbInfo.使用禁忌 }}</p>
        </div>
      </div>
      
      <div class="related-formulas" v-if="Object.keys(relatedFormulas).length > 0">
        <h3>相关方剂 ({{ Object.keys(relatedFormulas).length }})</h3>
        <ul class="formula-list">
          <li v-for="(_, formulaName) in relatedFormulas" :key="formulaName" @click="selectFormula(formulaName)">
            {{ formulaName }}
          </li>
        </ul>
      </div>
      
      <div v-if="!herbInfo">
        <p>未找到该药材的详细信息。</p>
      </div>
    </div>
  </div>
</div>
</template>

<script>
import { computed } from 'vue';
import medicinesData from '../../assets/data/medicine.json';

export default {
name: 'HerbDetail',
props: {
  herb: {
    type: String,
    required: true
  },
  visible: {
    type: Boolean,
    default: false
  },
  relatedFormulas: {
    type: Object,
    default: () => ({})
  }
},
emits: ['close', 'select-formula'],
setup(props, { emit }) {
  const herbInfo = computed(() => {
    return medicinesData[props.herb] || null;
  });
  
  const selectFormula = (formulaName) => {
    emit('close');
    setTimeout(() => {
      emit('select-formula', formulaName);
    }, 100);
  };
  
  return {
    herbInfo,
    selectFormula
  };
}
}
</script>

<style scoped>
.modal-overlay {
position: fixed;
top: 0;
left: 0;
right: 0;
bottom: 0;
background-color: rgba(0, 0, 0, 0.5);
display: flex;
justify-content: center;
align-items: center;
z-index: 1000;
}

.detail-modal {
background-color: white;
border-radius: 8px;
width: 80%;
max-width: 800px;
max-height: 80vh;
overflow-y: auto;
box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
}

.modal-header {
display: flex;
justify-content: space-between;
align-items: center;
padding: 1rem;
border-bottom: 1px solid #e0e0e0;
background-color: #f8f8f8;
border-top-left-radius: 8px;
border-top-right-radius: 8px;
}

.modal-content {
padding: 1.5rem;
}

.close-button {
border: none;
background: none;
font-size: 1.5rem;
cursor: pointer;
color: #666;
}

.detail-section {
margin-bottom: 1.5rem;
}

.detail-section h3 {
color: #333;
margin-bottom: 0.5rem;
font-size: 1.1rem;
}

.herb-detail h2 {
color: #333;
margin: 0;
font-size: 1.5rem;
}

.related-formulas {
margin-top: 2rem;
padding-top: 1rem;
border-top: 1px solid #e0e0e0;
}

.formula-list {
list-style: none;
padding: 0;
margin: 0;
display: flex;
flex-wrap: wrap;
gap: 0.5rem;
}

.formula-list li {
background-color: #f0f0f0;
padding: 0.25rem 0.75rem;
border-radius: 16px;
font-size: 0.9rem;
cursor: pointer;
transition: background-color 0.2s;
}

.formula-list li:hover {
background-color: #e0e0e0;
}
</style>