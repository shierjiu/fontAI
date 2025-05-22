<!--src/layout/components/LayoutAside.vue-->
<template>
  <el-menu class="layout-menu" text-color="#fff" active-text-color="#409eff" background-color="rgb(48,65,86)">
    <el-menu-item index="HomePage" @click="clickMenu('HomePage')">
      <el-icon><House /></el-icon>
      <span>首页</span>
    </el-menu-item>
    <el-sub-menu index="BackendManage">
      <template #title>
        <el-icon><Notification /></el-icon>
        <span>后台管理</span>
      </template>


      <el-sub-menu index="AiServer">
        <template #title>
          <span>AI评估</span>
        </template>
        <el-menu-item index="AiDataset" @click="clickMenu('AiDataset')">数据集</el-menu-item>
        <el-menu-item index="AiEvaluationTarget" @click="clickMenu('AiEvaluationTarget')">评测对象</el-menu-item>
        <el-menu-item index="AiEvaluator" @click="clickMenu('AiEvaluator')">评估器</el-menu-item>
      </el-sub-menu>


      <el-sub-menu index="AiServer">
        <template #title>
          <span>AI服务</span>
        </template>
        <el-menu-item index="AiModelConfig" @click="clickMenu('AiModelConfig.vue')">模型配置</el-menu-item>
        <el-menu-item index="AiAgentConfig" @click="clickMenu('AiAgentConfig')">智能体配置</el-menu-item>
      </el-sub-menu>
      <el-sub-menu index="MessageServer">
        <template #title>
          <span>消息服务</span>
        </template>
        <el-menu-item index="MessageWebhook" @click="clickMenu('MessageWebhook')">Webhook配置</el-menu-item>
        <el-menu-item index="MessageTemplate" @click="clickMenu('MessageTemplate')">模板配置</el-menu-item>
      </el-sub-menu>
      <el-menu-item index="VariableQuery" @click="clickMenu('VariableQuery')">变量管理</el-menu-item>
    </el-sub-menu>
  </el-menu>
</template>

<script setup>
import {useRouter} from "vue-router";
import {House, Notification} from "@element-plus/icons-vue"

const router = useRouter();

function clickMenu(item) {
  router.push({name: item});
}
</script>

<style>
.layout-menu {
  border: 0;
  height: 100%;
}
</style>