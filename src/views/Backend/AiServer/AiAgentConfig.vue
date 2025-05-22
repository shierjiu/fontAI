<template>
  <statistic-card />

  <el-button class="headerButton" type="primary" plain @click="addRow">新增</el-button>

  <el-table :data="agentList" border style="width: 100%">
    <el-table-column prop="name" label="名称" width="250">
      <template #default="scope">
        <el-input v-if="scope.row.editing" v-model="scope.row.editData.name" placeholder="请输入"/>
        <span v-else>{{scope.row.name}}</span>
      </template>
    </el-table-column>
    <el-table-column prop="code" label="编码" width="250">
      <template #default="scope">
        <el-input v-if="scope.row.editing" v-model="scope.row.editData.code" placeholder="请输入"/>
        <span v-else>{{scope.row.code}}</span>
      </template>
    </el-table-column>
    <el-table-column prop="model" label="模型" width="250">
      <template #default="scope">
        <el-select v-if="scope.row.editing" v-model="scope.row.editData.model">
          <el-option v-for="item in modelList" :key="item.id" :label="item.name" :value="item.id"/>
        </el-select>
        <span v-else>{{ scope.row.model.name }}</span>
      </template>
    </el-table-column>
    <el-table-column prop="temperature" label="温度" width="180">
      <template #default="scope">
        <el-input-number v-if="scope.row.editing" v-model="scope.row.editData.temperature" max="2" min="0" :controls="false" precision="1" :step="0.1" placeholder="请输入"/>
        <span v-else>{{scope.row.temperature}}</span>
      </template>
    </el-table-column>
    <el-table-column prop="max_token" label="MaxToken" width="180">
      <template #default="scope">
        <el-input-number v-if="scope.row.editing" v-model="scope.row.editData.max_token" max="8192" min="0" :controls="false" precision="0" :step="1" placeholder="请输入"/>
        <span v-else>{{scope.row.max_token}}</span>
      </template>
    </el-table-column>
    <el-table-column prop="category" label="分类" width="250">
      <template #header>
          <span>分类</span>
          <el-tooltip content="用于统计不同类型Agent的数量">
            <el-icon><InfoFilled /></el-icon>
          </el-tooltip>
      </template>
      <template #default="scope">
        <el-input v-if="scope.row.editing" v-model="scope.row.editData.category" placeholder="请输入"/>
        <span v-else>{{scope.row.category}}</span>
      </template>
    </el-table-column>
    <el-table-column prop="group" label="组别" width="250">
      <template #header>
        <span>组别</span>
        <el-tooltip content="用于按组别调用Agent，可空">
          <el-icon><InfoFilled /></el-icon>
        </el-tooltip>
      </template>
      <template #default="scope">
        <el-input v-if="scope.row.editing" v-model="scope.row.editData.group" placeholder="请输入"/>
        <span v-else>{{scope.row.group}}</span>
      </template>
    </el-table-column>
    <el-table-column prop="system_content" label="提示词" width="500" show-overflow-tooltip>
      <template #default="scope">
        <el-input v-if="scope.row.editing" v-model="scope.row.editData.system_content" type="textarea" placeholder="请输入"/>
        <span v-else>{{scope.row.system_content}}</span>
      </template>
    </el-table-column>
    <el-table-column label="操作" width="200" fixed="right">
      <template #default="scope">
        <div v-if="scope.row.editing">
          <el-button link type="primary" size="small" @click="agentInfoSubmit(scope.row)">提交</el-button>
          <el-button link type="info" size="small" @click="agentInfoCancel(scope.row)">取消</el-button>
        </div>
        <div v-else>
          <el-button link type="primary" size="small" @click="agentInfoEditEnable(scope.row)">编辑</el-button>
          <el-button link type="primary" size="small" @click="changeChatDrawerVisible(scope.row)">调试</el-button>
        </div>
      </template>
    </el-table-column>
  </el-table>

  <el-pagination class="table-pagination" v-model:current-page="pageNum" v-model:page-size="pageSize" :total="pageTotal" :page-sizes="[10, 50, 100, 500]" layout="total, sizes, prev, pager, next, jumper" @size-change="onSizeChange" @current-change="onPageChange"/>

  <chat-drawer v-model:visible="chatDrawerVisible" v-model:agent="chatDrawerAgent" v-model:options="chatDrawerOptions"/>

</template>

<script setup>
import {onMounted, ref} from "vue"
import * as AiServer from "@/api/AiServer"
import {ElNotification} from "element-plus"
import {InfoFilled} from "@element-plus/icons-vue"
import StatisticCard from "./components/StatisticCard.vue"
import ChatDrawer from "@/components/ChatDrawer/ChatDrawer.vue";

const pageNum = ref(1)
const pageSize = ref(10)
const pageTotal = ref(0)
const agentList = ref([])
const modelList = ref([])
const rawEditing = ref(false)
const chatDrawerVisible = ref(false)
const chatDrawerAgent = ref({})
const chatDrawerOptions = ref([])

async function getModelList() {
  const data = {pageEnable: false}
  const res = await AiServer.postModelList(data)
  modelList.value = res.data.data.data
}

async function getAgentList() {
  const data = {pageEnable: true, pageSize: pageSize.value, pageNum: pageNum.value}
  const res = await AiServer.postAgentList(data)
  agentList.value = res.data.data.data
  pageTotal.value = res.data.data.total
}

async function onSizeChange(val) {
  pageSize.value = val
  if (pageNum.value <= Math.ceil(pageTotal.value / pageSize.value)) {
    // 判断页码存在，不存在时会自动触发onPageChange
    await getAgentList()
  }
}

async function onPageChange(val) {
  pageNum.value = val
  await getAgentList()
}

function addRow() {
  if (rawEditing.value) {
    ElNotification({
      message: "请先提交当前数据",
      type: "warning",
    })
  } else {
    rawEditing.value = true
    const newDate = {
      name: '',
      code: '',
      model: "",
      temperature: "",
      max_token: "",
      system_content: "",
      category: "",
      group: "",
      editing: true,
      editData: {}
    }
    getModelList()
    agentList.value.unshift(newDate)
  }
}

async function agentInfoSubmit(row) {
  const data = row.editData
  const res = await AiServer.postAgentInfo(data)
  if (res.status === 200) {
    ElNotification({
      message: res.data.message,
      type: res.data.code,
    })
    await getAgentList()
    rawEditing.value = false
  }
}

function agentInfoEditEnable(row) {
  if (rawEditing.value) {
    ElNotification({
      message: "请先提交当前数据",
      type: "warning",
    })
  } else {
    rawEditing.value = true
    row.editData = {
      id: row.id,
      name: row.name,
      code: row.code,
      model: row.model.id,
      temperature: row.temperature,
      max_token: row.max_token,
      system_content: row.system_content,
      category: row.category,
      group: row.group,
    }
    getModelList()
    row.editing = true
  }
}

function agentInfoCancel(row) {
  if (row.id) {
    row.editing = false
  } else {
    const index = agentList.value.indexOf(row)
    if (index !== -1) {
      agentList.value.splice(index, 1)
    }
  }
  rawEditing.value = false
}

function changeChatDrawerVisible(row) {
  if (!chatDrawerVisible.value) {
    getOptions(row)
    getAgent(row)
  }
  chatDrawerVisible.value = !chatDrawerVisible.value
}

async function getAgent(row) {
  const res = await AiServer.postAgentList({
    pageNum: 1,
    pageSize: 1,
    pageRule: [{field: "code", rule: "is", value: row.code}],
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

async function getOptions(row) {
  const res = await AiServer.postAgentList({
    pageEnable: false,
    pageRule: [{field: "group", rule: "is", value: row.group}],
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

onMounted(() => {
  getAgentList()
})
</script>

<style scoped>
.headerButton {
  margin: 0 0 10px 0;
}

.table-pagination {
  padding-top: 10px;
}
</style>