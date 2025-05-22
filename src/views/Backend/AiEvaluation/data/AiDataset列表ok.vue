<template>


  <statistic-card />
  <!-- <el-form :inline="true" :model="formInline" class="demo-form-inline">
     #查询条件 -->
    <!-- <el-form-item label="问题">
      <el-input v-model="formInline.kb_question_name" placeholder="请输入问题" clearable />
    </el-form-item>
    <el-form-item label="答案">
      <el-input v-model="formInline.kb_question_answer" placeholder="请输入答案" clearable />
    </el-form-item>
    <el-form-item>
      <el-button type="primary" @click="handleQuery">查询</el-button>
    </el-form-item>
    <el-form-item>
      <el-button type="primary" @click="handleReset">重置</el-button>
    </el-form-item>
  </el-form> --> 





  <el-button class="headerButton" type="primary" plain @click="addRow">新增</el-button>
  <el-button class="headerButton" type="primary" plain @click="addRow">一键更新</el-button>
  <el-button class="headerButton" type="primary" plain @click="addRow">数据导入</el-button>
  <el-button class="headerButton" type="primary" plain @click="addRow">数据导出</el-button>
  <el-table :data="datasetList" border style="width: 100%">

    <el-table-column prop="question" label="标准问题" width="250">
      <template #default="scope">
        <el-input v-if="scope.row.editing" v-model="scope.row.editData.question" placeholder="请输入"/>
        <span v-else>{{scope.row.question}}</span>
      </template>
    </el-table-column>
    <el-table-column prop="ground_truth" label="标准答案" width="250">
      <template #default="scope">
        <el-input v-if="scope.row.editing" v-model="scope.row.editData.ground_truth" placeholder="请输入"/>
        <span v-else>{{scope.row.ground_truth}}</span>
      </template>
    </el-table-column>
    
    <el-table-column prop="contexts" label="上下文" width="180">
      <template #default="scope">
        <!-- <el-input-number v-if="scope.row.editing" v-model="scope.row.editData.contexts" placeholder="请输入"/> -->
        <el-input v-if="scope.row.editing" v-model="scope.row.editData.contexts" placeholder="请输入"/>
        <span v-else>{{scope.row.contexts}}</span>
      </template>
    </el-table-column>

    <el-table-column prop="answer" label="测评答案" width="180">
      <template #default="scope">
        <el-input v-if="scope.row.editing" v-model="scope.row.editData.answer" placeholder="请输入"/>
        <span v-else>{{scope.row.answer}}</span>
      </template>
    </el-table-column>
    <el-table-column prop="update_time" label="更新时间" width="180" show-overflow-tooltip>
      <template #default="scope">
        <el-date-picker
      v-if="scope.row.editing"
      v-model="scope.row.editData.update_time"
      type="datetime"
      placeholder="选择日期时间"
      format="YYYY-MM-DD HH:mm:ss"
      value-format="YYYY-MM-DD HH:mm:ss"
      :default-time="new Date(2000, 1, 1, 0, 0, 0)"
    />
    <span v-else>{{ formatDate(scope.row.update_time) }}</span>
      </template>
    </el-table-column>
      <el-table-column prop="entity" label="测评对象" width="180">
        <template #default="scope">
          <el-select
            v-if="scope.row.editing"
            v-model="scope.row.editData.entity"
            filterable
            placeholder="请选择测评对象"
          >
            <el-option
              v-for="item in entityList"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
          <span v-else>{{ getEntityName(scope.row.entity) }}</span>
        </template>
   </el-table-column>

      <el-table-column prop="tag" label="问题标签" width="250">
        <template #header>
          <span>问题标签</span>
          <el-tooltip content="用于问题标签打标">
            <el-icon><InfoFilled /></el-icon>
          </el-tooltip>
        </template>
        <template #default="scope">
          <el-select
            v-if="scope.row.editing"
            v-model="scope.row.editData.tag"
            filterable
            allow-create
            default-first-option
            placeholder="请选择或创建标签"
            @create="handleTagCreate"
          >
            <el-option
              v-for="item in tagList"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
          <span v-else>{{ getTagName(scope.row.tag) }}</span>
        </template>
      </el-table-column>



    <!-- 添加 dataset 列 -->
    <el-table-column prop="dataset" label="数据集" width="180">
  <template #default="scope">
    <el-select
      v-if="scope.row.editing"
      v-model="scope.row.editData.dataset"
      filterable
      allow-create
      default-first-option
      placeholder="请选择或创建数据集"
      @create="handleDatasetCreate"
      @change="(val) => handleDatasetChange(val, scope.row)"
    >
      <el-option
        v-for="item in datasetTreeList"
        :key="item.id"
        :label="item.name"
        :value="item.id"
      />
    </el-select>
    <span v-else>{{ getDatasetName(scope.row.dataset) }}</span>
  </template>
</el-table-column>
    <el-table-column label="操作" width="200" fixed="right">
      <template #default="scope">
        <div v-if="scope.row.editing">
          <el-button link type="primary" size="small" @click="DatasetItemInfoSubmit(scope.row)">提交</el-button>
          <el-button link type="info" size="small" @click="DatasetItemInfoCancel(scope.row)">取消</el-button>
        </div>
        <div v-else>
          <el-button link type="primary" size="small" @click="DataSetInfoEditEnable(scope.row)">编辑</el-button>
          <!-- <el-button link type="primary" size="small" @click="changeChatDrawerVisible(scope.row)">调试</el-button> -->
          <el-button link type="primary" size="small" @click="DatesetonDelete(scope.row)">删除</el-button>
        </div>
      </template>
    </el-table-column>
  </el-table>

  <el-pagination class="table-pagination" v-model:current-page="pageNum" v-model:page-size="pageSize" :total="pageTotal" :page-sizes="[10, 50, 100, 500]" layout="total, sizes, prev, pager, next, jumper" @size-change="onSizeChange" @current-change="onPageChange"/>

  <chat-drawer v-model:visible="chatDrawerVisible" v-model:agent="chatDrawerAgent" v-model:options="chatDrawerOptions"/>

</template>

<script setup>
import {onMounted, ref} from "vue"
import * as AiEvaluation from "@/api/AiEvaluation"
import {ElNotification} from "element-plus"
import {InfoFilled} from "@element-plus/icons-vue"
import dayjs from "dayjs"


const pageNum = ref(1)
const pageSize = ref(10)
const pageTotal = ref(0)
const datasetList = ref([])  // 改名以更准确反映数据内容
// const nodelList = ref([])
const rawEditing = ref(false)
const entityList = ref([])
const tagList = ref([])

const datasetTreeList = ref([]) 


// 获取数据集列表
// async function getDatasetItemList() {
//   const data = {pageEnable: false}
//   const res = await AiEvaluation.postDatasetItemList(data)
//   datasetList.value = res.data.data.data
// }



// Add helper functions for name lookups
function getEntityName(entityId) {
  if (!entityId) return ''
  const entity = entityList.value.find(item => item.id === entityId)
  return entity ? entity.name : ''
}

function getTagName(tagId) {
  if (!tagId) return ''
  const tag = tagList.value.find(item => item.id === tagId)
  return tag ? tag.name : ''
}

function getDatasetName(datasetId) {
  if (!datasetId) return ''
  const dataset = datasetTreeList.value.find(item => item.id === datasetId)
  return dataset ? dataset.name : ''
}

async function getDatasetItemList() {
  const data = {
    pageEnable: true,
    pageSize: pageSize.value,
    pageNum: pageNum.value
  }
  const res = await AiEvaluation.postDatasetItemList(data)
  console.log('【getDatasetItemList】API Response:', res)
  if (res.status === 200) {
    // 统一格式化 update_time 字段
    let list = res.data.data.data || []
    list = list.map(item => ({
      ...item,
      update_time: item.update_time ? dayjs(item.update_time).format('YYYY-MM-DD HH:mm:ss') : ''
    }))
    datasetList.value = list
    console.log('【getDatasetItemList】最终赋值 datasetList:', datasetList.value)
    pageTotal.value = res.data.data.total
  } else {
    console.warn('【getDatasetItemList】接口未返回200:', res)
  }
}

async function handleDatasetCreate(datasetName) {
  try {
    const newDatasetId = await addDataset(datasetName)
    if (newDatasetId) {
      return newDatasetId
    }
  } catch (error) {
    console.error('Create dataset error:', error)
    ElNotification({
      message: '创建数据集失败：' + (error.message || '未知错误'),
      type: 'error',
    })
  }
}

// #获取树节点列表
async function getDatasetTreeList() {
  const data = { pageEnable: false }
  const res = await AiEvaluation.postDatasetTreeList(data)
  if (res.status === 200) {
    datasetTreeList.value = res.data.data.data
    console.log('Dataset Tree List:', datasetTreeList.value)
  }
}


// 添加获取模型列表的函数
// async function getModelList() {
//   const data = {pageEnable: false}
//   const res = await AiEvaluation.postModelList(data)
//   if (res.status === 200) {
//     modelList.value = res.data.data.data
//   }
// }





async function getEntityList() {
  const data = { pageEnable: false }
  const res = await AiEvaluation.postEvaluationObjectList(data)
  if (res.status === 200) {
    entityList.value = res.data.data.data
  }
}

// 获取问题标签
async function getTagList() {
  const data = { pageEnable: false }
  const res = await AiEvaluation.postDatasetTagList(data)
  if (res.status === 200) {
    tagList.value = res.data.data.data
  }
}




// 添加标签的方法
async function addTag(tagName) {
  try {
    const data = { name: tagName }
    const res = await AiEvaluation.postDatasetTagInfo(data)
    if (res.status === 200) {
      ElNotification({
        message: '标签添加成功',
        type: 'success'
      })
      await getTagList() // 刷新标签列表
      return res.data.data.id // 返回新标签的ID
    }
  } catch (error) {
    ElNotification({
      message: '标签添加失败：' + error.message,
      type: 'error'
    })
  }
}

// 添加数据集节点的方法
async function addDataset(datasetName) {
  try {
    const data = { name: datasetName }
    const res = await AiEvaluation.postDatasetTreeInfo(data)
    if (res.status === 200) {
      ElNotification({
        message: '数据集添加成功',
        type: 'success'
      })
      await getDatasetList() // 刷新数据集列表
      return res.data.data.id // 返回新数据集的ID
    }
  } catch (error) {
    ElNotification({
      message: '数据集添加失败：' + error.message,
      type: 'error'
    })
  }
}


// 添加数据集选择变更处理函数
function handleDatasetChange(datasetId, row) {
  if (datasetId) {
    const selectedDataset = datasetTreeList.value.find(item => item.id === datasetId)
    if (selectedDataset) {
      row.dataset = datasetId
      row.datasetName = selectedDataset.name
    }
  }
}





async function onSizeChange(val) {
  pageSize.value = val
  if (pageNum.value <= Math.ceil(pageTotal.value / pageSize.value)) {
    // 判断页码存在，不存在时会自动触发onPageChange
    await getDatasetItemList()
  }
}

async function onPageChange(val) {
  pageNum.value = val
  await getDatasetItemList()
}





// 添加行
function addRow() {
  if (rawEditing.value) {
    ElNotification({
      message: "请先提交当前数据",
      type: "warning",
    })
  } else {
    rawEditing.value = true
    const now = dayjs().format('YYYY-MM-DD HH:mm:ss');
    const newDate = {
      question: '',
      ground_truth: '',
      contexts: "",
      answer: "",
      update_time: now,
      entity: null,
      tag: null,
      dataset: null,
      editing: true,  // 确保设置为 true
      editData: {
        question: '',
        ground_truth: '',
        contexts: '',
        answer: '',
        update_time: now,
        entity: null,
        tag: null,
        dataset: null
      }
    }
    if (!Array.isArray(datasetList.value)) {
      datasetList.value = []
    }
    datasetList.value.unshift(newDate)
    console.log('New row added:', newDate)
    console.log('Current datasetList:', datasetList.value)
  }
}

// 提交
// async function DatasetItemInfoSubmit(row) {
//   const data = row.editData
//   const res = await AiEvaluation.postDatasetItemInfo(data)
//   if (res.status === 200) {
//     ElNotification({
//       message: res.data.message,
//       type: res.data.code,
//     })
//     await  getDatasetItemList()
//     rawEditing.value = false
//   }
// }

// 修改提交方法
async function DatasetItemInfoSubmit(row) {
  try {
    // 统一格式化 update_time
    let updateTime = row.editData.update_time
    if (!updateTime) {
      updateTime = dayjs().format('YYYY-MM-DD HH:mm:ss')
    } else {
      updateTime = dayjs(updateTime).format('YYYY-MM-DD HH:mm:ss')
    }
    const data = {
      id: row.editData.id,
      question: row.editData.question,
      ground_truth: row.editData.ground_truth,
      contexts: row.editData.contexts,
      answer: row.editData.answer,
      update_time: updateTime,
      entity: row.editData.entity,
      tag: row.editData.tag,
      dataset: row.editData.dataset
    }
    console.log('Submitting data:', data)
    const res = await AiEvaluation.postDatasetItemInfo(data)
    console.log('Submit response:', res)
    if (res.status === 200) {
      ElNotification({
        message: res.data.message || '提交成功',
        type: 'success',
      })
      row.editing = false
      await getDatasetItemList()
      rawEditing.value = false
    } else {
      ElNotification({
        message: res.data.message || '提交失败',
        type: 'error',
      })
    }
  } catch (error) {
    console.error('Submit error:', error)
    ElNotification({
      message: '提交失败：' + (error.message || '未知错误'),
      type: 'error',
    })
  }
}

// 编辑
// 修改 DataSetInfoEditEnable 函数
function DataSetInfoEditEnable(row) {
  if (rawEditing.value) {
    ElNotification({
      message: "请先提交当前数据",
      type: "warning",
    })
  } else {
    rawEditing.value = true
    row.editData = {
      id: row.id,
      question: row.question,
      ground_truth: row.ground_truth,
      contexts: row.contexts,
      answer: row.answer,
      update_time: row.update_time,
      entity: row.entity,
      tag: row.tag,
      dataset: row.dataset,
      datasetName: getDatasetName(row.dataset) // 添加数据集名称
    }
    // 移除这行，避免刷新列表
    // getDatasetItemList()
    row.editing = true
  }
}


// 取消 
function DatasetItemInfoCancel(row) {
  if (row.id) {
    row.editing = false
  } else {
    const index = datasetList.value.indexOf(row)
    if (index !== -1) {
      datasetList.value.splice(index, 1)
    }
  }
  rawEditing.value = false
}


async function DatesetonDelete(id) {
  const res = await deleteDatasetItemInfo({"id": id})
  ElMessage ({
    message: res.data.message,
    type: res.data.code,
    plain: true,
  })
  if (pageNum.value > Math.ceil((pageTotal.value - 1) / pageSize.value) && (pageNum.value !== 1)){
    pageNum.value = pageNum.value - 1
  }
  await pageList()
}



// 修改 onMounted 钩子，确保初始化
onMounted(async () => {
  // 确保所有列表被初始化为空数组
  datasetList.value = []
  datasetTreeList.value = []
  entityList.value = []
  tagList.value = []
  
  // 获取所有必要的数据
  await Promise.all([
    getDatasetItemList(),
    getDatasetTreeList(),
    getEntityList(),
    getTagList()
  ])
})

// 格式化表格展示
function formatDate(val) {
  if (!val) return ''
  const d = dayjs(val)
  if (!d.isValid()) return ''
  return d.format('YYYY-MM-DD HH:mm:ss')
}

</script>

<style scoped>
.headerButton {
  margin: 0 0 10px 0;
}

.table-pagination {
  padding-top: 10px;
}

button-group {
  margin-bottom: 20px;
}

.headerButton {
  margin-right: 20px;  /* 按钮之间的间距 */
}

.headerButton:last-child {
  margin-right: 0;  /* 最后一个按钮不需要右边距 */
}
</style>