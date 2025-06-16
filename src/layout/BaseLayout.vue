<template>
  <div class="layout">
    <el-container class="layout-page">
      <el-aside class="layout-aside" width="200px"><LayoutAside /></el-aside>
      <el-container>
        <el-header class="container-header"><LayoutHeader /></el-header>
        <el-divider class="layout-divider" />
        <div class="tags-view-container">
            <el-tag class="tag-view-tag" v-for="tag in tags" :key="tag.name" :color="tag.title === activeTag ? '#42b983' : '#909399'" :closable="!tag.affix" size="large" effect="dark" @click="clickTag(tag)" @close="closeTag(tag)">
              {{tag.title}}
            </el-tag>
          </div>
        <el-main class="container-main"><LayoutMain /></el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script setup>
import LayoutAside from "@/layout/components/LayoutAside.vue";
import LayoutHeader from "@/layout/components/LayoutHeader.vue";
import LayoutMain from "@/layout/components/LayoutMain.vue";
import { computed,ref, watch } from 'vue';
import { useRoute,useRouter } from 'vue-router';
const route=useRoute()
const router=useRouter()
const activeTag = ref(route.meta.title)
const tags = ref([{affix: true, name: "HomePage", title: "首页", path: "/home"},])
// 点击 tag 跳转
console.log('路由',activeTag)
function clickTag(tag) {
  router.push(tag.path)
}

function closeTag(tag) {
  const index = tags.value.findIndex(t => t.name === tag.name)
  if (index !== -1) {
    const isActive = tag.name === activeTag.value
    tags.value.splice(index, 1)
    if (isActive) {
      router.push('/home')
    }
  }
}

watch([() => route.path, () => route.name, () => route.meta.title], ([newPath, newName, newTitle]) => {
  activeTag.value = newTitle
  console.log('route',route)
  const tagName = route.meta.title  // 这里就是要去重的 name
  // 只要 tags 里没有相同 name，就新增
  console.log('tags',tags)
  const exists = tags.value.some(tag => tag.title === tagName)
  console.log('判断是否存在', exists, tagName)
  if (!exists) {
    tags.value.push({
      affix: false,
      name: tagName,
      title: route.meta?.title || tagName,
      path: newPath
    });
  } else {
    // 如果存在，更新 path
    const tag = tags.value.find(t => t.title === tagName)
    if (tag) {
      tag.path = newPath
    }
  }
}, { immediate: true });
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
/* 让所有 el-tag 悬停时变小手 */
.layout-breadcrumb .el-tag {
  cursor: pointer;
}

/* 让关闭叉叉也变手 */
.layout-breadcrumb .el-tag__close {
  cursor: pointer;
}
.tag-view-tag {
  margin: 2px;
  border: 0;
  cursor: pointer;
}
</style>