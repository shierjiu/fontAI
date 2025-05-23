<template>
  <el-button class="headerButton" type="primary" plain @click="EvaluationObjectAddRow">新增</el-button>
  <div class="search-form">
        <el-form :inline="true" :model="formInline" class="demo-form-inline">
          <el-form-item label="名称">
            <el-input v-model="formInline.name" placeholder="请输入名称" clearable />
          </el-form-item>
          <!-- <el-form-item label="请求方法">
            <el-input v-model="formInline.method" placeholder="请选择请求方法" clearable />
          </el-form-item> -->
          <el-form-item label="请求方法">
            <el-select
              v-model="formInline.method"
              filterable
              default-first-option
              placeholder="请选择请求方法"
              @create="handleTagCreate"
              @change="handleQuery"
              clearable
            >
              <el-option
                v-for="item in typeList"
                :key="item.name"
                :label="item.name"
                :value="item.name"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="流式输出">
            <el-select
              v-model="formInline.stream"
              filterable
              default-first-option
              placeholder="请选择是否流式输出"
              @change="handleQuery"
              clearable
            >
              <el-option
                v-for="item in streamOutList"
                :key="item.value"
                :label="item.name"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleQuery">查询</el-button>
            <el-button @click="handleReset">重置</el-button>
          </el-form-item>
        </el-form>
      </div>
  <el-table :data="modelList" border style="width: 100%">
    <el-table-column prop="name" label="名称" width="250" class-name="ellipsis-cell">
      <template #default="scope">
        <el-input v-if="scope.row.editing" v-model="scope.row.editData.name" placeholder="请输入"/>
        <span v-else class="ellipsis-cell" :title="scope.row.name">{{ scope.row.name }}</span>
      </template>
    </el-table-column>
    <el-table-column prop="url" label="请求地址" width="250" class-name="ellipsis-cell">
      <template #default="scope">
        <el-input v-if="scope.row.editing" v-model="scope.row.editData.url" placeholder="请输入"/>
        <span v-else class="ellipsis-cell" :title="scope.row.url">{{ scope.row.url }}</span>
      </template>
    </el-table-column>
    <el-table-column prop="method" label="请求方法" width="250">
      <template #default="scope">
        <el-select v-if="scope.row.editing" v-model="scope.row.editData.method">
          <el-option v-for="item in typeList" :key="item.name" :label="item.name" :value="item.name"/>
        </el-select>
        <span v-else>{{ scope.row.method }}</span>
      </template>
    </el-table-column>
    <el-table-column prop="header" label="请求头" width="400" class-name="ellipsis-cell">
      <template #default="scope">
        <el-input v-if="scope.row.editing" v-model="scope.row.editData.header" placeholder="请输入"/>
        <span v-else class="ellipsis-cell" :title="scope.row.header">{{ scope.row.header }}</span>
      </template>
    </el-table-column>
    <el-table-column prop="body" label="请求体" width="400" class-name="ellipsis-cell">
      <template #default="scope">
        <el-input v-if="scope.row.editing" v-model="scope.row.editData.body" placeholder="请输入"/>
        <span v-else class="ellipsis-cell" :title="scope.row.body">{{ scope.row.body }}</span>
      </template>
    </el-table-column>
    <el-table-column prop="stream" label="是否流式输出" width="250">
      <template #default="scope">
        <el-select v-if="scope.row.editing" v-model="scope.row.editData.stream">
          <el-option v-for="item in streamOutList" :key="item.value" :label="item.name" :value="item.value"/>
        </el-select>
        <span v-else>{{ scope.row.stream }}</span>
      </template>
    </el-table-column> 
    <el-table-column prop="response_function" label="返回函数" class-name="ellipsis-cell">
      <template #default="scope">
        <span class="ellipsis-cell" :title="scope.row.response_function">
          {{ scope.row.response_function }}
        </span>
      </template>
    </el-table-column>
    <el-table-column label="操作" width="200" fixed="right">
      <template #default="scope">
        <div v-if="scope.row.editing">
          <el-button link type="primary" size="small" @click="EvaluationObjectonSubmit(scope.row)">提交</el-button>
          <el-button link type="info" size="small" @click="EvaluationObjectCancel(scope.row)">取消</el-button>
          
        </div>
        <div v-else>
          <el-button link type="primary" size="small" @click="EvaluationObjectEditEnable(scope.row)">编辑</el-button>   
          <el-button link type="danger" size="small" @click="EvaluationObjectDelete(scope.row.id)">删除</el-button>
          <el-button link type="warning" size="small" @click="debugObject(scope.row)">调试</el-button>
        </div>
      </template>
    </el-table-column>
  </el-table>

  <el-pagination class="table-pagination" v-model:current-page="pageNum" v-model:page-size="pageSize" :total="pageTotal" :page-sizes="[15, 50, 100, 500]" layout="total, sizes, prev, pager, next, jumper" @size-change="onSizeChange" @current-change="onPageChange"/>

</template>

<script setup>
import {onMounted, ref} from "vue"
import * as AiEvaluation from "@/api/AiEvaluation"
import * as AiServer from "@/api/AiServer"
import {ElNotification, ElMessage} from "element-plus"
import { stream } from "xlsx"
import { OneclickUpdate } from '@/api/AiEvaluation'

const pageNum = ref(1)
const pageSize = ref(15)
const pageTotal = ref(0)
const datasetList = ref(0)
const modelList = ref([])
const rawEditing = ref(false)
const typeList = ref([
  {name: "GET"},
  {name: "POST"},
  {name: "PUT"},
  {name: "DELETE"},
])
const streamOutList = ref([
  { name: "是", value: true  },
  { name: "否", value: false },
])

const previewContent = ref('')
const previewVisible = ref(false)
const previewStyle = ref({})

const formInline = ref({
  name: '',
  url: '',
  method: '',
  stream: undefined,
});

// async function  getModelList() {
//   const data = {pageEnable: true, pageSize: pageSize.value, pageNum: pageNum.value}
//   const res = await AiServer.postModelList(data)
//   modelList.value = res.data.data.data
//   pageTotal.value = res.data.data.total
// }

async function handleQuery() {
  console.log('=== 开始查询 ===')
  console.log('查询条件:', formInline.value)

  try {
      const pageRule = [
      { field: 'name',   rule: 'contains', value: formInline.value.name?.trim() },
      { field: 'method', rule: 'is',       value: formInline.value.method?.trim() },
      { field: 'stream', rule: 'is',       value: formInline.value.stream }
    ].filter(rule =>
      rule.value !== '' &&
      rule.value !== undefined &&
      rule.value !== null
    )
    // 2. 没有任何有效条件 → 全量查询
    if (pageRule.length === 0) {
      await AiEvaluation.getEvaluationObjectList()
      return
    }

    const params = {
      pageNum:  pageNum.value,
      pageSize: pageSize.value,
      pageEnable: true,
      pageRule,
    };
    
    console.log('查询参数:', params)
    const res = await AiEvaluation.postEvaluationObjectList(params)
    console.log('查询结果:', res)

    if (res.status === 200) {
      modelList.value = res.data.data?.data || [];
      pageTotal.value = res.data.data?.total || 0;
      pageNum.value = 1;
      ElMessage.success('查询成功')
    } else {
      ElMessage.error('查询失败：' + (res.data?.message || '未知错误'))
    }
    return res;
  } catch (error) {
    console.error('查询过程发生错误:', error)
    return null
  }
  console.log('=== 查询结束 ===')
}



function handleReset() {
  formInline.value = {
    name: '',
    url: '',
    method: '',
    stream: undefined, 
  }
  handleQuery()
}



// 获取评估对象列表
async function getEvaluationObjectList() {
  const data = {
    pageEnable: true, 
    pageSize: pageSize.value,
     pageNum: pageNum.value}
  const res = await AiEvaluation.postEvaluationObjectList(data)
  modelList.value = res.data.data.data
  pageTotal.value = res.data.data.total
}


async function onSizeChange(val) {
  pageSize.value = val
  if (pageNum.value <= Math.ceil(pageTotal.value / pageSize.value)) {
    // 判断页码存在，不存在时会自动触发onPageChange
    await  AiEvaluation.getEvaluationObjectList()
  }
}

async function onPageChange(val) {
  pageNum.value = val
  await  AiEvaluation.getEvaluationObjectList()
}

function EvaluationObjectAddRow() {
  if (rawEditing.value) {
    ElNotification({
      message: "请先提交当前数据",
      type: "warning",
    })
  } else {
    rawEditing.value = true
    const newDate = {
      name: '',
      url: "",
      method: "",
      header: '',
      body: "",
      stream: "",
      response_function: "",
      editing: true,
      editData: {}
    }
    modelList.value.unshift(newDate)
  }
}

async function EvaluationObjectonSubmit(row) {
  const data = row.editData
  const res = await AiEvaluation.postEvaluationObjectInfo(data)
  if (res.status === 200) {
    ElNotification({
      message: res.data.message,
      type: res.data.code,
    })
    await  AiEvaluation.getEvaluationObjectList()
    rawEditing.value = false
  }
}

function EvaluationObjectEditEnable(row) {
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
      method: row.method,
      header: row.header,
      body: row.body,
      stream: row.stream,
      response_function: row.response_function
    }
    row.editing = true
  }
}


async function EvaluationObjectDelete(id) {
  const res = await AiEvaluation.deleteEvaluationObjectInfo(id)
  ElMessage({
    message: res?.data?.message || '删除成功',
    type: res?.data?.code === 200 ? 'success' : 'error',
    plain: true,
  })
  if (pageNum.value > Math.ceil((pageTotal.value - 1) / pageSize.value) && (pageNum.value !== 1)) {
    pageNum.value = pageNum.value - 1
  }
  await AiEvaluation.getEvaluationObjectList()
}



// TODO 调试
async function debugObject(row) {
  const entity = row.id
  console.log('=== 开始调试 ===')
  console.log('调试对象:', entity)
  try {
    // 调用 OneclickUpdate，传递 entity_id
    const res = await OneclickUpdate({ entity })
    // 假设返回内容在 res.data
    const info = res.data ? JSON.stringify(res.data) : '无返回内容'
    ElNotification({
      message: `调试: ${info}`,
      type: "info",
    })
  } catch (error) {
    ElNotification({
      message: `调试: 调用失败 - ${error.message || '未知错误'}`,
      type: "error",
    })
  }
}
function EvaluationObjectCancel(row) {
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

function showCellPreview(content, event) {
  previewContent.value = content
  previewVisible.value = true
  // 定位到鼠标点击处
  if (event) {
    previewStyle.value = {
      position: 'fixed',
      left: event.clientX + 'px',
      top: event.clientY + 'px'
    }
  }
}
function closePreview() {
  previewVisible.value = false
}

onMounted(() => {
   getEvaluationObjectList()
})
</script>

<style scoped>
.headerButton {
  margin: 0 0 10px 0;
}

.table-pagination {
  padding-top: 10px;
}

.ellipsis-cell {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 300px; /* 可根据实际调整 */
  display: block;
  cursor: pointer;
}

.cell-preview-popover {
  background: #222;
  color: #fff;
  padding: 16px 20px;
  border-radius: 4px;
  max-width: 80vw;
  max-height: 60vh;
  overflow: auto;
  font-size: 15px;
  white-space: pre-wrap; /* 保持格式 */
  z-index: 9999;
}
</style>