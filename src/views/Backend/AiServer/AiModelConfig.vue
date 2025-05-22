<template>
  <el-button class="headerButton" type="primary" plain @click="addRow">新增</el-button>

  <el-table :data="modelList" border style="width: 100%">
    <el-table-column prop="name" label="名称" width="250">
      <template #default="scope">
        <el-input v-if="scope.row.editing" v-model="scope.row.editData.name" placeholder="请输入"/>
        <span v-else>{{scope.row.name}}</span>
      </template>
    </el-table-column>
    <el-table-column prop="type" label="模式" width="250">
      <template #default="scope">
        <el-select v-if="scope.row.editing" v-model="scope.row.editData.type">
          <el-option v-for="item in typeList" :key="item.name" :label="item.name" :value="item.name"/>
        </el-select>
        <span v-else>{{ scope.row.type }}</span>
      </template>
    </el-table-column>
    <el-table-column prop="key" label="ApiKey" width="400">
      <template #default="scope">
        <el-input v-if="scope.row.editing" v-model="scope.row.editData.key" placeholder="请输入"/>
<!--        <span v-else>{{scope.row.key}}</span>-->
        <span v-else>**********</span>
      </template>
    </el-table-column>
    <el-table-column prop="url" label="ApiUrl" width="250">
      <template #default="scope">
        <el-input v-if="scope.row.editing" v-model="scope.row.editData.url" placeholder="请输入"/>
        <span v-else>{{scope.row.url}}</span>
      </template>
    </el-table-column>
    <el-table-column prop="model" label="ApiModel" width="250">
      <template #default="scope">
        <el-input v-if="scope.row.editing" v-model="scope.row.editData.model" placeholder="请输入"/>
        <span v-else>{{scope.row.model}}</span>
      </template>
    </el-table-column>
    <el-table-column label="操作" width="200" fixed="right">
      <template #default="scope">
        <div v-if="scope.row.editing">
          <el-button link type="primary" size="small" @click="modelInfoSubmit(scope.row)">提交</el-button>
          <el-button link type="info" size="small" @click="modelInfoCancel(scope.row)">取消</el-button>
        </div>
        <div v-else>
          <el-button link type="primary" size="small" @click="modelInfoEditEnable(scope.row)">编辑</el-button>
        </div>
      </template>
    </el-table-column>
  </el-table>

  <el-pagination class="table-pagination" v-model:current-page="pageNum" v-model:page-size="pageSize" :total="pageTotal" :page-sizes="[15, 50, 100, 500]" layout="total, sizes, prev, pager, next, jumper" @size-change="onSizeChange" @current-change="onPageChange"/>

</template>

<script setup>
import {onMounted, ref} from "vue"
import * as AiServer from "@/api/AiServer"
import {ElNotification} from "element-plus"

const pageNum = ref(1)
const pageSize = ref(15)
const pageTotal = ref(0)
const modelList = ref([])
const rawEditing = ref(false)
const typeList = ref([
  {name: "SDK(OpenAI)"},
])

async function getModelList() {
  const data = {pageEnable: true, pageSize: pageSize.value, pageNum: pageNum.value}
  const res = await AiServer.postModelList(data)
  modelList.value = res.data.data.data
  pageTotal.value = res.data.data.total
}

async function onSizeChange(val) {
  pageSize.value = val
  if (pageNum.value <= Math.ceil(pageTotal.value / pageSize.value)) {
    // 判断页码存在，不存在时会自动触发onPageChange
    await getModelList()
  }
}

async function onPageChange(val) {
  pageNum.value = val
  await getModelList()
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
      type: '',
      key: "",
      url: "",
      model: "",
      editing: true,
      editData: {}
    }
    modelList.value.unshift(newDate)
  }
}

async function modelInfoSubmit(row) {
  const data = row.editData
  const res = await AiServer.postModelInfo(data)
  if (res.status === 200) {
    ElNotification({
      message: res.data.message,
      type: res.data.code,
    })
    await getModelList()
    rawEditing.value = false
  }
}

function modelInfoEditEnable(row) {
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
      type: row.type,
      key: "",
      url: row.url,
      model: row.model,
    }
    row.editing = true
  }
}

function modelInfoCancel(row) {
  if (row.id) {
    row.editing = false
  } else {
    const index = modelList.value.indexOf(row)
    if (index !== -1) {
      modelList.value.splice(index, 1)
    }
  }
  rawEditing.value = false
}

onMounted(() => {
  getModelList()
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