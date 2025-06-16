<template>
  <div class="file-content">
    <template v-if="!isViewingFile">
      <div class="button-group" style="margin-bottom: 12px;">
        <el-button
          size="mini"
          type="success"
          @click="openDialog('add')"
        >新增</el-button> 
      </div>
      <el-table :data="datasetList" border style="margin-top: 12px">
        <el-table-column prop="name" label="数据集" />
        <el-table-column label="操作" width="190">
          <template #default="scope">
            <el-button
              link
              size="small"
              type="primary"
              @click.stop="openDialog('edit', scope.row)"
            >编辑</el-button>
            <el-button
              link  
              size="small"
              type="primary"
              @click="handleRowClick(scope.row)"
            >查看</el-button>
            <el-button
              link
              size="small"
              type="danger"
              @click.stop="confirmDeleteNode(scope.row)"
            >删除</el-button>
          </template>
        </el-table-column>
      </el-table>
        <el-pagination class="table-pagination" v-model:current-page="pageNum" v-model:page-size="pageSize" :total="pageTotal" :page-sizes="[10, 50, 100, 500]" layout="total, sizes, prev, pager, next, jumper" @size-change="onSizeChange" @current-change="onPageChange"/>
    </template>
    <!-- <template v-else>
      <div class="router-view-wrapper">
        <RouterView style="border: 1px solid red;"/>
      </div>
    </template> -->
  </div>
  <el-dialog
    v-model="dialogVisible"
    :title="dialogType === 'add' ? '新增节点' : '编辑节点'"
    width="30%"
  >
    <el-form :model="nodeForm">
      <el-form-item label="节点名称" required>
        <el-input v-model="nodeForm.name" placeholder="请输入节点名称" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="dialogVisible = false">取消</el-button>
      <el-button type="primary" @click="submitDialog">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { useRouter,useRoute } from 'vue-router'
import { computed,onMounted,ref,watch } from 'vue'
import * as AiEvaluation from "@/api/AiEvaluation/index"
import { ElNotification ,ElMessageBox} from 'element-plus'
import { useStore } from 'vuex'
const store = useStore()
const router = useRouter()
const route = useRoute()
const props = defineProps({
  nodeId: String,
  leafNodes: Array
})
const datasetList=ref([])//数据集列表
//对话框状态
const datasetId=ref(route.params.nodeId)
const dialogVisible=ref(false)
const dialogType = ref('add')
const nodeForm=ref({id:null,name:''})//对话框存储内容
const pageNum = ref(1)
const pageTotal = ref(0)
const pageSize = ref(20) // 或更大，确保能获取全部数据
// 判断当前是否处于 file/:fileId 路由中
const isViewingFile = computed(() => route.name === 'fileProcess')

const handleRowClick = (row) =>{
    // 1. 把三个 ID 存到全局
  store.commit('setCurrentParams', {
    nodeId:    props.nodeId,
    fileId:    row.id,
    datasetId: row.id
  })
    const target = {
    name: 'fileProcess',
    params: {
      nodeId:    props.nodeId,
      fileId:    row.id,
      datasetId: row.id
    }
  }
  const resolved = router.resolve(target)
  console.log('resolved',resolved)
   const { title, icon, path } = resolved.meta
   store.commit('addMenu', { title, icon, path })
  router.push(target).catch(err => {
    if (!/Avoided redundant navigation/.test(err.message)) {
      console.error(err)
    }
  })
}
watch(
  () => route.params.nodeId,
  (newId) => {
    datasetId.value = newId
    getDatasetItemList()
  }
)
async function onSizeChange(val) {
  pageSize.value = val
  if (pageNum.value <= Math.ceil(pageTotal.value / pageSize.value)) {
    // 判断页码存在，不存在时会自动触发onPageChange
    await  getDatasetItemList() 
  }
}
async function onPageChange(val) {
  pageNum.value = val
  await getDatasetItemList() 
}
// 打开对话框，type = 'add' | 'edit', data = 当前节点
function openDialog(type, data) {
  dialogType.value = type
  if (type === 'add') {
    nodeForm.value = { id: null, name: '' }
  } else {
    nodeForm.value = { id: data.id, name: data.name }
  }
  dialogVisible.value = true
}
// 删除
function confirmDeleteNode(row) {
  ElMessageBox.confirm(
    `确认删除节点“${row.name}”？此操作不可撤销！`,
    '删除确认',
    { type: 'warning' }
  ).then(async () => {
    try {
      const res = await AiEvaluation.deleteNode(row.id)
      if (res.status === 200) {
        ElNotification.success('删除成功')
        getDatasetItemList()
      }
    } catch (e) {
      ElNotification.error('删除失败：' + (e.message || '未知错误'))
    }
  })
}
// 确认对话框提交
async function submitDialog() {
  if (!nodeForm.value.name) {
    ElNotification.warning('节点名称不能为空')
    return
  }
  try {
    let params;
    if(dialogType==="add"){
      params = {project:props.nodeId, name: nodeForm.value.name }
    }else{
      params={id:nodeForm.value.id, name: nodeForm.value.name,project:props.nodeId}
    }
    console.log('params',params)
    const res = await AiEvaluation.postNode(params)
    if (res.status === 200) {
      ElNotification.success(dialogType.value === 'add' ? '新增成功' : '编辑成功')
      dialogVisible.value = false
      getDatasetItemList()
    }
  } catch (e) {
    ElNotification.error('操作失败：' + (e.message || '未知错误'))
  }
}
//获取dataset
async function getDatasetItemList(){
  console.log('获取数据集列表',datasetId.value)
  const params={
    pageEnable:false,
    pageSize:pageSize.value,
    pageNum:pageNum.value,
    pageRule:[
      {
        field:"project__id",
        rule:"is",
        value:datasetId.value
      },
    ]
  }
  const res=await AiEvaluation.postDatasetList(params)
  datasetList.value=res.data.data.data
  console.log('数据集',datasetList.value)
  pageTotal.value=datasetList.value.length
}
onMounted(()=>{getDatasetItemList()})
</script>

<style scoped>
.file-content {
  padding: 20px;
  height: 100%;
}
.router-view-wrapper {
  flex: 1;
  width: 100%;
  height: 100%;
}
.button-group {
  display: flex;
  gap: 8px;
}
</style>