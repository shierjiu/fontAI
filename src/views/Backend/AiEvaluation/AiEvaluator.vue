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
        <!-- <el-form-item label="数据集">
          <el-select v-model="formInline.dataset" placeholder="请选择数据集" clearable style="width: 180px;">
            <el-option v-for="item in datasetList" :key="item.id" :label="item.name" :value="item.id"/>
          </el-select>
        </el-form-item> -->
        <el-form-item label="数据集">
          <el-cascader
            v-model="selectedDataset"
            :options="datasetTreeList"
            :props="cascaderProps"
            clearable
            filterable
            placeholder="请选择数据集"
            style="width: 100%;"
          />
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
    <!-- 评估记录列表 -->
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
    <el-table-column prop="status" label="状态" width="250" class-name="ellipsis-cell">
      <template #default="scope">
        <el-input v-if="scope.row.editing" v-model="scope.row.editData.status" placeholder="请输入"/>
        <span v-else class="ellipsis-cell" :title="scope.row.status">{{ scope.row.status }}</span>
      </template>
    </el-table-column>
    <el-table-column prop="score" label="分数" width="250" class-name="ellipsis-cell">
      <template #default="scope">
        <el-input v-if="scope.row.editing" v-model="scope.row.editData.score" placeholder="请输入"/>
        <span v-else class="ellipsis-cell" :title="scope.row.score">{{ scope.row.score }}</span>
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
        <div v-if="scope.row.editing">
          <el-button link type="primary" size="small" @click="EvaluationRecodeSubmit(scope.row)">提交</el-button>
          <el-button link type="info" size="small" @click="EvaluationRecodeCancel(scope.row)">取消</el-button>
        </div>
        <div v-else>
          <el-button link type="primary" size="small" @click="EvaluationDetailRecord(scope.row)">详情数据</el-button> 
          <el-button link type="primary" size="small" @click="EvaluationRecodeEdit(scope.row)">编辑</el-button>   
        </div>
      </template>
    </el-table-column>
  </el-table>
  <el-pagination class="table-pagination" v-model:current-page="pageNum" v-model:page-size="pageSize" :total="pageTotal" :page-sizes="[10, 50, 100, 500]" layout="total, sizes, prev, pager, next, jumper" @size-change="onSizeChange" @current-change="onPageChange"/>
  
  <!-- 选择评测对象 -->
    <el-dialog v-model="evalDialogVisible" title="评测对象选择" width="20%">
      <el-form :model="evalForm">
        <el-form-item label="智能体">
          <el-select v-model="evalForm.agent_id" multiple placeholder="请选择智能体">
            <el-option v-for="a in agentList" :key="a.id" :label="a.name" :value="a.id"/>
          </el-select>
        </el-form-item>
      <el-form-item label="数据集">
        <el-cascader
            v-model="selectedDataset"
            :options="datasetTreeList"
            :props="cascaderProps"
            clearable
            filterable
            placeholder="请选择数据集"
            @change="handleCascaderChange"
            style="width: 100%;"
          />
          </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="evalDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="startEvaluation">确定</el-button>
      </template>
    </el-dialog>

    <!-- 评测结果 详情-->
    <el-drawer
      v-model="detailDrawerVisible"
      title="详情数据"
      size="80%"
      direction="rtl"
    >
      <el-table :data="resultObj" border style="width: 100%;" class="detail-table">
        <el-table-column
          v-for="(value, key) in resultObj[0] || {}"
          :key="key"
          :prop="key"
          :label="key"
          align="left"
          header-align="left"
          class-name="custom-cell"
          header-class-name="custom-header"
          show-overflow-tooltip
        />
      </el-table>
    </el-drawer>

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
const rawEditing = ref(false)
const recordList = ref([])
const agentList = ref([])  // 智能体列表
const datasetList = ref([]) // 数据集列表
const datasetTreeList = ref([]) // 树结构数据
const datasetMap = ref({}) // 数据集映射
const entityList = ref([]) // 评测对象列表
const detailDrawerVisible = ref(false)
const detailData = ref({})
const resultObj = ref({}) // 这里存放你获取到的对象

const agentMap = computed(() => Object.fromEntries(agentList.value.map(a => [a.id, a.name])))

const formatRecordList = computed(() => {
  return recordList.value.map(item => {
    const entityName = entityMap.value[item.entity] || item.entity
    const datasetName = getDatasetName(item.dataset)
    const agentName = agentMap.value[item.agent] || item.agent
    const create_time = dayjs(item.create_time).format('YYYY-MM-DD HH:mm:ss')
    console.log('create_time创建日期展示方式:', create_time);
    return {
      ...item,
      name: `${entityName}-${datasetName}-${createTime}`,
      datasetName,
      agentName: Array.isArray(item.agent) ? item.agent.join('，') : item.agent || '',
      entityName: item.entity || '',
      create_time: dayjs(item.create_time).format('YYYY-MM-DD HH:mm:ss')
    }
  })
})


const formInline = ref({
  name: '',
  dataset: '',
  agent: '',
  entity: '',
  stream: 'false'
})

// 分页
const pageSize = ref(20) // 或更大，确保能获取全部数据
const pageNum = ref(1)
const pageTotal = ref(0)
const pageSizeDetail = ref(20) // 或更大，确保能获取全部数据
const pageNumDetail = ref(1)
const pageTotalDetail = ref(0)  
 

const detailTableColumns = ref(['question','answer','contexts','ground_truth', '测试机器人', '对话机器人'])
const detailTableData = ref([])

const treeProps = {
  children: 'children',
  label: 'name',
  value: 'id',
  disabled: 'disabled'
}

// 只允许叶子节点可选
function markLeafOnly(nodes) {
  nodes.forEach(node => {
    if (node.children && node.children.length > 0) {
      node.disabled = true
      markLeafOnly(node.children)
    } else {
      node.disabled = false
    }
  })
}

onMounted(() => {
  getAgentList()
  getEntityList()
  getDatasetList()
  getRecordList()
  getDatasetTreeList()
})

async function handleQuery() {
  console.log('=== 开始查询 ===')
  console.log('查询条件:', formInline.value)
  if (!formInline.value.name && !formInline.value.dataset && !formInline.value.agent && !formInline.value.entity) {
      // 没有任何查询条件，查全部
      await getRecordList();
      return;
    }

  try {
   

    const filters = [
      {
        field: 'name',
        rule: 'contains',
        value: formInline.value.name?.trim()
      },
      {
        field: 'dataset',
        rule: 'is',
        value: formInline.value.dataset
      },
      {
        field: 'agent',
        rule: 'is',
        value: formInline.value.agent
      },
      {
        field: 'entity',
        rule: 'is',
        value: formInline.value.entity
      }
      
    ]
    

    const params = {
      pageNum:  pageNum.value,
      pageSize: pageSize.value,
      // pageEnable: true,
      pageRule: filters.filter(rule => rule.value)
    };
    
    
    console.log('查询参数:', params)
    const res = await AiGenerateEvaluation.postEvaluationHistoryList(params)
    console.log('查询结果:', res)
    console.log('后端原始数据:', res.data.data.data)
   
    if (res.status === 200) {
      // 更新表格数据
      recordList.value = res.data.data?.data || [];
      // 更新分页信息
      pageTotal.value = res.data.data?.total || 0;
      pageNum.value = 1; // 保持分页器同步

      ElMessage.success('查询成功')

    } else {
      ElMessage.error('查询失败：' + (res.data?.message || '未知错误'))
    }
    return res;
  } catch (error) {
    console.error('查询过程发生错误:', error)
    // ElMessage.error('查询失败：' + error.message)
    return null
  }
  console.log('=== 查询结束 ===')
}

// 重置方法
const handleReset = () => {
  console.log('=== 开始重置 ===')
  formInline.value = {name : ''}
  formInline.value = {dataset: ''}
  formInline.value = {agent: ''}
  formInline.value = {entity: ''}
  
  handleQuery()
  console.log('=== 重置结束 ===')
}


async function openEvaluationDialog() {
  evalDialogVisible.value = true
  
}

// 获取评估器历史记录
async function getRecordList() {

  const res = await AiGenerateEvaluation.postEvaluationHistoryList()
  console.log('接口返回:', res)
  // 检查实际数据结构
  recordList.value = res.data.data.data || res.data.data.list || []
  pageTotal.value = res.data.data.total || 0
  console.log('1-列表获得评估的记录:', recordList.value)
}

// 获取评估器历史记录详情
async function getRecordDetailList() {
  const res = await AiGenerateEvaluation.postEvaluationHistoryDetailList({
     record_id: recordList.value[0].id 
    })

    detailTableData.value = res.data.data.data || []
    pageTotalDetail.value = res.data.data.total || 0
  console.log('获得评估的记录详情:', res);
}

// 数据集列表树展示
async function getDatasetTreeList() {
  const res = await AiGenerateEvaluation.postDatasetTreeList({ pageEnable: false })
  if (res.status === 200) {
    datasetTreeList.value = res.data.data.data || []
    datasetTreeList.value.forEach(item => {
      console.log('树节点:', { id: item.id, name: item.name, parent_id: item.parent_id })
    })

    console.log('数据集树列表:', datasetTreeList.value)
    console.log('数据集树列表类型:', typeof datasetTreeList.value)
  } else {
    datasetTreeList.value = []
  }
}


//获得数据集的映射关系 ， 数据集id 和 数据集名称
async function getDatasetList() {
  const res = await AiGenerateEvaluation.postDatasetItemFileList({ pageEnable: false })
  datasetList.value = res.data.data.data.map(item => ({
    id: item.id,
    name: item.name
  }))
  datasetMap.value = Object.fromEntries(datasetList.value.map(item => [String(item.id), item.name]))
  console.log('数据集列表:', datasetList.value);
}
// 获取评测对象的名称
function getDatasetName(datasetId) {
  if (!datasetId) return ''
  return (
    datasetMap.value[String(datasetId)] ||
    (datasetList.value.find(item => String(item.id) === String(datasetId))?.name ?? '')
  )
}


async function onSizeChange(val) {
  pageSize.value = val
  if (pageNum.value <= Math.ceil(pageTotal.value / pageSize.value)) {
    // 判断页码存在，不存在时会自动触发onPageChange
    await  getRecordList() 
  }
}

async function onPageChange(val) {
  pageNum.value = val
  await getRecordList() 
}


async function onSizeChangeDetail(val) {
  pageSize.value = val
  if (pageNum.value <= Math.ceil(pageTotal.value / pageSize.value)) {
    // 判断页码存在，不存在时会自动触发onPageChange
    await  getRecordDetailList() 
  }
}

async function onPageChangeDetail(val) {
  pageNum.value = val
  await getRecordDetailList() 
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
    // const datasetId = evalForm.value.dataset_id;
    const datasetId = selectedDataset.value;

    // 打印确认
    console.log('1-最后agent的值:', agentIds, Array.isArray(agentIds) ? 'array' : typeof agentIds);
    console.log('1-最后datasetId的值:', datasetId, typeof datasetId);

    // 组装参数
    const params = {
        agent: agentIds,
        dataset: datasetId,
    };
    console.log('1-组装参数为:', params);
    
    const res = await AiGenerateEvaluation.generateEvaluationRecordResult(params)
    console.log('3-获得评估的记录结果分数:', res);
    ElMessage.success('评测任务已提交，稍后可在历史记录中查看结果');
    evalDialogVisible.value = false;
    await getRecordList();
  } catch (error) {
    console.error('[开始评测] generateEvaluationRecord 异常:', error);
    ElMessage.error('评测任务提交失败');
  } finally {
    isEvaluating.value = false;
  }
}




async function EvaluationRecodeEdit(row) {
  console.log('EvaluationRecodeEdit:', row);
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
      dataset: row.dataset,
      agent: String(row.agent),
      status: row.status,
      entity: row.entity,
      create_time: row.create_time,
      score: row.score
    }
    row.editing = true
  }
}




// 提交评测记录分数
async function EvaluationRecodeSubmit(row) {
  const data = row.editData
  const res = await AiGenerateEvaluation.postEvaluationHistoryInfo(data)
  if (res.status === 200) {
    ElNotification({
      message: res.data.message,
      type: res.data.code,
    })
    await  getRecordList()
    rawEditing.value = false
  }
}




// 取消评测记录分数

async function EvaluationRecodeCancel(row) {
  if (row.id) {
    row.editing = false
  } else {
    const index = recordList.value.indexOf(row)
    if (index !== -1) {
      recordList.value.splice(index, 1)
    }
  }
  rawEditing.value = false
}



// 详情页各评分提交
async function EvaluationRecodeDetailSubmit(row) {
  const data = row.editData
  const res = await AiGenerateEvaluation.postEvaluationHistoryDetailInfo(data)
  if (res.status === 200) {
    ElNotification({
      message: res.data.message,
      type: res.data.code,
    })
    await  getRecordDetailList()
    rawEditing.value = false
  }
}

// 取消评测记录分数

async function EvaluationRecodeDetailCancel(row) {

  console.log('EvaluationRecodeDetailCancel:', row);
} 


// 打开评估详情页面

// 获取评估的记录详情中的record_id
async function EvaluationDetailRecord(row) {
  console.log('评做器的ROW记录EvaluationDetailRecord:', row);
  try {
    const res = await AiGenerateEvaluation.postEvaluationHistoryDetailList({ record: row.id })
    console.log('获取到的列表记录:', res);
    const arr = Array.isArray(res.data?.data) ? res.data.data: []
    console.log('获取到的arr:', arr);
    // 解析每一项的 result 字段
    resultObj.value = arr.map(item => {
      let resultObj = {}
      try {
        resultObj = JSON.parse(item.result)
      } catch (e) {}
      return resultObj
    })
    detailDrawerVisible.value = true
    console.log('resultObj获取到的结果对象的值 :', resultObj.value);
  } catch (e) {
    ElMessage.error('获取详情失败')
  }
}

const selectedDataset = ref(null)

// 级联选择器配置，只能选中叶子节点
const cascaderProps = {
  value: 'id',
  label: 'name',
  children: 'children',
  checkStrictly: false, // 只允许选中叶子节点
  emitPath: false,      // 只返回叶子节点 id
  expandTrigger: 'click', // 点击展开子菜单
  disabled: 'disabled',   // 支持节点禁用
}

// 选中事件
function handleCascaderChange(val) {
  console.log('选中的数据集id:', val)
}

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

.table-pagination {
  padding-top: 10px;
}

.detail-table .el-table th {
  background: #fafbfc;
  font-weight: bold;
  color: #333;
  font-size: 15px;
}
.detail-table .el-table td {
  text-align: left;
  font-size: 14px;
  color: #222;
  padding: 10px 8px;
}
.detail-table .el-button--text {
  color: #409EFF;
  font-size: 14px;
  padding: 0 6px;
}
.detail-table .el-table .el-button--text:hover {
  text-decoration: underline;
}

.detail-table .el-table__cell {
  max-width: 300px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
