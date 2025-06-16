<template>
  <div>
    <el-table 
    v-if="listData.length"
    :data="filteredList"
    border
    style="width: 100%;"
    >
    <el-table-column prop="name" label="名称" min-width="150"></el-table-column>
    <el-table-column label="所属项目" min-width="150">
      <template #default="scope">{{ scope.row.project.name }}</template>
    </el-table-column>
    <!-- <el-table-column prop="content" label="内容" min-width="300">
        <template #default="scope"><pre class="multi-line">{{ scope.row.content }}</pre></template>
    </el-table-column> -->
    <el-table-column label="内容" min-width="300" show-overflow-tooltip>
      <template #default="{ row }">
        <el-input
          v-if="row.editing"
          type="textarea"
          :rows="3"
          v-model="row.editData.content"
        />
        <pre v-else class="multi-line">{{ row.content }}</pre>
      </template>
    </el-table-column>
    <!-- <el-table-column prop="test_point" label="测试点" min-width="300">
        <template #default="scope"><pre class="multi-line">{{ scope.row.test_point }}</pre></template>
    </el-table-column>  -->
     <el-table-column label="测试点" min-width="200" show-overflow-tooltip>
      <template #default="{ row }">
        <el-input
          v-if="row.editing"
          v-model="row.editData.test_point"
          type="textarea"
          size="small"
        />
        <span v-else>{{ row.test_point }}</span>
      </template>
     </el-table-column>
    <el-table-column prop="test_point_agent" label="智能体" min-width="120"></el-table-column>
    <el-table-column prop="test_point_status" label="测试状态" min-width="100"></el-table-column>
      <!-- 操作列 -->
    <el-table-column label="操作" width="200" fixed="right">
    <template #default="scope">
        <div v-if="scope.row.editing">
        <el-button link type="primary" size="small" @click="DatasetItemInfoSubmit(scope.row)">提交</el-button>
        <el-button link type="info" size="small" @click="DatasetItemInfoCancel(scope.row)">取消</el-button>
        </div>
        <div v-else>
        <el-button link type="primary" size="small" @click="openGenerateUseCases(scope.row)">生成</el-button>
        <el-button link type="primary" size="small" @click="DataSetInfoEditEnable(scope.row)">编辑</el-button>
        <el-button link type="primary" size="small" @click="DatasetItemDelete(scope.row.id)">删除</el-button>
        <!-- <el-button link type="primary" size="small" @click="UpdateDataItem(scope.row.id)">更新</el-button> -->
        </div>
    </template>
    </el-table-column>   
    </el-table>
    <div v-else class="empty-tip">暂无数据</div>
    <GenerateUseCases
      v-if="drawerVisible"
      :visible="drawerVisible"
      :row="currentRow"
      @close="drawerVisible = false"
    />
  </div>
</template>

<script setup>
import * as TestCases from "@/api/TestCases/index"
import { onMounted,ref ,defineProps,computed,defineExpose } from "vue"
import { ElMessageBox,ElNotification } from 'element-plus'
import GenerateUseCases from "./GenerateUseCases.vue"
const props = defineProps({
  selectedNode: {
    type: Object,
    default: null
  }
})
const rawEditing = ref(false) // 是否有行正在编辑
const listData = ref([])// 列表数据
const drawerVisible= ref(false)
const currentRow   = ref(null)
const filteredList=computed(()=>{
  if (!props.selectedNode || props.selectedNode.id == null){
    return listData.value
  }
  return listData.value.filter(item=>{
    return String(item.project.id)===String(props.selectedNode.id)
  })
})

// 生成用例
async function openGenerateUseCases(row) {
  //console.log('生成用例行',row)
  currentRow.value   = row
  drawerVisible.value= true
}

// 提交需求表编辑
async function DatasetItemInfoSubmit(row){
  //console.log('提交行',row)
  const params = {
    id: row.id,
    project: row.project.id,
    name: row.name,
    content: row.editData.content,
    test_point: row.editData.test_point,
    test_point_agent: row.test_point_agent,
    test_point_status: row.test_point_status
  }
  await TestCases.postSubmitRequirement(params)
  getListData()
      // 4. 关闭编辑状态
    row.editing = false
    rawEditing.value = false
}
//取消需求表编辑
function DatasetItemInfoCancel(row) {
    if (row.id) {
    row.editing = false
  }else{
    const idx = filteredList.value.findIndex(item => item === row)
    if (idx > -1) {
      filteredList.value.splice(idx, 1)
    }
  }
    // 解除“正在编辑中”的全局锁
  rawEditing.value = false
}
//编辑需求表
async function DataSetInfoEditEnable(row) {
    console.log('编辑行',row)
    if (rawEditing.value) {
    ElNotification({
      message: "请先提交当前数据",
      type: "warning",
    })
    } else{
      rawEditing.value = true
      row.editData = {
        name: row.name,
        content: row.content,
        test_point: row.test_point,
        test_point_agent: row.test_point_agent,
        test_point_status: row.test_point_status
      }
      row.editing = true
    }
}
//删除需求表
async function DatasetItemDelete(id) {
      await ElMessageBox.confirm(
      '确认要删除这条需求吗？此操作不可撤销！',
      '删除确认',
      {
        type: 'warning',
        confirmButtonText: '删除',
        cancelButtonText: '取消'
      }
    )
    try {
       console.log('删除id',id)
        await TestCases.postDeleteRequirement(id)
        listData.value = listData.value.filter(item => item.id !== id)
        console.log('删除成功')
    } catch (error) {
        console.error('删除失败', error)
    }
}
//获得列表数据
async function getListData() {
    const params={
        pageEnable:false,
        pageSize:20,
        pageNum:1,
        pageRule:[{}]
    }
    const res=await TestCases.postListData(params)
    listData.value=res.data.data.data
    console.log('list数据',listData.value)
}
//获得智能体列表
async function getAgentList() {
    const res=await TestCases.postAllAgent()
    //console.log('智能体列表',res)
}
onMounted(()=>{
    getListData()
    // getAgentList()
})
// 通过 defineExpose 暴露 getListData 给父组件调用
defineExpose({
  getListData
});
</script>


<style scoped>
/* 保证 pre 内的换行生效 */
.multi-line {
  white-space: pre-wrap;    /* 自动换行 */
  word-break: break-all;    /* 长字符串也能换行 */
  margin: 0;                /* 去掉额外的顶部/底部空隙 */
  font-family: inherit;     /* 与表格字体一致 */
  font-size: 14px;
  line-height: 1.5;
}

/* 暂无数据提示样式 */
.empty-tip {
  text-align: center;
  margin-top: 20px;
  color: #999;
  font-size: 14px;
}
</style>