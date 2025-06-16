<template>
    <el-table :data="filteredTableData">
        <el-table-column label="任务ID" prop="id" width="150" />
        <el-table-column label="任务名称" prop="task_name" width="350" />
        <el-table-column label="定时设置"  width="250">
            <template #default="{ row }">
                {{ row.timing_on === 1 ? '已开启' : '未开启' }}
            </template>
        </el-table-column>
        <el-table-column label="定时状态"  width="250">
            <template #default="{ row }">
                {{ row.scheduler_status === 1 ? '已启动' : '未开启' }}
            </template>
        </el-table-column>
        <el-table-column label="任务状态"  width="250">
            <template #default="{ row }">
                <span :style="{ color: row.task_status === '任务正常' ? 'green' : 'red' }">
                    {{ row.task_status }}
                </span>
            </template>
        </el-table-column>
        <el-table-column label="下次执行时间" prop="next_run_time" width="250" />
    </el-table>

    <el-pagination class="table-pagination" v-model:current-page="pageNum" v-model:page-size="pageSize" :total="pageTotal" :page-sizes="[10, 20, 50, 100]"
                   layout="total, sizes, prev, pager, next, jumper" @size-change="onSizeChange" @current-change="onPageChange"/>
</template>

<script setup>
import { onMounted, onUnmounted, ref, computed } from "vue"
import {
    MenuInspectionSchedulerTaskList
} from "@/api/TestCases/index";
import { ElMessage } from "element-plus";

// 生命周期函数，每隔10秒请求一次table数据
onMounted(() => {
    pageList()
    const intervalId = setInterval(pageList, 10000)
    onUnmounted(() => {
        clearInterval(intervalId)
    })
})

const tableData = ref([])
const pageNum = ref(1)
const pageSize = ref(20)
const pageTotal = ref(0)

async function pageList() {
    const res = await MenuInspectionSchedulerTaskList({
        pageNum: pageNum.value,
        pageSize: pageSize.value,
    })
    if (res.status === 200) {
        const rawData = res.data.data.data;
        tableData.value = rawData.map(item => {
            const taskStatus = item.timing_on === item.scheduler_status ? '任务正常' : '任务错误';
            return {
                ...item,
                task_status: taskStatus
            };
        });
        pageTotal.value = res.data.data.total
    }
    return res
}

async function onSizeChange(val) {
    pageSize.value = val
    if (pageNum.value <= Math.ceil(pageTotal.value / pageSize.value)) {  // 判断页码存在，不存在时会自动触发onPageChange
        const res = await pageList()
        ElMessage({
            message: res.data.message,
            type: res.data.code,
            plain: true,
        })
    }
}

async function onPageChange(val) {
    pageNum.value = val
    const res = await pageList()
    ElMessage({
        message: res.data.message,
        type: res.data.code,
        plain: true,
    })
}

const filteredTableData = computed(() => {
    return tableData.value.filter(item => item.timing_on === 1 || item.task_status === '任务错误');
});
</script>

<style scoped>
.table-pagination {
    padding-top: 10px;
}
</style>