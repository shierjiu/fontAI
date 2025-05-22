<template>
  <div class="dataset-container">
    <div class="left-panel">
      
      <div class="tree-header">
        <el-button type="primary" plain @click="handleAdd({ level: 0 })">新增节点</el-button>
        <el-button type="primary" plain @click="handleEdit({ level: 0 })">编辑节点</el-button>
        <el-button type="danger" plain @click="handleDelete(null, { level: 0 })">删除节点</el-button>
      </div>
      <div class="tree-container">
      
      </div>
    </div>

    
    <div class="right-panel">

      <statistic-card />
      <div class="button-group">
        <el-button class="headerButton" type="primary" plain @click="addRow">新增</el-button>
        <el-button class="headerButton" type="primary" plain @click="addRow">一键更新</el-button>
        <el-button class="headerButton" type="primary" plain @click="addRow">数据导入</el-button>
        <el-button class="headerButton" type="primary" plain @click="addRow">数据导出</el-button>
      </div>
      <div class="search-form">
        <el-form :inline="true" :model="formInline" class="demo-form-inline">
          <el-form-item label="标准答案">
            <el-input v-model="formInline.ground_truth" placeholder="请输入标准答案" clearable />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleQuery">查询</el-button>
            <el-button @click="handleReset">重置</el-button>
          </el-form-item>
        </el-form>
      </div>


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
            <span v-else>{{ scope.row.update_time }}</span>
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
        </div>

        <!-- 树节点编辑对话框 -->
        <el-dialog v-model="dialogVisible" :title="dialogType === 'add' ? '新增节点' : '编辑节点'" width="30%">
          <el-form :model="treeForm" label-width="80px">
            <el-form-item label="节点名称">
              <el-input v-model="treeForm.name" placeholder="请输入节点名称" />
            </el-form-item>
            <el-form-item v-if="dialogType === 'add' && !hasRootNode" label="父节点">
              <el-input v-model="treeForm.parentName" disabled />
            </el-form-item>
            <el-form-item v-if="dialogType === 'add' && hasRootNode" label="父节点">
            <el-cascader
              v-model="treeForm.parentPath"
              :options="treeData"
              :props="cascaderProps"
              placeholder="请选择父节点"
              @change="handleParentPathChange"
            />
          </el-form-item>

            <el-form-item v-if="currentNodeLevel === 3" label="附件">
              <el-select v-model="treeForm.file" filterable placeholder="请选择附件" @change="handleFileChange">
                <el-option v-for="item in fileList" :key="item.id" :label="item.name" :value="item.id" />
              </el-select>
            </el-form-item>
          </el-form>
          <template #footer>
            <span class="dialog-footer">
              <el-button @click="dialogVisible = false">取消</el-button>
              <el-button type="primary" @click="TreehandleSubmit">确定</el-button>
            </span>
          </template>
        </el-dialog>
          
        
        <chat-drawer v-model:visible="chatDrawerVisible" v-model:agent="chatDrawerAgent" v-model:options="chatDrawerOptions"/>

    <!-- </el-dialog> -->
  </div>
</template>

<script setup>
import {onMounted, ref} from "vue"
import * as AiEvaluation from "@/api/AiEvaluation"
import {ElNotification,ElMessage, ElMessageBox} from "element-plus"
import {InfoFilled} from "@element-plus/icons-vue"


const pageNum = ref(1)
const pageSize = ref(10)
const pageTotal = ref(0)
const datasetList = ref([])  // 改名以更准确反映数据内容
// const nodelList = ref([])
const rawEditing = ref(false)
const entityList = ref([])
const tagList = ref([])

const datasetTreeList = ref([]) 
// 表格数据
// const tableData = ref([])
const currentPage = ref(1)
// const pageSize = ref(10)


const treeRef = ref(null)
const treeData = ref([])
const dialogVisible = ref(false)
const dialogType = ref('add')
const currentNodeLevel = ref(1)
const fileList = ref([])
const selectedNode = ref(null)
const defaultFile = ref(null)  // 添加默认文件引用
const hasRootNode = ref(false)
const treeForm = ref({
  id: null,
  name: '',
  parent_id: '',
  parentName: '',
  file: '0'
})

const defaultProps = {
  children: 'children',
  label: 'name'
}


const cascaderProps = {
  value: 'id',
  label: 'name',
  children: 'children',
  checkStrictly: true,
  emitPath: true
}

const formInline = ref({

  ground_truth: ''  // 添加标准答案字段
})



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
    // getDatasetTreeList(),
    getEntityList(),
    getTagList(),
    getFileList(),// 添加获取文件列表
    getTreeData() 
  ])
})


async function handleQuery() {
  console.log('=== 开始查询 ===')
  console.log('查询条件:', formInline.value)

  try {
    if (!formInline.value.ground_truth) {
        const res = await getDatasetItemList();
        if (res.status === 200) {
          datasetList.value = res.data.data?.data || [];
          pageTotal.value = res.data.data?.total || 0;
        }
        return res;
      }

    const params = {
      pageNum: currentPage.value,
      pageSize: pageSize.value,
      pageEnable: true,
      pageRule: [

        { 
          field: 'ground_truth', 
          rule: 'contains',  // 确保实际请求参数也使用contains规则
          value: formInline.value.ground_truth?.trim() // 添加trim处理
        }
       
      ].filter(rule => rule.value)
    };
    
    
    console.log('查询参数:', params)
    const res = await AiEvaluation.postDatasetItemList(params)
    console.log('查询结果:', res)
    
    if (res.status === 200) {
      // 更新表格数据
      datasetList.value = res.data.data?.data || [];
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
  formInline.value = {
    ground_truth: ''
  }
  // 重置后自动查询
  handleQuery()
  console.log('=== 重置结束 ===')
}



function checkRootNode() {
  hasRootNode.value = treeData.value && treeData.value.length > 0
}


async function getFileList() {
  try {
    const res = await AiEvaluation.postFileList({ pageEnable: false })
    if (res.status === 200) {
      fileList.value = res.data.data.data
      // 设置默认文件
      if (fileList.value.length > 0) {
        defaultFile.value = fileList.value[0]
      }
    }
  } catch (error) {
    ElNotification.error('获取文件列表失败：' + error.message)
  }
}

// 处理文件选择变化的方法
function handleFileChange(value) {
  const selectedFile = fileList.value.find(file => file.id === value)
  if (selectedFile) {
    treeForm.value.fileName = selectedFile.name
  }
}

// // 获取树形数据
// async function getTreeData() {
//   try {
//     const res = await AiEvaluation.postDatasetTreeList({ pageEnable: false })
//     if (res.status === 200) {
//       treeData.value = res.data.data.data
//     }
//   } catch (error) {
//     ElNotification.error('获取树形数据失败：' + error.message)
//   }
// }

// 获取文件列表
async function getTreeData() {
  try {
    console.log('=== 开始获取树形数据 ===')
    const params = { pageEnable: false }
    console.log('请求参数:', params)
    
    const res = await AiEvaluation.postDatasetTreeList(params)
    console.log('API返回数据:', res)
    
    if (res.status === 200) {
      // 检查数据结构
      console.log('原始数据结构:', {
        data: res.data,
        dataData: res.data.data,
        dataDataData: res.data.data.data
      })
      
      // 确保数据是数组格式
      const rawData = res.data.data.data || []
      console.log('原始树形数据:', rawData)
      
      // 处理数据，确保每个节点都有必要的属性
      const processedData = rawData.map(node => {
        // 递归处理子节点
        const processNode = (node, level = 1) => {
          const processedNode = {
            id: node.id,
            name: node.name,
            parent_id: node.parent_id,
            level: level,
            children: [],
            parentName: level === 1 ? '根节点' : node.parentName || ''
          }
          
          // 处理子节点
          if (node.children && Array.isArray(node.children)) {
            processedNode.children = node.children.map(child => processNode(child, level + 1))
          }
          
          console.log(`处理节点 [${level}级]:`, processedNode)
          return processedNode
        }
        
        return processNode(node)
      })
      
      console.log('处理后的树形数据:', processedData)
      treeData.value = processedData
      
      // 检查根节点
      checkRootNode()
      console.log('当前树形数据:', treeData.value)
    } else {
      console.warn('获取数据失败，状态码:', res.status)
      console.warn('错误信息:', res.data)
    }
  } catch (error) {
    console.error('获取树形数据失败:', error)
    console.error('错误详情:', {
      message: error.message,
      stack: error.stack,
      response: error.response?.data
    })
    ElNotification.error('获取树形数据失败：' + error.message)
  }
  console.log('=== 获取树形数据结束 ===')
}


// 处理节点点击
function handleNodeClick(data) {
  selectedNode.value = data
  // 只有三级节点才显示数据列表
  if (data.level === 3) {
    getDatasetItemList({ parent_id: data.id })
  } else {
    // 清空数据列表
    datasetList.value = []
    pageTotal.value = 0
  }
}

// 添加文件列表相关的响应式变量
const treeFileList = ref([])

// 获取文件列表的方法
async function getTreeFileList() {
  try {
    console.log('开始获取文件列表...')
    const res = await AiEvaluation.postFileList({ pageEnable: false })
    if (res.status === 200) {
      treeFileList.value = res.data.data.data
      console.log('获取到的文件列表:', treeFileList.value)
      // 设置默认文件
      if (treeFileList.value.length > 0) {
        defaultFile.value = treeFileList.value[0]
        console.log('设置默认文件:', defaultFile.value)
      }
    }
  } catch (error) {
    console.error('获取文件列表失败:', error)
    ElNotification.error('获取文件列表失败：' + error.message)
  }
}

// 新增节点
async function handleAdd(data) {
  console.log('=== 开始添加节点 ===')
  if (data.level >= 3) {
    console.warn('不能添加超过三级的节点')
    ElNotification.warning('不能添加超过三级的节点')
    return
  }

  dialogType.value = 'add'
  currentNodeLevel.value = data.level + 1
  console.log('当前节点级别:', currentNodeLevel.value)
  
  const timestamp = new Date().getTime()
  const randomNum = Math.floor(Math.random() * 1000)
  const uniqueId = `${timestamp}_${randomNum}`
  console.log('生成的唯一ID:', uniqueId)

  // 获取文件列表
  console.log('开始获取文件列表...')
  await getTreeFileList()
  console.log('文件列表获取完成:', treeFileList.value)

  treeForm.value = {
    id: null,
    name: '',
    parent_id: uniqueId,
    parentName: data.name || '根节点',
    parentPath: [],
    file: currentNodeLevel.value === 3 ? (treeFileList.value[0]?.id || '') : '0',
    fileName: currentNodeLevel.value === 3 ? (treeFileList.value[0]?.name || '') : ''
  }
  console.log('初始化表单数据:', treeForm.value)

  if (data.id) {
    const parentPath = getNodePath(treeData.value, data.id)
    if (parentPath) {
      treeForm.value.parentPath = parentPath
      treeForm.value.parent_id = data.id
      treeForm.value.parentName = data.name
      console.log('设置父节点路径:', parentPath)
    }
  }

  dialogVisible.value = true
  console.log('=== 添加节点结束 ===')
}

// 处理添加节点
function handleEdit(data) {
  dialogType.value = 'edit'
  currentNodeLevel.value = data.level
   // 查找对应的文件
  const file = fileList.value.find(f => f.id === data.file)
  treeForm.value = {
    id: data.id,
    name: data.name,
    parent_id: data.parent_id || '',
    parentName: data.parentName || '',
    file: data.file || (defaultFile.value ? defaultFile.value.id : '0'),  // 使用默认文件的ID
    fileName: file ? file.name : '' // 添加这行
 
  }
  dialogVisible.value = true
}

// 处理删除节点
async function handleDelete(node, data) {
  try {
    // 检查是否有子节点
    if (data.children && data.children.length > 0) {
      ElNotification.warning('该节点下还有子节点，不能删除')
      return
    }

    await ElMessageBox.confirm('确认删除该节点吗？', '提示', {
      type: 'warning'
    })
    const res = await AiEvaluation.deleteDatasetTreeInfo({ id: data.id })
    if (res.status === 200) {
      ElNotification.success('删除成功')
      await getTreeData()
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElNotification.error('删除失败：' + error.message)
    }
  }
}

// 处理提交
// async function handleSubmit() {

//     if (!treeForm.value.name) {
//       ElNotification.warning('请输入节点名称')
//       return
//     }

//     if (!treeForm.value.parent_id) {
//       ElNotification.warning('父节点ID不能为空')
//       return
//     }

//       // 只有三级节点才需要文件
//     if (currentNodeLevel.value === 3 && (!treeForm.value.file || treeForm.value.file === '0')) {
//       ElNotification.warning('请选择附件')
//       return
//     }

//     const data = {
//       id: treeForm.value.id,
//       name: treeForm.value.name,
//       parent_id: treeForm.value.parent_id,
//       file: currentNodeLevel.value === 3 ? treeForm.value.file : '0'
//     }

//     const res = await AiEvaluation.postDatasetTreeInfo(data)
//     if (res.status === 200) {
//       ElNotification.success(dialogType.value === 'add' ? '添加成功' : '修改成功')
//       dialogVisible.value = false
//       await getTreeData()
      
//       if (dialogType.value === 'add' && selectedNode.value) {
//         // 只有三级节点才刷新数据列表
//         if (selectedNode.value.level === 3) {
//           await getDatasetItemList({ parent_id: selectedNode.value.id })
//         }
//       }
//     }

// }

async function TreehandleSubmit() {


  if (!treeForm.value.name) {
    console.warn('验证失败: 节点名称为空')
    ElNotification.warning('请输入节点名称')
    return
  }

  if (!treeForm.value.parent_id) {
    console.warn('验证失败: 父节点ID为空')
    ElNotification.warning('请选择父节点')
    return
  }

  try {
    // 获取文件列表
    console.log('开始获取文件列表...')
    await getTreeFileList()
    console.log('文件列表获取完成:', treeFileList.value)

    // 获取默认文件ID
    let fileId = '1'
    if (currentNodeLevel.value === 3) {
      if (treeFileList.value && treeFileList.value.length > 0) {
        fileId = treeFileList.value[0].id
        console.log('使用第一个文件的ID:', fileId)
      } else {
        console.warn('文件列表为空，使用默认值')
      }
    }

    const data = {
      id: treeForm.value.id,
      name: treeForm.value.name,
      parent_id: treeForm.value.parent_id,
      parent_path: treeForm.value.parentPath.join(','),
      file: fileId
    }
    console.log('准备提交的数据:', data)
    console.log('文件ID:', data.file)
    console.log('父节点路径:', data.parent_path)

    console.log('开始调用接口...')
    // 使用 postDatasetTreeInf 方法提交
    const res = await AiEvaluation.postDatasetTreeInfo(data)
    console.log('接口返回数据:', res)
    
    if (res.status === 200) {
      console.log('操作成功，返回数据:', res.data)
      ElNotification.success('操作成功')
      dialogVisible.value = false
      console.log('开始刷新树形数据...')
      await getTreeData()
      console.log('树形数据刷新完成')
    } else {
      console.warn('操作失败，状态码:', res.status)
      console.warn('错误信息:', res.data)
      ElNotification.error('操作失败：' + (res.data?.message || '未知错误'))
    }
  } catch (error) {
    console.error('操作过程发生错误:', error)
    console.error('错误详情:', {
      message: error.message,
      stack: error.stack,
      response: error.response?.data
    })
    ElNotification.error('操作失败：' + error.message)
  }
  console.log('=== 提交表单结束 ===')
}



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
  console.log('API Response:', res)
  if (res.status === 200) {
    datasetList.value = res.data.data.data
    console.log('Dataset List:', datasetList.value)
    pageTotal.value = res.data.data.total
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
    const newDate = {
      question: '',
      ground_truth: '',
      contexts: "",
      answer: "",
      update_time: new Date().toISOString(),
      entity: null,
      tag: null,
      dataset: null,
      editing: true,  // 确保设置为 true
      editData: {
        question: '',
        ground_truth: '',
        contexts: '',
        answer: '',
        update_time: new Date().toISOString(),
        entity: null,
        tag: null,
        dataset: null
      }
    }
  // 确保 datasetList 是响应式数组
  if (!Array.isArray(datasetList.value)) {
      datasetList.value = []
    }

    // 直接添加到列表开头，不调用 getDatasetItemList
    datasetList.value.unshift(newDate)

      
    console.log('New row added:', newDate)  // 添加日志
    console.log('Current datasetList:', datasetList.value)  // 添加日志
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
    const data = {
      id: row.editData.id,
      question: row.editData.question,
      ground_truth: row.editData.ground_truth,
      contexts: row.editData.contexts,
      answer: row.editData.answer,
      update_time: row.editData.update_time,
      entity: row.editData.entity, // 直接使用选择的ID
      tag: row.editData.tag, // 直接使用选择的ID
      dataset: row.editData.dataset // 直接使用选择的ID
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
  const res = await AiEvaluation.deleteDatasetItemInfo({"id": id})
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



</script>

<style scoped>


.dataset-container {
  display: flex;
  gap: 20px;
  padding: 20px;
  height: 100%;
}

.tree-container {
  width: 300px;
  min-width: 300px;
  border-right: 1px solid #dcdfe6;
  padding-right: 20px;
  height: calc(100vh - 200px);
  overflow-y: auto;
  flex: 1;
}



.custom-tree-node {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 14px;
  padding-right: 8px;
  width: 100%;
}

.custom-tree-node .el-button {
  padding: 2px 4px;
  margin-left: 4px;
}

.headerButton {
  margin: 0 0 10px 0;
  margin-right: 20px;  /* 按钮之间的间距 */
}

.table-pagination {
  padding-top: 10px;
}

button-group {
  margin-bottom: 20px;
}



/* 树节点样式 */
:deep(.el-tree-node__content) {
  height: 32px;
}

:deep(.el-tree-node__content:hover) {
  background-color: #f5f7fa;
}

:deep(.el-tree-node.is-current > .el-tree-node__content) {
  background-color: #ecf5ff;
}

/* 确保树形控件在容器中正确显示 */
:deep(.el-tree) {
  background-color: transparent;
}

/* 调整树形控件的缩进 */
:deep(.el-tree-node__children) {
  padding-left: 16px;
}

/* 调整树节点的图标样式 */
:deep(.el-tree-node__expand-icon) {
  color: #909399;
}

:deep(.el-tree-node__expand-icon.expanded) {
  transform: rotate(90deg);
}


.left-panel {
  width: 300px;
  display: flex;
  flex-direction: column;
  border-right: 1px solid #dcdfe6;
  padding-right: 20px;
}

.tree-header {
  margin-bottom: 16px;
  display: flex;
  gap: 10px;
}



.right-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.button-group {
  margin-bottom: 16px;
  display: flex;
  gap: 8px;
}

.load-more {
  margin-top: 10px;
  text-align: center;
  padding: 10px 0;
  border-top: 1px solid #dcdfe6;
}

.table-container { 
  flex: 1; 
  padding: 16px; 
  display: flex; 
  flex-direction: column; 
}
.pagination-container { 
  margin-top: 16px; 
  display: flex; 
  justify-content: flex-end; 
}

</style>