import { createApp } from 'vue'
import App from './App.vue'
import * as echarts from 'echarts'
import 'echarts-wordcloud'

// 全局注册 echarts
const app = createApp(App)
app.config.globalProperties.$echarts = echarts

app.mount('#app')