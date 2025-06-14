<template>
  <div class="app-container">
    <!-- 🌿 顶部导航按钮 -->
    <div class="app-navigation-buttons">
      <button @click="navigateTo('home')">首页</button>
      <button @click="navigateTo('theory')">中医理论体系</button>
      <button @click="navigateTo('herbs')">药材应用</button>
      <button @click="navigateTo('health')">健康建议</button>
    </div>

    <!-- 页面主体内容 -->
    <Herb />
  </div>
</template>

<script>
import Herb from './components/Herb.vue';

export default {
  name: 'App',
  components: {
    Herb
  },
  data() {
    return {
      hoveredPart: null,
      moduleUrls: {
        home: 'http://localhost:5172/',
        theory: 'http://localhost:5173/',
        herbs: 'http://localhost:5174/',
        health: 'http://localhost:5175/'
      }
    };
  },
  methods: {
    navigateTo(module) {
      const url = this.moduleUrls[module];
      if (url) {
        console.log(`导航至 ${module} 页面 -> ${url}`);
        window.location.href = url;
      }
    }
  }
};
</script>

<style>
body {
  font-family: "SimSun", "STSong", serif;
  background-color: #f8f4e9;
  color: #3c3c3c;
  margin: 0;
  padding: 0;
}

.app-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

/* 🌸 顶部导航按钮风格 */
.app-navigation-buttons {
  display: flex;
  justify-content: center;
  gap: 30px;
  margin-bottom: 30px;
  padding: 20px;
  border-radius: 18px;
  background-color: #a87c55;
  background-image: url("data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%239c6d3d' fill-opacity='0.2'%3E%3Ccircle cx='25' cy='25' r='2'/%3E%3Ccircle cx='75' cy='75' r='2'/%3E%3Ccircle cx='25' cy='75' r='2'/%3E%3Ccircle cx='75' cy='25' r='2'/%3E%3C/g%3E%3C/svg%3E");
  background-size: 80px 80px;
  border: 2px solid #855a34;
  box-shadow: inset 0 0 20px rgba(0, 0, 0, 0.1), 0 6px 18px rgba(0, 0, 0, 0.05);
}

.app-navigation-buttons button {
  background-color: #973c3f;
  color: #fdf8ef;
  border: 2px solid #e2c17c;
  font-family: 'KaiTi', 'STKaiti', serif;
  font-size: 1.4rem;
  letter-spacing: 5px;
  padding: 12px 26px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 10px rgba(151, 60, 63, 0.2), inset 0 0 4px rgba(255, 248, 200, 0.3);
  text-shadow: 1px 1px 1px rgba(0, 0, 0, 0.3);
}

.app-navigation-buttons button:hover {
  background-color: #7a2f31;
  transform: scale(1.05);
  box-shadow: 0 6px 16px rgba(151, 60, 63, 0.3), inset 0 0 6px rgba(255, 248, 200, 0.4);
}

@media (max-width: 768px) {
  .app-navigation-buttons {
    flex-direction: column;
    align-items: center;
  }

  .app-navigation-buttons button {
    width: 80%;
    text-align: center;
  }
}
</style>

