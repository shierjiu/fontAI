<template>
  <el-button @click="changeChatDrawerVisible">home</el-button>
  <chat-drawer v-model:visible="chatDrawerVisible" v-model:agent="chatDrawerAgent" v-model:options="chatDrawerOptions"/>
</template>

<script setup>
import ChatDrawer from "@/components/ChatDrawer/ChatDrawer.vue"
import {ref} from "vue"
import * as AiServer from "@/api/AiServer/index.js";
import {ElNotification} from "element-plus";

const chatDrawerVisible = ref(false)
const chatDrawerAgent = ref({})
const chatDrawerOptions = ref([])

function changeChatDrawerVisible() {
  if (!chatDrawerVisible.value) {
    getOptions("iRobot")
    getAgent("iRobot")
  }
  chatDrawerVisible.value = !chatDrawerVisible.value
}

async function getAgent(code) {
  const res = await AiServer.postAgentList({
    pageNum: 1,
    pageSize: 1,
    pageRule: [{field: "code", rule: "is", value: code}],
  })
  if (res.status === 200) {
    chatDrawerAgent.value = res.data.data.data[0]
  } else {
    ElNotification({
      message: res.data.message,
      type: res.data.code,
    })
  }
}

async function getOptions(group) {
  const res = await AiServer.postAgentList({
    pageEnable: false,
    pageRule: [{field: "group", rule: "is", value: group}],
  })
  if (res.status === 200) {
    chatDrawerOptions.value = res.data.data.data
  } else {
    ElNotification({
      message: res.data.message,
      type: res.data.code,
    })
  }
}
</script>

<style scoped>

</style>