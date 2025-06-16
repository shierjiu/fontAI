<template>
  <div class="dataset-layout">
    <div class="dataset-manager" v-if="!isFileProcess">
        <DatasetTree @updateLeafNodes="onLeafNodesUpdate"/>
    </div>
    <div class="content">
      <div>
        <RouterView :leaf-nodes="leafNodes"/>
      </div>
    </div>
  </div>
  <div class="fileprocess">
    <RouterView name="fileprocess" style="border: 1px solid red;"/>
  </div>
</template>

<script setup>
import DatasetTree from '@/views/Backend/AiEvaluation/components/DatasetTree.vue'
import { RouterView,useRoute } from 'vue-router'
import { ref ,computed} from 'vue'
const route = useRoute()
const leafNodes = ref([]) // 用于存储叶子节点
const isFileProcess = computed(() => route.name === 'fileProcess')
function onLeafNodesUpdate(nodes) {
  leafNodes.value = nodes
  //console.log('收到的子节点:',nodes);
}
</script>

<style scoped>
.dataset-layout {
  display: flex;
  height: 100%;
}
.dataset-manager {
  display: flex;
  height: 100%;
}
.content {
  flex: 1;
  padding: 20px;
  overflow: auto;
}
.fileprocess {
  /* 例如：让它固定高度 400px；也可以改成 flex:1 让它撑满剩余 */
  flex:1;
  overflow: auto;
}
</style>