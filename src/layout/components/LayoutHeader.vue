<template>
  <div class="layout-header">
    <div class="layout-avatar">
      <el-avatar :size="32" src="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png"/>
    </div>
  </div>

</template>

<script setup>
import { computed } from 'vue';
import { useStore } from 'vuex';
import { useRoute,useRouter } from 'vue-router';
const store=useStore()
const selectMenu=computed(()=>store.state.menu.selectMenu)
const route=useRoute()
const router=useRouter()
// 点击 tag 跳转
function goTo(path) {
  if (route.path !== path) {
    router.push({ path })
  }
}
function closeTab(item, index) {
  store.commit('closeMenu', item)

  // 如果关闭的不是当前激活页，直接返回
  if (route.path !== item.path) return

  // 关闭的是当前页，需要跳转到前一个或首页
  const list = selectMenu.value
  if (list.length === 0) {
    router.push('/')
  } else {
    // 如果刚好是最后一个，跳到新的最后一个
    const newIndex = index === list.length ? index - 1 : index
    router.push({ path: list[newIndex].path })
  }
}
</script>

<style scoped>
.layout-header {
  display: flex;
  flex-direction: column;    /* 垂直排列 avatar / divider / breadcrumb */
  width: 100%;
  background: #fff;          /* 白底，遮住下面内容 */
  position: relative;
  z-index: 10;               /* 保证在 el-main 之上 */
}

.icon {
  width: 45px;
  height: 100%;
}
.icon:hover{
  background-color: #f5f5f5;
  cursor: pointer;
}
.tab{
  padding: 0 10px;
  height: 100%;
  .close{
  visibility: hidden;
}
}
.tab:hover{
  background-color: #f5f5f5;
  .close{
    visibility: inherit;
    cursor: pointer;
    color: #000;
  }
}
.selected{
  a{
    color: #409eff;
  }
  i{
    color: #409eff;
  }
  background-color: #f5f5f5;
}
.layout-breadcrumb {
  width: 100%;  
  padding: 0 10px;
}

.layout-avatar {
  width: 100%; 
  display: flex;
  justify-content: flex-end;
  padding: 0 10px;
}
.flex-box{
  display: flex;
  align-items:center;
  padding: 0;
}
.text{
  margin:0 5px;
}
a{
  height: 100%;
  color: #333;
  font-size:15px
}
a, 
.router-link-active,
.text {
  text-decoration: none;
}
/* Vue3 + <style scoped> 下用 ::v-deep 深度选择器 */
.layout-breadcrumb ::v-deep .el-tag {
  cursor: pointer;
}

/* 如果还想单独给关闭图标也变手，可以加上： */
.layout-breadcrumb ::v-deep .el-tag__close {
  cursor: pointer;
}
.header-divider {
  margin: 0;           /* 去掉默认上下间距 */
  width: 100%;         /* 铺满整行 */
  border-color: #e0e0e0; /* 可自定义颜色 */
}
</style>