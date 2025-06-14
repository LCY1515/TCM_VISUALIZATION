<template>
  <div class="content-section">
    <h2 class="section-title">古籍养生核心概念</h2>
    <div ref="wordCloudChart" class="word-cloud"></div>
    
    <div class="core-concepts">
      <h3 class="section-title">养生理论框架</h3>
      <div class="concept-categories">
        <div class="concept-category">
          <h4>阴阳理论</h4>
          <div class="concept-tag">阴阳平衡</div>
          <div class="concept-tag">阴阳转化</div>
          <div class="concept-tag">阴阳互根</div>
          <div class="concept-tag">阴平阳秘</div>
        </div>
        
        <div class="concept-category">
          <h4>五行理论</h4>
          <div class="concept-tag">木火土金水</div>
          <div class="concept-tag">相生相克</div>
          <div class="concept-tag">五行归藏</div>
          <div class="concept-tag">五脏六腑</div>
        </div>
        
        <div class="concept-category">
          <h4>精气神</h4>
          <div class="concept-tag">精为本</div>
          <div class="concept-tag">气为动</div>
          <div class="concept-tag">神为变</div>
          <div class="concept-tag">精气神合一</div>
        </div>
        
        <div class="concept-category">
          <h4>气血理论</h4>
          <div class="concept-tag">气血同源</div>
          <div class="concept-tag">气为血帅</div>
          <div class="concept-tag">血为气母</div>
          <div class="concept-tag">气血调和</div>
        </div>
        
        <div class="concept-category">
          <h4>脏腑理论</h4>
          <div class="concept-tag">五脏藏精</div>
          <div class="concept-tag">六腑传化</div>
          <div class="concept-tag">奇恒之腑</div>
          <div class="concept-tag">脏腑相关</div>
        </div>
        
        <div class="concept-category">
          <h4>经络理论</h4>
          <div class="concept-tag">十二经脉</div>
          <div class="concept-tag">奇经八脉</div>
          <div class="concept-tag">经络联通</div>
          <div class="concept-tag">气血运行</div>
        </div>
      </div>
      
      <p style="margin-top: 20px;">古籍中的养生思想围绕阴阳五行等核心概念，通过调和人体与自然的关系，达到健康长寿的目的。这些概念构成了中医养生的理论基础，指导着具体的养生实践。</p>
    </div>
  </div>
</template>

<script>
import { onMounted, ref } from 'vue';
import * as echarts from 'echarts';
import 'echarts-wordcloud';

export default {
  name: 'WordcloudSection',
  setup() {
    const wordCloudChart = ref(null);

    onMounted(() => {
      if (wordCloudChart.value) {
        const chart = echarts.init(wordCloudChart.value);
        const option = {
          backgroundColor: '#f8f4e9',
          tooltip: {
            show: true
          },
          series: [{
            type: 'wordCloud',
            shape: 'circle',
            left: 'center',
            top: 'center',
            width: '90%',
            height: '90%',
            right: null,
            bottom: null,
            sizeRange: [12, 60],
            rotationRange: [-90, 90],
            rotationStep: 45,
            gridSize: 8,
            drawOutOfBound: false,
            textStyle: {
              fontFamily: 'SimSun, STSong',
              fontWeight: 'normal',
              color: function () {
                return 'rgb(' + [
                  Math.round(Math.random() * 160 + 30),
                  Math.round(Math.random() * 160 + 30),
                  Math.round(Math.random() * 160 + 30)
                ].join(',') + ')';
              }
            },
            emphasis: {
              textStyle: {
                shadowBlur: 10,
                shadowColor: '#333'
              }
            },
            data: [
              { name: '阴阳', value: 100 },
              { name: '五行', value: 95 },
              { name: '气血', value: 90 },
              { name: '精神', value: 85 },
              { name: '脏腑', value: 80 },
              { name: '经络', value: 75 },
              { name: '四时', value: 70 },
              { name: '五脏', value: 65 },
              { name: '六腑', value: 60 },
              { name: '调和', value: 55 },
              { name: '平衡', value: 50 },
              { name: '养生', value: 45 },
              { name: '摄生', value: 40 },
              { name: '形神', value: 38 },
              { name: '导引', value: 36 },
              { name: '吐纳', value: 34 },
              { name: '调息', value: 32 },
              { name: '内养', value: 30 },
              { name: '外养', value: 28 },
              { name: '药食同源', value: 26 },
              { name: '寒热', value: 24 },
              { name: '虚实', value: 22 },
              { name: '表里', value: 20 },
              { name: '升降', value: 18 },
              { name: '固摄', value: 16 },
              { name: '通达', value: 14 },
              { name: '四季养生', value: 12 },
              { name: '春养肝', value: 12 },
              { name: '夏养心', value: 12 },
              { name: '秋养肺', value: 12 },
              { name: '冬养肾', value: 12 },
              { name: '顺应自然', value: 35 },
              { name: '阴阳平衡', value: 32 },
              { name: '正气内存', value: 30 },
              { name: '形神共养', value: 28 },
              { name: '天人合一', value: 25 },
              { name: '五脏六腑', value: 22 },
              { name: '三焦', value: 18 },
              { name: '奇经八脉', value: 15 },
              { name: '十二经脉', value: 15 }
            ]
          }]
        };

        chart.setOption(option);

        window.addEventListener('resize', () => {
          chart.resize();
        });
      }
    });

    return {
      wordCloudChart
    };
  }
}
</script>

<style scoped>
.word-cloud {
  width: 100%;
  height: 300px;
  margin: 20px 0;
}

.core-concepts {
  margin-top: 30px;
}

.concept-categories {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 15px;
  margin-top: 20px;
}

.concept-category {
  background-color: white;
  border-radius: var(--border-radius);
  padding: 15px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
}

.concept-category h4 {
  color: var(--primary-color);
  margin-bottom: 10px;
  border-bottom: 1px solid var(--secondary-color);
  padding-bottom: 5px;
}

.concept-tag {
  display: inline-block;
  background-color: var(--light-bg);
  padding: 5px 10px;
  margin: 3px;
  border-radius: 15px;
  font-size: 0.9rem;
  border: 1px solid var(--secondary-color);
}
</style>