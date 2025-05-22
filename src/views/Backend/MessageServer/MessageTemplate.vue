<template>
  <el-button class="headerButton" type="primary" plain @click="addRow">新增</el-button>

  <el-table :data="templateList" border style="width: 100%">
    <el-table-column prop="name" label="名称" width="250">
      <template #default="scope">
        <el-input v-if="scope.row.editing" v-model="scope.row.editData.name" placeholder="请输入"/>
        <span v-else>{{scope.row.name}}</span>
      </template>
    </el-table-column>
    <el-table-column prop="content" label="内容" width="1200" show-overflow-tooltip>
      <template #default="scope">
        <el-input v-if="scope.row.editing" v-model="scope.row.editData.content" type="textarea" placeholder="请输入"/>
        <span v-else>{{scope.row.content}}</span>
      </template>
    </el-table-column>
    <el-table-column label="操作" width="200" fixed="right">
      <template #default="scope">
        <div v-if="scope.row.editing">
          <el-button link type="primary" size="small" @click="templateInfoSubmit(scope.row)">提交</el-button>
          <el-button link type="info" size="small" @click="templateInfoCancel(scope.row)">取消</el-button>
        </div>
        <div v-else>
          <el-button link type="primary" size="small" @click="templateInfoEditEnable(scope.row)">编辑</el-button>
        </div>
      </template>
    </el-table-column>
  </el-table>

  <el-pagination class="table-pagination" v-model:current-page="pageNum" v-model:page-size="pageSize" :total="pageTotal" :page-sizes="[15, 50, 100, 500]" layout="total, sizes, prev, pager, next, jumper" @size-change="onSizeChange" @current-change="onPageChange"/>

</template>

<script setup>
import {onMounted, ref} from "vue"
import * as MessageServer from "@/api/MessageServer"
import {ElNotification} from "element-plus"

const pageNum = ref(1)
const pageSize = ref(15)
const pageTotal = ref(0)
const templateList = ref([])
const rawEditing = ref(false)

async function getTemplateList() {
  const data = {pageEnable: true, pageSize: pageSize.value, pageNum: pageNum.value}
  const res = await MessageServer.postTemplateList(data)
  templateList.value = res.data.data.data
  pageTotal.value = res.data.data.total
}

async function onSizeChange(val) {
  pageSize.value = val
  if (pageNum.value <= Math.ceil(pageTotal.value / pageSize.value)) {
    // 判断页码存在，不存在时会自动触发onPageChange
    await getTemplateList()
  }
}

async function onPageChange(val) {
  pageNum.value = val
  await getTemplateList()
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
      content: '',
      editing: true,
      editData: {}
    }
    templateList.value.unshift(newDate)
  }
}

async function templateInfoSubmit(row) {
  const data = row.editData
  const res = await MessageServer.postTemplateInfo(data)
  if (res.status === 200) {
    ElNotification({
      message: res.data.message,
      type: res.data.code,
    })
    await getTemplateList()
    rawEditing.value = false
  }
}

function templateInfoEditEnable(row) {
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
      content: row.content,
    }
    row.editing = true
  }
}

function templateInfoCancel(row) {
  if (row.id) {
    row.editing = false
  } else {
    const index = templateList.value.indexOf(row)
    if (index !== -1) {
      templateList.value.splice(index, 1)
    }
  }
  rawEditing.value = false
}

onMounted(() => {
  getTemplateList()
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