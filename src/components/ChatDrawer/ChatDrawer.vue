<template>
  <el-drawer v-model="visible" size="40%">
    <template #header>
      <p>iRobot</p>
    </template>
    <template #default>
      <div v-for="(message, index) in chatMessages" :key="index" class="message" :class="message.role">
        <el-icon v-if="message.role === 'system'" class="message-icon"><Service /></el-icon>
        <div class="message-content">{{ message.content }}</div>
        <el-icon v-if="message.role === 'user'" class="message-icon"><User /></el-icon>
      </div>
    </template>
    <template #footer>
      <el-card class="el-card__body" shadow="always">
        <el-input v-model="userInput" type="textarea" :rows="3" resize="none" class="user-input" :disabled="userInputDisabled"></el-input>
        <div class="user-input-footer">
          <div class="user-input-footer-left">
            <el-dropdown>
              <el-button round plain class="agent-button">
                {{agent.name}}<el-icon class="el-icon--right"><ArrowDown /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item v-for="item in options" @click="updateAgent(item)">{{item.name}}</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
          <div class="user-input-footer-right">
            <el-icon class="user-input-icon" size="25" @click="sendMessage"><Position /></el-icon>
          </div>
        </div>
      </el-card>
    </template>
  </el-drawer>
</template>

<script setup>
import {ref} from "vue"
import {Service, User, Position, ArrowDown} from "@element-plus/icons-vue"
import {BASE_URL} from "@/utils/request.js"

const visible = defineModel('visible', { required: true })
const agent = defineModel('agent', { required: true })
const options = defineModel('options', { required: true })
const chatMessages = ref([])
const userInput = ref("")
const userInputDisabled = ref(false)

function updateAgent(value) {
  agent.value = value
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
          agentId: agent.value.id,
          userContent: userContent
        })
      })
      // 添加一个空的助手消息，后续逐步追加内容
      chatMessages.value.push({ role: "system", content: "思考中..." })
      const systemIndex = chatMessages.value.length - 1

      // 获取流的读取器，并创建一个解码器
      const reader = response.body.getReader()
      const decoder = new TextDecoder("utf-8")
      chatMessages.value[systemIndex].content = ""  // 清空"思考中..."

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

<style>
.message {
  display: flex;
  margin-bottom: 16px;
  align-items: flex-start;
}

.message.user {
  justify-content: flex-end;
}

.message.system {
  justify-content: flex-start;
}

.message-icon {
  width: 40px;
  height: 40px;
  border-radius: 4px;
  object-fit: cover;
}

.message-content {
  max-width: 70%;
  padding: 10px 14px;
  border-radius: 4px;
  position: relative;
  word-break: break-word;
  line-height: 1.4;
  margin: 0 8px;
}

.message.user .message-content {
  background-color: #95ec69;
  order: -1;
}

.message.system .message-content {
  background-color: #e5e5ea;
}

.el-card__body {
  padding: 5px;
  border-radius: 15px;
}

.user-input-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.user-input .el-textarea__inner{
  border: none;
  box-shadow: none;
  background-color: transparent;
}

.user-input-footer-left {
  display: flex;
}

.user-input-icon {
  border-radius: 4px;
  object-fit: cover;
  color: dodgerblue;
  margin-top: 10px;
}

.agent-button {
 margin-top: 10px;
}
</style>