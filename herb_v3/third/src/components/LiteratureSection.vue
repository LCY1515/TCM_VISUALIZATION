<template>
  <div class="content-section">
    <h2 class="section-title">古籍养生智慧时间轴</h2>
    <div class="timeline">
      <div class="timeline-item" v-for="(book, index) in filteredBooks" :key="index">
        <div class="timeline-date">{{ book.dynasty }}</div>
        <div class="timeline-content">
          <h3 class="timeline-title">{{ book.title }} ({{ book.author }})</h3>
          <p class="timeline-text">{{ book.description }}</p>
          <div class="ancient-quote" v-if="book.quote">
            {{ book.quote }}
          </div>
          <div class="book-detail" v-if="book.details">
            <p class="book-detail-title">养生要点：</p>
            <ul>
              <li v-for="(detail, i) in book.details" :key="i">{{ detail }}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue';
import { ancientBooks } from '@/stores/data.js';

export default {
  name: 'LiteratureSection',
  props: {
    searchQuery: {
      type: String,
      default: ''
    }
  },
  setup(props) {
    const filteredBooks = computed(() => {
      if (!props.searchQuery) return ancientBooks;
      
      const query = props.searchQuery.toLowerCase();
      return ancientBooks.filter(book => 
        book.title.toLowerCase().includes(query) ||
        book.author.toLowerCase().includes(query) ||
        book.description.toLowerCase().includes(query) ||
        book.quote.toLowerCase().includes(query) ||
        (book.details && book.details.some(detail => detail.toLowerCase().includes(query)))
      );
    });

    return {
      filteredBooks
    };
  }
}
</script>

<style scoped>
.timeline {
  position: relative;
  margin: 40px 0;
}

.timeline::before {
  content: '';
  position: absolute;
  top: 0;
  left: 50%;
  height: 100%;
  width: 4px;
  background: var(--secondary-color);
  transform: translateX(-50%);
}

.timeline-item {
  position: relative;
  margin-bottom: 60px;
  display: flex;
}

.timeline-item:nth-child(odd) {
  flex-direction: row;
}

.timeline-item:nth-child(even) {
  flex-direction: row-reverse;
}

.timeline-item:last-child {
  margin-bottom: 0;
}

.timeline-date {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  background-color: var(--primary-color);
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  font-weight: bold;
  z-index: 1;
}

.timeline-content {
  width: 45%;
  padding: 20px;
  background-color: var(--light-bg);
  border-radius: var(--border-radius);
  box-shadow: 0 3px 10px rgba(0,0,0,0.1);
  position: relative;
}

.timeline-title {
  font-size: 1.2rem;
  color: var(--primary-color);
  margin-bottom: 10px;
  border-bottom: 1px dashed var(--secondary-color);
  padding-bottom: 5px;
}

.timeline-text {
  line-height: 1.7;
}

.book-detail {
  margin-top: 15px;
  padding: 10px;
  background-color: rgba(210, 180, 140, 0.1);
  border-radius: var(--border-radius);
}

.book-detail-title {
  font-weight: bold;
  color: var(--primary-color);
  margin-bottom: 5px;
}

.book-detail ul {
  list-style-type: none;
  padding-left: 15px;
}

.book-detail li {
  padding: 3px 0;
  position: relative;
}

.book-detail li::before {
  content: '•';
  color: var(--primary-color);
  position: absolute;
  left: -15px;
}

@media (max-width: 768px) {
  .timeline::before {
    left: 30px;
  }

  .timeline-item {
    flex-direction: row !important;
  }

  .timeline-date {
    left: 30px;
    top: -30px;
  }

  .timeline-content {
    width: calc(100% - 60px);
    margin-left: 60px;
  }
}
</style>