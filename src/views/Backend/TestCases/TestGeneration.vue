<template>
    <div class="test-generation">
        <div class="left"><DatasetTree  @node-click="onTreeNodeClick"/></div>
        <div class="right">
        <div class="table-wrapper">
        <el-table :data="testGenerationList"
        border
        style="min-width: 800px">
        <el-table-column prop="record" label="生成记录" width="250">
            <template #default="scope">
                <span>{{ scope.row.code }}</span>
            </template>
        </el-table-column>
        <el-table-column prop="record" label="需求" width="250">
            <template #default="scope">
                <span>{{ scope.row.requirement.content }}</span>
            </template>
        </el-table-column>
        <el-table-column prop="record" label="智能体" width="250">
            <template #default="scope">
                <span>{{ scope.row.agent }}</span>
            </template>
        </el-table-column>
        <el-table-column prop="record" label="用例类型" width="250">
            <template #default="scope">
                <span>{{ scope.row.case_type }}</span>
            </template>
        </el-table-column>
        <el-table-column prop="record" label="用例数目" width="250">
            <template #default="scope">
                <span>{{ scope.row.case_number }}</span>
            </template>
        </el-table-column>
        <el-table-column prop="record" label="更新时间" width="250">
            <template #default="scope">
                <span>{{ formatDate(scope.row.update_time) }}</span>
            </template>
        </el-table-column>

        <el-table-column label="操作" width="250">
            <template #default="scope">
                <el-button link type="primary" size="small" @click="searchTestCase(scope.row.id)">查看</el-button>
                <el-button link type="danger" size="small" @click="deleteTestCase(scope.row.id)">删除</el-button>
            </template>
        </el-table-column>
        </el-table>
        </div>
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
    </div>
</template>
<script setup>
import DatasetTree from '@/views/Backend/TestCases/components/DatasetTree.vue'
import * as TestGeneration from '@/api/TestCases/index.js';
import { useRouter } from 'vue-router';
import { onMounted,ref,watch } from 'vue';
import { formatDate } from '@/utils/date.js';
const testGenerationList = ref([]);
const datasetId= ref(null);
const router = useRouter();
const pageNum = ref(1);
const pageSize = ref(10);
const pageTotal = ref(0);
watch(datasetId, async (newVal, oldVal) => {
  // 切换数据集时把页码重置到 1（可选）
  await getTestGenerationList()
})

async function onPageChange (val) {
  pageNum.value = val
  await fetchFileData()
}
async function onSizeChange (val) {
  pageSize.value = val
  if (pageNum.value <= Math.ceil(pageTotal.value / pageSize.value)){
      await fetchFileData()
  }

}
//获得节点
const onTreeNodeClick = (node) => {
    datasetId.value = node.id;
};
//查看测试用例
const searchTestCase = (id) => {
router.push(`components/test-flow-testcase/${id}`);
};

//删除测试用例
const deleteTestCase = async (id) => {
    console.log('Deleting Test Case with ID:', id);
    await TestGeneration.postDeleteTestGeneration(id);
    getTestGenerationList();
};
//获取测试用例生成列表
const getTestGenerationList = async () => {
    try {
        console.log('Fetching test generation list for dataset ID:', datasetId.value);
        const params = {
            pageEnable: true,
            page: 1,
            pageSize: 10,
            pageRule:[
                {
                    field: "project__id",
                    rule: "is",
                    value: String(datasetId.value)
                }
            ]
        };
        const response = await TestGeneration.postTestGenerationList(params);
        testGenerationList.value = response.data.data.data || [];
        pageTotal.value = response.data.total || 0;
    } catch (error) {
        console.error('Error fetching test generation list:', error);
    }
};

onMounted(() => {
    getTestGenerationList();
});
</script>

<style scoped>
.table-wrapper {
  flex: 1;
  overflow-x: auto;
}
.table-pagination {
  margin-top: 20px;
  text-align: right;
}
.left {
  width: 250px;
}
.test-generation {
  display: flex;
}
.right {
  flex: 1;
  min-width: 0;     
  display: flex;     
  flex-direction: column;
}
</style>