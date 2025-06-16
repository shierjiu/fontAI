<template>
  <el-tabs v-model="activeTab">
    <el-tab-pane name="Server" label="菜单巡查"><MenuInspectionServer /></el-tab-pane>
    <el-tab-pane name="Record" label="历史记录"><MenuInspectionRecord /></el-tab-pane>
    <el-tab-pane name="SchedulerTaskList" label="定时任务"><MenuInspectionSchedulerTaskList /></el-tab-pane>
  </el-tabs>
</template>

<script setup>
import {ref} from "vue";
import MenuInspectionServer from "@/views/Backend/TestCases/components/MenuInspectionServer.vue";
import MenuInspectionRecord from "@/views/Backend/TestCases/components/MenuInspectionRecord.vue";
import MenuInspectionSchedulerTaskList from "@/views/Backend/TestCases/components/MenuInspectionSchedulerTaskList.vue";


const activeTab = ref("Server")
</script>

<style scoped>
</style>