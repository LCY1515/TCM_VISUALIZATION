<template>
  <header>
    <h1 class="title">古籍养生智慧</h1>
    <p class="subtitle">源于经典 · 顺应自然 · 现代实践</p>
  </header>
</template>

<script>
export default {
  name: 'HeaderComponent'
}
</script>

<style scoped>
header {
  text-align: center;
  margin-bottom: 40px;
  position: relative;
  padding: 30px 0;
  background: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100" height="100" fill="%23f8f4e9"/><path d="M0,0 L100,100 M100,0 L0,100" stroke="%23d2b48c" stroke-width="1" stroke-opacity="0.2"/></svg>');
  border-bottom: 2px solid var(--secondary-color);
}

.title {
  font-size: 2.8rem;
  margin-bottom: 15px;
  color: var(--primary-color);
  letter-spacing: 2px;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.1);
}

.subtitle {
  font-size: 1.2rem;
  color: var(--text-color);
  opacity: 0.8;
}
</style>