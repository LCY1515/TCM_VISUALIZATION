<template>
  <div class="chart-container" ref="chartContainer">
    <svg ref="svg" width="100%" height="100%">
      <g class="chart-group" :transform="`translate(${width / 2}, ${height / 2})`">
        <!-- D3将在此绘制内容 -->
      </g>
    </svg>
  </div>
</template>

<script>
import { ref, onMounted, watch, computed, nextTick } from 'vue';
import * as d3 from 'd3';
import _ from 'lodash';

export default {
  name: 'CircularChart',
  props: {
    formulas: {
      type: Object,
      required: true
    },
    medicines: {
      type: Object,
      required: true
    },
    links: {
      type: Object,
      required: true
    },
    showHerbLabels: {
      type: Boolean,
      default: true
    },
    showFormulaLabels: {
      type: Boolean,
      default: true
    }
  },
  emits: ['select-formula', 'select-herb', 'hover-formula', 'hover-herb'],
  setup(props, { emit }) {
    const chartContainer = ref(null);
    const svg = ref(null);
    const width = ref(0);
    const height = ref(0);
    const simulation = ref(null);
    
    // 获取已加载方剂中使用的药材（仅限于存在于medicines对象中的药材）
    const activeHerbs = computed(() => {
      const herbs = new Set();
      Object.values(props.links).forEach(herbList => {
        herbList.forEach(herb => {
          // 只添加在medicines数据中存在的药材
          if (props.medicines[herb]) {
            herbs.add(herb);
          }
        });
      });
      return Array.from(herbs);
    });
    
    // 按归经分组药材
    const herbsByMeridian = computed(() => {
      const result = {};
      
      // 只处理activeHerbs中的药材，确保它们都在medicines数据中
      activeHerbs.value.forEach(herbName => {
        const herbInfo = props.medicines[herbName];
        if (herbInfo && herbInfo.归经 && herbInfo.归经.length > 0) {
          const primaryMeridian = herbInfo.归经[0]; // 取第一个归经
          if (!result[primaryMeridian]) {
            result[primaryMeridian] = [];
          }
          result[primaryMeridian].push(herbName);
        } else {
          // 如果没有归经信息，归为"未知"类
          if (!result['未知']) {
            result['未知'] = [];
          }
          result['未知'].push(herbName);
        }
      });
      
      return result;
    });
    
    // 获取有效的方剂-药材链接（仅包含medicines中存在的药材）
    const validLinks = computed(() => {
      const result = {};
      Object.entries(props.links).forEach(([formula, herbs]) => {
        result[formula] = herbs.filter(herb => props.medicines[herb]);
      });
      return result;
    });
    
    // 计算方剂大小（基于有效药材数量）
    const formulaSizes = computed(() => {
      const result = {};
      Object.entries(validLinks.value).forEach(([formula, herbs]) => {
        result[formula] = herbs.length;
      });
      return result;
    });
    
    // 创建更柔和的颜色方案
    const createColorScheme = () => {
      // 创建一个柔和的颜色方案，适合中医风格
      return [
        '#D4A373', // 暖棕色
        '#CCD5AE', // 淡黄绿
        '#E9EDC9', // 浅黄
        '#FAEDCD', // 米色
        '#D4B2A9', // 粉棕
        '#AEC5EB', // 淡蓝
        '#B5DECA', // 淡绿
        '#F1C0E8', // 淡粉
        '#E3D7FF', // 淡紫
        '#FFD8BE', // 杏色
        '#A9B388', // 橄榄色
        '#94B9AF'  // 青灰
      ];
    };
    
    // 绘制可视化图表
    const drawChart = () => {
      if (!chartContainer.value) return;
      
      const containerRect = chartContainer.value.getBoundingClientRect();
      width.value = containerRect.width;
      height.value = containerRect.height;
      
      const chartGroup = d3.select(svg.value).select('.chart-group');
      chartGroup.selectAll('*').remove();
      
      const radius = Math.min(width.value, height.value) * 0.45;
      const innerRadius = radius * 0.6;
      
      // 为归经设置颜色
      const colorScheme = createColorScheme();
      const meridianColors = d3.scaleOrdinal()
        .domain(Object.keys(herbsByMeridian.value))
        .range(colorScheme);
      
      // 创建方剂气泡大小的比例尺
      const maxHerbCount = Math.max(...Object.values(formulaSizes.value), 1);
      const minRadius = innerRadius * 0.05;
      const maxRadius = innerRadius * 0.15;
      const formulaRadiusScale = d3.scaleLinear()
        .domain([1, maxHerbCount])
        .range([minRadius, maxRadius]);
      
      // 计算外环上药材的位置和宽度
      const herbPositions = {};
      const meridianArcs = {};
      let currentAngle = 0;
      const padding = 0.005; // 宽条之间的间隙（弧度）
      
      // 首先计算每个归经的总药材数
      const totalHerbs = activeHerbs.value.length;
      const meridianTotalHerbs = {};
      Object.entries(herbsByMeridian.value).forEach(([meridian, herbs]) => {
        meridianTotalHerbs[meridian] = herbs.length;
      });
      
      // 然后为每个归经分配弧长
      Object.entries(herbsByMeridian.value).forEach(([meridian, herbs]) => {
        const meridianArcLength = (2 * Math.PI) * (herbs.length / totalHerbs);
        const meridianStartAngle = currentAngle;
        const arcPadding = padding * herbs.length; // 所有间隙的总和
        const effectiveArcLength = meridianArcLength - arcPadding; // 减去间隙后的有效弧长
        const herbArcLength = effectiveArcLength / herbs.length; // 每个药材的弧长
        
        // 记录归经弧的信息
        meridianArcs[meridian] = {
          startAngle: meridianStartAngle,
          endAngle: meridianStartAngle + meridianArcLength,
          color: meridianColors(meridian)
        };
        
        // 计算每个药材位置
        herbs.forEach((herb, index) => {
          const herbStartAngle = meridianStartAngle + index * (herbArcLength + padding);
          const herbEndAngle = herbStartAngle + herbArcLength;
          const midAngle = (herbStartAngle + herbEndAngle) / 2;
          
          herbPositions[herb] = {
            startAngle: herbStartAngle,
            endAngle: herbEndAngle,
            midAngle: midAngle-Math.PI/2,
            x: radius * Math.cos(midAngle-Math.PI/2),
            y: radius * Math.sin(midAngle-Math.PI/2),
            color: meridianColors(meridian),
            meridian: meridian
          };
        });
        
        currentAngle = meridianStartAngle + meridianArcLength;
      });
      
      // 创建外环背景
      const backgroundGroup = chartGroup.append('g')
        .attr('class', 'background-group');
      
      // 为每个归经创建背景弧
      Object.entries(meridianArcs).forEach(([meridian, arc]) => {
        const meridianArc = d3.arc()
          .innerRadius(radius - 5)
          .outerRadius(radius + 5)
          .startAngle(arc.startAngle)
          .endAngle(arc.endAngle);
        
        backgroundGroup.append('path')
          .attr('d', meridianArc)
          .attr('fill', arc.color)
          .attr('opacity', 0.3)
          .append('title')
          .text(meridian);
      });
      
      // 绘制药材弧段
      Object.entries(herbPositions).forEach(([herb, position]) => {
        const herbArc = d3.arc()
          .innerRadius(radius - 15)
          .outerRadius(radius + 5)
          .startAngle(position.startAngle)
          .endAngle(position.endAngle);
        
        backgroundGroup.append('path')
          .attr('d', herbArc)
          .attr('fill', position.color)
          .attr('stroke', 'none')
          .attr('class', 'herb-arc')
          .attr('data-herb', herb)
          .style('cursor', 'pointer')
          .on('mouseover', function() {
            highlightHerb(herb);
            emit('hover-herb', herb);
          })
          .on('mouseout', function() {
            resetHighlights();
            emit('hover-herb', null);
          })
          .on('click', function() {
            emit('select-herb', herb);
          })
          .append('title')
          .text(herb);
      });
      
      // 添加药材标签（如果启用）
      if (props.showHerbLabels) {
        const labelsGroup = chartGroup.append('g')
          .attr('class', 'herb-labels-group');
        
        Object.entries(herbPositions).forEach(([herb, position]) => {
          const labelRadius = radius + 20;
          //position.midAngle = position.midAngle-Math.PI/2
          const x = labelRadius * Math.cos(position.midAngle);
          const y = labelRadius * Math.sin(position.midAngle);
          // 旋转标签以便它们沿着圆周排列
          const rotate = (position.midAngle * 180 / Math.PI) + (position.midAngle > Math.PI/2 && position.midAngle < Math.PI*3/2 ? 180 : 0);
          
          labelsGroup.append('text')
            .attr('x', 0)
            .attr('y', 0)
            .attr('transform', `translate(${x}, ${y}) rotate(${rotate})`)
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', 'middle')
            .attr('font-size', '8px')
            .attr('fill', '#333')
            .attr('class', 'herb-label')
            .attr('data-herb', herb)
            .style('pointer-events', 'none')
            .text(herb);
        });
      }
      
      // 创建连接线的容器组
      const linksGroup = chartGroup.append('g')
        .attr('class', 'links-group')
        .style('opacity', 0.15); // 默认较低的不透明度
      
      // 创建方剂节点的容器组
      const formulaGroup = chartGroup.append('g')
        .attr('class', 'formula-group');
      
      // 使用力导向布局定位方剂节点
      const formulaNodes = Object.keys(props.formulas).map(formula => {
        // 计算方剂的平均颜色
        const herbsInFormula = validLinks.value[formula] || [];
        let avgColor = '#888'; // 默认颜色
        
        if (herbsInFormula.length > 0) {
          let r = 0, g = 0, b = 0;
          let validHerbCount = 0;
          
          herbsInFormula.forEach(herb => {
            if (herbPositions[herb]) {
              const color = d3.rgb(herbPositions[herb].color);
              r += color.r;
              g += color.g;
              b += color.b;
              validHerbCount++;
            }
          });
          
          if (validHerbCount > 0) {
            r = Math.round(r / validHerbCount);
            g = Math.round(g / validHerbCount);
            b = Math.round(b / validHerbCount);
            avgColor = `rgb(${r}, ${g}, ${b})`;
          }
        }
        
        return {
          id: formula,
          radius: formulaRadiusScale(formulaSizes.value[formula] || 1),
          herbs: validLinks.value[formula] || [],
          color: avgColor,
          x: (Math.random() - 0.5) * innerRadius * 0.5,
          y: (Math.random() - 0.5) * innerRadius * 0.5
        };
      });
      
      // 停止之前的模拟（如果存在）
      if (simulation.value) {
        simulation.value.stop();
      }
      
      // 创建方剂气泡的力导向模拟
      simulation.value = d3.forceSimulation(formulaNodes)
        .force('center', d3.forceCenter(0, 0))
        .force('collision', d3.forceCollide().radius(d => d.radius * 1.1).strength(0.8))
        .force('charge', d3.forceManyBody().strength(-30))
        // 添加一个限制力，防止节点移出内圈
        .force('radial', d3.forceRadial(innerRadius * 0.7, 0, 0).strength(0.1))
        .alphaDecay(0.01) // 较慢的衰减以使动画更生动
        .on('tick', ticked);
      
      // 绘制方剂节点
      const formulaElements = formulaGroup.selectAll('.formula-node')
        .data(formulaNodes, d => d.id)
        .enter()
        .append('g')
        .attr('class', 'formula-node')
        .attr('data-formula', d => d.id)
        .style('cursor', 'pointer')
        .on('mouseover', function(event, d) {
          highlightFormula(d.id);
          emit('hover-formula', d.id);
        })
        .on('mouseout', function() {
          resetHighlights();
          emit('hover-formula', null);
        })
        .on('click', function(event, d) {
          emit('select-formula', d.id);
        });
      
      formulaElements.append('circle')
        .attr('r', d => d.radius)
        .attr('fill', d => d.color)
        .attr('stroke', '#fff')
        .attr('stroke-width', 1)
        .attr('opacity', 0.85);
      
      // 添加方剂标签（如果启用）
      if (props.showFormulaLabels) {
        formulaElements.append('text')
          .attr('text-anchor', 'middle')
          .attr('dominant-baseline', 'middle')
          .attr('font-size', d => Math.max(8, Math.min(d.radius * 0.4, 12)) + 'px')
          .attr('fill', '#333')
          .attr('pointer-events', 'none')
          .text(d => d.id.length > d.radius/3 ? d.id.substring(0, Math.floor(d.radius/3)) + '...' : d.id);
      }
      
      function ticked() {
        // 更新方剂位置
        formulaGroup.selectAll('.formula-node')
          .attr('transform', d => `translate(${d.x}, ${d.y})`);
        
        // 更新连接线
        updateLinks();
      }
      
      function updateLinks() {
        linksGroup.selectAll('*').remove();
        
        formulaNodes.forEach(formula => {
          formula.herbs.forEach(herb => {
            if (herbPositions[herb]) {
              // 计算连接线的颜色（混合方剂和药材的颜色）
              const herbColor = d3.rgb(herbPositions[herb].color);
              const formulaColor = d3.rgb(formula.color);
              const mixedColor = d3.rgb(
                (herbColor.r + formulaColor.r) / 2,
                (herbColor.g + formulaColor.g) / 2,
                (herbColor.b + formulaColor.b) / 2
              );
              
              // 绘制从方剂到药材的连接线
              linksGroup.append('line')
                .attr('x1', formula.x)
                .attr('y1', formula.y)
                .attr('x2', herbPositions[herb].x)
                .attr('y2', herbPositions[herb].y)
                .attr('stroke', mixedColor)
                .attr('stroke-width', 1.5)
                .attr('data-formula', formula.id)
                .attr('data-herb', herb);
            }
          });
        });
      }
      
      // 高亮相关元素
      function highlightFormula(formulaId) {
        // 降低所有元素亮度
        d3.selectAll('.formula-node')
          .style('opacity', 0.2);
        d3.selectAll('.herb-arc')
          .style('opacity', 0.2);
        
        // 先降低所有连接线的不透明度，而不是整个组
        linksGroup.selectAll('line')
          .style('opacity', 0.05);
        
        // 高亮选中的方剂
        d3.selectAll(`.formula-node[data-formula="${formulaId}"]`)
          .style('opacity', 1)
          .selectAll('circle')
          .attr('stroke', '#ffcc00')
          .attr('stroke-width', 2);
        
        // 高亮相关药材
        const relatedHerbs = validLinks.value[formulaId] || [];
        relatedHerbs.forEach(herb => {
          d3.selectAll(`.herb-arc[data-herb="${herb}"]`)
            .style('opacity', 0.9)
            .attr('stroke', '#ffcc00')
            .attr('stroke-width', 1);
          
          // 同时高亮药材标签
          if (props.showHerbLabels) {
            d3.selectAll(`.herb-label[data-herb="${herb}"]`)
              .attr('font-weight', 'bold')
              .attr('fill', '#000');
          }
          
          // 高亮连接线 - 这里需要修改
          linksGroup.selectAll(`line[data-formula="${formulaId}"][data-herb="${herb}"]`)
            .style('opacity', 1)  // 完全不透明
            .attr('stroke-width', 2)
            .attr('stroke', '#ffcc00');
        });
      }
      
      // 在 highlightHerb 函数中做类似修改:
      function highlightHerb(herbName) {
        // 降低所有元素亮度
        d3.selectAll('.formula-node')
          .style('opacity', 0.2);
        d3.selectAll('.herb-arc')
          .style('opacity', 0.2);
        
        // 先降低所有连接线的不透明度，而不是整个组
        linksGroup.selectAll('line')
          .style('opacity', 0.05);
        
        // 高亮选中的药材
        d3.selectAll(`.herb-arc[data-herb="${herbName}"]`)
          .style('opacity', 0.9)
          .attr('stroke', '#ffcc00')
          .attr('stroke-width', 1);
        
        // 高亮药材标签
        if (props.showHerbLabels) {
          d3.selectAll(`.herb-label[data-herb="${herbName}"]`)
            .attr('font-weight', 'bold')
            .attr('fill', '#000');
        }
        
        // 查找相关方剂
        const relatedFormulas = [];
        Object.entries(validLinks.value).forEach(([formula, herbs]) => {
          if (herbs.includes(herbName)) {
            relatedFormulas.push(formula);
          }
        });
        
        // 高亮相关方剂
        relatedFormulas.forEach(formula => {
          d3.selectAll(`.formula-node[data-formula="${formula}"]`)
            .style('opacity', 1)
            .selectAll('circle')
            .attr('stroke', '#ffcc00')
            .attr('stroke-width', 2);
          
          // 高亮连接线 - 这里需要修改
          linksGroup.selectAll(`line[data-formula="${formula}"][data-herb="${herbName}"]`)
            .style('opacity', 1)  // 完全不透明
            .attr('stroke-width', 2)
            .attr('stroke', '#ffcc00');
        });
      }
      
      // 在 resetHighlights 函数中做相应修改:
      function resetHighlights() {
        // 重置方剂节点
        d3.selectAll('.formula-node')
          .style('opacity', 1)
          .selectAll('circle')
          .attr('stroke', '#fff')
          .attr('stroke-width', 1);
        
        // 重置药材弧
        d3.selectAll('.herb-arc')
          .style('opacity', 0.8)
          .attr('stroke', 'none');
        
        // 重置药材标签
        if (props.showHerbLabels) {
          d3.selectAll('.herb-label')
            .attr('font-weight', 'normal')
            .attr('fill', '#333');
        }
        
        // 重置连接线 - 不要一次性设置整个组的不透明度
        linksGroup.selectAll('line')
          .style('opacity', 0.15)
          .attr('stroke-width', 1.5)
          .each(function() {
            const line = d3.select(this);
            const formulaId = line.attr('data-formula');
            const herb = line.attr('data-herb');
            
            // 恢复混合颜色
            const formulaNode = formulaNodes.find(n => n.id === formulaId);
            const herbPos = herbPositions[herb];
            
            if (formulaNode && herbPos) {
              const herbColor = d3.rgb(herbPos.color);
              const formulaColor = d3.rgb(formulaNode.color);
              const mixedColor = d3.rgb(
                (herbColor.r + formulaColor.r) / 2,
                (herbColor.g + formulaColor.g) / 2,
                (herbColor.b + formulaColor.b) / 2
              );
              
              line.attr('stroke', mixedColor);
            }
          });
      }
    };
    
    // 初始化并处理窗口大小变化
    onMounted(() => {
      window.addEventListener('resize', _.debounce(() => {
        nextTick(drawChart);
      }, 250));
      
      nextTick(drawChart);
    });
    
    // 当数据变化时重绘
    watch(
      [
        () => props.formulas, 
        () => props.links, 
        () => props.showHerbLabels, 
        () => props.showFormulaLabels
      ],
      _.debounce(() => {
        nextTick(drawChart);
      }, 250),
      { deep: true }
    );
    
    return {
      chartContainer,
      svg,
      width,
      height
    };
  }
}
</script>

<style scoped>
.chart-container {
  width: 100%;
  height: 100%;
  overflow: hidden;
}

svg {
  display: block;
}
</style>