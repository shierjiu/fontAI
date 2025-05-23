<template>
  <div class="dataset-container">
     <div class="button-group">
        <el-button class="headerButton" type="primary" plain @click="openEvaluationDialog">开始评测</el-button>
      </div>

     <div class="search-form">
      <el-form :inline="true" :model="formInline" class="demo-form-inline">
        <el-form-item label="名称">
          <el-input v-model="formInline.name" placeholder="请输入名称" clearable style="width: 180px;"/>
        </el-form-item>
        <el-form-item label="数据集">
          <el-select v-model="formInline.dataset" placeholder="请选择数据集" clearable style="width: 180px;">
            <el-option v-for="item in datasetList" :key="item.id" :label="item.name" :value="item.id"/>
          </el-select>
        </el-form-item>
        <el-form-item label="智能体">
          <el-select v-model="formInline.agent" placeholder="请选择智能体" clearable style="width: 180px;">
            <el-option v-for="item in agentList" :key="item.id" :label="item.name" :value="item.id"/>
          </el-select>
        </el-form-item>
        <el-form-item label="评测对象">
          <el-select v-model="formInline.entity" placeholder="请选择评测对象" clearable style="width: 180px;">
            <el-option v-for="item in entityList" :key="item.id" :label="item.name" :value="item.id"/>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleQuery">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <el-table :data="recordList" border style="width: 100%">
    <el-table-column prop="name" label="名称" width="250" class-name="ellipsis-cell">
      <template #default="scope">
        <el-input v-if="scope.row.editing" v-model="scope.row.editData.name" placeholder="请输入"/>
        <span v-else class="ellipsis-cell" :title="scope.row.name">{{ scope.row.name }}</span>
      </template>
    </el-table-column>
    <el-table-column prop="dataset" label="数据集" width="250" class-name="ellipsis-cell">
      <template #default="scope">
        <el-input v-if="scope.row.editing" v-model="scope.row.editData.dataset" placeholder="请输入"/>
        <span v-else class="ellipsis-cell" :title="scope.row.dataset">{{ scope.row.dataset }}</span>
      </template>
    </el-table-column>
    <el-table-column prop="agent" label="智能体" width="250" class-name="ellipsis-cell">
      <template #default="scope">
        <el-input v-if="scope.row.editing" v-model="scope.row.editData.agent" placeholder="请输入"/>
        <span v-else class="ellipsis-cell" :title="scope.row.agent">{{ scope.row.agent }}</span>
      </template>
    </el-table-column>
    <el-table-column prop="entity" label="评测对象" width="250" class-name="ellipsis-cell">
      <template #default="scope">
        <el-input v-if="scope.row.editing" v-model="scope.row.editData.entity" placeholder="请输入"/>
        <span v-else class="ellipsis-cell" :title="scope.row.entity">{{ scope.row.entity }}</span>
      </template>
    </el-table-column>
    <el-table-column prop="create_time" label="评测时间" width="250" class-name="ellipsis-cell">
      <template #default="scope">
        <span class="ellipsis-cell" :title="scope.row.create_time">{{ scope.row.create_time }}</span>
      </template>
    </el-table-column>
    <el-table-column label="操作" width="200" fixed="right">
      <template #default="scope">
          <el-button link type="primary" size="small" @click="EvaluationObjectEditEnable(scope.row)">详情数据</el-button>   
      </template>
    </el-table-column>
  </el-table>
    <!-- #选择评测对象 -->
    <el-dialog v-model="evalDialogVisible" title="评测对象选择" width="20%">
      <el-form :model="evalForm">
        <el-form-item label="智能体">
          <el-select v-model="evalForm.agent_id" multiple placeholder="请选择智能体">
            <el-option v-for="a in agentList" :key="a.id" :label="a.name" :value="a.id"/>
          </el-select>
        </el-form-item>
        <el-form-item label="数据集">
          <el-select v-model="evalForm.dataset_id">
            <el-option v-for="d in datasetList" :key="d.id" :label="d.name" :value="d.id"/>
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="evalDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="startEvaluation">确定</el-button>
      </template>
    </el-dialog>
    <!-- 评测结果 详情-->
 
    <el-dialog v-model="detailDialogVisible" title="详情数据" width="80%">
      <el-table :data="detailTableData">
        <el-table-column prop="question" label="标准问题" />
        <el-table-column prop="answer" label="标准答案" />
        <el-table-column prop="contexts" label="标准上下文" />
        <el-table-column prop="ground_truth" label="标准得分" />
        <el-table-column prop="测试机器人" label="测试机器人得分" />
        <el-table-column prop="对话机器人" label="对话机器人得分" />
      </el-table>
      <template #footer>
        <el-button @click="detailDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>

  </div>
</template>

<script setup>
import { ElNotification, ElMessage } from 'element-plus';
import { ref, computed, onMounted } from 'vue';
// import { api } from '../../api';
import * as AiGenerateEvaluation from "@/api/AiEvaluation"
import * as AiServer from "@/api/AiServer"
import dayjs from 'dayjs'
import AiEvaluationTarget from './AiEvaluationTarget.vue';

const evalDialogVisible = ref(false)
const evalForm = ref({ agent_id: [], entity_id: '', dataset_id: '' })
const isEvaluating = ref(false)
const detailList = ref([]) // 详情数据
const tableColumns = computed(() => {
  if (!detailList.value.length) return []
  // 取所有 result 的 key 并去重
  const keys = new Set()
  detailList.value.forEach(item => {
    Object.keys(item.result || {}).forEach(k => keys.add(k))
  })
  return Array.from(keys)
})
const recordList = ref([]) // 后端返回的原始数据
const agentList = ref([])  // 智能体列表
const datasetList = ref([])// 数据集列表
const datasetMap = ref({})// 数据集映射
const entityList = ref([]) // 评测对象列表
const detailDialogVisible = ref(false)
const detailData = ref({})

const agentMap = computed(() => Object.fromEntries(agentList.value.map(a => [a.id, a.name])))

const formatRecordList = computed(() => {
  return recordList.value.map(item => {
    const entityName = entityMap.value[item.entity] || item.entity
    const datasetName = getDatasetName(item.dataset)
    const agentName = agentMap.value[item.agent] || item.agent
    const createTime = dayjs(item.create_time).format('YYYY-MM-DD HH:mm:ss')
    return {
      ...item,
      name: `${entityName}-${datasetName}-${createTime}`,
      datasetName,
      agentName: Array.isArray(item.agent) ? item.agent.join('，') : item.agent || '',
      entityName: item.entity || '',
      createTime: dayjs(item.create_time).format('YYYY-MM-DD HH:mm:ss')
    }
  })
})


const formInline = ref({
  name: '',
  dataset: '',
  agent: '',
  entity: '',
})

const pageSize = ref(100) // 或更大，确保能获取全部数据
const pageNum = ref(1)
const pageTotal = ref(0)

const detailTableColumns = ref(['question', '测试机器人', '对话机器人'])
const detailTableData = ref([])

// 获取评估器历史记录
async function getRecordList() {
  const res = await AiGenerateEvaluation.postEvaluationHistoryList({ pageEnable: true, pageSize: 100, pageNum: 1 })
  recordList.value = res.data.data.data
  console.log('列表获得评估的记录:', recordList.value);
}

// 获取评估器历史记录详情
async function getRecordDetailList() {
  const res = await AiGenerateEvaluation.postEvaluationHistoryDetailList({ record_id: recordList.value[0].id })
  console.log('获得评估的记录详情:', res);
}

//获得数据集的映射
async function getDatasetList() {
  const res = await AiGenerateEvaluation.postDatasetItemList({ pageEnable: true, pageSize: 100, pageNum: 1 })
  datasetList.value = res.data.data.data.map((item, idx) => ({
    id: item.id,
    name: item.name || item.dataset_name || item.title
  }))
  datasetMap.value = Object.fromEntries(datasetList.value.map(item => [String(item.id), item.name]))
}
// 获取评测对象的名称
function getDatasetName(datasetId) {
  if (!datasetId) return ''
  return (
    datasetMap.value[String(datasetId)] ||
    (datasetList.value.find(item => String(item.id) === String(datasetId))?.name ?? '')
  )
}

// 获取评测对象的方法
async function getEntityList() {
  // const data = {pageEnable: true, pageSize: 100, pageNum: 1}
  // const res = await AiGenerateEvaluation.postEntityList(data)
  // entityList.value = res.data.data.data
  const res = await AiGenerateEvaluation.postEvaluationObjectList({ pageEnable: true, pageSize: 100, pageNum: 1 })
  entityList.value = res.data.data.data
}

// 获取智能体名称
async function getAgentList() {
  const res = await AiServer.postAgentList({ pageEnable: true, pageSize: 100, pageNum: 1 })
  agentList.value = res.data.data.data
  console
}


// 开始评测
async function startEvaluation() {
  isEvaluating.value = true
  try {
    // 假设 evalForm.value.agent_id 是 {0: 2, 1: 3} 这种对象
    const agentIdObj = evalForm.value.agent_id;
    // 取出所有 value，组成数组
    const agentIds = Object.values(agentIdObj);
    // 单个数据集id
    const datasetId = evalForm.value.dataset_id;
    +

    // 打印确认
    console.log('1-最后agent的值:', agentIds, Array.isArray(agentIds) ? 'array' : typeof agentIds);
    console.log('1-最后datasetId的值:', datasetId, typeof datasetId);

    // 组装参数
    const params = {
      agent: agentIds,
      dataset: datasetId
    };

    // 调用后端接口,获得评估的记录
    // const res = await AiGenerateEvaluation.postEvaluationHistoryList(JSON.stringify(params));
    // const res = await AiGenerateEvaluation.generateEvaluationRecord(params)
    // console.log('2-获得评估的记录:', res);
    // 把返回的record_id传给generateEvaluationRecordResult 获得评估的记录详情
    
    const res = await AiGenerateEvaluation.generateEvaluationRecordResult(params)
    console.log('3-获得评估的记录结果分数:', res);
    ElMessage.success('评测任务已提交，稍后可在历史记录中查看结果');
    evalDialogVisible.value = false;
    await getRecordList();
  } catch (error) {
    console.error('[startEvaluation] generateEvaluationRecord 异常:', error);
    ElMessage.error('评测任务提交失败');
  } finally {
    isEvaluating.value = false;
  }
}

function openEvaluationDialog() {
  evalDialogVisible.value = true
}

// 打开评估详情页面
// 获取评估的记录详情中的record_id
async function EvaluationObjectEditEnable(row) {
  try {
    const res = await AiGenerateEvaluation.postEvaluationHistoryDetailList({ record_id: row.id })
    console.log('res:', res);
    const arr = Array.isArray(res.data.data?.data) ? res.data.data.data : []
    console.log('arr:', arr);
    // 只取你关心的字段
    detailTableData.value = arr.map(item => {
      let resultObj = {}
      try {
        resultObj = JSON.parse(item.result)
        console.log('resultObj:', resultObj);
      } catch (e) {}
      return {
        question: resultObj.question ?? '',
        answer: resultObj.answer ?? '',
        contexts: resultObj.contexts ?? '',
        ground_truth: resultObj.ground_truth ?? '',
        测试机器人: resultObj['测试机器人'] ?? '',
        对话机器人: resultObj['对话机器人'] ?? ''
      }
    })
    detailDialogVisible.value = true
  } catch (e) {
    ElMessage.error('获取详情失败')
  }
}

onMounted(() => {
  getAgentList()
  getEntityList()
  getDatasetList()
  getRecordList()
})


</script>

<style scoped>
.dataset-container {
  display: flex;
  flex-direction: column; /* 让元素从上到下排列 */
  gap: 20px;
  padding: 20px;
  height: 100%;
}

.search-form {
  flex: 0 1 auto; /* 使搜索框部分自适应大小 */
}

.table-container {
  width: 100%; /* 确保表格占满父容器的宽度 */
}

.custom-header {
  font-weight: bold;
  background: #fafbfc;
  color: #333;
  font-size: 15px;
}
.custom-cell {
  text-align: left;
  font-size: 14px;
  color: #222;
}
.el-table th, .el-table td {
  padding: 10px 8px;
}
.el-button--text {
  color: #409EFF;
  font-size: 14px;
  padding: 0 6px;
}
.el-table .el-button--text:hover {
  text-decoration: underline;
}
</style>
