<template>
  <div class="chart-container">
    <div class="chart-controls">
      <div class="zoom-controls">
        <button @click="zoomIn" class="control-btn" title="放大">
          <svg-icon name="zoom-in" :size="20" />
          <span>放大</span>
        </button>
        <button @click="zoomOut" class="control-btn" title="缩小">
          <svg-icon name="zoom-out" :size="20" />
          <span>缩小</span>
        </button>
        <button @click="resetZoom" class="control-btn" title="重置视图">
          <svg-icon name="refresh-cw" :size="20" />
          <span>重置视图</span>
        </button>
      </div>
    </div>
    <div ref="chartRef" class="school-relation-chart" :style="{ width: width, height: height }"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import * as echarts from 'echarts'

const props = defineProps({
  width: {
    type: String,
    default: '100%'
  },
  height: {
    type: String,
    default: '100%'
  },
  layout: {
    type: String,
    default: 'force'
  },
  // 可接受外部数据，默认使用内置数据
  graphData: {
    type: Object,
    default: () => ({
  "nodes": [
    // 学派节点 (Schools) - category 0
    { "id": 0, "name": "医经学派", "symbolSize": 50, "category": 0 },
    { "id": 1, "name": "经方学派", "symbolSize": 50, "category": 0 },
    { "id": 2, "name": "伤寒学派", "symbolSize": 60, "category": 0 },
    { "id": 3, "name": "河间学派", "symbolSize": 55, "category": 0 },
    { "id": 4, "name": "易水学派", "symbolSize": 55, "category": 0 },
    { "id": 5, "name": "温病学派", "symbolSize": 60, "category": 0 },
    { "id": 6, "name": "汇通学派", "symbolSize": 45, "category": 0 },
    
    // 代表人物节点 (Key Figures) - category 1
    { "id": 10, "name": "张仲景", "symbolSize": 45, "category": 1, "time": "东汉末年" },
    { "id": 11, "name": "刘完素", "symbolSize": 42, "category": 1, "time": "金代" },
    { "id": 12, "name": "叶天士", "symbolSize": 42, "category": 1, "time": "清代中叶" },
    { "id": 13, "name": "吴鞠通", "symbolSize": 40, "category": 1, "time": "清代" },
    { "id": 14, "name": "张元素", "symbolSize": 42, "category": 1, "time": "金代" },
    { "id": 15, "name": "李东垣", "symbolSize": 40, "category": 1, "time": "金元" },
    { "id": 16, "name": "张锡纯", "symbolSize": 38, "category": 1, "time": "清末民初" },
    { "id": 17, "name": "王冰", "symbolSize": 35, "category": 1, "time": "唐代" },
    { "id": 18, "name": "朱丹溪", "symbolSize": 42, "category": 1, "time": "元代" },
    { "id": 19, "name": "张从正", "symbolSize": 40, "category": 1, "time": "金元" },
    { "id": 20, "name": "王叔和", "symbolSize": 35, "category": 1, "time": "晋代" },
    { "id": 21, "name": "孙思邈", "symbolSize": 40, "category": 1, "time": "唐代" },
    { "id": 22, "name": "成无己", "symbolSize": 38, "category": 1, "time": "金代" },
    { "id": 23, "name": "方有执", "symbolSize": 35, "category": 1, "time": "明末" },
    { "id": 24, "name": "喻嘉言", "symbolSize": 35, "category": 1, "time": "清初" },
    { "id": 25, "name": "张志聪", "symbolSize": 35, "category": 1, "time": "明末清初" },
    { "id": 26, "name": "唐容川", "symbolSize": 35, "category": 1, "time": "清末民初" },
    { "id": 27, "name": "恽铁樵", "symbolSize": 35, "category": 1, "time": "民国" },
    { "id": 28, "name": "王孟英", "symbolSize": 38, "category": 1, "time": "清代" },
    { "id": 29, "name": "薛雪", "symbolSize": 38, "category": 1, "time": "清代" },
    { "id": 30, "name": "吴又可", "symbolSize": 38, "category": 1, "time": "明末" },
    { "id": 31, "name": "罗天益", "symbolSize": 35, "category": 1, "time": "元代" },
    { "id": 32, "name": "杨则民", "symbolSize": 35, "category": 1, "time": "民国" },
    { "id": 33, "name": "张景岳", "symbolSize": 38, "category": 1, "time": "明代" },
    { "id": 34, "name": "薛己", "symbolSize": 36, "category": 1, "time": "明代" },
    { "id": 35, "name": "李中梓", "symbolSize": 36, "category": 1, "time": "明代" },
    { "id": 36, "name": "赵献可", "symbolSize": 35, "category": 1, "time": "明代" },
    { "id": 37, "name": "王好古", "symbolSize": 34, "category": 1, "time": "金元" },
    { "id": 38, "name": "朱肱", "symbolSize": 34, "category": 1, "time": "宋代" },
    { "id": 39, "name": "朱沛文", "symbolSize": 32, "category": 1, "time": "清末民初" },
    
    // 代表典籍节点 (Classical Texts) - category 2
    { "id": 50, "name": "黄帝内经", "symbolSize": 60, "category": 2, "time": "战国-汉" },
    { "id": 51, "name": "伤寒论", "symbolSize": 55, "category": 2, "time": "东汉末年" },
    { "id": 52, "name": "温疫论", "symbolSize": 45, "category": 2, "time": "明末" },
    { "id": 53, "name": "温热论", "symbolSize": 45, "category": 2, "time": "清代" },
    { "id": 54, "name": "脾胃论", "symbolSize": 45, "category": 2, "time": "金元" },
    { "id": 55, "name": "素问玄机原病式", "symbolSize": 40, "category": 2, "time": "金代" },
    { "id": 56, "name": "内经知要", "symbolSize": 38, "category": 2, "time": "明代" },
    { "id": 57, "name": "温病条辨", "symbolSize": 45, "category": 2, "time": "清代" },
    { "id": 58, "name": "医学衷中参西录", "symbolSize": 42, "category": 2, "time": "清末民初" },
    { "id": 59, "name": "洁古珍珠囊", "symbolSize": 40, "category": 2, "time": "金代" },
    { "id": 60, "name": "内外伤辨惑论", "symbolSize": 40, "category": 2, "time": "金元" },
    { "id": 61, "name": "兰室秘藏", "symbolSize": 38, "category": 2, "time": "金元" },
    { "id": 62, "name": "卫生宝鉴", "symbolSize": 38, "category": 2, "time": "元代" },
    { "id": 63, "name": "宣明论方", "symbolSize": 38, "category": 2, "time": "金代" },
    { "id": 64, "name": "素问病机气宜保命集", "symbolSize": 40, "category": 2, "time": "金代" },
    { "id": 65, "name": "湿热条辨", "symbolSize": 38, "category": 2, "time": "清代" },
    { "id": 66, "name": "温热经纬", "symbolSize": 40, "category": 2, "time": "清代" },
    { "id": 67, "name": "类经", "symbolSize": 38, "category": 2, "time": "明代" },
    { "id": 68, "name": "千金要方", "symbolSize": 38, "category": 2, "time": "唐代" },
    { "id": 69, "name": "注解伤寒论", "symbolSize": 38, "category": 2, "time": "金代" },
    { "id": 70, "name": "类证活人书", "symbolSize": 36, "category": 2, "time": "宋代" },
    { "id": 71, "name": "群经见智录", "symbolSize": 35, "category": 2, "time": "民国" },
    { "id": 72, "name": "医经读", "symbolSize": 35, "category": 2, "time": "清代" },
    
    // 理论概念节点 (Concepts) - category 3
    { "id": 80, "name": "阴阳五行", "symbolSize": 45, "category": 3 },
    { "id": 81, "name": "脏腑经络", "symbolSize": 45, "category": 3 },
    { "id": 82, "name": "六经辨证", "symbolSize": 42, "category": 3 },
    { "id": 83, "name": "卫气营血辨证", "symbolSize": 42, "category": 3 },
    { "id": 84, "name": "三焦辨证", "symbolSize": 40, "category": 3 },
    { "id": 85, "name": "八纲辨证", "symbolSize": 40, "category": 3 },
    { "id": 86, "name": "火热论", "symbolSize": 40, "category": 3 },
    { "id": 87, "name": "攻邪论", "symbolSize": 38, "category": 3 },
    { "id": 88, "name": "养阴论", "symbolSize": 38, "category": 3 },
    { "id": 89, "name": "脾胃内伤", "symbolSize": 38, "category": 3 },
    { "id": 90, "name": "升阳散火", "symbolSize": 36, "category": 3 },
    { "id": 91, "name": "阳常不足", "symbolSize": 36, "category": 3 },
    { "id": 92, "name": "戾气学说", "symbolSize": 36, "category": 3 },
    { "id": 93, "name": "气化学说", "symbolSize": 36, "category": 3 },
    { "id": 94, "name": "相火妄动", "symbolSize": 36, "category": 3 },
    { "id": 95, "name": "味归经络", "symbolSize": 36, "category": 3 },
    { "id": 96, "name": "引经报使", "symbolSize": 36, "category": 3 },
    { "id": 97, "name": "六气致病", "symbolSize": 35, "category": 3 },
    { "id": 98, "name": "中西医汇通", "symbolSize": 40, "category": 3 },
    
    // 治法节点 (Methods) - category 4
    { "id": 100, "name": "汗吐下三法", "symbolSize": 38, "category": 4 },
    { "id": 101, "name": "和解少阳", "symbolSize": 36, "category": 4 },
    { "id": 102, "name": "温补法", "symbolSize": 36, "category": 4 },
    { "id": 103, "name": "清热泻火", "symbolSize": 38, "category": 4 },
    { "id": 104, "name": "养阴清热", "symbolSize": 36, "category": 4 }
  ],
  
  "links": [
    // 学派间传承与影响关系
    { "source": "医经学派", "target": "伤寒学派", "value": "理论基础" },
    { "source": "医经学派", "target": "河间学派", "value": "理论来源" },
    { "source": "医经学派", "target": "易水学派", "value": "理论渊源" },
    { "source": "医经学派", "target": "温病学派", "value": "间接影响" },
    { "source": "经方学派", "target": "伤寒学派", "value": "方剂来源" },
    { "source": "经方学派", "target": "河间学派", "value": "提供方剂" },
    { "source": "经方学派", "target": "易水学派", "value": "方剂基础" },
    { "source": "伤寒学派", "target": "温病学派", "value": "学术争鸣" },
    { "source": "河间学派", "target": "易水学派", "value": "学术争鸣" },
    { "source": "河间学派", "target": "温病学派", "value": "理论奠基" },
    { "source": "易水学派", "target": "温病学派", "value": "理论补充" },
    { "source": "温病学派", "target": "汇通学派", "value": "现代发展" },
    { "source": "医经学派", "target": "汇通学派", "value": "传统来源" },
    { "source": "河间学派", "target": "汇通学派", "value": "火热理论" },
    
    // 学派与理论概念关系
    { "source": "医经学派", "target": "阴阳五行", "value": "基础理论" },
    { "source": "医经学派", "target": "脏腑经络", "value": "核心内容" },
    { "source": "医经学派", "target": "气化学说", "value": "重要理论" },
    { "source": "伤寒学派", "target": "六经辨证", "value": "核心理论" },
    { "source": "伤寒学派", "target": "八纲辨证", "value": "辨证方法" },
    { "source": "河间学派", "target": "火热论", "value": "核心理论" },
    { "source": "河间学派", "target": "攻邪论", "value": "治疗理论" },
    { "source": "河间学派", "target": "养阴论", "value": "发展理论" },
    { "source": "河间学派", "target": "六气致病", "value": "病因理论" },
    { "source": "易水学派", "target": "脾胃内伤", "value": "核心理论" },
    { "source": "易水学派", "target": "升阳散火", "value": "治法理论" },
    { "source": "易水学派", "target": "阳常不足", "value": "发展理论" },
    { "source": "易水学派", "target": "相火妄动", "value": "病机理论" },
    { "source": "易水学派", "target": "味归经络", "value": "用药理论" },
    { "source": "易水学派", "target": "引经报使", "value": "用药理论" },
    { "source": "温病学派", "target": "卫气营血辨证", "value": "核心理论" },
    { "source": "温病学派", "target": "三焦辨证", "value": "核心理论" },
    { "source": "温病学派", "target": "戾气学说", "value": "早期理论" },
    { "source": "汇通学派", "target": "中西医汇通", "value": "核心思想" },
    
    // 理论概念与理论概念关系
    { "source": "阴阳五行", "target": "脏腑经络", "value": "基础关系" },
    { "source": "六经辨证", "target": "卫气营血辨证", "value": "辨证互补" },
    { "source": "卫气营血辨证", "target": "三焦辨证", "value": "辨证互补" },
    { "source": "火热论", "target": "攻邪论", "value": "理论衍生" },
    { "source": "火热论", "target": "养阴论", "value": "理论衍生" },
    { "source": "脾胃内伤", "target": "升阳散火", "value": "理论关联" },
    { "source": "相火妄动", "target": "养阴论", "value": "病机关联" },
    { "source": "味归经络", "target": "引经报使", "value": "相关理论" },
    
    // 理论概念与治法关系
    { "source": "六经辨证", "target": "汗吐下三法", "value": "治疗方法" },
    { "source": "六经辨证", "target": "和解少阳", "value": "治疗方法" },
    { "source": "卫气营血辨证", "target": "养阴清热", "value": "治疗方法" },
    { "source": "火热论", "target": "清热泻火", "value": "治疗方法" },
    { "source": "攻邪论", "target": "汗吐下三法", "value": "治疗方法" },
    { "source": "养阴论", "target": "养阴清热", "value": "治疗方法" },
    { "source": "脾胃内伤", "target": "温补法", "value": "治疗方法" },
    
    // 学派与治法关系
    { "source": "伤寒学派", "target": "汗吐下三法", "value": "主要治法" },
    { "source": "河间学派", "target": "清热泻火", "value": "主要治法" },
    { "source": "易水学派", "target": "温补法", "value": "主要治法" },
    { "source": "温病学派", "target": "养阴清热", "value": "主要治法" },
    
    // 人物与学派关系
    { "source": "张仲景", "target": "伤寒学派", "value": "创始人" },
    { "source": "刘完素", "target": "河间学派", "value": "创始人" },
    { "source": "叶天士", "target": "温病学派", "value": "核心人物" },
    { "source": "吴鞠通", "target": "温病学派", "value": "集大成者" },
    { "source": "张元素", "target": "易水学派", "value": "创始人" },
    { "source": "李东垣", "target": "易水学派", "value": "核心人物" },
    { "source": "张锡纯", "target": "汇通学派", "value": "核心人物" },
    { "source": "王冰", "target": "医经学派", "value": "重要人物" },
    { "source": "朱丹溪", "target": "河间学派", "value": "核心人物" },
    { "source": "张从正", "target": "河间学派", "value": "核心人物" },
    { "source": "王叔和", "target": "伤寒学派", "value": "早期整理者" },
    { "source": "孙思邈", "target": "经方学派", "value": "重要代表" },
    { "source": "孙思邈", "target": "伤寒学派", "value": "早期研究" },
    { "source": "成无己", "target": "伤寒学派", "value": "代表人物" },
    { "source": "方有执", "target": "伤寒学派", "value": "错简派" },
    { "source": "喻嘉言", "target": "伤寒学派", "value": "错简派" },
    { "source": "张志聪", "target": "伤寒学派", "value": "旧论派" },
    { "source": "唐容川", "target": "汇通学派", "value": "代表人物" },
    { "source": "恽铁樵", "target": "汇通学派", "value": "代表人物" },
    { "source": "王孟英", "target": "温病学派", "value": "集大成者" },
    { "source": "薛雪", "target": "温病学派", "value": "重要代表" },
    { "source": "吴又可", "target": "温病学派", "value": "早期代表" },
    { "source": "罗天益", "target": "易水学派", "value": "传人" },
    { "source": "杨则民", "target": "汇通学派", "value": "代表人物" },
    { "source": "张景岳", "target": "医经学派", "value": "研究发展" },
    { "source": "张景岳", "target": "易水学派", "value": "传承人" },
    { "source": "薛己", "target": "易水学派", "value": "传承人" },
    { "source": "李中梓", "target": "易水学派", "value": "传承人" },
    { "source": "赵献可", "target": "易水学派", "value": "传承人" },
    { "source": "王好古", "target": "易水学派", "value": "早期传人" },
    { "source": "朱肱", "target": "伤寒学派", "value": "代表人物" },
    { "source": "朱沛文", "target": "汇通学派", "value": "代表人物" },
    
    // 人物与人物之间的师承关系
    { "source": "刘完素", "target": "朱丹溪", "value": "学术传承" },
    { "source": "刘完素", "target": "张从正", "value": "学术影响" },
    { "source": "张元素", "target": "李东垣", "value": "师承" },
    { "source": "李东垣", "target": "罗天益", "value": "师承" },
    { "source": "朱丹溪", "target": "薛己", "value": "学术影响" },
    { "source": "薛己", "target": "赵献可", "value": "师承" },
    { "source": "叶天士", "target": "吴鞠通", "value": "理论传承" },
    { "source": "吴鞠通", "target": "王孟英", "value": "理论发展" },
    { "source": "王叔和", "target": "成无己", "value": "学术传承" },
    { "source": "方有执", "target": "喻嘉言", "value": "学术传承" },
    
    // 人物与理论概念的关系
    { "source": "张仲景", "target": "六经辨证", "value": "创立" },
    { "source": "刘完素", "target": "火热论", "value": "创立" },
    { "source": "刘完素", "target": "六气致病", "value": "提出" },
    { "source": "叶天士", "target": "卫气营血辨证", "value": "创立" },
    { "source": "吴鞠通", "target": "三焦辨证", "value": "创立" },
    { "source": "张元素", "target": "味归经络", "value": "创立" },
    { "source": "张元素", "target": "引经报使", "value": "创立" },
    { "source": "李东垣", "target": "脾胃内伤", "value": "创立" },
    { "source": "李东垣", "target": "升阳散火", "value": "创立" },
    { "source": "朱丹溪", "target": "养阴论", "value": "创立" },
    { "source": "朱丹溪", "target": "相火妄动", "value": "发展" },
    { "source": "张从正", "target": "攻邪论", "value": "创立" },
    { "source": "吴又可", "target": "戾气学说", "value": "创立" },
    { "source": "张景岳", "target": "阳常不足", "value": "创立" },
    { "source": "张锡纯", "target": "中西医汇通", "value": "践行" },
    { "source": "唐容川", "target": "中西医汇通", "value": "探索" },
    { "source": "恽铁樵", "target": "中西医汇通", "value": "探索" },
    { "source": "杨则民", "target": "中西医汇通", "value": "探索" },
    
    // 人物与治法的关系
    { "source": "张仲景", "target": "汗吐下三法", "value": "发展" },
    { "source": "刘完素", "target": "清热泻火", "value": "倡导" },
    { "source": "吴鞠通", "target": "养阴清热", "value": "发展" },
    { "source": "李东垣", "target": "温补法", "value": "倡导" },
    { "source": "张从正", "target": "汗吐下三法", "value": "擅长" },
    
    // 人物与典籍的关系
    { "source": "张仲景", "target": "伤寒论", "value": "著作" },
    { "source": "刘完素", "target": "素问玄机原病式", "value": "著作" },
    { "source": "刘完素", "target": "宣明论方", "value": "著作" },
    { "source": "刘完素", "target": "素问病机气宜保命集", "value": "著作" },
    { "source": "叶天士", "target": "温热论", "value": "著作" },
    { "source": "吴鞠通", "target": "温病条辨", "value": "著作" },
    { "source": "张元素", "target": "洁古珍珠囊", "value": "著作" },
    { "source": "李东垣", "target": "脾胃论", "value": "著作" },
    { "source": "李东垣", "target": "内外伤辨惑论", "value": "著作" },
    { "source": "李东垣", "target": "兰室秘藏", "value": "著作" },
    { "source": "张锡纯", "target": "医学衷中参西录", "value": "著作" },
    { "source": "王冰", "target": "黄帝内经", "value": "注解" },
    { "source": "成无己", "target": "注解伤寒论", "value": "著作" },
    { "source": "恽铁樵", "target": "群经见智录", "value": "著作" },
    { "source": "王孟英", "target": "温热经纬", "value": "著作" },
    { "source": "薛雪", "target": "湿热条辨", "value": "著作" },
    { "source": "吴又可", "target": "温疫论", "value": "著作" },
    { "source": "罗天益", "target": "卫生宝鉴", "value": "著作" },
    { "source": "张景岳", "target": "类经", "value": "著作" },
    { "source": "李中梓", "target": "内经知要", "value": "著作" },
    { "source": "王叔和", "target": "伤寒论", "value": "整理" },
    { "source": "孙思邈", "target": "千金要方", "value": "著作" },
    
    // 典籍与学派的关系
    { "source": "黄帝内经", "target": "医经学派", "value": "核心典籍" },
    { "source": "伤寒论", "target": "伤寒学派", "value": "核心典籍" },
    { "source": "温疫论", "target": "温病学派", "value": "奠基著作" },
    { "source": "温热论", "target": "温病学派", "value": "代表著作" },
    { "source": "脾胃论", "target": "易水学派", "value": "代表著作" },
    { "source": "素问玄机原病式", "target": "河间学派", "value": "代表著作" },
    { "source": "内经知要", "target": "医经学派", "value": "研究著作" },
    { "source": "温病条辨", "target": "温病学派", "value": "经典著作" },
    { "source": "医学衷中参西录", "target": "汇通学派", "value": "代表著作" },
    { "source": "洁古珍珠囊", "target": "易水学派", "value": "代表著作" },
    { "source": "内外伤辨惑论", "target": "易水学派", "value": "代表著作" },
    { "source": "兰室秘藏", "target": "易水学派", "value": "代表著作" },
    { "source": "卫生宝鉴", "target": "易水学派", "value": "传承著作" },
    { "source": "宣明论方", "target": "河间学派", "value": "代表著作" },
    { "source": "素问病机气宜保命集", "target": "河间学派", "value": "代表著作" },
    { "source": "湿热条辨", "target": "温病学派", "value": "代表著作" },
    { "source": "温热经纬", "target": "温病学派", "value": "代表著作" },
    { "source": "类经", "target": "医经学派", "value": "研究著作" },
    { "source": "千金要方", "target": "经方学派", "value": "代表著作" },
    { "source": "注解伤寒论", "target": "伤寒学派", "value": "注解著作" },
    { "source": "类证活人书", "target": "伤寒学派", "value": "代表著作" },
    { "source": "群经见智录", "target": "汇通学派", "value": "代表著作" },
    { "source": "医经读", "target": "医经学派", "value": "研究著作" },
    
    // 典籍与典籍关系
    { "source": "黄帝内经", "target": "湿热条辨", "value": "注解关系" },
    { "source": "黄帝内经", "target": "内经知要", "value": "研究关系" },
    { "source": "黄帝内经", "target": "类经", "value": "研究关系" },
    { "source": "黄帝内经", "target": "医经读", "value": "研究关系" },
    { "source": "伤寒论", "target": "注解伤寒论", "value": "注解关系" },
    { "source": "伤寒论", "target": "类证活人书", "value": "研究关系" },
    
    // 典籍与理论概念关系
    { "source": "黄帝内经", "target": "阴阳五行", "value": "阐述" },
    { "source": "黄帝内经", "target": "脏腑经络", "value": "阐述" },
    { "source": "伤寒论", "target": "六经辨证", "value": "奠基" },
    { "source": "温疫论", "target": "戾气学说", "value": "阐述" },
    { "source": "温热论", "target": "卫气营血辨证", "value": "阐述" },
    { "source": "脾胃论", "target": "脾胃内伤", "value": "阐述" },
    { "source": "素问玄机原病式", "target": "火热论", "value": "阐述" },
    { "source": "温病条辨", "target": "三焦辨证", "value": "阐述" },
    { "source": "素问病机气宜保命集", "target": "火热论", "value": "阐述" },
    { "source": "素问病机气宜保命集", "target": "六气致病", "value": "阐述" },
    
    // 增加典籍与治法关系
    { "source": "伤寒论", "target": "汗吐下三法", "value": "记载" },
    { "source": "伤寒论", "target": "和解少阳", "value": "记载" },
    { "source": "温热论", "target": "养阴清热", "value": "记载" },
    { "source": "脾胃论", "target": "温补法", "value": "记载" },
    { "source": "素问玄机原病式", "target": "清热泻火", "value": "记载" }
  ]
})
  }
})

const chartRef = ref(null)
let chartInstance = null

const initChart = () => {
  if (!chartRef.value) return

  // 确保先销毁旧实例
  if (chartInstance) {
    chartInstance.dispose()
  }

  chartInstance = echarts.init(chartRef.value)
  
  // 确保categories存在
  const categories = Array.isArray(props.graphData.categories) 
    ? props.graphData.categories 
    : [
        { 
          name: "学派",
          itemStyle: { color: '#7397AB' }
        },
        { 
          name: "人物",
          itemStyle: { color: '#95C077' }
        },
        { 
          name: "典籍",
          itemStyle: { color: '#F6C86C' }
        },
        { 
          name: "理论概念",
          itemStyle: { color: '#F09B98' }
        },
        { 
          name: "治法",
          itemStyle: { color: '#89D2DE' }
        }
      ];
  
  const option = {
    title: {
      show: false
    },
    tooltip: {
      formatter: function(params) {
        if (params.dataType === 'edge') {
          return `${params.data.source} → ${params.data.target}<br/>关系：${params.data.value}`
        }
        if (params.data.time) {
          return `${params.data.name}<br/>时期: ${params.data.time}`
        }
        return params.data.name
      },
      backgroundColor: 'rgba(255, 250, 240, 0.9)',
      borderColor: '#B88A67',
      textStyle: {
        fontFamily: '"STZhongsong", serif',
        color: '#333'
      }
    },
    legend: {
      data: categories.map(c => c.name),
      orient: 'vertical',
      right: 10,
      top: 'middle',
      textStyle: {
        fontFamily: '"STZhongsong", serif',
        color: '#333'
      }
    },
    animationDuration: 1500,
    animationEasingUpdate: 'quinticInOut',
    series: [{
      type: 'graph',
      layout: props.layout,
      force: {
        repulsion: 300,
        edgeLength: 100,
        gravity: 0.1
      },
      zoom: 1,
      roam: true,
      draggable: true,
      circular: {
        rotateLabel: true
      },
      data: props.graphData.nodes.map(node => ({
        ...node,
        id: node.name,
        symbolSize: node.symbolSize || 30,
        category: node.category,
        itemStyle: {
          color: node.itemStyle?.color || getCategoryStyle(node.category).color,
          borderColor: '#B88A67',
          borderWidth: 1
        },
        label: {
          show: true,
          position: 'right',
          formatter: '{b}',
          fontFamily: '"STZhongsong", serif',
          color: '#333'
        }
      })),
      links: props.graphData.links.map(link => ({
        ...link,
        lineStyle: {
          color: '#B88A67',
          width: 1.5,
          curveness: 0.3
        }
      })),
      categories: categories,
      label: {
        show: true,
        position: 'right',
        formatter: '{b}',
        fontFamily: '"STZhongsong", serif'
      },
      lineStyle: {
        color: '#B88A67',
        curveness: 0.3,
        width: 1.5
      },
      emphasis: {
        focus: 'adjacency',
        lineStyle: {
          width: 3
        }
      },
      edgeSymbol: ['none', 'arrow'],
      edgeSymbolSize: [0, 8]
    }]
  }

  chartInstance.setOption(option)
  
  // 添加点击事件
  chartInstance.on('click', function(params) {
    if (params.dataType === 'node') {
      // 点击节点时高亮相关连接
      chartInstance.dispatchAction({
        type: 'highlight',
        seriesIndex: 0,
        name: params.name
      })
    }
  })
  
  // 点击空白处取消高亮
  chartInstance.getZr().on('click', function(event) {
    if (!event.target) {
      chartInstance.dispatchAction({
        type: 'downplay'
      })
    }
  })
}

// 为每个类别提供不同的样式
const getCategoryStyle = (categoryIndex) => {
  const styles = [
    { color: '#7397AB' },  // 学派 - 蓝色
    { color: '#95C077' },  // 人物 - 绿色
    { color: '#F6C86C' },  // 典籍 - 黄色
    { color: '#F09B98' },  // 理论概念 - 红色
    { color: '#89D2DE' }   // 治法 - 蓝色
  ]
  return styles[categoryIndex] || { color: '#999' }
}

const handleResize = () => {
  if (chartInstance) {
    chartInstance.resize()
  }
}

onMounted(() => {
  initChart()
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  if (chartInstance) {
    chartInstance.dispose()
    chartInstance = null
  }
})

// 监听数据变化
watch(() => props.graphData, () => {
  initChart() // 重新初始化图表，以确保所有配置都被更新
}, { deep: true })

// 添加重置方法
const resetZoom = () => {
  if (chartInstance) {
    chartInstance.setOption({
      series: [{
        zoom: 1,
        center: ['50%', '50%']
      }]
    })
  }
}

// 监听布局变化
watch(() => props.layout, () => {
  initChart()
})

const currentLayout = ref(props.layout)

const setLayout = (layout) => {
  currentLayout.value = layout
  initChart()
}

const zoomIn = () => {
  if (chartInstance) {
    const option = chartInstance.getOption()
    const zoom = option.series[0].zoom || 1
    chartInstance.setOption({
      series: [{
        zoom: zoom * 1.5
      }]
    })
  }
}

const zoomOut = () => {
  if (chartInstance) {
    const option = chartInstance.getOption()
    const zoom = option.series[0].zoom || 1
    chartInstance.setOption({
      series: [{
        zoom: zoom / 1.5
      }]
    })
  }
}

defineExpose({
  resetZoom
})
</script>

<style scoped>
.chart-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.chart-controls {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  padding: 8px;
  background-color: var(--bg-color, #f5f5f5);
  border-radius: 8px;
}

.zoom-controls {
  display: flex;
  gap: 8px;
}

.control-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border: 1px solid var(--border-color, #ddd);
  border-radius: 4px;
  background-color: var(--card-bg, white);
  color: var(--text-color, #333);
  cursor: pointer;
  transition: all 0.3s ease;
}

.control-btn:hover {
  background-color: var(--primary-light);
  border-color: var(--primary-color);
}

.control-btn.active {
  background-color: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
}

.control-btn span {
  display: inline-block;
}

.school-relation-chart {
  flex: 1;
  min-height: 600px;
  background: var(--bg-color, #f5f5f5);
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.1);
}

/* 响应式调整 */
@media (max-width: 768px) {
  .chart-controls {
    flex-wrap: wrap;
  }
  
  .control-btn span {
    display: none;
  }
  
  .control-btn {
    padding: 8px;
  }
}
</style>