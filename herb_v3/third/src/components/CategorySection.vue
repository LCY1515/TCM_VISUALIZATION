<template>
  <div class="content-section">
    <h2 class="section-title">养生主题分类</h2>
    <div class="category-cards">
      <div class="category-card" v-for="(category, index) in filteredCategories" :key="index">
        <div class="card-header">{{ category.title }}</div>
        <div class="card-body">
          <ul>
            <li v-for="(item, i) in category.items" :key="i">{{ item }}</li>
          </ul>
          <div v-if="category.source" class="ancient-quote">
            出自：{{ category.source }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue';
import { categories } from '@/stores/data.js';

export default {
  name: 'CategorySection',
  props: {
    searchQuery: {
      type: String,
      default: ''
    }
  },
  setup(props) {
    const filteredCategories = computed(() => {
      if (!props.searchQuery) return categories;
      
      const query = props.searchQuery.toLowerCase();
      return categories.filter(category => 
        category.title.toLowerCase().includes(query) ||
        category.items.some(item => item.toLowerCase().includes(query)) ||
        (category.source && category.source.toLowerCase().includes(query))
      );
    });

    return {
      filteredCategories
    };
  }
}
</script>

<style scoped>
.category-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin-top: 30px;
}

.category-card {
  background-color: white;
  border-radius: var(--border-radius);
  overflow: hidden;
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
  transition: var(--transition);
  border: 1px solid var(--secondary-color);
}

.category-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 12px rgba(0,0,0,0.15);
}

.card-header {
  background-color: var(--primary-color);
  color: white;
  padding: 15px;
  text-align: center;
  font-size: 1.2rem;
}

.card-body {
  padding: 15px;
}

.card-body ul {
  list-style-type: none;
  padding-left: 0;
}

.card-body li {
  padding: 8px 0;
  border-bottom: 1px dashed var(--secondary-color);
  display: flex;
  align-items: center;
}

.card-body li::before {
  content: '•';
  color: var(--primary-color);
  margin-right: 8px;
  font-size: 1.2em;
}

@media (max-width: 768px) {
  .category-cards {
    grid-template-columns: 1fr;
  }
}
</style>