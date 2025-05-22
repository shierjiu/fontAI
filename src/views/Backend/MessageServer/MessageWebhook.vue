<template>
  <el-button class="headerButton" type="primary" plain @click="addRow">新增</el-button>

  <el-table :data="webhookList" border style="width: 100%">
    <el-table-column prop="name" label="名称" width="250">
      <template #default="scope">
        <el-input v-if="scope.row.editing" v-model="scope.row.editData.name" placeholder="请输入"/>
        <span v-else>{{scope.row.name}}</span>
      </template>
    </el-table-column>
    <el-table-column prop="url" label="地址" width="1000" show-overflow-tooltip>
      <template #default="scope">
        <el-input v-if="scope.row.editing" v-model="scope.row.editData.url" placeholder="请输入"/>
        <span v-else>{{scope.row.url}}</span>
      </template>
    </el-table-column>
    <el-table-column prop="default_template" label="默认模板" width="250">
      <template #default="scope">
        <el-select v-if="scope.row.editing" v-model="scope.row.editData.default_template">
          <el-option v-for="item in templateList" :key="item.id" :label="item.name" :value="item.id"/>
        </el-select>
        <span v-else>{{ scope.row.default_template?.name || '' }}</span>
      </template>
    </el-table-column>
    <el-table-column label="操作" width="200" fixed="right">
      <template #default="scope">
        <div v-if="scope.row.editing">
          <el-button link type="primary" size="small" @click="webhookInfoSubmit(scope.row)">提交</el-button>
          <el-button link type="info" size="small" @click="webhookInfoCancel(scope.row)">取消</el-button>
        </div>
        <div v-else>
          <el-button link type="primary" size="small" @click="webhookInfoEditEnable(scope.row)">编辑</el-button>
          <el-button link type="primary" size="small" @click="webhookServer(scope.row)">发送</el-button>
        </div>
      </template>
    </el-table-column>
  </el-table>

  <el-pagination class="table-pagination" v-model:current-page="pageNum" v-model:page-size="pageSize" :total="pageTotal" :page-sizes="[15, 50, 100, 500]" layout="total, sizes, prev, pager, next, jumper" @size-change="onSizeChange" @current-change="onPageChange"/>

</template>

<script setup>
import {onMounted, ref} from "vue"
import * as MessageServer from "@/api/MessageServer"
import {ElMessageBox, ElNotification} from "element-plus"

const pageNum = ref(1)
const pageSize = ref(15)
const pageTotal = ref(0)
const webhookList = ref([])
const templateList = ref([])
const rawEditing = ref(false)

async function getWebhookList() {
  const data = {pageEnable: true, pageSize: pageSize.value, pageNum: pageNum.value}
  const res = await MessageServer.postWebhookList(data)
  webhookList.value = res.data.data.data
  pageTotal.value = res.data.data.total
}

async function getTemplateList() {
  const data = {pageEnable: false}
  const res = await MessageServer.postTemplateList(data)
  templateList.value = res.data.data.data
}

async function onSizeChange(val) {
  pageSize.value = val
  if (pageNum.value <= Math.ceil(pageTotal.value / pageSize.value)) {
    // 判断页码存在，不存在时会自动触发onPageChange
    await getWebhookList()
  }
}

async function onPageChange(val) {
  pageNum.value = val
  await getWebhookList()
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
      url: '',
      default_template: null,
      editing: true,
      editData: {}
    }
    webhookList.value.unshift(newDate)
    getTemplateList()
  }
}

async function webhookInfoSubmit(row) {
  const data = row.editData
  const res = await MessageServer.postWebhookInfo(data)
  if (res.status === 200) {
    ElNotification({
      message: res.data.message,
      type: res.data.code,
    })
    await getWebhookList()
    rawEditing.value = false
  }
}

function webhookInfoEditEnable(row) {
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
      url: row.url,
      default_template: row.default_template?.id,
    }
    row.editing = true
    getTemplateList()
  }
}

function webhookInfoCancel(row) {
  if (row.id) {
    row.editing = false
  } else {
    const index = webhookList.value.indexOf(row)
    if (index !== -1) {
      webhookList.value.splice(index, 1)
    }
  }
  rawEditing.value = false
}

async function webhookServer(row) {
  const data = {webhook: row.id, template: row.default_template?.id}
  const res = await MessageServer.postWebhookServer(data)
  if (res.status === 200) {
    ElMessageBox.alert(res.data.data, '提示信息', {
      confirmButtonText: '确定',
    }).catch(() => {})
  }
}

onMounted(() => {
  getWebhookList()
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