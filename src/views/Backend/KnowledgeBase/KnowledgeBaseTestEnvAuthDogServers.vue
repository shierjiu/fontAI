<template>
    <el-form :inline="true" :model="formInline" class="demo-form-inline">
    <!-- #查询条件 -->
    <el-form-item label="授权狗名称">
      <el-input v-model="formInline.auth_dog_name" placeholder="请输入授权狗名称" clearable />
    </el-form-item>
    <el-form-item label="授权狗Host">
      <el-input v-model="formInline.auth_dog_host" placeholder="请输入授权狗Host" clearable />
    </el-form-item>
    <el-form-item>
      <el-button class="headerButton" type="primary" plain @click="handleQuery">查询</el-button>
    </el-form-item>
    <el-form-item>
      <el-button class="headerButton" type="primary" plain @click="handleReset">重置</el-button>
    </el-form-item>
  </el-form>

  <!-- 新增 -->
  <div class="button-group">
    <el-button class="headerButton" type="primary" plain @click="add">新增</el-button>
    <el-button class="headerButton" type="primary" plain @click="onExport">导出</el-button>
  </div>
  <el-table :data="tableData" stripe max-height="880">
    <el-table-column type="index" width="70" fixed="aline"/>
    <el-table-column label="授权狗名称" prop="auth_dog_name"  width="250" />
    <el-table-column label="授权狗Host" prop="auth_dog_host"  width="250" />
    <el-table-column label="用户名+密码" prop="auth_dog_user_password"  width="250" />
    <el-table-column label="备注（宿主机）" prop="auth_dog_remark" width="250" />
    <el-table-column label="是否启用" prop="auth_dog_enable" width="200">
      <template #default="scope">
        <el-tag v-if="scope.row.auth_dog_enable===true" type="success">启用</el-tag>
        <el-tag v-if="scope.row.auth_dog_enable===false" type="danger">停用</el-tag>
      </template>
    </el-table-column>
    <!-- #操作列表 -->
    <el-table-column label="操作列" width="300" fixed="right">
      <template #default="scope">
        <el-button class="headerButton" type="primary" plain size="small" @click="OnEdit(scope.row.id, scope.row.auth_dog_name, scope.row.auth_dog_host, scope.row.auth_dog_user_password, scope.row.auth_dog_remark)">编辑</el-button>
        <el-popconfirm title="确认删除吗" confirm-button-text="是" cancel-button-text="否" @confirm="onDelete(scope.row.id)">
          <template #reference>
            <el-button class="headerButton" type="danger" plain size="small">删除</el-button>
          </template>
        </el-popconfirm>
      </template>
    </el-table-column>
  </el-table>
  <el-pagination class="table-pagination" v-model:current-page="pageNum" v-model:page-size="pageSize" :total="pageTotal" :page-sizes="[10, 20, 50, 100]" layout="total, sizes, prev, pager, next, jumper" @size-change="onSizeChange" @current-change="onPageChange"/>


  <el-dialog v-model="dialogVisible" :close-on-click-modal="false" :close-on-press-escape="false" title="添加加密狗服务器" width="500">
    <el-form :model="formData" label-position="left" label-width="120px">
      <el-form-item label="授权狗名称"><el-input v-model="formData.auth_dog_name" placeholder="例：10.10.40.56/192.168.90.101"></el-input></el-form-item>
      <el-form-item label="授权狗host"><el-input v-model="formData.auth_dog_host" placeholder="例：192.168.10.62:80"></el-input></el-form-item>
      <el-form-item label="用户名+密码">
        <el-input v-model="formData.auth_dog_user_password" placeholder="例：admin/Supcon@1304"></el-input></el-form-item>
      <el-form-item label="备注（宿主机）">
        <el-input v-model="formData.auth_dog_remark" placeholder="例：192.168.90.205"></el-input></el-form-item>
      <el-form-item>
        <el-button @click="onCancel">取消</el-button>
        <el-button type="primary" @click="onSubmit">提交</el-button>
      </el-form-item>
    </el-form>
  </el-dialog>
</template>

<script setup>
import { onMounted, ref, onUnmounted } from "vue";
import * as KnowledgeBaseTestEnvAuthDog from "@/api/knowledgeBase"
import { ElMessage } from "element-plus";


const formInline = ref({
  auth_dog_name: '',
  auth_dog_host: ''
})

const formData = ref({
  auth_dog_name:' 10.10.40.56',
  auth_dog_host: '192.168.10.62:80',
  auth_dog_user_password: 'admin/Supcon@1304',
  auth_dog_remark: '注意加密狗的IP地址'
})
const tableData = ref([])
const pageNum = ref(1)
const pageSize = ref(20)
const pageTotal = ref(0)
const dialogVisible = ref(false)



// let intervalId

onMounted(async () => {
    await handleQuery()
    // intervalId = setInterval(pageList, 10000);
})

onUnmounted(() => {
  // clearInterval(intervalId)
})


async function handleQuery(initLoad = false) {
  try {
    // 当所有查询条件为空时调用pageList（修正字段名匹配）
      if (!formInline.value.auth_dog_name && !formInline.value.auth_dog_host) {
      const res = await pageList();
      if (res.status === 200) {
        tableData.value = res.data.data?.data || [];
        pageTotal.value = res.data.data?.total || 0;
      }
      return res;
    }

    const params = {
      pageNum: initLoad ? 1 : pageNum.value,
      pageSize: pageSize.value,
      pageEnable: true,
      pageRule: [
        { 
          field: 'auth_dog_name', 
          rule: 'contains',  // 确保实际请求参数也使用contains规则
          value: formInline.value.auth_dog_name?.trim() // 添加trim处理
        },
        {
          field: 'auth_dog_host',
          rule: 'contains',
          value: formInline.value.auth_dog_host
        }
      ].filter(rule => rule.value)
    };
    const res = await KnowledgeBaseTestEnvAuthDog.PostKnowledgeBaseTestEnvAuthDogInfoList(params);
    
    
    console.log('过滤后返回的信息');
    console.log(res);

    if (res.status === 200) {
      // 更新表格数据和分页信息
      tableData.value = res.data.data?.data || [];
      // console.log(tableData.value);
      pageTotal.value = res.data.data?.total || 0;
      pageNum.value = 1; // 保持分页器同步

    }
    console.log('查询的结果');
    console.log(tableData.value);
    return res;
  } catch (error) {
    // 捕获异常
    console.error('查询失败:', error)
    ElMessage.error('查询失败，请检查网络连接')
    return null
  }
}





async function pageList() {
  const res = await KnowledgeBaseTestEnvAuthDog.PostKnowledgeBaseTestEnvAuthDogInfoList({
    pageNum: pageNum.value,
    pageSize: pageSize.value,
  })
  if (res?.status === 200)  {
    tableData.value = res.data.data.data
    pageTotal.value = res.data.data.total
  }
  return res
}

async function handleReset() {
  formInline.value.auth_dog_name = '';
  formInline.value.auth_dog_host = '';
  handleQuery();
}

async function onSizeChange(val) {
  pageSize.value = val;
  if (pageNum.value <= Math.ceil(pageTotal.value / pageSize.value)) {
    // 判断页码存在，不存在时会自动触发onPageChange
    const res = await pageList();
    ElMessage({
      message: res.data.message,
      type: res.data.code,
      plain: true,
    });
  }
}

async function onPageChange(val) {
  pageNum.value = val;
  const res = await handleQuery();
  ElMessage({
    message: res.data.message,
    type: res.data.code,
    plain: true,
  });
}


async function add() {
  formData.value = { }
  dialogVisible.value = true
}

async function onSubmit() {
  const res = await KnowledgeBaseTestEnvAuthDog.PostKnowledgeBaseTestEnvAuthDogInfo(formData.value)
  ElMessage({
    message: res.data.message,
    type: res.data.code,
    plain: true,
  })
  formData.value = {}
  dialogVisible.value = false
  await pageList()
}
  

async function onCancel() {
  dialogVisible.value = false
  formData.value = {}
}

async function onDelete(id) {
  try {
    const res = await KnowledgeBaseTestEnvAuthDog.DeleteKnowledgeBaseTestEnvAuthDogInfo({ id: id })
    ElMessage({
      message: res?.data?.message || '删除成功',
      type: res?.data?.code === 200 ? 'success' : 'error',
      plain: true,
    })
    if (pageNum.value > Math.ceil((pageTotal.value - 1) / pageSize.value) && (pageNum.value !== 1)) {
      pageNum.value = pageNum.value - 1
    }
    await pageList()
  } catch (error) {
    ElMessage({
      message: error.message || '删除失败',
      type: 'error',
      plain: true,
    })
  }
}

async function OnEdit(id, auth_dog_name, auth_dog_host, auth_dog_user_password, auth_dog_remark, auth_dog_enable) {
  formData.value.id = id
  formData.value.auth_dog_name = auth_dog_name
  formData.value.auth_dog_host = auth_dog_host
  formData.value.auth_dog_user_password = auth_dog_user_password
  formData.value.auth_dog_remark = auth_dog_remark
  formData.value.auth_dog_enable = auth_dog_enable
  dialogVisible.value = true
} 

</script>

<style scoped>
.table-pagination {
  padding-top: 300px;
}
</style>
