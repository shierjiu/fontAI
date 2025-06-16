<template>
    <div class="main">
        <div class="left"><DatasetTree  @node-click="onNodeClick"/></div>
        <div class="right">
            <div class="button-wrapper">
                <el-button class="headerButton" type="primary" plain @click="addRow">新增</el-button>
            </div>
            <TestListData ref="listRef" :selected-node="selectedNode"/>
            <NewDemand 
            v-model:visible="drawerVisible"
            :selected-node="selectedNode"
            @refresh-list="onRefreshList"
            />
        </div>
   </div>
</template>

<script setup>
import TestListData from './components/TestListData.vue';
import DatasetTree from '@/views/Backend/TestCases/components/DatasetTree.vue'
import NewDemand from './components/NewDemand.vue';
import { ref } from 'vue';

const listRef = ref(null);
//抽屉视窗
const drawerVisible=ref(false)
//新增
function addRow(){
    drawerVisible.value=true
}
// 用来保存当前点击的节点对象
const selectedNode = ref(null)
// 当 DatasetTree emit 出 “node-click” 时调用
function onNodeClick(node){
    selectedNode.value = node
    console.log('父组件的值',selectedNode.value.id)
}
// 当 NewDemand 发来 refresh-list 事件时，调用 TestListData.getListData()

function onRefreshList() {
  if (listRef.value && typeof listRef.value.getListData === 'function') {
    listRef.value.getListData();
  }
}
</script>
<style scoped>
.main{
    display: flex;
    height: 100%;
}
.right{
    flex:1;
    padding: 16px;
}
</style>