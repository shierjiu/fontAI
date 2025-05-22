<template>
  <el-button class="headerButton" type="primary" plain @click="addRow">新增</el-button>

  <el-table :data="variableList" border style="width: 100%">
    <el-table-column prop="variable" label="变量" width="180">
      <template #default="scope">
        <el-input v-if="scope.row.editing" v-model="scope.row.editData.variable" placeholder="请输入"/>
        <span v-else>{{scope.row.variable}}</span>
      </template>
    </el-table-column>
    <el-table-column prop="sql_query" label="语句" width="250" show-overflow-tooltip>
      <template #default="scope">
        <el-input v-if="scope.row.editing" v-model="scope.row.editData.sql_query" placeholder="请输入"/>
        <span v-else>{{scope.row.sql_query}}</span>
      </template>
    </el-table-column>
    <el-table-column prop="db_type" label="数据库类型" width="180">
      <template #default="scope">
        <el-select v-if="scope.row.editing" v-model="scope.row.editData.db_type">
          <el-option v-for="item in dbTypeOptions" :key="item.name" :label="item.name" :value="item.name"/>
        </el-select>
        <span v-else>{{scope.row.db_type}}</span>
      </template>
    </el-table-column>
    <el-table-column prop="db_host" label="数据库地址" width="180">
      <template #default="scope">
        <el-input v-if="scope.row.editing" v-model="scope.row.editData.db_host" placeholder="请输入"/>
        <span v-else>{{scope.row.db_host}}</span>
      </template>
    </el-table-column>
    <el-table-column prop="db_port" label="数据库端口" width="180">
      <template #default="scope">
        <el-input-number v-if="scope.row.editing" v-model="scope.row.editData.db_port" :controls="false" precision="2" :step="0.01" placeholder="请输入"/>
        <span v-else>{{scope.row.db_port}}</span>
      </template>
    </el-table-column>
    <el-table-column prop="db_name" label="数据库名称" width="180">
      <template #default="scope">
        <el-input v-if="scope.row.editing" v-model="scope.row.editData.db_name" placeholder="请输入"/>
        <span v-else>{{scope.row.db_name}}</span>
      </template>
    </el-table-column>
    <el-table-column prop="db_username" label="数据库用户" width="180">
      <template #default="scope">
        <el-input v-if="scope.row.editing" v-model="scope.row.editData.db_username" placeholder="请输入"/>
        <span v-else>{{scope.row.db_username}}</span>
      </template>
    </el-table-column>
    <el-table-column prop="db_password" label="数据库密码" width="180">
      <template #default="scope">
        <el-input v-if="scope.row.editing" v-model="scope.row.editData.db_password" placeholder="请输入"/>
        <span v-else>{{scope.row.db_password}}</span>
      </template>
    </el-table-column>
    <el-table-column prop="describe" label="描述" width="250" show-overflow-tooltip>
      <template #default="scope">
        <el-input v-if="scope.row.editing" v-model="scope.row.editData.describe" placeholder="请输入"/>
        <span v-else>{{scope.row.describe}}</span>
      </template>
    </el-table-column>
    <el-table-column label="操作" width="180" fixed="right">
      <template #default="scope">
        <div v-if="scope.row.editing">
          <el-button link type="primary" size="small" @click="variableInfoSubmit(scope.row)">提交</el-button>
          <el-button link type="info" size="small" @click="variableInfoCancel(scope.row)">取消</el-button>
        </div>
        <div v-else>
          <el-button link type="primary" size="small" @click="variableInfoEditEnable(scope.row)">编辑</el-button>
          <el-button link type="primary" size="small" @click="variableServer(scope.row)">运行</el-button>
        </div>
      </template>
    </el-table-column>
  </el-table>

  <el-pagination class="table-pagination" v-model:current-page="pageNum" v-model:page-size="pageSize" :total="pageTotal" :page-sizes="[15, 50, 100, 500]" layout="total, sizes, prev, pager, next, jumper" @size-change="onSizeChange" @current-change="onPageChange"/>

</template>

<script setup>
import {onMounted, ref} from "vue"
import * as VariableQuery from "@/api/VariableQuery"
import {ElMessageBox, ElNotification} from "element-plus"

const pageNum = ref(1)
const pageSize = ref(15)
const pageTotal = ref(0)
const variableList = ref([])
const rawEditing = ref(false)
const dbTypeOptions = ref([{name: "mysql"},])

async function getVariableList() {
  const data = {pageEnable: true, pageSize: pageSize.value, pageNum: pageNum.value}
  const res = await VariableQuery.postDataBaseList(data)
  variableList.value = res.data.data.data
  pageTotal.value = res.data.data.total
}

async function onSizeChange(val) {
  pageSize.value = val
  if (pageNum.value <= Math.ceil(pageTotal.value / pageSize.value)) {
    // 判断页码存在，不存在时会自动触发onPageChange
    await getVariableList()
  }
}

async function onPageChange(val) {
  pageNum.value = val
  await getVariableList()
}

function addRow() {
  if (rawEditing.value) {
    ElNotification({
      message: "请先提交当前数据",
      type: "warning",
    })
  } else {
    rawEditing.value = true
    const newDate = {
      variable: '',
      sql_query: '',
      db_type: null,
      db_host: null,
      db_port: null,
      db_name: null,
      db_username: null,
      db_password: null,
      describe: null,
      editing: true,
      editData: {}
    }
    variableList.value.unshift(newDate)
  }
}

async function variableInfoSubmit(row) {
  const data = row.editData
  const res = await VariableQuery.postDatabaseInfo(data)
  if (res.status === 200) {
    ElNotification({
      message: res.data.message,
      type: res.data.code,
    })
    await getVariableList()
    rawEditing.value = false
  }
}

function variableInfoEditEnable(row) {
  if (rawEditing.value) {
    ElNotification({
      message: "请先提交当前数据",
      type: "warning",
    })
  } else {
    rawEditing.value = true
    row.editData = {
      id: row.id,
      variable: row.variable,
      sql_query: row.sql_query,
      db_type: row.db_type,
      db_host: row.db_host,
      db_port: row.db_port,
      db_name: row.db_name,
      db_username: row.db_username,
      db_password: row.db_password,
      describe: row.describe,
    }
    row.editing = true
  }
}

function variableInfoCancel(row) {
  if (row.id) {
    row.editing = false
  } else {
    const index = variableList.value.indexOf(row)
    if (index !== -1) {
      variableList.value.splice(index, 1)
    }
  }
  rawEditing.value = false
}

async function variableServer(row) {
  const data = {variable: row.variable}
  const res = await VariableQuery.postDatabaseServer(data)
  if (res.status === 200) {
    ElMessageBox.alert(res.data.data, '提示信息', {
      confirmButtonText: '确定',
    }).catch(() => {})
  }
}

onMounted(() => {
  getVariableList()
})
</script>

<style scoped>
.headerButton {
  margin: 0 0 10px 0;
}

.table-pagination {
  padding-top: 10px;
}
</style>