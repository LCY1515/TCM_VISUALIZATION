<template>
  <div class="nav-tabs">
    <div 
      v-for="tab in tabs" 
      :key="tab.id"
      class="nav-tab" 
      :class="{ active: activeTab === tab.id }" 
      @click="$emit('update:activeTab', tab.id)"
    >
      {{ tab.label }}
    </div>
  </div>
</template>

<script>
export default {
  name: 'NavTabs',
  props: {
    activeTab: {
      type: String,
      required: true
    }
  },
  setup() {
    const tabs = [
      { id: 'literature', label: '文献维度' },
      { id: 'category', label: '主题维度' },
      { id: 'seasonal', label: '节气维度' },
      { id: 'wordcloud', label: '核心概念' },
      { id: 'recommendation', label: '现代实践' }
    ];

    return {
      tabs
    };
  }
}
</script>

<style scoped>
.nav-tabs {
  display: flex;
  justify-content: center;
  margin-bottom: 30px;
  border-bottom: 1px solid var(--secondary-color);
  flex-wrap: wrap;
}

.nav-tab {
  padding: 12px 25px;
  margin: 0 5px 5px;
  cursor: pointer;
  border-radius: var(--border-radius) var(--border-radius) 0 0;
  transition: var(--transition);
  background-color: var(--light-bg);
  color: var(--text-color);
  border: 1px solid var(--secondary-color);
  border-bottom: none;
  font-weight: bold;
}

.nav-tab.active {
  background-color: var(--secondary-color);
  color: var(--dark-bg);
}

@media (max-width: 768px) {
  .nav-tabs {
    flex-direction: column;
    align-items: center;
  }
  
  .nav-tab {
    width: 80%;
    text-align: center;
    margin-bottom: 5px;
  }
}
</style>