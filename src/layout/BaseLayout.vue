<template>
  <div class="layout">
    <el-container class="layout-page">
      <el-aside class="layout-aside" width="200px"><LayoutAside /></el-aside>
      <el-container>
        <el-header class="container-header"><LayoutHeader /></el-header>
        <el-divider class="layout-divider" />
        <el-main class="container-main"><LayoutMain /></el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script setup>
import LayoutAside from "@/layout/components/LayoutAside.vue";
import LayoutHeader from "@/layout/components/LayoutHeader.vue";
import LayoutMain from "@/layout/components/LayoutMain.vue";
</script>

<style>
.layout {
  width: 100%;
  height: 100%;
}

.layout-page {
  height: 100%;
}

.container-main {
  padding: 10px 10px;
  width: 100%;
  height: 100%;
  border: 0;
}

.layout-divider {
  margin: 0;
}
</style>