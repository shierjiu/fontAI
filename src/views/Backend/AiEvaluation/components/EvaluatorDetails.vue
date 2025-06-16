<template>
    <div class="detail-page">
    <el-table
      :data="resultObj"
      border
      style="width: 100%; margin-top: 16px;"
      class="detail-table"
    >
      <el-table-column
        v-for="key in detailTableKeys"
        :key="key"
        :prop="key"
        :label="key"
        align="left"
        header-align="left"
        class-name="custom-cell"
        header-class-name="custom-header"
        show-overflow-tooltip
      >
        <template #default="{ row }">
          <div v-if="row.editing">
            <el-input v-model="row[key]" size="small" />
          </div>
          <div v-else>
            <span :title="row[key]">{{ row[key] }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column
        label="操作"
        width="180"
        fixed="right"
      >
        <template #default="{ row }">
            <div v-if="row.editing">
            <el-button
                type="primary"
                link
                size="small"
                @click="submitDetailRowEdit(row)"
            >提交</el-button>
            <el-button
                type="info"
                link
                size="small"
                @click="cancelEditDetailRow(row)"
            >取消</el-button>
            </div>
            <div v-else>
            <el-button
                type="primary"
                link
                size="small"
                @click="startEditDetailRow(row)"
            >编辑</el-button>
            </div>
        </template>
      </el-table-column>
    </el-table>
    </div>
</template>

<script setup>
import { ElNotification, ElMessage } from 'element-plus';
import { useRoute } from 'vue-router';
import { ref, computed, onMounted } from 'vue';
import * as AiGenerateEvaluation from "@/api/AiEvaluation";
import dayjs from 'dayjs';
const pageSize = ref(20)
const pageNum = ref(1)
const pageTotal = ref(0)
const route = useRoute()
const recordId = route.params.id
const resultObj = ref([])  // 初始为空数组
const rawEditing = ref(false)
// 计算出需要展示的表头（去除'id'字段和'editing'字段）
const detailTableKeys = computed(() => {
  const firstRow = resultObj.value && Array.isArray(resultObj.value) ? resultObj.value[0] : null;
  if (!firstRow) return [];
  return Object.keys(firstRow).filter(key => key !== 'id' && key !=='editing');
});
function startEditDetailRow(row) {
  console.log('选择数据:', row);
  row.editing = true;
}
//取消
function cancelEditDetailRow(row) {
  console.log('取消编辑:', row);
  row.editing = false;
  rawEditing.value = false;
}
//编辑详情数据
async function submitDetailRowEdit(row) {
  try {
    delete row.editing
    let resultData = row;
    console.log('resultData:', resultData);
      if (typeof resultData === 'object' && resultData !== null) {
        resultData = JSON.stringify(resultData);  
    }
    const data = {
      id:row.id,
      result:resultData
    }
    console.log('提交编辑的行数据:', data);
    const res = await AiGenerateEvaluation.postEvaluationHistoryDetailEdit(data)
    if (res.status === 200 && res.data.code === 'success') {
      ElMessage.success('修改成功')
      await EvaluationDetailRecord({id:recordId})
      row.editing = false
      rawEditing.value = false
    } else {
      ElMessage.error(res.data.message || '提交失败')
    }
  } catch (error) {
    console.error('提交失败', error)
    ElMessage.error('提交时发生错误')
  }
}
// 获取评估的记录详情中的record_id
async function EvaluationDetailRecord(row) {
  console.log('评做器的ROW记录EvaluationDetailRecord:', row);
  console.log('评做器的ROW记录ID:', row.id);
  const params={
    pageNum:pageNum.value,
    pageSize:pageSize.value,
    pageEnable:true,
    pageRule:[{
      field:"record",
      rule:"is",
      value:row.id
    }]
  }
  try {
    const res = await AiGenerateEvaluation.postEvaluationHistoryDetailList(params)
    console.log('获取到的列表记录:', res);
    const arr = res.data.data.data;
    console.log('获取到的arr:', arr);
    // 解析每一项的 result 字段
    resultObj.value = arr.map(item => {
      let resultObj = {}
      try {
        resultObj = JSON.parse(item.result)
      } catch (e) {}
      const agents = item.record.agent  || []
      console.log('获取到的agents:', agents);
      agents.forEach(name=>{
      if(!(name in resultObj)){
       resultObj[name] = null
      }
    })
      return resultObj
    })
    console.log('resultObj获取到的结果对象的值 :', resultObj);
  } catch (e) {
    ElMessage.error('获取详情失败')
  }
}
onMounted(() => {
  console.log('组件挂载完成，开始获取评估记录详情');
  EvaluationDetailRecord({id:recordId})
})
</script>

<style lang="css" scoped>
.custom-cell {
  text-align: left;
  font-size: 14px;
  color: #222;
}
</style>