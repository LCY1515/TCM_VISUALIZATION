<template>
  <div id="app">
    <!-- 顶部模块跳转按钮区域 -->
    <div class="app-navigation-buttons">
      <button @click="handleNavigation('home')">首页</button>
      <button @click="handleNavigation('theory')">中医理论体系</button>
      <button @click="handleNavigation('herbs')">药材应用</button>
      <button @click="handleNavigation('health')">健康建议</button>
    </div>
    
    <!-- 中间主展示区域 -->
    <Dashboard @navigate="handleNavigation" />
  </div>
</template>

<script>
import Dashboard from './components/Dashboard.vue'

export default {
  name: 'App',
  components: {
    Dashboard
  },
  data() {
    return {
      hoveredPart: null,
      // 动态配置 URL
      moduleUrls: this.getModuleUrls()
    };
  },
  methods: {
    // 获取基于环境的URL配置
    getModuleUrls() {
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
    },
    
    // 模块导航
    handleNavigation(module) {
      const url = this.moduleUrls[module];
      
      if (url) {
        console.log(`将跳转到 ${module}，URL: ${url}`);
        
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
    }
  }
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background-color: #f5f9f6;
}

#app {
  width: 100%;
  min-height: 100vh;
}

.app-navigation-buttons {
  display: flex;
  justify-content: center;
  gap: 30px;
  margin: 40px auto;
  padding: 30px;
  border-radius: 18px;
  background-color: #a87c55;
  background-image: url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%239c6d3d' fill-opacity='0.2'%3E%3Ccircle cx='25' cy='25' r='2'/%3E%3Ccircle cx='75' cy='75' r='2'/%3E%3Ccircle cx='25' cy='75' r='2'/%3E%3Ccircle cx='75' cy='25' r='2'/%3E%3C/g%3E%3C/svg%3E");
  background-size: 80px 80px;
  box-shadow: inset 0 0 30px rgba(0, 0, 0, 0.15), 0 8px 24px rgba(0, 0, 0, 0.05);
  border: 2px solid #855a34;
  position: relative;
  z-index: 1;
}

.app-navigation-buttons button {
  position: relative;
  background-color: #973c3f;
  color: #fdf8ef;
  border: 2px solid #e2c17c;
  padding: 14px 32px;
  font-family: 'KaiTi', 'STKaiti', serif;
  font-size: 1.5rem;
  letter-spacing: 6px;
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(151, 60, 63, 0.2), inset 0 0 5px rgba(255, 248, 200, 0.3);
  background-image: linear-gradient(145deg, rgba(255, 255, 255, 0.05), rgba(0, 0, 0, 0.05));
  text-shadow: 1px 1px 1px rgba(0, 0, 0, 0.3);
}

.app-navigation-buttons button::before {
  content: '';
  position: absolute;
  top: -6px;
  left: -6px;
  right: -6px;
  bottom: -6px;
  border-radius: 10px;
  background: radial-gradient(ellipse at center, rgba(255, 215, 110, 0.15), transparent 70%);
  z-index: -1;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.app-navigation-buttons button:hover::before {
  opacity: 1;
}

.app-navigation-buttons button:hover {
  background-color: #7a2f31;
  transform: translateY(-2px) scale(1.04);
  box-shadow: 0 6px 18px rgba(151, 60, 63, 0.3), inset 0 0 8px rgba(255, 248, 200, 0.4);
}
</style>