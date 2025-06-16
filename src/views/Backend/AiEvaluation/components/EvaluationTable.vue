<template>
    <div class="button-group">
    <el-button class="headerButton" type="primary" plain @click="addRow">新增</el-button>
    <el-select v-model="entityId" placeholder="请选择测试对象" style="width: 160px; margin-right: 8px">
    <el-option v-for="item in entityList" :key="item.id" :label="item.name" :value="item.id"   />
    </el-select>
    <el-button class="headerButton" type="primary" plain @click="OneclickUpdateAnswer" :loading="isUpdatingAnswer">一键更新</el-button>
    <el-button class="headerButton" type="primary" plain @click="excelImport">数据导入</el-button>
    <el-button class="headerButton" type="primary" plain @click="excelExport">数据导出</el-button>
    <el-button class="headerButton" type="primary" plain @click="fileUpload">知识库</el-button>
    <el-button class="headerButton" type="primary" plain @click="TemplateDownload">模板下载</el-button>
    </div>
    <div class="search-form">
    <el-form :inline="true" :model="formInline" class="demo-form-inline">
        <el-form-item label="标准问题">
        <el-input v-model="formInline.question" placeholder="请输入标准问题" clearable style="width: 180px;"/>
        </el-form-item>
        <el-form-item label="标准答案">
        <el-input v-model="formInline.ground_truth" placeholder="请输入标准答案"   clearable style="width: 180px;"/>
        </el-form-item>
        <el-form-item label="问题标签">
        <el-select
            v-model="formInline.tag"
            placeholder="请选择问题标签"
            clearable
            style="width: 180px;"
        >
            <el-option
            v-for="item in tagList"
            :key="item.id"
            :label="item.name"
            :value="item.id"
            />
        </el-select>
        </el-form-item>
    
        <el-form-item>
        <el-button type="primary" @click="handleQuery">查询</el-button>
        <el-button @click="handleReset">重置</el-button>
        </el-form-item>
    </el-form>
    </div>
     <div class="table-wrapper">
        <el-table 
        :data="filteredList"
        :row-key="row => row.id ?? row._uuid"
        border
        style="width:100%"
        @selection-change="handleSelectionChange"
         show-overflow-tooltip
         :cell-style="{
            maxWidth: '150px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
             whiteSpace: 'nowrap'
         }"
        >
        <!-- 自定义表格列内容 -->
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
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DD HH:mm:ss"
            placeholder="选择日期时间"
            editable="false"
            clearable="false"
          />
          <span v-else>{{ formatDate(scope.row.update_time) }}</span>
        </template>
      </el-table-column>

      <el-table-column prop="status" label="状态" width="180">
        <template #default="scope">
          <span>{{scope.row.status}}</span>
        </template>
      </el-table-column>

      <el-table-column prop="entity" label="评测对象" width="180">
        <template #default="scope">
          <span>{{ getEntityName(scope.row.entity) }}</span>
        </template>
      </el-table-column>

      <el-table-column prop="tag" label="问题标签" width="180">
        <template #default="scope">
          <el-select
            v-if="scope.row.editing"
            v-model="scope.row.editData.tag"
            filterable
            placeholder="请选择问题标签"
          >
            <el-option
              v-for="item in tagList"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
          <span v-else>{{ scope.row.tag?.name || '' }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="dataset" label="数据集" v-if="false" >
        <template #default="scope">
          <el-select
            v-if="scope.row.editing"
            v-model="scope.row.editData.dataset"
            filterable
            placeholder="请选择数据集"
          >
            <el-option
              v-for="item in datasetTreeList"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
          <span v-else>{{ scope.row.dataset?.name || '' }}</span>
        </template>
      </el-table-column>
      <!-- 操作列 -->
      <el-table-column label="操作" width="200" fixed="right">
        <template #default="scope">
          <div v-if="scope.row.editing">
            <el-button link type="primary" size="small" @click="DatasetItemInfoSubmit(scope.row)">提交</el-button>
            <el-button link type="info" size="small" @click="DatasetItemInfoCancel(scope.row)">取消</el-button>
          </div>
          <div v-else>
            <el-button link type="primary" size="small" @click="DataSetInfoEditEnable(scope.row)">编辑</el-button>
            <el-button link type="primary" size="small" @click="UpdateDataItem(scope.row.id)">更新</el-button>
            <el-button link type="danger" size="small" @click="DatasetItemDelete(scope.row.id)">删除</el-button>
          </div>
        </template>
      </el-table-column>                             
        </el-table>
        <el-pagination
          class="table-pagination"
          v-model:current-page="pageNum"
          v-model:page-size="pageSize"
          :total="pageTotal"
          :page-sizes="[10, 50, 100, 500]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="onSizeChange"
          @current-change="onPageChange"
          />
    </div>
    <ExcelImportDrawer 
     v-model:visible="showExcel"
     :dataset-id="props.datasetId"
      @uploaded="fetchFileData"
    />
    <KnowledgeBase
      v-model:visible="fileUploadVisible"
      :dataset-id="props.datasetId"
      @uploaded="fetchFileData"
    />
</template>

<script setup>
import { ref,onMounted ,computed,defineProps,watch,reactive} from 'vue';
import * as AiEvaluation from "@/api/AiEvaluation/index"
import {ElNotification,ElMessage,ElPopconfirm,ElMessageBox,dayjs} from "element-plus"
import KnowledgeBase from '@/views/Backend/AiEvaluation/components/KnowledgeBase.vue';
import ExcelImportDrawer from './ExcelImportDrawer.vue';
import date from 'dayjs'
import { saveAs } from 'file-saver'
import * as XLSX from 'xlsx'

const props = defineProps({
  datasetId:        { type: [String, Number], required: true },
})
const filteredList = ref([]);  // 表格数据
const pageNum = ref(1)
const pageSize = ref(10)
const pageTotal = ref(0)
const tagList=ref([]) // 问题标签列表
const entityList = ref([]); // 测评对象列表
const rawEditing = ref(false) // 是否有行正在编辑
const entityId   = ref(null)  // 当前选择的对象 id
const datasetTreeList = ref([])
const isUpdatingAnswer = ref(false) // 一键更新答案的加载状态
const statusList=ref([])// 状态列表
const fileUploadVisible = ref(false);
const showExcel = ref(false)
const selectedRows = ref([])
let   pollTimer         = null  // 定时器
const formInline = ref({
  question: '',
  ground_truth: '',  
  tag :'',
  value: {
    request_method: ''
  }
})
const handleSelectionChange = (val) => {
  selectedRows.value = val
}
async function onSizeChange (val) {
  pageSize.value = val
  if (pageNum.value <= Math.ceil(pageTotal.value / pageSize.value)){
      await fetchFileData()
  }

}
async function onPageChange (val) {
  pageNum.value = val
  await fetchFileData()
}
const formatDate = (val) => {
  if (!val) return ''
  const d = date(val)
  return d.isValid() ? d.format('YYYY-MM-DD HH:mm:ss') : ''
}

function normalizeList(rawList) {
  return (Array.isArray(rawList) ? rawList : []).map(it => ({
    ...it,
    /* 统一时间 */
    update_time: it.update_time
      ? date(it.update_time).format('YYYY-MM-DD HH:mm:ss')
      : '',
    /* 统一本来可能分散的 id 字段 */
    entity : it.entity_id  ?? it.entity  ?? '',
    tag    : it.tag_id     ?? it.tag     ?? '',
    dataset: it.dataset_id ?? it.dataset ?? ''
  }))
}
function extractArray(resData) {
  if (Array.isArray(resData)) return resData
  if (Array.isArray(resData?.data)) return resData.data
  if (Array.isArray(resData?.records)) return resData.records
  return resData?.data?.data ?? []          
}
// 新增
function addRow() {
  if (rawEditing.value) {
    ElNotification({
      message: "请先提交当前数据",
      type: "warning",
    });
    return
  } else {
    rawEditing.value = true
    const newRow = {
      id: null,
      question: '',
      ground_truth: '',
      contexts: '',
      answer: '',
      update_time: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      entity: null,
      tag: null,
      dataset:  props.datasetId,
      editing: true, 
    }
    newRow.editData = { ...newRow } // 初始化编辑数据
    filteredList.value.unshift(newRow)
  }
}
//提交
async function DatasetItemInfoSubmit(row) {
  try {
    console.log('提交数据:', row.editData)
    const res = await AiEvaluation.postDatasetItemInfo(row.editData)
    if (res.status === 200){
      row.editing = false
      rawEditing.value = false
      await fetchFileData()
      ElMessage({
        message: res.data.message || '提交成功',
        type: 'success',
        plain: true,
      })
    }
  } catch(error) {
    ElMessage({
      message: error.message || '提交失败',
      type: 'error',
      plain: true,
    })
  }
}
// 取消 
function DatasetItemInfoCancel(row) {
  // 如果是已经有 id 的老数据，只退出编辑模式
  if (row.id) {
    row.editing = false
  }
  else {
    const idx = filteredList.value.findIndex(item => item === row)
    if (idx > -1) {
      filteredList.value.splice(idx, 1)
    }
  }
  // 解除“正在编辑中”的全局锁
  rawEditing.value = false
}
// 编辑
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
      update_time:String(dayjs().format('YYYY-MM-DD HH:mm:ss')),
      entity: row.entity?.id ?? null,   // 取对象的 id
      tag: row.tag?.id ?? null,
      dataset: row.dataset?.id ?? null,
    }
    row.editing = true
  }
}
//删除
async function DatasetItemDelete(id) {
  try {
    const res = await AiEvaluation.deleteDatasetItemInfo({ params: {id} })
    ElMessage({
      message: res?.data?.message || '删除成功',
      type: res?.data?.code === 200 ? 'success' : 'error',
      plain: true,
    })
    if (pageNum.value > Math.ceil((pageTotal.value - 1) / pageSize.value) && (pageNum.value !== 1)) {
      pageNum.value = pageNum.value - 1
    }
    await fetchFileData()
  } catch (error) {
    ElMessage({
      message: error.message || '删除失败',
      type: 'error',
      plain: true,
    })
  }
}
// 更新
async function UpdateDataItem(id) {
  try{
    const detail= parseInt(id, 10)
    const payload = {
      entity: entityId.value,
      detail
    }
    const res = await AiEvaluation.OneclickUpdate(payload)
      if (res.status === 200 || res.data?.code === 'success'){
      ElMessage.success(res.data?.message || '单条更新成功！')
      await fetchFileData() // 刷新列表
    } else {
      ElMessage.error(res.data?.message || '单条更新失败！')
    }
  } catch (error) {
    ElMessage.error(error.message || '单条更新失败！')
  }
}
//一键更新
async function OneclickUpdateAnswer() {
if (!props.datasetId) {
    ElMessage.warning('请先选中节点')
    return
  }
  if (!entityId.value) {
    ElMessage.warning('请选择评测对象')
    return
  }

  isUpdatingAnswer.value = true

  try {
    // 第 1 步：触发后台开始计算
    const res = await AiEvaluation.OneclickUpdate({
      dataset: props.datasetId,
      entity: entityId.value
    })
    if (res.data.code !== 'success') {
      throw new Error(res.data.message || '启动失败')
    }
    ElMessage.info('更新已启动，开始轮询结果…')

    // 第 2 步：立即拉一次表格初始数据
    await fetchFileData()

    // 清除老的定时器
    if (pollTimer) clearInterval(pollTimer)

    // 第 3 步：每 2 秒拉一次
    pollTimer = setInterval(async () => {
      await fetchFileData()

      // 停止条件：当所有行的 status 都不是 'pending'
      if (!statusList.value.includes('pending')) {
        clearInterval(pollTimer)
        ElMessage.success('所有任务已完成，停止轮询！')
        isUpdatingAnswer.value = false
      }
    }, 20000)

  } catch (err) {
    console.error('[OneclickUpdateAnswer]', err)
    ElMessage.error('启动更新失败：' + err.message)
    isUpdatingAnswer.value = false
  }
}
// 数据导入
function excelImport(){
  showExcel.value = true;
}
//数据导出
function excelExport(){
  let exportData=selectedRows.value.length > 0 ? selectedRows.value : filteredList.value
  // 2. 处理导出字段
  const fields = [
    { key: 'question', label: '标准问题' },
    { key: 'ground_truth', label: '标准答案' },
    { key: 'contexts', label: '上下文' },
    { key: 'answer', label: '测评答案' },
    { key: 'update_time', label: '更新时间' },
    { key: 'entity', label: '测评对象' },
    { key: 'tag', label: '问题标签' },
    { key: 'dataset', label: '数据集' }
  ]
  // 3. 格式化数据
  const data = exportData.map(row => {
    return {
      question: row.question,
      ground_truth: row.ground_truth,
      contexts: row.contexts,
      answer: row.answer,
      update_time: row.update_time,
      entity: row.entity.name, // 转换为名称
      tag: row.tag.name,          // 转换为名称
      dataset: row.dataset.name // 转换为名称
    }
  })
  // 4. 生成 worksheet
  const ws = XLSX.utils.json_to_sheet(data, { header: fields.map(f => f.key) })
  // 设置表头
  XLSX.utils.sheet_add_aoa(ws, [fields.map(f => f.label)], { origin: 'A1' })
  // 5. 生成 workbook
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, '数据集')
  //excel导出
  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
  saveAs(new Blob([wbout], { type: 'application/octet-stream' }), '数据集导出.xlsx')
}
//打开知识库
function fileUpload(){
  fileUploadVisible.value=true;
}
// 模板下载
async function TemplateDownload() {
  console.log('开始下载模板');
  try{
    const res = await AiEvaluation.downloadTemplate({responseType: 'blob'})
    const blob = new Blob([res.data], { type: res.headers['content-type'] || 'application/octet-stream' });
    const disposition = res.headers['content-disposition'] || ''
    const filenameMatch = disposition.match(/filename="?(.+)"?/)
    const filename = filenameMatch ? filenameMatch[1] : '数据集模板.xlsx';
    saveAs(blob, filename);
  } catch (error) {
    console.error('下载模板失败:', error);
  }
}
//查询
async function handleQuery() {
  console.log('查询条件:', formInline);
  try{
    //拿到当前节点下的所有记录
    const res= await AiEvaluation.postDatasetItemList({
      pageEnable: true,
      pageNum: pageNum.value,
      pageSize: pageSize.value,
      dataset_id: props.datasetId,
    });
    if (res.status !== 200) throw new Error('网络异常');
      // 1) 先按 datasetId 过滤
    let list = (res.data.data.data || []).filter(item => 
      String(item.dataset.id) === String(props.datasetId)
    );
    // 2) 再按表单条件过滤
    const { question, ground_truth, tag } = formInline.value;
    if (question) {
      const q = question.trim();
      list = list.filter(item => item.question?.includes(q));
    }
    if (ground_truth) {
      const g = ground_truth.trim();
      list = list.filter(item => item.ground_truth?.includes(g));
    }
    if (tag) {
      list = list.filter(item => {
        const t = item.tag?.id ?? item.tag;
        return t != null && String(t) === String(tag);
      });
    }
    filteredList.value = list;
    pageTotal.value = list.length;
    ElMessage.success('查询并本地过滤完成');
  } catch (error) {
    ElMessage.error('查询失败：' + error.message);
  }
}
//重置
function handleReset() {
  formInline.value = {
    question: '',
    ground_truth: '',
    tag: ''
  };
  fetchFileData(); // 重置后重新获取数据
  ElMessage.success('已重置查询条件');
}
//获取测评对象
function getEntityName(entity) {
  //console.log('entity:', entity);
  if (!entity) return '';
  const entityId = typeof entity === 'object' ? entity.id : entity;
  const found = entityList.value.find(item => item.id === entityId);
  //console.log('found:', found);
  return found ? found.name : '';
}
// 获取文件数据
async function fetchFileData() {
  console.log('当前datasetId:', props.datasetId);
  try {
    const { status, data } = await AiEvaluation.postDatasetItemList({
      pageEnable: true,
      pageNum: pageNum.value,
      pageSize: pageSize.value,
      pageRule:[
        { field: 'dataset', rule: 'is',value: props.datasetId },
      ],

    });
    if (status !== 200) throw new Error('网络异常');
    // 1. 拿到后端原始数组
    console.log('后端data数组',data)
    const rawList = extractArray(data);
    console.log('后端原始数组',rawList)
    // 2. 统一格式化
    const normalized = normalizeList(rawList);
    const filtered = normalized.filter(item => {
      return String(item.dataset.id) === String(props.datasetId);
    });
    // 4. 同步分页总数（前端分页时用）
    filteredList.value = filtered;
    console.log('filteredList',filteredList.value)
    pageTotal.value = data.data.total;
    statusList.value = filtered.map(item => item.status);
  } catch (err) {
    console.error('获取文件数据失败', err);
    filteredList.value = []
    pageTotal.value = 0;
    statusList.value = [];
  }
}
async function getEntityList() {
  const data = { pageEnable: false }
  const res = await AiEvaluation.postEvaluationObjectList(data)
  if (res.status === 200) {
    entityList.value = res.data.data.data
    //console.log('获取测评对象列表成功:', entityList.value);
  }
}
// 获取问题标签
async function getTagList() {
  const data = { pageEnable: false }
  const res = await AiEvaluation.postDatasetTagList(data)
  //console.log('获取问题标签列表:', res);
  if (res.status === 200) {
    tagList.value = res.data.data.data
  }
}

// 页面初始化时获取文件数据
onMounted(() => {
  fetchFileData();
  getEntityList();
  getTagList();
});
watch(
  () => [props.datasetId, pageNum.value, pageSize.value],
  fetchFileData,
  { immediate: true }
)
</script>

<style scoped>
.table-wrapper {
  margin-top: 0px;
  min-height: 400px;
  overflow: auto;
}
.table-pagination {
  margin-top: 20px;
  text-align: right;
}
.button-group,
.search-form,
.table-wrapper {
  margin-bottom: 12px;
}
</style>