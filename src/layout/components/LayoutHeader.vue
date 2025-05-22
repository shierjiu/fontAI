<template>
  <div class="layout-header">
    <div class="layout-breadcrumb"></div>
    <div class="layout-avatar">
      <el-avatar :size="32" src="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png"/>
    </div>
  </div>
</template>

<script setup>
</script>

<style>
.layout-header {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
}

.layout-breadcrumb {
  padding: 0 10px;
}

.layout-avatar {
  padding: 0 10px;
}
</style>