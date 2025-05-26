<template>
  <div class="dataset-container">
    <div class="left-panel" :style="{  width: panelWidth + 'px', transition:'width .2s', overflow:'hidden' }">
      <template v-if="!isCollapsed">
      <div class="tree-header" style="display: flex; flex-direction: row; gap: 10px; align-items: center; ">
        <el-aside width="300px" style="padding: 0;">
        </el-aside>
      </div>
      <div class="tree-container">
        <el-tree
          ref="treeRef"
          :data="treeData"
          node-key="id"
          default-expand-all
          :props="{ children: 'children', label: 'name' }"
          highlight-current
          :current-node-key="currentNodeKey"
          @node-click="handleNodeClick"
        >
        <template #default="{ node, data }">
          <div class="tree-node-ref">
            <!-- 1）给这个 span 设置 flex:1 + 文本溢出隐藏 -->
            <el-tooltip 
              v-if="!data.children || data.children.length===0"
              class="node-label" 
              effect="dark" 
              :content="data.name" 
              placement="top">
               <span class="node-label">{{ data.name }}</span>
            </el-tooltip>
            <span 
              v-else 
              class="node-label" 
              :title="data.name">
              {{ data.name }}
            </span>

            <el-space class="action-btns" direction="horizontal" size="small">
              <el-button size="mini" plain circle @click.stop="treeAdd(data)">
                <el-icon><Plus/></el-icon>
              </el-button>
              <el-button size="mini" plain circle @click.stop="treeEdit(data)">
                <el-icon><EditPen/></el-icon>
              </el-button>
              <el-button size="mini" v-if="!data.isRoot" type="danger" plain circle @click.stop="confirmDeleteNode(data)">
                <el-icon><Minus/></el-icon>
              </el-button>
            </el-space>
          </div>
        </template>


        </el-tree>
      </div>
      </template>
    </div> 
    
    <div class="right-panel">
      <statistic-card />
      <div class="button-group">
        <el-button class="headerButton" type="primary" plain @click="addRow">新增</el-button>
        <el-select v-model="entityId" placeholder="请选择测试对象" style="width: 160px; margin-right: 8px">
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
        <div class="table-wrapper">
          <el-table :data="filteredList" border  style="width: 100%" ref="tableRef"
           @selection-change="handleSelectionChange"
            show-overflow-tooltip
            :cell-style="{
              maxWidth: '150px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }">
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
                  <!-- <el-button link type="primary" size="small" @click="CopyDataItem(scope.row.id)">复制</el-button> -->
                </div>
              </template>
            </el-table-column>
          </el-table>
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
    <el-drawer v-model="excelDrawerVisible" title="Excel 导入" width="20%" direction="rtl" size="30%" destroy-on-close class="custom-drawer">
      <el-form :model="multiformData" class="drawer-form">
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
              <div class="el-upload__tip">
                支持Excel格式，单个文件不超过20MB
              </div>
              <!-- 回显区域放到 tip 里 -->
              <!-- <div class="preview-files" v-if="fileNames.length">
                <el-tag
                  v-for="(n, i) in fileNames"
                  :key="i"
                  :type="n === selectedFileName ? 'success' : 'info'"
                  @click="selectedFileName = n"
                  style="cursor: pointer; margin: 4px 4px;"
                >
                  {{ n }}
                </el-tag>
              </div> -->
            </template>
          </el-upload>
        </el-form-item>
      </el-form>
        <template #footer>
    <div class="drawer-footer">
      <el-button @click="excelDrawerVisible=false">取消</el-button>
      <el-button type="primary" @click="MultFileonSubmit">开始上传</el-button>
    </div>
        </template>
    </el-drawer> 
        <!-- 知识库 -->
        <el-drawer v-model="fileDrawerVisible" title="知识库" width="20%" direction="rtl" size="30%" destroy-on-close class="custom-drawer">
          <!-- ============ 回显区 ============ -->
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
                  <!-- 回显区域放在这里 -->
                  <div class="preview-files" v-if="fileNames.length">
                    <el-tag
                      v-for="(n, i) in fileNames"
                      :key="i"
                      type="info"
                      class="preview-tag"
                      @click="fileExport"
                    >
                      {{ n }}
                    </el-tag>
                  </div>
                </template>
          </el-upload>
        </el-form-item>
        <template #footer>
          <div class="drawer-footer">
          <el-button @click="fileDrawerVisible  = false">取消</el-button>
          <el-button type="primary" @click="MultFileonSubmit">开始上传</el-button>
          <!-- <el-button type="primary" @click="fileExport">开始下载</el-button> -->
          </div>
        </template>
        </el-drawer>

    <!-- 添加树型列表的界面 -->
    <el-dialog v-model="addDialogVisible" title="新增节点" width="420px" class="custom-add-dialog" :close-on-click-modal="false">
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
    <!-- ★★ 折叠 / 展开箭头按钮 -->
      <el-button
      class="collapse-btn"
      :icon="isCollapsed ? ArrowRight : ArrowLeft"
      circle size="small"
      @click="togglePanel"
      :style="{ left: panelWidth + 'px' }"
    />
  </div>  
</template>

<script setup>
import { request } from '@/utils/request'
import {onMounted, ref, computed,watch} from "vue"
import * as AiEvaluation from "@/api/AiEvaluation"
import {ElNotification,ElMessage,ElPopconfirm,ElMessageBox} from "element-plus"
import { ArrowLeft, ArrowRight } from '@element-plus/icons-vue'
import {InfoFilled} from "@element-plus/icons-vue"
import dayjs from 'dayjs'
import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'
import axios from 'axios'
import { OneclickUpdate } from "@/api/AiEvaluation"
import { downloadDatasetFile } from '@/api/AiEvaluation' 
import { Plus, EditPen, Minus } from '@element-plus/icons-vue'
import { EvaluationExcelImport } from '@/api/AiEvaluation'

const activeTreeNode = ref({})
const pageNum = ref(1)
const pageSize = ref(10)
const pageTotal = ref(0)
const datasetList = ref([])  // 右侧所有数据
const rawEditing = ref(false)
const entityList = ref([])
const entityId   = ref(null)  // 当前选择的对象 id
let   pollTimer         = null              // 轮询定时器
const tagList = ref([])
const datasetTreeList = ref([])
const pageList = ref([])
const currentPage = ref(1)
// 控制导航栏是否折叠
const isCollapsed = ref(false)
/* 统一的面板宽度变量（展开 300，收起 0）*/
const panelWidth  = computed(() => (isCollapsed.value ? 0 : 200))
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
const previewData    = ref([])   // 解析出来的数组
const previewColumns = ref([])   // 表头字段列表
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


const togglePanel = () => (isCollapsed.value = !isCollapsed.value)


// 修改 onMounted 钩子，确保初始化
onMounted(async () => {
  // await getEntityList()
  await getTagList()
  await getEntityList()
  await getDatasetTreeList()
  await getTreeDataList()
  await getDatasetItemList() // 映射表加载完再加载表格
})


// 查询当前选中数据集并按条件过滤
async function handleQuery() {
  if (!selectedNode.value?.id) {
    ElMessage.warning('请先选择一个数据集节点');
    return;
  }

  try {
    // 1) 不分页、不加任何后端过滤，拿到当前节点下的所有记录
    const res = await AiEvaluation.postDatasetItemList({
      dataset_id: selectedNode.value.id,
      pageEnable: false
    });

    if (!(res.status === 200 && res.data.code === 'success')) {
      throw new Error(res.data.message || '后端返回非成功状态');
    }

    let all = res.data.data.data;    // 后端返回的完整数组

    // 2) 在前端本地做过滤
    const { question, ground_truth, tag } = formInline.value;
    if (question) {
      const q = question.trim();
      all = all.filter(item => item.question?.includes(q));
    }
    if (ground_truth) {
      const g = ground_truth.trim();
      all = all.filter(item => item.ground_truth?.includes(g));
    }
    if (tag) {
      all = all.filter(item => {
        // 先拿到可能是对象或直接 id 的 tag 值
        const t = item.tag?.id ?? item.tag;
        // 只有非空且匹配时才保留
        return t != null && String(t) === String(tag);
      });
    }

    // 3) 把结果赋回去、更新总条数
    datasetList.value = all;
    pageTotal.value   = all.length;
    ElMessage.success('查询并本地过滤完成');

  } catch (error) {
    console.error('查询失败：', error.response?.data || error);
    const msg = error.response?.data?.message || error.message || '未知错误';
    ElMessage.error(`查询失败：${msg}`);
  }
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
  entityId.value = null;
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
    const children = res.data.data.data || []
    treeData.value = [
      {
        id: 0,
        name: '根节点',
        isRoot:true,
        children
      }
    ]
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
    //console.log('【getDatasetItemList】最终赋值 datasetList:', datasetList.value)
    //console.log('【getDatasetItemList】最终赋值 filteredList:', filteredList.value)
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


    const res = await AiEvaluation.postDatasetItemInfo(data)

    if (res.status === 200) {
      ElNotification({
        message: res.data.message || '提交成功',
        type: 'success',
      })
      const newId = res.data.data.id
      row.id = newId
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
  console.log('测试')
  excelDrawerVisible.value = true
  multiFiles.value = []
  previewContent.value = ''
}

function handleMultiChange(file, fileList) {
  multiFiles.value = fileList;

  if (!excelDrawerVisible.value) {
    previewColumns.value = [];
    previewData.value = [];
    return;
  }

  const rawFile = file.raw;
  const name = rawFile.name.toLowerCase();
  if (!name.endsWith('.xls') && !name.endsWith('.xlsx')) {
    ElNotification.warning('请上传 .xls 或 .xlsx 文件进行预览');
    previewColumns.value = [];
    previewData.value = [];
    return;
  }

  const reader = new FileReader();
  reader.onload = e => {
    try {
      const wb    = XLSX.read(e.target.result, { type: 'binary' });
      const ws    = wb.Sheets[wb.SheetNames[0]];
      // ← 加上 defval:""，让所有空单元格都变成空字符串
      const raw   = XLSX.utils.sheet_to_json(ws, {
        header: 1,
        blankrows: false,
        defval: ''
      });
      // —— 打印解析出来的原始二维数组
      console.log('【sheet_to_json raw】:', raw);
      if (raw.length <= 1) {
        previewColumns.value = [];
        previewData.value   = [];
        return;
      }

      // 第一行做表头
      const header = raw[0].map(h => String(h).trim());
      console.log('【header】:', header);
      previewColumns.value = header;

      // 剩下的每一行：补齐长度、再只删掉整行全空的
      const dataRows = raw.slice(1)
        .map(row => {
          const r = [...row];
          while (r.length < header.length) r.push('');
          return r;
        })
        .filter(row => row.some(cell => cell !== ''));  // 至少一个单元不空
        console.log('【dataRows after filter】:', dataRows);
      // 最后映射成对象数组
      previewData.value = dataRows.map(row => {
        const obj = {};
        header.forEach((col, i) => {
          obj[col] = row[i];
        });
        return obj;
      });
      // —— 打印最后要显示的 previewData
      console.log('【previewData】:', previewData.value);
    } catch (err) {
      ElNotification.error('Excel 解析失败：' + (err.message || '未知错误'));
      previewColumns.value = [];
      previewData.value    = [];
    }
  };
  reader.readAsBinaryString(rawFile);
}



function handleRemove(file, fileList) {
  multiFiles.value = fileList
    // 如果没有任何待上传文件了，就清空预览
  if (!fileList.length) {
    previewColumns.value = []
    previewData.value    = []
}
}
// 知识库打开 
async function fileUpload() {
  if (!selectedNode.value || !selectedNode.value.id) {
    ElNotification({ message: '请先选中节点', type: 'warning' })
    return
  }
  try{
    const res = await AiEvaluation.postDatasetItemFileList({ dataset: selectedNode.value.id })
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
    ElNotification.warning('请先选择文件')
    return
  }
  if (!selectedNode.value?.id) {
    ElNotification.warning('请先选中节点')
    return
  }

  // 2. 如果是 ZIP / 普通文件面板，按原逻辑直接上传
  if (fileDrawerVisible.value) {
    const formData = new FormData()
    formData.append('file', multiFiles.value[0].raw)
    formData.append('dataset', selectedNode.value.id)
    try {
      const res = await AiEvaluation.EvaluationFileImport(formData)
      if (res.status === 200) {
        ElNotification.success('文件上传成功')
        await getDatasetItemList()
      } else {
        ElNotification.error(res.data?.message || '文件上传失败')
      }
    } catch (e) {
      ElNotification.error('文件上传异常：' + (e.message || '未知错误'))
    } finally {
      fileDrawerVisible.value = false
      excelDrawerVisible.value = false
      multiFiles.value = []
    }
    return
  }

  // 3. 如果是 Excel 导入面板，逐行校验并发送
  if (excelDrawerVisible.value) {
    if (!previewData.value.length) {
      ElNotification.warning('请先预览并校验要导入的数据')
      return
    }
    // 把 previewData 里的列名映射成后端需要的字段
      const rows = previewData.value.map(item => {
        // 先拿到原始 update_time
        let ut = item.Updated || item.update_time

        // 如果是数字（Excel 序列号），转换成字符串
        if (typeof ut === 'number') {
          ut = dayjs('1899-12-30')
            .add(ut, 'day')
            .format('YYYY-MM-DD HH:mm:ss')
        }

        // 确保字符串类型也符合格式
        if (typeof ut === 'string') {
          // 如果已经是 YYYY-MM-DD HH:mm:ss 格式就不用动，
          // 否则也可以再 parse 一次：
          const parsed = dayjs(ut)
          if (parsed.isValid()) {
            ut = parsed.format('YYYY-MM-DD HH:mm:ss')
          }
        }

        return {
          detail:       item.ID || item.id,
          question:     item.Question || item.question,
          ground_truth: item.ground_truth,
          answer:       item['AI Answer'] || item.answer || '',
          contexts:     item.Contexts   || item.contexts || '',
          update_time:  ut,
          entity:       entityId.value,
          tag:          item.Tag         || item.tag || '',
          dataset:      selectedNode.value.id
        }
      })


    const payload = {
      dataset:   selectedNode.value.id,
      json_data: JSON.stringify(rows)
    }
    console.group('Excel 导入 JSON Payload')
    console.log(payload)
    console.groupEnd()
    // 4. 全部处理完成后刷新 & 清理
    await getDatasetItemList()
    previewData.value    = []
    previewColumns.value = []
    multiFiles.value     = []
    excelDrawerVisible.value = false
        try {
      const res = await EvaluationExcelImport(payload)
      if (res.data.code === 'success') {
        ElNotification.success(res.data.message)
        await getDatasetItemList()
      } else {
        ElNotification.error(res.data.message || '导入失败')
      }
    } catch (err) {
      console.error('Excel 导入异常', err)
      ElNotification.error('导入接口调用失败：' + err.message)
    } finally {
      // 清理状态
      previewData.value        = []
      previewColumns.value     = []
      multiFiles.value         = []
      excelDrawerVisible.value = false
    }
  }
}


//文件下载
async function fileExport () {
  if (!selectedNode.value?.id) {
    ElMessage.warning('请先选中节点再下载')
    return
}

  try {
    const res = await downloadDatasetFile({ dataset: selectedNode.value.id })

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
// 过滤列表
const filteredList = computed(() => {
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
  console.log('selectedNode:', selectedNode.value.id)
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

//一键更新答案
// async function OneclickUpdateAnswer() {
//   console.log('[OneclickUpdateAnswer] 方法开始')
//   console.log('[OneclickUpdateAnswer] selectedNode:', selectedNode.value.id)
//   if (!selectedNode.value || !selectedNode.value.id) {
//     ElMessage.warning('请先选择对应的数据节点！')
//     return
//   }
//   // 前置校验：是否选中评测对象
//   if (!entityId.value) {
//     ElMessage.warning('请选择评测对象！')
//     return
//   }
//   if (isUpdatingAnswer.value) {
//     ElMessage.info('有数据正在更新，请稍候...')
//     return
//   }
//   const dataset_id = selectedNode.value.id

//   const params = {     
//     dataset_id: selectedNode.value.id,
//     entity_id : entityId.value}
//   console.log('[OneclickUpdateAnswer] 调用 OneclickUpdate 参数:', params)
//   isUpdatingAnswer.value = true
//   try {
//     const res = await OneclickUpdate(params)
//     //console.log('[OneclickUpdateAnswer] OneclickUpdate 返回:', res)
//     if (res.status === 200) {
//       // 判断后端返回是否全部完成（可根据后端返回的字段调整）
//       if (res.data && (res.data.success_count === res.data.processed_entries || res.data.status === 'completed')) {
//         ElMessage.success('答案更新完成')
//         await getDatasetItemList(); // 确保更新后刷新数据
//       } else {
//         ElMessage.success(res.data?.message || '一键更新成功！')
//       }
//       await getDatasetItemList() // 刷新列表
//     } else {
//       ElMessage.info('有数据正在更新，请稍候...')
//     }
//   } catch (error) {
//     console.error('[OneclickUpdateAnswer] 一键更新异常:', error)
//     ElMessage.info('有数据正在更新，请稍候...')
//   } finally {
//     isUpdatingAnswer.value = false
//   }
// }
// 判断所有行是否都拿到 answer
function allAnswered() {
  return datasetList.value.every(row => row.answer != null && row.answer !== '')
}
function allDone() {
  console.log(
  datasetList.value.map(item => item.status)
)
  return datasetList.value.every(row => row.status !== 'pending')
}
async function OneclickUpdateAnswer() {
  if (!selectedNode.value.id) {
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
    const res = await OneclickUpdate({
      dataset: selectedNode.value.id,
      entity: entityId.value
    })
    if (res.data.code !== 'success') {
      throw new Error(res.data.message || '启动失败')
    }
    ElMessage.info('更新已启动，开始轮询结果…')

    // 第 2 步：立即拉一次表格初始数据
    await refreshTable()

    // 清除老的定时器
    if (pollTimer) clearInterval(pollTimer)

    // 第 3 步：每 2 秒拉一次
    pollTimer = setInterval(async () => {
      await refreshTable()

      // 停止条件：当所有行的 status 都不是 'pending'
      if (allDone()) {
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
// 辅助：刷新表格数据
async function refreshTable() {
    if (!selectedNode.value?.id) {
    // 没有选中节点就不做任何事
    return
  }
  try {
    const resp = await AiEvaluation.postDatasetItemList({
      pageEnable: false,        // 或按需分页
    })
    if (resp.status === 200) {
      // 1. 拿到后端所有的数据
      const all = resp.data.data.data
      // 2. 过滤——只保留 dataset 字段等于当前选中节点 ID 的项
      const filtered = all.filter(item => {
        // 兼容 dataset 字段可能是对象或直接 ID
        let ds = item.dataset ?? item.dataset_id
        if (typeof ds === 'object' && ds !== null) ds = ds.id
        return String(ds) === String(selectedNode.value.id)
      })
      // 3. 赋值给 datasetList，这时它只包含当前选中数据集的记录
      datasetList.value = filtered.map(item => ({
        ...item,
      }))
    }
  } catch (e) {
    console.error('刷新表格失败', e)
  }
}
// 单条更新答案
async function UpdateDataItem(id) {
  const detail = parseInt(id, 10)
    if (!Number.isInteger(detail)) {
    ElMessage.error('更新失败：传入的 detail 不是有效数字')
    return
  }
  const item = datasetList.value.find(row => row.id === id)
  if (!item) {
    ElMessage.error('未找到该条数据')
    return
  }
    // 2. 检查全局下拉是否已选评测对象
  if (!entityId.value) {
    ElMessage.warning('请先在上方 “评测对象” 下拉中选择一个对象');
    return;
  }
  try {
    // 2. 构造新的请求体
    const payload = {
      entity: entityId.value,
      detail
    }
    //console.log('[UpdateDataItem] 调用 OneclickUpdate 参数:', params)
    const res = await OneclickUpdate(payload)

    if (res.status === 200 || res.data?.code === 'success'){
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
watch(entityId, () => {
  // 重拉数据或本地过滤，二选一
  getDatasetItemList()
})
// 这里补上缺失的 }
</script>

<style scoped>
/* 折叠按钮：始终贴在 left-panel 右缘；左缘宽变 0 时自动回到最左 */
.collapse-btn{
  position:absolute;
  top:50%;
  left:300px;             /* 展开时 = 面板宽度 */
  transform:translateX(-50%,-50%);
  transition: left .2s;
  z-index:1000;
  box-shadow:0 2px 8px rgba(0,0,0,.15);
}

/* 当内联样式含 width:0px → 说明面板已折叠，按钮移到最左 */
.left-panel[style*="width: 0px"] + .main-panel + .collapse-btn{
  left: 0;                      
}
/* 毛玻璃背景 */
.custom-add-dialog .el-overlay {
  backdrop-filter: blur(3px);
}
/* 对话框本体 */
.custom-add-dialog .el-dialog {
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}
/* 头部：渐变 + 圆角 */
.custom-add-dialog .el-dialog__header {
  padding: 18px 24px 10px;
  background: linear-gradient(135deg, #409eff 0%, #79bbff 100%);
  border-top-left-radius: 12px;
  border-top-right-radius: 12px;
}
.custom-add-dialog .el-dialog__title {
  color: #ffffff;
  font-size: 18px;
  font-weight: 600;
}
/* 内容区内边距 */
.custom-add-dialog .el-dialog__body {
  padding: 20px 24px;
}
/* 底部按钮区：浅灰背景 + 圆角 */
.custom-add-dialog .el-dialog__footer {
  background: #f5f7fa;
  padding: 12px 24px 20px;
  border-bottom-left-radius: 12px;
  border-bottom-right-radius: 12px;
  text-align: right;
}
/* 调整按钮最小宽度与间距 */
.custom-add-dialog .el-button {
  min-width: 80px;
  margin-left: 8px;
}

.table-wrapper{
  /* height:calc(100vh - 230px);   230px 换成头部按钮区 + 分页条的实际高度 */
  flex:1;
  overflow:auto;
}
.right-panel,
.table-wrapper{
  min-width:0;        /* 允许在交叉轴方向收缩 */
}

.dataset-container {
  display: flex;
  gap: 20px;
  padding: 20px;
  height: 100%;
  position:relative;
}

.tree-container {
  width: 200px;
  min-width: 200px;
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
  padding-left: 0px;
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
  padding-left: 0px;
}

:deep(.el-tree-node__content:hover) {
  background-color: #f5f7fa;
}

:deep(.el-tree-node.is-current > .el-tree-node__content) {
  background-color: #ecf5ff;
}

/* 确保树形控件在容器中正确显示 */
:deep(.el-tree) {
  background: #fff; 
  padding: 0 4px;
}

.left-panel {
  width: 200px;
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

/* ---------- Drawer 通用美化 ---------- */
:deep(.custom-drawer .el-drawer__body) {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  overflow-y: auto;
}

:deep(.custom-drawer .el-upload-dragger) {
  border-radius: 8px;
  transition: border-color .2s;
}
:deep(.custom-drawer .el-upload-dragger:hover) {
  border-color: var(--el-color-primary);
}

/* footer：按钮贴右、间距一致 */
:deep(.custom-drawer .drawer-footer) {
  display:flex;
  justify-content:flex-end;
  gap:12px;
  padding:12px 24px;
  border-top:1px solid var(--el-border-color-light);
}

:deep(.custom-drawer .el-form-item) {
  margin-bottom: 16px;
}
.tree-node-ref {
  display: flex;
  align-items: center;
  /* 空间分配：label 占剩余，buttons 固定 */
  justify-content: space-between;
  width: 100%;          /* 一定要占满整行 */
  /* 允许里面的 flex 子项缩小到 0 */
  min-width: 0;
}
.tree-node-ref:hover .action-btns {
  display: flex;          /* 悬浮时显示 */
}
.action-btns {
  display: none;        /* 默认隐藏 */
  margin-left: auto;    /* 向右推 */
  justify-content: flex-end;
  align-items: center;
}
.node-label {
  /* 在 flex 布局中可缩放，但不小于 0 */
  flex: 1 1 0;
  min-width: 0;
  margin-right: 2px;        /* 按钮和文字留出间距 */
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  cursor: default;
}
.node-label.ellipsis {
  display: inline-block;
  max-width: 120px;       /* 根据侧栏宽度调整 */
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  vertical-align: middle;
  cursor: pointer;        /* 显示为可悬停提示 */
}
/* 4. 保持你原来 el-button 的样式 */
.action-btns .el-button {
  /* 例：plain circle */
  padding: 0;
  width: 24px;
  height: 24px;
  line-height: 24px;
  border-radius: 50%;
}
.action-btns .el-icon {
  font-size: 14px;
}
.preview-wrapper {
  max-height: 300px;       /* 与之前 body-wrapper 的高度保持一致 */
  overflow: auto;          /* 同时允许纵向和横向滚动 */
}
.preview-files {
  margin-top: 8px;
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}
.preview-tag {
  margin: 0;
  cursor: pointer;
}
</style>