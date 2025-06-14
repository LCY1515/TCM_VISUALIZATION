<!-- WisdomTreeHorizontal.vue -->
<template>
  <div class="ink-wisdom-tree-container">
    <div class="chinese-border">
      <div class="header">
        <div class="title-decoration left"></div>
        <h1 class="title">智慧之树</h1>
        <div class="title-decoration right"></div>
        <p class="subtitle">医道传承 · 探索中医智慧 · 寻找健康之道</p>
      </div>
      
      <!-- 主要内容区域横向布局 -->
      <div class="main-content-horizontal">
        <!-- 左侧树的可视化区域 -->
        <div class="tree-container">
          <div class="tree-image-container">
            <!-- 背景卷轴 -->
            <div class="scroll-background"></div>
            
            <!-- 树的基础图像 -->
            <div class="tree-base-wrapper">
              <img src="/tree-image.png" class="tree-base-image" alt="智慧之树" />
            </div>
            
            <!-- 可交互的树冠区域 -->
            <div 
              class="interactive-area crown-area" 
              @click="navigateTo('health')" 
              @mouseover="handleHover('crown')" 
              @mouseleave="handleLeave('crown')"
              :class="{ 'area-active': hoveredPart === 'crown' }"
            >
              <div class="area-label">健康建议</div>
            </div>
            
            <!-- 可交互的树干区域 -->
            <div 
              class="interactive-area trunk-area" 
              @click="navigateTo('herbs')" 
              @mouseover="handleHover('trunk')" 
              @mouseleave="handleLeave('trunk')"
              :class="{ 'area-active': hoveredPart === 'trunk' }"
            >
              <div class="area-label trunk-label">药材应用</div>
            </div>
            
            <!-- 可交互的树根区域 -->
            <div 
              class="interactive-area roots-area" 
              @click="navigateTo('theory')" 
              @mouseover="handleHover('roots')" 
              @mouseleave="handleLeave('roots')"
              :class="{ 'area-active': hoveredPart === 'roots' }"
            >
              <div class="area-label">中医理论体系</div>
            </div>
          </div>
        </div>
        
        <!-- 右侧模块说明区域 -->
        <div class="module-descriptions" :class="{ 'show-description': hoveredPart }">
          <div class="module-info" v-show="hoveredPart === 'roots'">
            <h2>中医理论体系</h2>
            <div class="chinese-divider"></div>
            <p>探索中医基础理论，了解阴阳五行、脏腑经络、气血津液等传统中医哲学和生理学体系，传承千年医道智慧。</p>
          </div>
          
          <div class="module-info" v-show="hoveredPart === 'trunk'">
            <h2>药材应用</h2>
            <div class="chinese-divider"></div>
            <p>认识常用中药材的性味归经、功效作用，学习药材的适应症和配伍原则，掌握中药材在现代生活中的应用方法。</p>
          </div>
          
          <div class="module-info" v-show="hoveredPart === 'crown'">
            <h2>健康建议</h2>
            <div class="chinese-divider"></div>
            <p>获取基于中医理论的四季养生、饮食调理、穴位保健等实用健康指导，将古老智慧融入现代生活，守护家庭健康。</p>
          </div>

          <!-- 未选择模块时的默认提示 -->
          <div class="module-info default-info" v-show="!hoveredPart">
            <h2>中医智慧</h2>
            <div class="chinese-divider"></div>
            <p>请将鼠标悬停在树的不同部位，了解各个模块的内容。点击可进入相应的功能区域，探索传统中医的深厚智慧。</p>
          </div>
        </div>
      </div>
      
      <!-- 导航按钮 -->
      <div class="direct-navigation-buttons">
        <button @click="navigateTo('theory')">中医理论体系</button>
        <button @click="navigateTo('herbs')">药材应用</button>
        <button @click="navigateTo('health')">健康建议</button>
      </div>
      
      <!-- 底部印章 -->
      <div class="footer-seal">
        <div class="seal-image"></div>
        <p class="seal-text">医道传承 · 继往开来</p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'WisdomTreeHorizontal',
  data() {
    return {
      hoveredPart: null,
      // 动态配置 URL
      moduleUrls: this.getModuleUrls()
    };
  },
  methods: {
    // 处理鼠标悬停事件
    handleHover(part) {
      this.hoveredPart = part;
    },
    
    // 处理鼠标离开事件
    handleLeave(part) {
      if (this.hoveredPart === part) {
        this.hoveredPart = null;
      }
    },
    
    // 获取基于环境的URL配置
    getModuleUrls() {
      // 检查是否在 Electron 环境中运行
      const isElectron = window.navigator.userAgent.toLowerCase().indexOf('electron') > -1;
      // 检查是否在生产环境
      const isProd = process.env.NODE_ENV === 'production' || isElectron;
      
      if (isProd) {
        // 打包环境 - 使用项目名称
        return {
          theory: 'test',
          herbs: 'my-project',
          health: 'third'
        };
      } else {
        // 开发环境 - 使用端口
        return {
          theory: 'http://localhost:5173/',
          herbs: 'http://localhost:5174/',
          health: 'http://localhost:5175/'
        };
      }
    },
    
    // 模块导航
    navigateTo(module) {
      const url = this.moduleUrls[module];
      
      if (url) {
        console.log(`导航到${module}模块，URL: ${url}`);
        
        // 检查是否在 Electron 环境中运行
        const isElectron = window.navigator.userAgent.toLowerCase().indexOf('electron') > -1;
        
        if (isElectron) {
          try {
            // 在 Electron 中使用 IPC 通信来切换项目
            // window.require 是 Electron 环境下的特殊方法
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
        
        // 触发事件，以便父组件可以处理其他逻辑
        this.$emit('navigate', module);
      }
    }
  }
};
</script>

<style scoped>
.ink-wisdom-tree-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 100vh;
  background-color: #f7f3e9;
  background-image: 
    url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M50 50 L50 60 L60 60 L60 50 Z' fill='%23d9cab3' fill-opacity='0.2'/%3E%3C/svg%3E"),
    linear-gradient(rgba(217, 202, 179, 0.1) 1px, transparent 1px),
    linear-gradient(90deg, rgba(217, 202, 179, 0.1) 1px, transparent 1px);
  background-size: 100px 100px, 50px 50px, 50px 50px;
  padding: 40px 20px;
  font-family: 'SimSun', 'STSong', serif; /* 使用中文宋体字体 */
}

.chinese-border {
  width: 95%;
  max-width: 1200px;
  border: 8px double #973c3f;
  box-shadow: 0 0 0 2px #f7f3e9, 0 0 0 4px #973c3f;
  padding: 30px;
  background-color: #f9f6f2;
  position: relative;
  border-radius: 2px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.chinese-border:before, .chinese-border:after {
  content: '';
  position: absolute;
  width: 40px;
  height: 40px;
  background-size: contain;
  background-repeat: no-repeat;
  z-index: 10;
}

.chinese-border:before {
  top: -4px;
  left: -4px;
  background-image: url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 20 Q10 0 20 0 Q40 0 40 20 Q40 30 30 30 Q10 30 10 40 Q0 40 0 20 Z' fill='%23973c3f' /%3E%3C/svg%3E");
}

.chinese-border:after {
  bottom: -4px;
  right: -4px;
  background-image: url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M40 20 Q30 40 20 40 Q0 40 0 20 Q0 10 10 10 Q30 10 30 0 Q40 0 40 20 Z' fill='%23973c3f' /%3E%3C/svg%3E");
}

.header {
  text-align: center;
  margin-bottom: 30px;
  position: relative;
  width: 100%;
}

.title-decoration {
  display: inline-block;
  width: 100px;
  height: 2px;
  background: linear-gradient(to right, transparent, #973c3f, transparent);
  position: absolute;
  top: 50%;
}

.title-decoration.left {
  left: 20%;
}

.title-decoration.right {
  right: 20%;
}

.title {
  font-size: 3.5rem;
  color: #973c3f;
  margin-bottom: 15px;
  font-weight: normal;
  letter-spacing: 12px;
  text-shadow: 2px 2px 5px rgba(151, 60, 63, 0.2);
  position: relative;
  display: inline-block;
}

.title::before, .title::after {
  content: "※";
  color: #973c3f;
  font-size: 2rem;
  opacity: 0.7;
  position: relative;
  top: -10px;
  margin: 0 15px;
}

.subtitle {
  font-size: 1.3rem;
  color: #65535c;
  font-weight: normal;
  letter-spacing: 5px;
  margin-top: 10px;
}

/* 横向布局的主要内容区域 */
.main-content-horizontal {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: stretch;
  width: 100%;
  margin: 0 auto;
  gap: 30px;
}

.tree-container {
  flex: 1;
  position: relative;
  min-height: 500px;
  max-width: 50%;
}

.tree-image-container {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 500px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.scroll-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0 Q50 25 100 0 L100 100 Q50 75 0 100 Z' fill='%23f7eedd' /%3E%3C/svg%3E");
  background-size: 100% 100%;
  opacity: 0.8;
  z-index: 0;
}

.tree-base-wrapper {
  position: relative;
  width: 80%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1;
}

.tree-base-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  filter: drop-shadow(0 0 8px rgba(151, 60, 63, 0.3));
}

.interactive-area {
  position: absolute;
  z-index: 2;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: transform 0.4s ease, filter 0.3s ease;
  border-radius: 50%;
}

.area-label {
  color: #f7eedd;
  font-family: 'KaiTi', 'STKaiti', serif;
  font-size: 1.5rem;
  text-align: center;
  text-shadow: 0 0 10px rgba(151, 60, 63, 0.8), 0 0 20px rgba(0, 0, 0, 0.6);
  pointer-events: none;
  letter-spacing: 6px;
  background-color: rgba(151, 60, 63, 0.2);
  padding: 8px 15px;
  border-radius: 30px;
  border: 1px solid rgba(151, 60, 63, 0.3);
  backdrop-filter: blur(2px);
}

.trunk-label {
  writing-mode: vertical-lr;
  text-orientation: upright;
  letter-spacing: 12px;
  padding: 20px 8px;
}

.crown-area {
  width: 60%;
  height: 38%;
  top: 5%;
  left: 20%;
  border-radius: 50%;
}

.trunk-area {
  width: 20%;
  height: 42%;
  top: 38%;
  left: 40%;
}

.roots-area {
  width: 70%;
  height: 20%;
  bottom: 0;
  left: 15%;
}

.area-active {
  transform: scale(1.05);
  filter: brightness(1.1) saturate(1.2);
}

/* 右侧模块描述区域 */
.module-descriptions {
  flex: 1;
  background-color: #f7eedd;
  border: 1px solid #d9cab3;
  border-radius: 4px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1), inset 0 0 0 1px #fff;
  padding: 25px;
  text-align: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
  opacity: 1;
  min-height: 500px;
  position: relative;
}

.module-descriptions:before, .module-descriptions:after {
  content: '';
  position: absolute;
  width: 30px;
  height: 30px;
  background-size: contain;
  background-repeat: no-repeat;
}

.module-descriptions:before {
  top: -5px;
  left: -5px;
  background-image: url("data:image/svg+xml,%3Csvg width='30' height='30' viewBox='0 0 30 30' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 15 Q7.5 0 15 0 Q30 0 30 15 Q30 22.5 22.5 22.5 Q7.5 22.5 7.5 30 Q0 30 0 15 Z' fill='%23973c3f' fill-opacity='0.5' /%3E%3C/svg%3E");
}

.module-descriptions:after {
  bottom: -5px;
  right: -5px;
  background-image: url("data:image/svg+xml,%3Csvg width='30' height='30' viewBox='0 0 30 30' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 15 Q22.5 30 15 30 Q0 30 0 15 Q0 7.5 7.5 7.5 Q22.5 7.5 22.5 0 Q30 0 30 15 Z' fill='%23973c3f' fill-opacity='0.5' /%3E%3C/svg%3E");
}

.module-info {
  animation: fadeIn 0.4s ease;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.module-info h2 {
  color: #973c3f;
  margin-bottom: 10px;
  font-size: 1.8rem;
  font-weight: normal;
  position: relative;
  display: inline-block;
  letter-spacing: 8px;
}

.chinese-divider {
  width: 60%;
  height: 15px;
  margin: 5px auto 15px;
  background-image: url("data:image/svg+xml,%3Csvg width='120' height='10' viewBox='0 0 120 10' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 5 L40 5 M80 5 L120 5' stroke='%23973c3f' stroke-width='1'/%3E%3Ccircle cx='60' cy='5' r='4' fill='none' stroke='%23973c3f' stroke-width='1'/%3E%3Ccircle cx='50' cy='5' r='2' fill='%23973c3f'/%3E%3Ccircle cx='70' cy='5' r='2' fill='%23973c3f'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: center;
  background-size: contain;
}

.module-info p {
  color: #65535c;
  line-height: 2;
  font-size: 1.1rem;
  letter-spacing: 2px;
}

/* 导航按钮样式 */
.direct-navigation-buttons {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 30px;
}

.direct-navigation-buttons button {
  background-color: #973c3f;
  color: #f7eedd;
  border: none;
  padding: 10px 20px;
  font-family: 'KaiTi', 'STKaiti', serif;
  font-size: 1.2rem;
  letter-spacing: 4px;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.3s ease;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.15);
}

.direct-navigation-buttons button:hover {
  background-color: #7a2f31;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.direct-navigation-buttons button:active {
  transform: translateY(1px);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

.footer-seal {
  margin-top: 30px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.seal-image {
  width: 80px;
  height: 80px;
  background-color: rgba(151, 60, 63, 0.9);
  border-radius: 5px;
  position: relative;
  background-image: url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='80' height='80' fill='none' stroke='%23f7eedd' stroke-width='2'/%3E%3Ctext x='40' y='45' font-family='STKaiti, KaiTi' font-size='24' fill='%23f7eedd' text-anchor='middle'%3E医道%3C/text%3E%3Ctext x='40' y='65' font-family='STKaiti, KaiTi' font-size='14' fill='%23f7eedd' text-anchor='middle'%3E传承%3C/text%3E%3C/svg%3E");
  background-size: contain;
  transform: rotate(15deg);
  box-shadow: 3px 3px 10px rgba(0, 0, 0, 0.2);
}

.seal-text {
  margin-top: 15px;
  color: #973c3f;
  font-size: 1.1rem;
  letter-spacing: 4px;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(5px); }
  to { opacity: 1; transform: translateY(0); }
}

/* 响应式调整 */
@media (max-width: 900px) {
  .main-content-horizontal {
    flex-direction: column;
  }
  
  .tree-container {
    max-width: 100%;
  }
  
  .module-descriptions {
    min-height: 300px;
  }
  
  .direct-navigation-buttons {
    flex-direction: column;
    align-items: center;
  }
  
  .direct-navigation-buttons button {
    width: 80%;
    margin-bottom: 10px;
  }
}

@media (max-width: 768px) {
  .chinese-border {
    padding: 20px 15px;
  }
  
  .title {
    font-size: 2.5rem;
    letter-spacing: 8px;
  }
  
  .title::before, .title::after {
    font-size: 1.5rem;
    margin: 0 10px;
  }
  
  .subtitle {
    font-size: 1.1rem;
    letter-spacing: 3px;
  }
  
  .area-label {
    font-size: 1.2rem;
  }
  
  .module-info h2 {
    font-size: 1.6rem;
    letter-spacing: 5px;
  }
  
  .module-info p {
    font-size: 1rem;
  }
  
  .seal-image {
    width: 60px;
    height: 60px;
  }
  
  .direct-navigation-buttons button {
    font-size: 1rem;
    padding: 8px 15px;
  }
}
</style>