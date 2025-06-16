<template>
  <div class="topbutton">
    <el-button type="primary" @click="excelExport">下载</el-button>
  </div>
  <div class="datalist">
    <el-table :data="form" border style="min-width: 800px">
      <el-table-column label="用例名称">
        <template #default="scope">
          <span>{{ scope.row.title }}</span>
        </template>
      </el-table-column>
      <el-table-column label="所属模块">
        <template #default="scope">
          <span>{{ scope.row.belonging_module }}</span>
        </template>
      </el-table-column>
      <el-table-column label="标签">
        <template #default="scope">
          <span>{{ scope.row.label }}</span>
        </template>
      </el-table-column>
      <el-table-column label="前置条件">
        <template #default="scope">
          <span>{{ scope.row.precondition }}</span>
        </template>
      </el-table-column>
      <el-table-column label="步骤">
        <template #default="scope">
          <span>{{ scope.row.steps }}</span>
        </template>
      </el-table-column>
      <el-table-column label="预期结果">
        <template #default="scope">
          <span>{{ scope.row.expected_result }}</span>
        </template>
      </el-table-column>
      <el-table-column label="编辑模式">
        <template #default="scope">
          <span>{{ scope.row.editor_mode }}</span>
        </template>
      </el-table-column>
      <el-table-column label="备注">
        <template #default="scope">
          <span>{{ scope.row.remark }}</span>
        </template>
      </el-table-column>
      <el-table-column label="状态">
        <template #default="scope">
          <span>{{ scope.row.status }}</span>
        </template>
      </el-table-column>
      <el-table-column label="负责人">
        <template #default="scope">
          <span>{{ scope.row.assignee }}</span>
        </template>
      </el-table-column>
      <el-table-column label="用例等级">
        <template #default="scope">
          <span>{{ scope.row.priority }}</span>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
        class="table-pagination"
        v-model:current-page="pageNum"
        v-model:page-size="pageSize"
        :total="pageTotal"
        :page-sizes="[10, 50, 100, 500]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="onSizeChange"
        @current-change="onPageChange"
        />
  </div>
</template>


<script setup>
import { ref,onMounted } from 'vue';
import * as TestGeneration from '@/api/TestCases/index.js';
import { useRoute } from 'vue-router';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
const route = useRoute();
const form= ref([]);
const pageNum = ref(1)
const pageSize = ref(10)
const pageTotal = ref(0)
async function onSizeChange (val) {
  pageSize.value = val
  if (pageNum.value <= Math.ceil(pageTotal.value / pageSize.value)){
      await getTestGenerationList()
  }

}
async function onPageChange (val) {
    console.log('当前页码:', val);
  pageNum.value = val
  await getTestGenerationList()
}
function excelExport(){
  let exportData= form.value;
  // 2. 处理导出字段
  const fields = [
    {key:'title', label: '用例名称'},
    {key:'belonging_module', label: '所属模块'},
    {key:'label', label: '标签'},
    {key:'precondition', label: '前置条件'},
    {key:'steps', label: '步骤'},
    {key:'expected_result', label: '预期结果'},
    {key:'editor_mode', label: '编辑模式'},
    {key:'remark', label: '备注'},
    {key:'status', label: '状态'},  
    {key:'assignee', label: '负责人'},
    {key:'priority', label: '用例等级'}
  ]
  // 3. 格式化数据
  const data = exportData.map(row => {
    return {
        title: row.title,
        belonging_module: row.belonging_module,
        label: row.label,
        precondition: row.precondition,
        steps: row.steps,
        expected_result: row.expected_result,
        editor_mode: row.editor_mode,
        remark: row.remark,
        status: row.status,
        assignee: row.assignee,
        priority: row.priority
    }
  })
  // 4. 生成 worksheet
  const ws = XLSX.utils.json_to_sheet(data, { header: fields.map(f => f.key) })
  // 设置表头
  XLSX.utils.sheet_add_aoa(ws, [fields.map(f => f.label)], { origin: 'A1' })
  // 5. 生成 workbook
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, '数据集')
  //excel导出
  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
  saveAs(new Blob([wbout], { type: 'application/octet-stream' }), '数据集导出.xlsx')
}

//获得测试用例记录表
async function getTestGenerationList() {
    try {
        const params = {
            pageEnable: true,
            pageNum: pageNum.value,
            pageSize: pageSize.value,
            pageRule: [
                {
                    field: 'record',
                    value: route.params.id, // 使用路由参数中的 ID
                    rule: 'is'
                }
            ]
        };
        const response = await TestGeneration.postTestCaseRecordList(params);
        form.value = response.data.data.data || [];
        pageTotal.value = response.data.data.total || 0;
        console.log('form List:', form.value);
        // 处理响应数据
    } catch (error) {
        console.error('Error fetching test generation list:', error);
    }
}

onMounted(() => {
    getTestGenerationList();
});
</script>

<style scoped>
.topbutton {
  margin-bottom: 20px;
}
</style>