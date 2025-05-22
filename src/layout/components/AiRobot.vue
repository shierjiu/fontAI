<template>
  <el-affix class="affix-robot" :offset="0">
    <el-button type="primary" @click="robotChat">一个机器人</el-button>
  </el-affix>

  <el-drawer v-model="robotDrawerVisible" title="数科对话机器人" size="40%">
    <div class="div-chat">
      <div v-for="(message, index) in chatMessages" :key="index" :class="{'message-user': message.role==='user', 'message-system': message.role==='system'}">
        {{ message.content }}
      </div>
    </div>
    <el-input class="input-user" v-model="userInput" placeholder="输入你的问题..." :disabled="userInputDisabled" @keyup.enter="sendMessage"></el-input>
  </el-drawer>

</template>

<script setup>
import {onMounted, ref} from "vue";
import {BASE_URL} from "@/utils/request.js";
import * as AiServer from "@/api/AiServer";
import {ElMessage} from "element-plus";

const robotDrawerVisible = ref(false)
const chatMessages = ref([{role: "system", content: '你好，我是一个机器人，有什么问题可以问我'}])
const userInput = ref('')
const userInputDisabled = ref(false)
const defaultAgentId = ref()

// 生命周期函数
onMounted(() => {
  getDefaultAgent()
})

async function getDefaultAgent() {
  const res = await AiServer.postAgentList({
    pageNum: 1,
    pageSize: 1,
    pageRule: [{field: "code", rule: "is", value: "DefaultChatRobot"}]
  })
  if (res.status === 200) {
    defaultAgentId.value = res.data.data.data[0].id
  } else {
    ElMessage({
      message: "未找到默认的Robot智能体",
      type: "error",
      plain: true,
    })
  }
}

async function robotChat() {
  robotDrawerVisible.value = true
}

async function sendMessage() {
  if (userInput.value) {
    const userContent = userInput.value
    userInput.value = ''
    // 先将用户消息添加到聊天记录中
    chatMessages.value.push({ role: "user", content: userContent })
    userInputDisabled.value = true

    try {
      // 调用流接口
      const response = await fetch(BASE_URL + '/ai_server/agent/server_stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          agentId: defaultAgentId.value,
          userContent: userContent
        })
      })
      // 添加一个空的助手消息，后续逐步追加内容
      chatMessages.value.push({ role: "system", content: "思考中..." })
      const systemIndex = chatMessages.value.length - 1

      // 获取流的读取器，并创建一个解码器
      const reader = response.body.getReader()
      const decoder = new TextDecoder("utf-8")
      chatMessages.value[systemIndex].content = ""  // 清空“思考中...”

      // 循环读取流中的数据
      // eslint-disable-next-line no-constant-condition
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        // 解码本次读取到的二进制数据
        const chunk = decoder.decode(value, { stream: true })
        // 遍历每个字符，实现逐字输出（可以调整延时以控制打字速度）
        for (const char of chunk) {
          chatMessages.value[systemIndex].content += char
          // 延时30毫秒，实现打字机效果
          await new Promise(resolve => setTimeout(resolve, 10))
        }
      }
    } catch (error) {
      console.error("流处理错误:", error)
      chatMessages.value.push({ role: "assistant", content: "消息接收失败" })
    } finally {
      userInputDisabled.value = false
    }
  }
}
</script>

<style scoped>
.affix-robot {
position: fixed;
right: 0; /* 距离右侧的距离 */
bottom: 20px; /* 距离底部的距离 */
z-index: 1000; /* 确保层级高于其他容器 */
}

.div-chat {
  height: calc(100vh - 200px);
  overflow-y: auto;
  padding: 20px;
}

.message-user, .message-system {
  margin: 10px 0;
  padding: 10px 15px;
  border-radius: 10px;
  max-width: 80%;
}

.message-user {
  background-color: #e6f3ff;
  margin-left: auto;
  text-align: right;
}

.message-system {
  background-color: #f4f4f5;
}

.input-user {
  position: fixed;
  bottom: 20px;
  width: calc(40% - 40px);
  margin: 0 20px;
}
</style>