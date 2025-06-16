<template>
    <div class="tree-container">
        <el-tree
          ref="treeRef"
          :data="treeData"
          node-key="id"
          default-expand-all
          :props="defaultProps"
          highlight-current
          :current-node-key="currentNodeKey"
          @node-click="handleNodeClick"
        >
        <template #default="{node, data}">
            <div class="tree-node">
              <el-tooltip 
                v-if="!data.children || data.children.length === 0"
                :content="data.name"
                placement="top">
                <span class="label">{{ data.name }}</span>
              </el-tooltip>
              <span v-else class="label">{{ data.name }}</span>
            <el-space class="action-btns" direction="horizontal" size="small">
              <el-button size="mini" plain circle @click.stop="openDialog('add', data)">
                <el-icon><Plus/></el-icon>
              </el-button>
              <el-button size="mini" plain circle @click.stop="openDialog('edit', data)">
                <el-icon><EditPen/></el-icon>
              </el-button>
              <el-button size="mini" v-if="!data.isRoot" type="danger" plain circle @click.stop="confirmDeleteNode(data)">
                <el-icon><Minus/></el-icon>
              </el-button>
            </el-space>
            </div>
        </template>
        </el-tree>
    <!-- 新增/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 'add' ? '新增节点' : '编辑节点'"
      width="30%"
    >
      <el-form :model="treeForm">
        <el-form-item label="节点名称" required>
          <el-input v-model="treeForm.name" placeholder="请输入节点名称" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitDialog">确定</el-button>
      </template>
    </el-dialog>
    </div>
</template>

<script setup>
//树的内容
import { ref, onMounted,defineEmits } from 'vue'
import { useRouter } from 'vue-router'
import {postDatasetTreeList} from '@/api/AiEvaluation/index.js'
import {ElNotification,ElMessageBox} from "element-plus"
import * as AiEvaluation from "@/api/AiEvaluation/index"
const treeData = ref([])//树的内容
const currentNodeKey = ref(null)//当前选中的节点
const router = useRouter()
const treeRef = ref(null)//树形结构引用
const leafNodes = ref([])// 用于存储叶子节点
// 对话框状态
const dialogVisible = ref(false)
const dialogType = ref('add')
const treeForm = ref({ id: null, name: '', parent_id: null })
const emit = defineEmits(['updateLeafNodes','node-click'])// 定义事件以便父组件可以监听叶子节点更新
// 配置项：指定子节点字段为 'children'，展示名称为 'name'
const defaultProps = {
    children: 'children',
    label: 'name'
}
// 点击树节点时执行：更新当前选中节点并跳转路由
const handleNodeClick = (node) => {
  currentNodeKey.value = node.id
  emit('node-click',node)
}
// 打开对话框，type = 'add' | 'edit', data = 当前节点
function openDialog(type, data) {
  dialogType.value = type
  if (type === 'add') {
    const pid = data.id === 0 ? null : data.id
    treeForm.value = { id: null, name: '', parent_id: pid }
  } else {
    treeForm.value = { id: data.id, name: data.name, parent_id: data.parent_id }
  }
  dialogVisible.value = true
}
// 确认对话框提交
async function submitDialog() {
  if (!treeForm.value.name) {
    ElNotification.warning('节点名称不能为空')
    return
  }
  try {
    const params = { name: treeForm.value.name }
    if (treeForm.value.id) {
      params.id = treeForm.value.id    
    }
    if (treeForm.value.parent_id != null) {
      params.parent = treeForm.value.parent_id  
    }
    const res = await AiEvaluation.postDatasetTreeInfo(params)
    if (res.status === 200) {
      ElNotification.success(dialogType.value === 'add' ? '新增成功' : '编辑成功')
      dialogVisible.value = false
      loadTree()
    }
  } catch (e) {
    ElNotification.error('操作失败：' + (e.message || '未知错误'))
  }
}
// 删除节点
function confirmDeleteNode(data) {
  ElMessageBox.confirm(
    `确认删除节点“${data.name}”？此操作不可撤销！`,
    '删除确认',
    { type: 'warning' }
  ).then(async () => {
    try {
      const res = await AiEvaluation.deleteDatasetTreeInfo(data.id)
      if (res.status === 200) {
        ElNotification.success('删除成功')
        loadTree()
      }
    } catch (e) {
      ElNotification.error('删除失败：' + (e.message || '未知错误'))
    }
  })
}
// 加载树形数据（在组件挂载时调用）
async function loadTree() {
  const res = await postDatasetTreeList({ pageEnable: false })  // 向后端请求树数据
  const children = res.data.data.data || []
  treeData.value = [
    {
      id: 0,
      name: '根节点',
      isRoot: true,
      children: res.data.data.data || []  // 添加所有子节点
    }
  ]
  console.log('tree',treeData.value)
  //leafNodes.value = getLeafNodes(children)
  const rawLeaves = getLeafNodes(children)
  leafNodes.value = rawLeaves.map(node => ({
    id: node.id,
    name: node.name,
    datasetId: node.id 
  }))
  emit('updateLeafNodes', leafNodes.value) // 通知父组件
}
function getLeafNodes(nodes){
  const leaves = []
  nodes.forEach(node => {
    if (node.children && node.children.length > 0) {
      leaves.push(...getLeafNodes(node.children)) // 递归获取子节点的叶子节点
    } else {
      leaves.push(node) // 如果没有子节点，则为叶子节点
    }
  })
  return leaves
}
onMounted(() => {
  loadTree()
})
</script>

<style scoped>
.tree-container {
  width: 200px;
  min-width: 200px;
  border-right: 1px solid #dcdfe6;
  padding-right: 12px;
  height: 100vh;
  overflow-y: auto;
}

.tree-node {
  display: flex;
  align-items: center;
  padding: 4px 0;
  width: 100%;
}

.label {
  flex: 1;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.tree-node:hover .action-btns {
  display: flex;          /* 悬浮时显示 */
}
/* 调整操作按钮右对齐 */
.action-btns {
  margin-left: auto;
  display: none;
  justify-content: flex-end;
  align-items: center;
  gap: 2px;
}

/* 调整按钮尺寸 */
.action-btns .el-button {
  padding: 0;
  width: 18px;
  height: 18px;
  line-height: 18px;
}
.action-btns .el-icon {
  font-size: 12px;
}
</style>