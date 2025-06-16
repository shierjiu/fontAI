<template>

  <el-table :data="tableData">
    <el-table-column type="index" width="50"  fixed="left"/>
    <el-table-column label="时间" width="200">
      <template #default="scope">{{formatDate(scope.row.create_time)}}</template>
    </el-table-column>
    <el-table-column label="名称" prop="task_name" width="250" />
    <el-table-column label="地址" prop="task_url" width="250" />
    <el-table-column label="用户" prop="task_username" width="150" />
    <el-table-column label="状态" prop="status" width="100">
      <template #default="scope">
        <el-tag v-if="scope.row.status==='success'" type="success">已完成</el-tag>
        <el-tag v-if="scope.row.status==='running'" type="info">进行中</el-tag>
        <el-tag v-if="scope.row.status==='error'" type="danger">错误</el-tag>
      </template>
    </el-table-column>
    <el-table-column label="菜单数量" prop="menu_num" width="150" />
    <el-table-column label="报错数量" prop="error_num" width="150" />
    <el-table-column label="报错文件" prop="error_file_name" width="300" />
    <el-table-column label="操作列" width="200" fixed="right">
      <template #default="scope">
        <el-button link type="primary" size="small" @click.prevent="onPush(scope.row.id)">推送</el-button>
        <el-button link type="primary" size="small" @click.prevent="onDownload(scope.row.id, scope.row.error_file_name)">下载</el-button>
        <el-popconfirm title="确认删除吗" confirm-button-text="是" cancel-button-text="否" @confirm="onDelete(scope.row.id)">
          <template #reference>
            <el-button link type="danger" size="small">删除</el-button>
          </template>
        </el-popconfirm>
      </template>
    </el-table-column>
  </el-table>

  <el-pagination class="table-pagination" v-model:current-page="pageNum" v-model:page-size="pageSize" :total="pageTotal" :page-sizes="[10, 20, 50, 100]"
                 layout="total, sizes, prev, pager, next, jumper" @size-change="onSizeChange" @current-change="onPageChange"/>
</template>

<script setup>
import {onMounted, onUnmounted, ref} from "vue"
import {MenuInspectionRecordInfoDelete, MenuInspectionRecordList, MenuInspectionServerPush} from "@/api/TestCases/index";
import {ElMessage} from "element-plus";
import {BASE_URL} from "@/utils/request";
import { formatDate } from "@/utils/date";
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
  const res = await MenuInspectionRecordList({
    pageNum: pageNum.value,
    pageSize: pageSize.value,
  })
  if (res.status === 200) {
    tableData.value = res.data.data.data
    pageTotal.value = res.data.data.total
  }
  return res
}

async function onDelete(id) {
  const res = await MenuInspectionRecordInfoDelete({"id": id})
  ElMessage ({
    message: res.data.message,
    type: res.data.code,
    plain: true,
  })
  if (pageNum.value > Math.ceil((pageTotal.value - 1) / pageSize.value) && (pageNum.value !== 1)){
    pageNum.value = pageNum.value - 1
  }
  await pageList()
}

async function onSizeChange(val) {
  pageSize.value = val
  if (pageNum.value <= Math.ceil(pageTotal.value / pageSize.value)) {  // 判断页码存在，不存在时会自动触发onPageChange
    const res = await pageList()
    ElMessage ({
      message: res.data.message,
      type: res.data.code,
      plain: true,
    })
  }
}

async function onPageChange(val) {
  pageNum.value = val
  const res = await pageList()
  ElMessage ({
    message: res.data.message,
    type: res.data.code,
    plain: true,
  })
}

async function onDownload(id, name) {
  const a = document.createElement('a')
  const url = BASE_URL + "/menu_inspection/download?id=" + id
  a.href = url
  a.download = name
  document.body.appendChild(a)
  a.click()
  window.URL.revokeObjectURL(url)
  document.body.removeChild(a)
}

async function onPush(id) {
  const res = await MenuInspectionServerPush({
    record_id: id
  })
  ElMessage({
    message: res.data.message,
    type: res.data.code,
    plain: true,
  })
}
</script>

<style scoped>
.table-pagination {
  padding-top: 10px;
}
</style>