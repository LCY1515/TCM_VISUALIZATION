<template>
<div class="modal-overlay" v-if="visible" @click.self="$emit('close')">
  <div class="detail-modal formula-detail">
    <div class="modal-header">
      <h2>{{ formulaInfo?.方剂名 || formula }}</h2>
      <button class="close-button" @click="$emit('close')">×</button>
    </div>
    <div class="modal-content">
      <div v-if="formulaInfo">
        <div class="detail-section" v-if="formulaInfo.组成">
          <h3>组成</h3>
          <p>{{ formulaInfo.组成 }}</p>
        </div>
        <div class="detail-section" v-if="formulaInfo.用法">
          <h3>用法</h3>
          <p>{{ formulaInfo.用法 }}</p>
        </div>
        <div class="detail-section" v-if="formulaInfo.功效">
          <h3>功效</h3>
          <p>{{ formulaInfo.功效 }}</p>
        </div>
        <div class="detail-section" v-if="formulaInfo.主治">
          <h3>主治</h3>
          <p>{{ formulaInfo.主治 }}</p>
        </div>
        <div class="detail-section" v-if="formulaInfo.方解">
          <h3>方解</h3>
          <p>{{ formulaInfo.方解 }}</p>
        </div>
        <div class="detail-section" v-if="formulaInfo.方歌">
          <h3>方歌</h3>
          <p>{{ formulaInfo.方歌 }}</p>
        </div>
        <div class="detail-section" v-if="formulaInfo.临床医案">
          <h3>临床医案</h3>
          <p>{{ formulaInfo.临床医案 }}</p>
        </div>
      </div>
      <div v-else>
        <p>未找到该方剂的详细信息。</p>
      </div>
    </div>
  </div>
</div>
</template>

<script>
import { computed } from 'vue';
import formulasData from '../../assets/data/formulas.json';

export default {
name: 'FormulaDetail',
props: {
  formula: {
    type: String,
    required: true
  },
  visible: {
    type: Boolean,
    default: false
  }
},
emits: ['close'],
setup(props) {
  const formulaInfo = computed(() => {
    return formulasData[props.formula] || null;
  });
  
  return {
    formulaInfo
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

.formula-detail h2 {
color: #333;
margin: 0;
font-size: 1.5rem;
}
</style>