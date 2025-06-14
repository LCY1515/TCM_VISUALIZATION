<template>
  <div ref="treeChart" class="tree-chart" style="background-color: #fdfaf4; font-family: 'STKaiti', serif;"></div>
</template>

<script>
import * as echarts from 'echarts';

export default {
  name: 'TreeChart',
  props: {
    treeData: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      pathStack: [], // 用于记录当前路径
      chart: null
    };
  },
  mounted() {
    this.chart = echarts.init(this.$refs.treeChart);
    this.renderTreeChart(this.treeData); // 初始显示第一层
  },
  methods: {
    renderTreeChart(node) {
      const children = node.children || [];
      const data = {
        name: node.name,
        children: children.map(child => ({
          name: child.name,
          children: child.children ? [{}] : [] // 用空节点占位，避免展开
        }))
      };

      const option = {
        backgroundColor: 'transparent',
        tooltip: {
          trigger: 'item',
          triggerOn: 'mousemove',
          formatter: '{b}',
          backgroundColor: 'rgba(250, 235, 215, 0.9)',
          borderColor: '#e0c097',
          borderWidth: 1,
          textStyle: {
            color: '#5b3a29',
            fontFamily: 'STKaiti, serif'
          }
        },
        series: [
          {
            type: 'tree',
            data: [data],
            top: '5%',
            left: '5%',
            bottom: '5%',
            right: '5%',
            Symbol:'image:///icon.jpg',
            symbolSize: 14,
            orient: 'horizontal',
            label: {
              position: 'top',
              verticalAlign: 'middle',
              align: 'center',
              fontSize: 14,
              color: '#6b8a76',
              fontFamily: 'STKaiti, serif'
            },
            leaves: {
              label: {
                position: 'bottom',
                verticalAlign: 'middle',
                align: 'center'
              }
            },
            lineStyle: {
              color: '#a6754f'
            },
            expandAndCollapse: false,
            animationDuration: 550,
            animationDurationUpdate: 750
          }
        ]
      };

      this.chart.setOption(option);
      this.chart.off('click');
      this.chart.on('click', params => this.handleNodeClick(params, node));
    },

    handleNodeClick(params, currentNode) {
      const clickedName = params.name;

      // 如果点击的是当前节点，返回上一层
      if (clickedName === currentNode.name) {
        if (this.pathStack.length > 0) {
          const parentNode = this.pathStack.pop();
          this.renderTreeChart(parentNode);
        }
        return;
      }

      // 在当前节点的子节点里查找点击的节点
      const clickedNode = (currentNode.children || []).find(child => child.name === clickedName);

      if (clickedNode) {
        // 压栈当前节点，进入下一层
        this.pathStack.push(currentNode);
        this.renderTreeChart(clickedNode);
      }
    }
  }
};
</script>


<style scoped>
.tree-chart {
  width: 100%;
  height: 450px; /* 设置固定的高度 */
  background-color: #fdfaf4; 
  font-family: 'KaiTi', 'STKaiti', serif;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); /* 轻微阴影效果 */
}
</style>
