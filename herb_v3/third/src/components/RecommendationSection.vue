<template>
  <div class="content-section">
    <h2 class="section-title">古籍养生智慧的现代实践</h2>
    <p>结合古籍智慧与现代生活方式，为您提供可实践的养生建议：</p>
    
    <div class="recommendations">
      <div class="recommendation-list">
        <div class="recommendation-card" v-for="(rec, index) in filteredRecommendations" :key="index">
          <div class="recommendation-header">{{ rec.title }}</div>
          <div class="recommendation-body">
            <p>{{ rec.description }}</p>
            <p class="recommendation-source">—— 源自《{{ rec.source }}》</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue';
import { modernRecommendations } from '@/stores/data.js';

export default {
  name: 'RecommendationSection',
  props: {
    searchQuery: {
      type: String,
      default: ''
    }
  },
  setup(props) {
    const filteredRecommendations = computed(() => {
      if (!props.searchQuery) return modernRecommendations;
      
      const query = props.searchQuery.toLowerCase();
      return modernRecommendations.filter(rec => 
        rec.title.toLowerCase().includes(query) ||
        rec.description.toLowerCase().includes(query) ||
        rec.source.toLowerCase().includes(query)
      );
    });

    return {
      filteredRecommendations
    };
  }
}
</script>

<style scoped>
.recommendations {
  margin-top: 30px;
}

.recommendation-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.recommendation-card {
  background-color: white;
  border-radius: var(--border-radius);
  overflow: hidden;
  box-shadow: 0 3px 8px rgba(0,0,0,0.1);
  border: 1px solid var(--secondary-color);
  transition: var(--transition);
}

.recommendation-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0,0,0,0.15);
}

.recommendation-header {
  background-color: var(--primary-color);
  color: white;
  padding: 12px;
  text-align: center;
  font-size: 1.1rem;
}

.recommendation-body {
  padding: 15px;
}

.recommendation-source {
  font-style: italic;
  color: var(--primary-color);
  margin-top: 10px;
  text-align: right;
  font-size: 0.9rem;
}

@media (max-width: 768px) {
  .recommendation-list {
    grid-template-columns: 1fr;
  }
}
</style>