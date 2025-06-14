<!-- App.vue -->
<template>
  <div id="app">
        <Dashboard @navigate="handleNavigation" />
    
    <!-- 后续可以在这里添加其他页面组件和路由 -->
  </div>
</template>

<script>
import Dashboard from './components/WisdomTreeHome.vue'

export default {
  name: 'App',
  components: {
    Dashboard
  },
  methods: {
    handleNavigation(module) {
      // 处理导航逻辑，例如使用路由跳转到不同模块页面
      console.log(`将导航到: ${module} 模块`);
      // 后续可以使用vue-router实现真正的页面导航
      // this.$router.push({ name: module });
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
</style>