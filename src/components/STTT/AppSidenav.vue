<template>
    <el-drawer v-model="localValue" title="侧边栏" :with-header="false"  direction="ltr"  >
        <el-menu
      default-active="1"
      class="el-menu-vertical-demo"
      @select="handleSelect"
    >
      <el-menu-item index="1">首页</el-menu-item>
      <el-menu-item index="2">理财宝</el-menu-item>
      <el-menu-item index="3">详情</el-menu-item>
      <el-menu-item index="4">入金</el-menu-item>
      <el-menu-item index="5">出金</el-menu-item>
    </el-menu>
    </el-drawer>
  </template>
  
  <script setup>
  import { computed } from 'vue'
  
  const props = defineProps({
    modelValue: Boolean
  })
  const emit = defineEmits(['update:modelValue'])
  
  const localValue = computed({
    get: () => props.modelValue,
    set: (val) => emit('update:modelValue', val)
  })
  </script>
  