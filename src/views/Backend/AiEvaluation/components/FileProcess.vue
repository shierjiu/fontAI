<template>
  <div class="file-process">
    <div class="header">
      <!-- <el-button type="danger" size="small" @click.stop="goBack">关闭</el-button> -->
    </div>
  <div class="table-wrapper">
      <EvaluationTable 
      :dataset-id="datasetId"
      />
  </div>
  </div>
</template>

<script setup>
import { defineProps} from 'vue'
import { useRouter,useRoute } from 'vue-router'
import { useStore } from 'vuex'
import EvaluationTable from './EvaluationTable.vue'
const router = useRouter()
const store = useStore()
const route = useRoute()
const props = defineProps({
  nodeId: String,
  fileId: String,
  datasetId: String
})

function goBack() {
  const currentPath = route.path
  const tabs = store.state.menu.selectMenu
  const currentTab = tabs.find(tab => tab.path === currentPath)
  if (currentTab) {
    store.commit('closeMenu', currentTab)
  }
  router.push({
    name: 'nodeDetail',
    params: { nodeId: props.nodeId }
  }).catch(error => {
    // 忽略重复导航错误
    if (!error.message.includes('Avoided redundant navigation')) {
      console.error('导航失败:', error);
    }
  });
}

</script>

<style scoped>
.file-process {
  border: 1px solid #dcdfe6;
  padding: 20px;
  min-height: 400px;
  height: 100%;
}
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
.title {
  font-weight: bold;
  font-size: 18px;
}
.button-group {
  margin-bottom: 16px;
  display: flex;
  gap: 8px;
}
.table-wrapper{
  max-height: 500px;
  flex:1;
  overflow:auto;
}
</style>