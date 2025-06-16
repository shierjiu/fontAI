<template>
    <el-drawer
      v-model="state.visibleInternal"
      title="生成用例"
      size="30%"
      with-header
      @close="handleClose"
    >
    <el-form label-position="top" class="p-4">
      <el-form-item >
        <el-cascader
          v-model="form.agent"
          :options="agentGroupList"
          :props="{ label: 'name', value: 'id', children: 'children', emitPath: false }"
          placeholder="请选择测评器"
          :show-all-levels="false"
          size="small"
        />
      </el-form-item>
    <el-form-item >
        <el-input-number
            v-model="form.case_number"
            :min="1"
            :step="1"
            controls-position="right"
            size="small"
        />
    </el-form-item>

    <el-form-item label="用例类型">
        <div class="case-types">
            <el-tag
            v-for="type in allCaseTypes"
            :key="type"
            :type="form.case_type.includes(type) ? 'primary' : 'info'"
            @click="toggleCaseType(type)"
            effect="plain"
            style="cursor: pointer; margin-right: 8px; margin-bottom: 8px;"
            >
            {{ type }}
            </el-tag>
        </div>
    </el-form-item>

    </el-form>
    <template #footer>
      <div class="drawer-footer">
        <el-button type="primary" @click="submit">开始生成</el-button>
      </div>
    </template>
    </el-drawer>
</template>

<script setup>
import { defineProps, defineEmits, reactive, watch ,onMounted,ref} from 'vue'
import * as TestCases from '@/api/TestCases/index'
import * as AiGenerateEvaluation from '@/api/AiEvaluation/index'
const props = defineProps({
    visible: Boolean,
    row: {
        type: Object,
        default: null
    }
})
const datasetId=props.row.project.id
const emit = defineEmits(['update:visible', 'finished'])
const state = reactive({
  visibleInternal: props.visible,
})
// 所有可选用例类型
const allCaseTypes = ref([
  '冒烟测试',
  '功能测试',
  '性能测试',
  '安全测试',
  '回归测试'
])
// 下拉列表数据
const agentGroupList = ref([])
// 表单数据
const form = reactive({
  agent: [],
  case_type: [],
  case_number: 15,
  group: []
})
const cascaderProps = {
  label: 'name',
  value: 'id',
  children: 'children',
  emitPath: false  // 只返回测评器id
}
function handleClose() {
  state.visibleInternal = false
}
// 切换用例类型选中状态
function toggleCaseType(type) {
  const idx = form.case_type.indexOf(type)
  if (idx >= 0) {
    form.case_type.splice(idx, 1)
  } else {
    form.case_type.push(type)
  }
}
//提交
async function submit() {
 try{
    const params={
        requirement: props.row.id,
        agent: form.agent,
        case_type: form.case_type,
        case_number: form.case_number,
        project: datasetId
    }
    const res=await TestCases.postSubmitTestCase(params)
 } catch (error) {
    console.error('Error in submit:', error);
 }
}

//获取评测测评器的列表
async function getAgentGroupList() {
  const res = await AiGenerateEvaluation.postEvaluationAgentGroupList()
  const rawList = ref([])
  rawList.value = res.data.data
  console.log('获取评测测评器的列表:', rawList.value);
  const grouped = {}
  rawList.value.forEach(item => {
    if (!grouped[item.group]) {
      grouped[item.group] = []
    }
    grouped[item.group].push({
      id: item.id,
      name: item.name
    })
  })
    agentGroupList.value = Object.entries(grouped).map(([groupName, children]) => ({
    name: groupName,
    children
  }))
  console.log('处理后的评测测评器列表:', agentGroupList.value);
}



watch(() => props.visible, v => state.visibleInternal = v)
watch(() => state.visibleInternal, v => emit('update:visible', v))


onMounted(() => {
  getAgentGroupList()
})
</script>

<style scoped>
.case-types {
  display: flex;
  flex-wrap: wrap;
}
.drawer-footer {
  text-align: right;
}
</style>