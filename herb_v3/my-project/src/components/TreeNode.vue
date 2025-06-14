<template>
  <div>
    <div @click="toggle" class="node">
      <span v-if="hasChildren" :class="{'has-children': hasChildren}">
        {{ node.name }}
      </span>
      <span v-else>{{ node.name }}</span>
    </div>
    <div v-if="hasChildren && isOpen" class="children">
      <TreeNode v-for="(child, index) in node.children" :key="index" :node="child" />
    </div>
  </div>
</template>

<script>
export default {
  name: 'TreeNode',
  props: {
    node: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      isOpen: false
    };
  },
  computed: {
    hasChildren() {
      return Array.isArray(this.node.children);
    }
  },
  methods: {
    toggle() {
      this.isOpen = !this.isOpen;
    }
  }
}
</script>

<style scoped>
.node {
  cursor: pointer;
  padding-left: 10px;
}
.has-children {
  font-weight: bold;
}
.children {
  padding-left: 20px;
}
</style>
