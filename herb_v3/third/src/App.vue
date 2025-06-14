<template>
  <div class="app-container">
    <!-- 🌿 顶部导航按钮 -->
    <div class="app-navigation-buttons">
      <button @click="navigateTo('home')">首页</button>
      <button @click="navigateTo('theory')">中医理论体系</button>
      <button @click="navigateTo('herbs')">药材应用</button>
      <button @click="navigateTo('health')">健康建议</button>
    </div>

    <HeaderComponent />

    <NavTabs 
      :activeTab="activeTab" 
      @update:activeTab="activeTab = $event" 
    />

    <LiteratureSection 
      v-if="activeTab === 'literature'" 
      :searchQuery="''" 
    />
    
    <CategorySection 
      v-if="activeTab === 'category'" 
      :searchQuery="''" 
    />
    
    <SeasonalSection 
      v-if="activeTab === 'seasonal'" 
    />
    
    <WordcloudSection 
      v-if="activeTab === 'wordcloud'" 
    />
    
    <RecommendationSection 
      v-if="activeTab === 'recommendation'" 
      :searchQuery="''" 
    />

    <FooterComponent />
  </div>
</template>

<script>
import { ref } from 'vue';
import HeaderComponent from './components/HeaderComponent.vue';
import NavTabs from './components/NavTabs.vue';
import LiteratureSection from './components/LiteratureSection.vue';
import CategorySection from './components/CategorySection.vue';
import SeasonalSection from './components/SeasonalSection.vue';
import WordcloudSection from './components/WordcloudSection.vue';
import RecommendationSection from './components/RecommendationSection.vue';
import FooterComponent from './components/FooterComponent.vue';

export default {
  name: 'App',
  components: {
    HeaderComponent,
    NavTabs,
    LiteratureSection,
    CategorySection,
    SeasonalSection,
    WordcloudSection,
    RecommendationSection,
    FooterComponent
  },
  setup() {
    const activeTab = ref('literature');
    
    // 动态获取模块URLs
    const getModuleUrls = () => {
      // 检查是否在 Electron 环境中运行
      const isElectron = window.navigator.userAgent.toLowerCase().indexOf('electron') > -1;
      // 检查是否在生产环境
      const isProd = process.env.NODE_ENV === 'production' || isElectron;
      
      if (isProd) {
        // 打包环境 - 使用项目名称
        return {
          home: 'first1',
          theory: 'test',
          herbs: 'my-project',
          health: 'third'
        };
      } else {
        // 开发环境 - 使用端口
        return {
          home: 'http://localhost:5172/',
          theory: 'http://localhost:5173/',
          herbs: 'http://localhost:5174/',
          health: 'http://localhost:5175/'
        };
      }
    };
    
    const moduleUrls = getModuleUrls();

    const navigateTo = (module) => {
      const url = moduleUrls[module];
      if (url) {
        console.log(`导航至: ${module} 页面 -> ${url}`);
        
        // 检查是否在 Electron 环境中运行
        const isElectron = window.navigator.userAgent.toLowerCase().indexOf('electron') > -1;
        
        if (isElectron) {
          try {
            // 在 Electron 中使用 IPC 通信来切换项目
            if (window.require) {
              const { ipcRenderer } = window.require('electron');
              ipcRenderer.send('open-project', url);
              console.log('使用IPC发送导航请求');
            } else {
              // 降级方案
              console.log('无法访问 window.require，使用降级方案');
              window.location.href = `http://localhost:3000/`;
            }
          } catch (e) {
            console.error('导航出错:', e);
            // 最后的降级方案
            window.location.href = `http://localhost:3000/`;
          }
        } else {
          // 浏览器环境 - 直接导航到开发服务器端口
          window.location.href = url;
        }
      }
    };

    return {
      activeTab,
      navigateTo
    };
  }
}
</script>

<style>
:root {
  --primary-color: #8b5a2b;
  --secondary-color: #d2b48c;
  --accent-color: #e8c39e;
  --text-color: #3c3c3c;
  --light-bg: #f8f4e9;
  --dark-bg: #2c1e0f;
  --border-radius: 8px;
  --transition: all 0.3s ease;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: "SimSun", "STSong", serif;
  background-color: var(--light-bg);
  color: var(--text-color);
  line-height: 1.6;
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

.content-section {
  background-color: white;
  border-radius: var(--border-radius);
  padding: 30px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
  margin-bottom: 40px;
  border: 1px solid var(--secondary-color);
}

.section-title {
  border-left: 5px solid var(--primary-color);
  padding-left: 15px;
  margin-bottom: 25px;
  font-size: 1.5rem;
  color: var(--primary-color);
}

.ancient-quote {
  font-style: italic;
  background-color: rgba(210, 180, 140, 0.2);
  padding: 15px;
  border-radius: var(--border-radius);
  margin: 15px 0;
  position: relative;
}

.ancient-quote::before, .ancient-quote::after {
  content: '"';
  font-size: 2rem;
  color: var(--primary-color);
  position: absolute;
  opacity: 0.5;
}

.ancient-quote::before {
  top: 0;
  left: 5px;
}

.ancient-quote::after {
  bottom: -15px;
  right: 5px;
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