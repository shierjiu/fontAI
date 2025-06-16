<!--src/layout/components/LayoutAside.vue-->
<template>
  <el-menu class="layout-menu" text-color="#fff" active-text-color="#409eff" background-color="rgb(48,65,86)">
    <el-menu-item :index="menuData[0].name" @click="clickMenu(menuData[0])">
      <el-icon><House /></el-icon>
      <span>首页</span>
    </el-menu-item>

       <!-- 质量大屏 -->
    <el-menu-item index="QualityDashboard" @click="openQualityDashboard">
      <el-icon><Monitor /></el-icon>
      <span>质量大屏</span>
    </el-menu-item>
      <!-- 知识库 -->
      <el-menu-item index="KnowledgeBaseDashboard" @click="openKnowledgeBaseDashboard">
      <el-icon><ChatDotSquare /></el-icon>
      <span>知识库问答</span>
    </el-menu-item>
    
    <!-- 知识库管理    -->
    <el-sub-menu index="KnowledgeBase">
      <template #title>
        <el-icon><Reading /></el-icon>
        <span>知识库维护</span>
      </template>

      <el-sub-menu index="KnowledgeBase">
          <template #title>
            <el-icon><CollectionTag /></el-icon>
            <span>环境维护</span>
          </template>
          <el-menu-item index="KnowledgeBaseTestEnvMainTain" @click="clickMenu(menuData[10])">测试环境维护</el-menu-item>
          <el-menu-item index="KnowledgeBaseTestEnvSystemDatabase" @click="clickMenu(menuData[11])">数据库环境维护</el-menu-item>
          <el-menu-item index="KnowledgeBaseTestEnvAuthDogServers" @click="clickMenu(menuData[12])">加密狗维护</el-menu-item>
      </el-sub-menu>
      <el-sub-menu index="KnowledgeBase">
        <template #title>
          <el-icon><Folder /></el-icon>
          <span>Faq管理</span>
        </template>
        <el-menu-item index="KnowledgeBaseFaqUnfile" @click="clickMenu(menuData[13])">Faq管理</el-menu-item>
        <el-menu-item index="KnowledgeBaseFileUpload" @click="clickMenu(menuData[14])">文件上传</el-menu-item>
      </el-sub-menu>
    </el-sub-menu>



    <el-sub-menu index="BackendManage">
      <template #title>
        <el-icon><Notification /></el-icon>
        <span>后台管理</span>
      </template>


      <!-- <el-sub-menu index="AiAssess">
        <template #title>
          <span>AI评估</span>
        </template>
        <el-menu-item :index="menuData[6].name" @click="clickMenu(menuData[9])">数据集</el-menu-item>
        <el-menu-item :index="menuData[7].name" @click="clickMenu(menuData[7])">评测对象</el-menu-item>
        <el-menu-item :index="menuData[8].name" @click="clickMenu(menuData[8])">评估器</el-menu-item>
      </el-sub-menu> -->


      <el-sub-menu index="AiServer">
        <template #title>
          <span>AI服务</span>
        </template>
        <el-menu-item :index="menuData[4].name" @click="clickMenu(menuData[4])">模型配置</el-menu-item>
        <el-menu-item :index="menuData[5].name" @click="clickMenu(menuData[5])">智能体配置</el-menu-item>
      </el-sub-menu>
      <el-sub-menu index="MessageServer">
        <template #title>
          <span>消息服务</span>
        </template>
        <el-menu-item :index="menuData[2].name" @click="clickMenu(menuData[2])">Webhook配置</el-menu-item>
        <el-menu-item :index="menuData[3].name" @click="clickMenu(menuData[3])">模板配置</el-menu-item>
      </el-sub-menu>
      <el-menu-item :index="menuData[1].name" @click="clickMenu(menuData[1])">变量管理</el-menu-item>
    </el-sub-menu>
    <el-sub-menu index="AiAssess">
      <template #title>
        <el-icon><Cpu /></el-icon>
        <span>AI评估</span>
      </template>
         <el-menu-item :index="menuData[6].name" @click="clickMenu(menuData[9])">数据集</el-menu-item>
        <el-menu-item :index="menuData[7].name" @click="clickMenu(menuData[7])">评测对象</el-menu-item>
        <el-menu-item :index="menuData[8].name" @click="clickMenu(menuData[8])">评估器</el-menu-item>
    </el-sub-menu>
      <el-sub-menu index="TestCases">
      <template #title>
        <el-icon><EditPen /></el-icon>
        <span>测试用例</span>
      </template>
        <el-menu-item :index="menuData[17].name" @click="clickMenu(menuData[17])">菜单巡查</el-menu-item>
        <el-menu-item :index="menuData[16].name" @click="clickMenu(menuData[16])">需求分析</el-menu-item>
        <el-menu-item :index="menuData[19].name" @click="clickMenu(menuData[19])">用例生成</el-menu-item> 
    </el-sub-menu>
  </el-menu>
</template>

<script setup>
import {useRouter} from "vue-router";
import { openQualityDashboard, openKnowledgeBaseDashboard } from '@/components/LayOutUrl/url.js';
import {House, Notification} from "@element-plus/icons-vue";
import { useStore } from "vuex";
import { reactive } from "vue";
const router = useRouter();
const store=useStore();
const menuData=reactive(router.options.routes[0].children)
console.log('路由数组',menuData)
function clickMenu(item) {
  router.push('/'+item.path);
  store.commit('addMenu',item.meta);
  console.log("路由数组",store.state.menu.selectMenu)
}
</script>

<style>
.layout-menu {
  border: 0;
  height: 100%;
}
</style>