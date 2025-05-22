<template>
  <div class="dataset-container">
    <div class="left-panel">
      
      <div class="tree-header" style="display: flex; flex-direction: row; gap: 10px; align-items: center;">
        <el-aside width="300px" style="padding: 0;">
          <el-button type="primary" plain @click="treeAdd">新增节点</el-button>
          <el-button type="primary" plain @click="treeEdit">编辑节点</el-button>
          <el-button type="danger" @click="confirmDeleteNode">删除节点</el-button>
        </el-aside>
      </div>
      <div class="tree-container">
<el-tree
  ref="treeRef"
  :data="treeData"
  node-key="id"
  :props="{ children: 'children', label: 'name' }"
  highlight-current
  :current-node-key="currentNodeKey"
  @node-click="handleNodeClick"
>
  <template #default="{ node, data }">
    <el-popover trigger="hover" placement="right" width="120">
      <el-space direction="vertical" alignment="stretch" style="width: 100%">
          <el-button type="primary" plain @click="treeAdd">新增节点</el-button>
          <el-button type="primary" plain @click="treeEdit">编辑节点</el-button>
          <el-button type="danger" @click="confirmDeleteNode">删除节点</el-button>
      </el-space>
      <!-- 触发 Popover 的锚点 -->
      <template #reference>
        <span @contextmenu.prevent="showNodeMenu($event, data)">
          {{ data.name }}
        </span>
      </template>
    </el-popover>
  </template>
</el-tree>
      </div>
    </div> 
    
    <div class="right-panel">
      <statistic-card />
      <div class="button-group">
        <el-button class="headerButton" type="primary" plain @click="addRow">新增</el-button>
        <el-select v-model="entityId" placeholder="请选择测试对象" size="small" style="width: 160px; margin-right: 8px">
          <el-option v-for="item in entityList" :key="item.id" :label="item.name" :value="item.id"   />
        </el-select>
        <el-button class="headerButton" type="primary" plain @click="OneclickUpdateAnswer" :loading="isUpdatingAnswer">一键更新</el-button>
        <el-button class="headerButton" type="primary" plain @click="excelImport">数据导入</el-button>
        <el-button class="headerButton" type="primary" plain @click="excelExport">数据导出</el-button>
        <el-button class="headerButton" type="primary" plain @click="fileUpload">知识库</el-button>
      </div>
      <!-- 查询按钮  -->
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
    <!-- 列表 -->
          <div class="table-wrapper" ref="scrollRef">
          <el-table :data="filteredList" border style="width: max-content" ref="tableRef" @selection-change="handleSelectionChange">        
            <el-table-column type="selection" width="55" />
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
            <!-- 添加 dataset 列 -->
              <el-table-column prop="entity" label="评测对象">
                <template #default="scope">
                  <span>{{ getEntityName(scope.row.entity) }}</span>
                </template>
              </el-table-column>
              <el-table-column prop="tag" label="问题标签">
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
            <el-table-column prop="dataset" label="数据集">
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
            <el-table-column label="操作" width="200" fixed="right">
              <template #default="scope">
                <div v-if="scope.row.editing">
                  <el-button link type="primary" size="small" @click="DatasetItemInfoSubmit(scope.row)">提交</el-button>
                  <el-button link type="info" size="small" @click="DatasetItemInfoCancel(scope.row)">取消</el-button>
                </div>
                <div v-else>
                  <el-button link type="primary" size="small" @click="DataSetInfoEditEnable(scope.row)">编辑</el-button>
                  <!-- <el-button link type="primary" size="small" @click="changeChatDrawerVisible(scope.row)">调试</el-button> -->
                  <el-button link type="primary" size="small" @click="DatasetItemDelete(scope.row.id)">删除</el-button>
                  <el-button link type="primary" size="small" @click="UpdateDataItem(scope.row.id)">更新</el-button>
                  <el-button link type="primary" size="small" @click="CopyDataItem(scope.row.id)">复制</el-button>
                </div>
              </template>
            </el-table-column>
          </el-table>
            <el-slider
            v-if="scroll.enabled"
            v-model="scroll.left"
            :min="0"
            :max="scroll.max"
            :step="20"
            class="h-scroll-slider"
            @input="val => scrollRef.value && (scrollRef.value.scrollLeft = val)"
          /> 
          </div>
          <el-pagination class="table-pagination" v-model:current-page="pageNum" v-model:page-size="pageSize" :total="pageTotal" :page-sizes="[10, 50, 100, 500]" layout="total, sizes, prev, pager, next, jumper" @size-change="onSizeChange" @current-change="onPageChange"/>
        </div>

        <!-- 树节点编辑对话框 -->
        <el-dialog v-model="dialogVisible" :title="dialogType === 'add' ? '新增节点' : '编辑节点'" width="20%">
          <el-form :model="treeForm" label-width="80px">
            <el-form-item label="节点名称">
              <el-input v-model="treeForm.name" placeholder="请输入节点名称" />
            </el-form-item>
            <el-form-item v-if="(dialogType === 'add' && hasRootNode) || dialogType === 'edit'" label="父节点">
              <el-cascader
                v-model="treeForm.parentPath"
                :options="treeData"
                :props="cascaderProps"
                placeholder="请选择父节点"
                @change="handleParentPathChange"
              />
            </el-form-item>
            <!-- <el-form-item v-if="(dialogType === 'add' && !hasRootNode) || dialogType === 'edit'" label="父节点">
              <el-input v-model="treeForm.parentName" disabled />
            </el-form-item> -->

            <el-form-item v-if="currentNodeLevel === 3" label="附件">
              <el-select v-model="treeForm.file" filterable placeholder="请选择附件" @change="handleFileChange">
                <el-option v-for="item in fileList" :key="item.id" :label="item.name" :value="item.id" />
              </el-select>
            </el-form-item>
          </el-form>
          <template #footer>
            <span class="dialog-footer">
              <el-button @click="dialogVisible = false">取消</el-button>
              <el-button type="primary" @click="treeEditSubmit">确定</el-button>
            </span>
          </template>
        </el-dialog>
          
        
        <chat-drawer v-model:visible="chatDrawerVisible" v-model:agent="chatDrawerAgent" v-model:options="chatDrawerOptions"/>

    <!-- </el-dialog> -->
    <!-- Excel导入 -->
    <el-drawer v-model="excelDrawerVisible" title="Excel 导入" width="20%" direction="rtl" size="30%" destroy-on-close>
      <el-form :model="multiformData">
        <el-form-item label="选择文件" required>
          <el-upload
            class="knowledgebase-Multi-file-upload"
            drag
            multiple
            :limit="1"
            :auto-upload="false"
            :file-list="multiFiles"
            accept=".xls,.xlsx"
            :on-change="handleMultiChange"
            :on-remove="handleRemove"
            list-type="text"
          >
            <el-icon class="el-icon--upload"><upload-filled /></el-icon>
            <div class="el-upload__text">拖拽文件到此处或<em>点击上传</em></div>
            <template #tip>
              <div class="el-upload__tip">支持Excel格式，单个文件不超过20MB</div>
            </template>
          </el-upload>
        </el-form-item>
        <el-form-item>
          <el-button @click="excelDrawerVisible = false">取消</el-button>
          <el-button type="primary" @click="MultFileonSubmit">开始上传</el-button>
        </el-form-item>
      </el-form>
    </el-drawer> 
        <!-- 文件导入 -->
        <el-drawer v-model="fileDrawerVisible" title="文件导入" width="20%" direction="rtl" size="30%" destroy-on-close>
          <!-- ============ 回显区 ============ -->
           <div style="margin-bottom: 12px;">
  <template v-if="fileNames.length">
    <el-tag
      v-for="(n, i) in fileNames"
      :key="i"
      type="info"
      style="margin: 4px 4px;"
    >
      {{ n }}
    </el-tag>
  </template>
  <template v-else>
    <el-empty description="暂无数据" :image-size="60" />
  </template>
</div>
      <el-form-item label="选择文件" required>
        <el-upload
            class="knowledgebase-Multi-file-upload"
            drag
            multiple
            :limit="1"
            :auto-upload="false"
            :file-list="multiFiles"
            accept=".zip,.tar,.gz"
            :on-change="handleMultiChange"
            :on-remove="handleRemove"
            list-type="text"
          >
            <el-icon class="el-icon--upload"><upload-filled /></el-icon>
            <div class="el-upload__text">拖拽文件到此处或<em>点击上传</em></div>
            <template #tip>
              <div class="el-upload__tip">支持Excel格式，单个文件不超过20MB</div>
            </template>
          </el-upload>
        </el-form-item>
        <el-form-item>
          <el-button @click="fileDrawerVisible  = false">取消</el-button>
          <el-button type="primary" @click="MultFileonSubmit">开始上传</el-button>
          <el-button type="primary" @click="fileExport">开始下载</el-button>
      </el-form-item>
     </el-drawer>

    <!-- 添加树型列表的界面 -->
    <el-dialog v-model="addDialogVisible" title="新增节点">
      <el-form :model="addForm">
        <el-form-item label="节点名称" required>
          <el-input v-model="addForm.name" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="addDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="treeSubmit">确定</el-button>
      </template>
    </el-dialog>

    <!-- 右键菜单 -->
    <el-dropdown
      v-if="contextMenuVisible"
      :style="{ position: 'fixed', left: `${menuX}px`, top: `${menuY}px` }"
      @command="handleMenuCommand"
      @visible-change="val => { if (!val) contextMenuVisible = false }"
    >
      <el-dropdown-menu slot="dropdown">
        <el-dropdown-item command="addChild">添加子节点</el-dropdown-item>
      </el-dropdown-menu>
    </el-dropdown>

  </div>
</template>

<script setup>
import {onMounted, ref, computed,watch,nextTick,reactive,onBeforeUnmount} from "vue"
import * as AiEvaluation from "@/api/AiEvaluation"
import {ElNotification,ElMessage,ElPopconfirm,ElMessageBox} from "element-plus"
import {InfoFilled} from "@element-plus/icons-vue"
import dayjs from 'dayjs'
import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'
import axios from 'axios'
import { OneclickUpdate } from "@/api/AiEvaluation"
import { downloadDatasetFile } from '@/api/AiEvaluation' 

const activeTreeNode = ref({})
const pageNum = ref(1)
const pageSize = ref(10)
const pageTotal = ref(0)
const datasetList = ref([])  // 右侧所有数据
const rawEditing = ref(false)
const entityList = ref([])
const entityId   = ref(null)  // 当前选择的对象 id
const tagList = ref([])
const datasetTreeList = ref([])
const pageList = ref([])
const currentPage = ref(1)
const scrollRef = ref(null)
const currentNodeKey = ref(null)
const treeRef = ref(null)
const treeData = ref([])
const dialogVisible = ref(false)
const dialogType = ref('add')
const currentNodeLevel = ref(1)
const fileList = ref([])
const selectedNode = ref(null)
const defaultFile = ref(null)  // 添加默认文件引用
const hasRootNode = ref(false)
const fileDrawerVisible  = ref(false)
const fileNames= ref([])      //保存回显文件名列表
// 树形结构新增
const addDialogVisible = ref(false)
const addForm = ref({ name: '' })

const excelDrawerVisible = ref(false)
const multiFiles = ref([])
const previewVisible = ref(false)
const previewContent = ref('')
const multiformData = ref({})

const isUpdatingAnswer = ref(false)
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

const scroll = reactive({
  enabled: false,   // 是否需要横向滚动
  max: 0,           // 最大 scrollLeft
  left: 0           // 当前 scrollLeft
})
const cascaderProps = {
  value: 'id',
  label: 'name',
  children: 'children',
  checkStrictly: true,
  emitPath: true,
  disabled: (node, data) => {
    if (dialogType.value === 'edit' && treeForm.value.id) {
      const currentNode = findNodeById(treeData.value, treeForm.value.id)
      if (currentNode) {
        const disabledIds = getDescendantIds(currentNode)
        return disabledIds.includes(data.id)
      }
    }
    return false
  }
}

const formInline = ref({
  question: '',
  ground_truth: '',  // 添加标准答案字段: ''
  tag :'',
  value: {
    request_method: ''
  }
})



// 修改 onMounted 钩子，确保初始化
onMounted(async () => {
  // await getEntityList()
  await getTagList()
  await getEntityList()
  await getDatasetTreeList()
  await getTreeDataList()
  await getDatasetItemList() // 映射表加载完再加载表格
  nextTick(() => {
    refreshScroll()
    scrollRef.value?.addEventListener('scroll', onScroll)
  })
})
onBeforeUnmount(() => {
  window.removeEventListener('resize', refreshScroll)
  scrollRef.value?.removeEventListener('scroll', onScroll)
})
// 查询
async function handleQuery() {
  console.log('=== 开始查询 ===')
  console.log('查询条件:', formInline.value)

  try {
    // 获取标签名
    let tagName = ''
    if (formInline.value.tag !== undefined && formInline.value.tag !== null && formInline.value.tag !== '') {
      const tagObj = tagList.find(item => item.id === formInline.value.tag)
      tagName = tagObj ? tagObj.name : ''
    }

    const filters = [
      {
        field: 'question',
        rule: 'contains',
        value: formInline.value.question?.trim()
      },
      {
        field: 'ground_truth',
        rule: 'contains',
        value: formInline.value.ground_truth?.trim()
      }
    ]
    if (tagName) {
      filters.push({
        field: 'tag',
        rule: 'equals',
        value: tagName
      })
    }

    const params = {
      pageNum:  pageNum.value,
      pageSize: pageSize.value,
      pageEnable: true,
      pageRule: filters.filter(rule => rule.value)
    };
    
    
    console.log('查询参数:', params)
    const res = await AiEvaluation.postDatasetItemList(params)
    console.log('查询结果:', res)
    
    console.log('后端原始数据:', res.data.data.data)
   
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
  formInline.value = {quesiton: ''}
  formInline.value = {ground_truth: ''}
  formInline.value = {tag: ''}
  // 重置选中节点和高亮
  selectedNode.value = null
  currentNodeKey.value = null
  if (treeRef.value && treeRef.value.setCurrentKey) {
    treeRef.value.setCurrentKey(null)
  }
  selectedNode.value = null
  // 重置后自动查询
  handleQuery()
  console.log('=== 重置结束 ===')
}


// 选中根节点
function checkRootNode() {
  hasRootNode.value = treeData.value && treeData.value.length > 0
}

// 获取文件列表
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

// 获取树形数据列表
async function getTreeDataList() {
  const res = await AiEvaluation.postDatasetTreeList({ pageEnable: false })
  if (res.status === 200) {
    const data = res.data.data.data || []
    // 打印每个节点的 id、name、parent_id
    data.forEach(item => {
      // console.log('树节点:', { id: item.id, name: item.name, parent_id: item.parent_id })
    })
    treeData.value = data
  } else {
    treeData.value = []
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


function findNodeById(nodes, id) {
  for (const node of nodes) {
    if (node.id === id) return node
    if (node.children) {
      const found = findNodeById(node.children, id)
      if (found) return found
    }
  }
  return null
}




function treeAdd() {
  // 未选中节点，新增为根节点，parent_id 设为 'root'
  if (!selectedNode.value || !selectedNode.value.id) {
    addForm.value = { name: '', parent_id: Number('root') } // parent_id 临时为 'root'
    addDialogVisible.value = true
    return
  }
  // 选中节点，新增为该节点的子节点
  addForm.value = { name: '', parent_id: selectedNode.value.id }
  addDialogVisible.value = true
}


function treeEdit() {
  if (!selectedNode.value || !selectedNode.value.id) {
    ElMessage.warning('请先选中节点');
    return;
  }
  // 初始化表单数据
  treeForm.value = {
    id: selectedNode.value.id,
    name: selectedNode.value.name,
    parent_id: selectedNode.value.parent_id,
    // 其它字段...
  };
  dialogVisible.value = true;
}




async function treeSubmit() {
  // 打印选中节点和表单
  console.log('treeSubmit - selectedNode:', selectedNode.value)
  console.log('treeSubmit - addForm:', addForm.value)
  // 先获取选中节点id
  let parentId = addForm.value.parent_id
  if (parentId === 'root') {
    // 根节点 parent 赋为自身 name 或其它唯一标识
    parentId = addForm.value.name
  }
  console.log('treeSubmit - parentId to use:', parentId)
  // 组装参数
  const params = {
    name: addForm.value.name,
    parent: parentId,       // 根节点 parent 为自身 name
    // file: addForm.value.file || 1
  };
  // 打印提交参数
  console.log('treeSubmit - 提交参数:', params);
  try {
    const res = await AiEvaluation.postDatasetTreeInfo(params);
    // 打印接口返回
    console.log('treeSubmit - 接口返回:', res);
    if (res.status === 200) {
      ElMessage.success('添加成功');
      addDialogVisible.value = false;
      await getTreeDataList();
    } else {
      ElMessage.error('添加失败');
    }
    getDatasetTreeList()
  } catch (error) {
    // 打印异常
    console.error('treeSubmit - 异常:', error);
    ElMessage.error('添加失败');
  }
}


//获取测评对象
function getEntityName(entity) {
  if (!entity) return '';
  const entityId = typeof entity === 'object' ? entity.id : entity;
  const found = entityList.value.find(item => item.id === entityId);
  return found ? found.name : '';
}

function getTagName(tagId) {
  if (!tagId) return ''
  const tag = tagList.value.find(item => String(item.id) === String(tagId))
  return tag ? tag.name : ''
}

function getDatasetName(datasetId) {
  if (!datasetId) return ''
  const dataset = datasetTreeList.value.find(item => String(item.id) === String(datasetId))
  return dataset ? dataset.name : ''
}




// async function getDatasetItemList() {
//   // 获取全部数据
//   const res = await AiEvaluation.postDatasetItemList({ pageEnable: false })
//   if (res.status === 200) {
//     datasetList.value = res.data.data.data || []
//     // 判断是否选中节点
//     if (!selectedNode.value || !selectedNode.value.id) {
//       // 未选中节点，不显示任何记录
//       filteredList.value = []
//     } else {
//       // 选中节点，过滤
//       filteredList.value = datasetList.value.filter(
//         item => item.parent_id === selectedNode.value.id
//       )
//     }
//   }
// }

async function getDatasetItemList() {
  const data = {
    pageEnable: true,
    pageSize: pageSize.value,
    pageNum: pageNum.value
  }
  const res = await AiEvaluation.postDatasetItemList(data)
  console.log('【getDatasetItemList】API Response:', res)
  if (res.status === 200) {
    // 统一格式化 update_time 字段，并兼容 id 字段
    let list = res.data.data.data || []
    // 兼容所有可能的 id 字段
    list = list.map(item => ({
      ...item,
      update_time: item.update_time ? dayjs(item.update_time).format('YYYY-MM-DD HH:mm:ss') : '',
      entity: item.entity_id || item.entity || '',
      tag: item.tag ?? item.tag_id ?? '',
      dataset: item.dataset ?? item.dataset_id ?? ''
    }))
    datasetList.value = list
    if (!selectedNode.value || !selectedNode.value.id) {
      // 未选中节点，不显示任何记录
      filteredList.value = []
    } else {
      // 选中节点，过滤
      filteredList.value = datasetList.value.filter(
        item => item.parent_id === selectedNode.value.id
      )
    }
    console.log('【getDatasetItemList】最终赋值 datasetList:', datasetList.value)
    pageTotal.value = res.data.data.total
    await nextTick()
    refreshScroll()
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





// 获取测试对象

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
  // 新增前先校验是否选中节点
  if (!selectedNode.value || !selectedNode.value.id) {
    ElMessage.warning('请先选择对应的节点');
    return;
  }
  if (rawEditing.value) {
    ElNotification({
      message: "请先提交当前数据",
      type: "warning",
    })
  } else {
    rawEditing.value = true
    const defaultEntityId = entityId.value       
    const defaultTagId = tagList.value.length > 0 ? tagList.value[0].id : null
    const now = dayjs().format('YYYY-MM-DD HH:mm:ss');
    const newDate = {
      question: '',
      ground_truth: '',
      contexts: '',
      answer: '',
      update_time: now,
      status: 'pending',
      entity: defaultEntityId,
      tag: null,
      dataset: { id: selectedNode.value.id, name: selectedNode.value.name }, // 关键：对象，便于 name 匹配
      editing: true,
      editData: {
        question: '',
        ground_truth: '',
        contexts: '',
        answer: '',
        update_time: now,
        status: 'pending',
        entity: defaultEntityId,
        tag: defaultTagId,
        dataset: selectedNode.value.id // 下拉框选 id
      }
    }
    if (!Array.isArray(datasetList.value)) {
      datasetList.value = []
    }
    datasetList.value.unshift(newDate)
  }
}


// 修改数据集提交方法
async function DatasetItemInfoSubmit(row) {
  try {
    if (!row.editData) {
      ElNotification({
        message: '提交数据不能为空',
        type: 'error',
      })
      return
    }

    let updateTime = row.editData.update_time;

    // 如果为空，赋当前时间
    if (!updateTime) {
      updateTime = dayjs().format('YYYY-MM-DD HH:mm:ss');
    }

    // 如果是只有时间（如 '14:52:45.880602'），强制赋当前日期+时间
    if (/^\d{2}:\d{2}:\d{2}/.test(updateTime) && updateTime.length >= 8 && updateTime.length <= 15) {
      updateTime = dayjs().format('YYYY-MM-DD') + ' ' + updateTime.slice(0, 8);
    }

    // 强制用 dayjs 解析
    let parsed = dayjs(updateTime);
    if (!parsed.isValid()) {
      ElNotification({
        message: '请选择有效的日期时间',
        type: 'error',
      })
      return
    }
    updateTime = parsed.format('YYYY-MM-DD HH:mm:ss');

    // 再次确保是字符串
    if (typeof updateTime !== 'string') {
      updateTime = String(updateTime);
    }

    // 关键：把 name 转成 id
    const entityIdFixed = entityId.value
    const tagId = getIdByName(tagList.value, row.editData.tag)
    const datasetId = getIdByName(datasetTreeList.value, row.editData.dataset)

    if (!datasetId) {
      ElNotification({
        message: '数据集不能为空',
        type: 'warning',
      })
      return
    }

    const data = {
      id: row.editData.id || null,
      question: row.editData.question || '',
      ground_truth: row.editData.ground_truth || '',
      contexts: row.editData.contexts || '',
      answer: row.editData.answer || '',
      update_time: updateTime,
      status: row.status || '',
      entity: entityIdFixed,
      tag: tagId,
      dataset: datasetId,
    };

    // ...其它校验...
    if (!data.question || !data.ground_truth) {
      ElNotification({
        message: '问题和标准答案不能为空',
        type: 'warning',
      })
      return
    }
    if (!data.tag) {
      ElNotification({
        message: '问题标签不能为空',
        type: 'warning',
      })
      return
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
      entity: row.entity?.id ?? null,   // 取对象的 id
      tag: row.tag?.id ?? null,
      dataset: row.dataset?.id ?? null,
    }
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




async function DatasetItemDelete(id) {
  try {
    const res = await  AiEvaluation.deleteDatasetItemInfo({ params: {id} })
    ElMessage({
      message: res?.data?.message || '删除成功',
      type: res?.data?.code === 200 ? 'success' : 'error',
      plain: true,
    })
    if (pageNum.value > Math.ceil((pageTotal.value - 1) / pageSize.value) && (pageNum.value !== 1)) {
      pageNum.value = pageNum.value - 1
    }
    await getDatasetItemList()
  } catch (error) {
    ElMessage({
      message: error.message || '删除失败',
      type: 'error',
      plain: true,
    })
  }
}

// 递归查找父节点链路
function getParentKeys(tree, nodeId, path = []) {
  for (const node of tree) {
    if (node.id === nodeId) {
      return [...path, node.id]
    }
    if (node.children && node.children.length) {
      const found = getParentKeys(node.children, nodeId, [...path, node.id])
      if (found.length) return found
    }
  }
  return []
}



async function handleNodeClick(node) {
  console.log('树节点被点击:', node)
  selectedNode.value = node
  // await getDatasetTreeList(node.id)
  getDatasetItemList()
}


// 获取节点的递归函数
function getNodePath(tree, nodeId, path = []) {
  for (const node of tree) {
    if (node.id === nodeId) return [...path, node.id]
    if (node.children && node.children.length) {
      const found = getNodePath(node.children, nodeId, [...path, node.id])
      if (found) return found
    }
  }
  return []
}

function getDescendantIds(node) {
  let ids = [node.id]
  if (node.children && node.children.length) {
    node.children.forEach(child => {
      ids = ids.concat(getDescendantIds(child))
    })
  }
  return ids
}

// function handleParentPathChange(val) {
//   treeForm.value.parent_id = val[val.length - 1]
// }

function flattenTree(tree) {
  let result = []
  tree.forEach(node => {
    result.push({ id: node.id, name: node.name })
    if (node.children && node.children.length) {
      result = result.concat(flattenTree(node.children))
    }
  })
  return result
}

// 获取树型结构列表数据展示
async function getDatasetTreeList() {
  const res = await AiEvaluation.postDatasetTreeList({ pageEnable: false })
  if (res.status === 200) {
    const tree = res.data.data.data || []
    datasetTreeList.value = flattenTree(tree)
    console.log('datasetTreeList:', datasetTreeList.value)
  }
}



function formatDate(val) {
  if (!val) return ''
  // 兼容时间戳
  if (typeof val === 'number' || (/^\d+$/.test(val) && String(val).length >= 10)) {
    return dayjs(Number(val)).isValid() ? dayjs(Number(val)).format('YYYY-MM-DD HH:mm:ss') : ''
  }
  // 兼容 20240610123456 这种格式
  if (typeof val === 'string' && val.length === 14 && /^\d+$/.test(val)) {
    const y = val.slice(0, 4)
    const m = val.slice(4, 6)
    const d = val.slice(6, 8)
    const h = val.slice(8, 10)
    const min = val.slice(10, 12)
    const s = val.slice(12, 14)
    return `${y}-${m}-${d} ${h}:${min}:${s}`
  }
  // 兼容字符串
  const d = dayjs(val)
  if (!d.isValid()) return ''
  return d.format('YYYY-MM-DD HH:mm:ss')
}

const tableRef = ref(null)
const selectedRows = ref([])

function handleSelectionChange(val) {
  selectedRows.value = val
}


// excel导出
function excelExport() {
  // 1. 获取要导出的数据
  let exportData = selectedRows.value.length > 0 ? selectedRows.value : datasetList.value

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
      entity: getEntityName(row.entity), // 转换为名称
      tag: getTagName(row.tag),          // 转换为名称
      dataset: getDatasetName(row.dataset) // 转换为名称
    }
  })

  // 4. 生成 worksheet
  const ws = XLSX.utils.json_to_sheet(data, { header: fields.map(f => f.key) })
  // 设置表头
  XLSX.utils.sheet_add_aoa(ws, [fields.map(f => f.label)], { origin: 'A1' })

  // 5. 生成 workbook
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, '数据集')

  // 6. 导出
  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
  saveAs(new Blob([wbout], { type: 'application/octet-stream' }), '数据集导出.xlsx')
}

// excel导入
function excelImport() {
  if (!selectedNode.value || !selectedNode.value.id) {
    ElMessage.warning('请先选中节点');
    return;
  }
  excelDrawerVisible.value = true
  multiFiles.value = []
  previewContent.value = ''
}

function handleMultiChange(file, fileList) {
  multiFiles.value = fileList
}

function handleRemove(file, fileList) {
  multiFiles.value = fileList
}

// 知识库打开 
async function fileUpload() {
  if (!selectedNode.value || !selectedNode.value.id) {
    ElNotification({ message: '请先选中节点', type: 'warning' })
    return
  }
  try{
    const res = await AiEvaluation.postDatasetItemFileList({ dataset_id: selectedNode.value.id })
    console.log('文件列表:', res)
    fileNames.value = (Array.isArray(res.data) ? res.data : res.data?.data || []).map(item => item.name)
  }catch(e){
    fileNames.value = []
    console.error(e)
  }
  fileDrawerVisible.value = true
  multiFiles.value = []
  previewContent.value = ''
}

// 文件上传
async function MultFileonSubmit () {
  // 1. 基础校验
  if (!multiFiles.value.length) {
    ElNotification({ message: '请先选择文件', type: 'warning' })
    return
  }
  if (!selectedNode.value?.id) {
    ElNotification({ message: '请先选中节点', type: 'warning' })
    return
  }
  // 2. 构造 FormData（所有面板都一样）
  const formData = new FormData()
  formData.append('file', multiFiles.value[0].raw)
  formData.append('dataset_id', selectedNode.value.id)

  try {
    let res

    /* ---------- 判断打开的是哪种面板 ---------- */
    if (excelDrawerVisible.value){
      res = await AiEvaluation.EvaluationExcelImport(formData)
    }
      else if (fileDrawerVisible.value) {
      // 抽屉里的普通文件导入
      res = await AiEvaluation.EvaluationFileImport(formData)

    } else if (fileDialogVisible.value) {
      // 旧的 dialog 弹窗导入（如果仍保留的话）
      res = await AiEvaluation.EvaluationFileImport(formData)

    } else {
      ElNotification({ message: '未打开任何导入窗口', type: 'warning' })
      return
    }

    /* ---------- 结果处理 ---------- */
    if (res.status === 200) {
      ElNotification({ message: '导入成功', type: 'success' })
      await getDatasetItemList()
    } else {
      ElNotification({ message: res.data?.message || '导入失败', type: 'error' })
    }
  } catch (e) {
    ElNotification({ message: '导入失败：' + (e.message || '未知错误'), type: 'error' })
  } finally {
    // 3. 统一关闭面板
    fileDrawerVisible.value  = false
    excelDrawerVisible.value = false 
    multiFiles.value = []
  }
}

//文件下载
async function fileExport () {
  if (!selectedNode.value?.id) {
    ElMessage.warning('请先选中节点再下载')
    return
}

  try {
    const res = await downloadDatasetFile({ dataset_id: selectedNode.value.id })

    /* ---------- 文件名 ---------- */
    let filename = fileNames.value?.[0] || `dataset_${selectedNode.value.id}.zip`
    const dispo = res.headers['content-disposition']
    if (dispo) {
      const m = dispo.match(/filename\*?=(UTF-8'')?([^;]+)/i)
      if (m) filename = decodeURIComponent(m[2].replace(/['"]/g, ''))
    }
    if (!filename.endsWith('.zip')) filename += '.zip'

    /* ---------- 触发浏览器下载 ---------- */
    const blob = new Blob([res.data], { type: 'application/zip' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)

    ElMessage.success('下载成功')
  } catch (err) {
    console.error(err)
    ElMessage.error('下载失败：' + (err.response?.data?.message || err.message))
  }
}

async function treeEditSubmit() {
  // 校验
  if (!treeForm.value.name) {
    ElMessage.warning('节点名称不能为空');
    return;
  }
  // 组装参数
  const params = {
    id: treeForm.value.id,
    name: treeForm.value.name,
    parent: treeForm.value.parent_id,
    // 其它字段...
  };
  try {
    const res = await AiEvaluation.postDatasetTreeInfo(params);
    if (res.status === 200) {
      ElMessage.success('编辑成功');
      dialogVisible.value = false;
      await getTreeDataList(); // 刷新树
    } else {
      ElMessage.error('编辑失败');
    }
  } catch (error) {
    ElMessage.error('编辑失败: ' + (error.message || '未知错误'));
  }
}

// 修正 filteredList 计算属性，选中节点时，能兼容 dataset 字段为对象（有 name）、为 id、为字符串三种情况，确保能正确筛选出所有属于当前节点的数据。
const filteredList = computed(() => {
  // 如果没有选中节点，或 datasetList 为空，直接返回全部
  // if (!selectedNode.value || !selectedNode.value.id || !Array.isArray(datasetList.value)) return datasetList.value
  // 只显示 dataset id 与选中节点 id 完全一致的数据
  if (!selectedNode.value || selectedNode.value.id == null) {
     return []
   }
  return datasetList.value.filter(item => {
    // 兼容 dataset 字段为对象、id、字符串、数字等情况
    let datasetId = item.dataset
    if (typeof datasetId === 'object' && datasetId !== null) {
      datasetId = datasetId.id
    }
    return String(datasetId) === String(selectedNode.value.id)
  })
})

// 根据名称获取 id
function getIdByName(list, value) {
  if (!value) return null
  // 先查 id
  let found = list.find(item => String(item.id) === String(value))
  if (found) return found.id
  // 再查 name
  found = list.find(item => item.name === value)
  return found ? found.id : null
}

// 删除节点确认
function confirmDeleteNode() {
  // 检查是否选中节点
  if (!selectedNode.value || !selectedNode.value.id) {
    ElMessage.warning('请选中要删除的节点');
    return;
  }
  // 弹窗确认
  ElMessageBox.confirm(
    `确定要删除节点 "${selectedNode.value.name}" 吗？此操作不可恢复！`,
    '删除确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(() => {
    // 直接用 id 删除
    treeDelete(selectedNode.value.id)
  }).catch(() => {
    // 用户取消，无需处理
  })
}

// 删除节点方法
async function treeDelete(id) {
  if (!id) {
    ElMessage.warning('请选中要删除的节点');
    return;
  }
  try {   
    const res = await AiEvaluation.deleteDatasetTreeInfo(id)
    if (res.status === 200) {
      ElMessage.success('删除成功');
      await getTreeDataList();
      await getDatasetTreeList();
      await getDatasetItemList();
    } else {
      ElMessage.error(res.data?.message || '删除失败');
    }
  } catch (error) {
    ElMessage.error('删除失败: ' + (error.message || '未知错误'));
  }
}

// 一键更新答案
async function OneclickUpdateAnswer() {
  console.log('[OneclickUpdateAnswer] 方法开始')
  console.log('[OneclickUpdateAnswer] selectedNode:', selectedNode.value.id)
  if (!selectedNode.value || !selectedNode.value.id) {
    ElMessage.warning('请先选择对应的数据节点！')
    return
  }
  // 前置校验：是否选中评测对象
  if (!entityId.value) {
    ElMessage.warning('请选择评测对象！')
    return
  }
  if (isUpdatingAnswer.value) {
    ElMessage.info('有数据正在更新，请稍候...')
    return
  }
  const dataset_id = selectedNode.value.id

  const params = {     
    dataset_id: selectedNode.value.id,
    entity_id : entityId.value}
  console.log('[OneclickUpdateAnswer] 调用 OneclickUpdate 参数:', params)
  isUpdatingAnswer.value = true
  try {
    const res = await OneclickUpdate(params)
    //console.log('[OneclickUpdateAnswer] OneclickUpdate 返回:', res)
    if (res.status === 200) {
      // 判断后端返回是否全部完成（可根据后端返回的字段调整）
      if (res.data && (res.data.success_count === res.data.processed_entries || res.data.status === 'completed')) {
        ElMessage.success('答案更新完成')
        await getDatasetItemList(); // 确保更新后刷新数据
      } else {
        ElMessage.success(res.data?.message || '一键更新成功！')
      }
      await getDatasetItemList() // 刷新列表
    } else {
      ElMessage.info('有数据正在更新，请稍候...')
    }
  } catch (error) {
    console.error('[OneclickUpdateAnswer] 一键更新异常:', error)
    ElMessage.info('有数据正在更新，请稍候...')
  } finally {
    isUpdatingAnswer.value = false
  }
}

// 单条更新答案
async function UpdateDataItem(id) {
  console.log('[UpdateDataItem] 传入id:', id)
  // 1. 查找该条记录
  const item = datasetList.value.find(row => row.id === id)
  console.log('[UpdateDataItem] 查找到的item:', item)
  if (!item) {
    ElMessage.error('未找到该条数据')
    return
  }
  // 2. 获取 dataset_id 和 question
  const dataset_id = item.dataset?.id || item.dataset || item.dataset_id
  const question = item.question
  console.log('[UpdateDataItem] dataset_id:', dataset_id)
  console.log('[UpdateDataItem] question:', question)
  if (!dataset_id || !question) {
    ElMessage.error('数据不完整，无法更新')
    return
  }
  try {
    // 3. 调用 OneclickUpdate
    const params = { dataset_id }
    console.log('[UpdateDataItem] 调用 OneclickUpdate 参数:', params)
    const res = await OneclickUpdate(params)
    console.log('[UpdateDataItem] OneclickUpdate 返回:', res)
    if (res.status === 200) {
      ElMessage.success(res.data?.message || '单条更新成功！')
      await getDatasetItemList() // 刷新列表
    } else {
      ElMessage.error(res.data?.message || '单条更新失败！')
    }
  } catch (error) {
    console.error('[UpdateDataItem] 单条更新异常:', error)
    ElMessage.error('单条更新异常：' + (error.message || '未知错误'))
  }
}

function CopyDataItem(id) {
  // 1. 查找该条记录
  const item = datasetList.value.find(row => row.id === id)
  if (!item) {
    ElMessage.error('未找到要复制的数据')
    return
  }
  // 2. 复制内容，去除 id，进入编辑状态
  const copy = {
    ...item,
    id: undefined, // 新记录无 id
    editing: true,
    editData: {
      question: item.question,
      ground_truth: item.ground_truth,
      contexts: item.contexts,
      answer: item.answer,
      update_time: item.update_time,
      entity: item.entity,
      tag: item.tag,
      dataset: item.dataset
    }
  }
  // 3. 插入到列表最前面
  datasetList.value.unshift(copy)
  ElMessage.success('已复制一条数据，请编辑后提交')
}

/* 页面加载完 & 数据加载完以后刷新一次 */
function refreshScroll () {
  nextTick(() => {
    const el = scrollRef.value
    if (!el) return
    scroll.max     = el.scrollWidth - el.clientWidth
    scroll.enabled = scroll.max > 0
    scroll.left    = el.scrollLeft
  })
}

/* 滑块拖动 → 设置容器 scrollLeft */
function onSliderInput (val) {
  const el = scrollRef.value
  if (el) el.scrollLeft = val
}

/* 容器滚动 → 更新滑块位置 */
function onScroll () {
  const el = scrollRef.value
  if (el) scroll.left = el.scrollLeft
}
watch(entityId, () => {
  // 重拉数据或本地过滤，二选一
  getDatasetItemList()
})

</script>

<style scoped>

.table-wrapper {
  padding-bottom:24px;          
  overflow-x: auto;      
  position:relative
}
.table-wrapper::-webkit-scrollbar{height:6px;}
.table-wrapper{scrollbar-width:thin;}
.h-scroll-slider{
  position:absolute;
  bottom:0;
  left:0;
  right:0;
  margin:0 4px;   /* 两侧稍微收一点边 */
}
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
  background: #fff; /* 或你需要的样式 */
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

.parent-selected {
  background: #ecf5ff !important;
  color: #409EFF;
}

</style>