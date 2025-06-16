<template>
   <el-form :inline="true" :model="formInline" class="demo-form-inline">
    <el-form-item label="数据库名称">
      <el-input v-model="formInline.db_name" placeholder="请输入数据库信息" clearable />
    </el-form-item>
    <el-form-item label="数据库类型及版本">
      <el-select
        v-model="formInline.db_type_version"
        placeholder="选择数据库类型版本"
        clearable
      >
        <el-option label="SQLServer" value="SQLServer" />
        <el-option label="MySQL" value="MySQL"/>
        <el-option label="Oracle" value="Oracle" />
      </el-select>
    </el-form-item>
    <el-form-item label="数据库地址+端口">
      <el-input v-model="formInline.db_address_host" placeholder="请输入数据库地址+端口" clearable />
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
    <el-button class="headerButton" type="primary" plain @click="dialogVisible = true">新增</el-button>
    <el-button class="headerButton" type="primary" plain @click="importVisible = true">一键导入</el-button>
  </div>
  <el-table :data="tableData">
    <el-table-column type="index" width="50" fixed="left"/>
    <el-table-column label="数据库名称" prop="db_name"  width="250" />
    <el-table-column label="数据库类型及版本" prop="db_type_version" width="250" />
    <el-table-column label="数据库地址+端口" prop="db_address_host"  width="250" />
    <el-table-column label="数据库账号密码" prop="db_account_password" width="250" />
    <el-table-column label="操作列" width="300" fixed="right">
      <template #default="scope">
        <el-button class="headerButton" type="primary" plain size="small" @click="onEdit(scope.row.id, scope.row.db_name,scope.row.db_type_version, scope.row.db_address_host,scope.row.db_account_password)">编辑</el-button>
        <el-popconfirm title="确认删除吗" confirm-button-text="是" cancel-button-text="否" @confirm="onDelete(scope.row.id)">
          <template #reference>
            <el-button class="headerButton" type="danger" plain size="small">删除</el-button>
          </template>
        </el-popconfirm>
      </template>
    </el-table-column>
  </el-table>

  <el-pagination class="table-pagination" v-model:current-page="pageNum" v-model:page-size="pageSize" :total="pageTotal" :page-sizes="[10, 20, 50, 100]"
  layout="total, sizes, prev, pager, next, jumper" @size-change="onSizeChange" @current-change="onPageChange"/>

  <el-dialog v-model="dialogVisible" :close-on-click-modal="false" :close-on-press-escape="false" title="添加数据库" width="500">
    <el-form :model="formData">
      <el-form-item label="数据库所属名称">
        <el-input v-model="formData.db_name" placeholder="例：xx数据库的名称"></el-input>
      </el-form-item>
      <el-form-item label="数据库类型及版本">
        <el-select v-model="formData.db_type_version" placeholder="请选择数据库类型及版本">
          <el-option
            v-for="tag in db_type_version"
            :key="tag.value"
            :label="tag.label"
            :value="tag.value">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="数据库地址+端口">
        <el-input v-model="formData.db_address_host" placeholder="例：xx数据库地址+端口"></el-input>
      </el-form-item>

      <el-form-item label="数据库账号密码">
        <el-input v-model="formData.db_account_password" placeholder="例：admn/Supcon@1304"></el-input>
      </el-form-item>
      <el-form-item>
        <el-button class="headerButton" type="primary" plain @click="onCancel">取消</el-button>
        <el-button type="primary" @click="onSubmit">提交</el-button>
      </el-form-item>
    </el-form>
  </el-dialog>
</template>


<script setup>



const formInline = reactive({
  db_name: '',
  db_type_version: '',
  db_address_host: '',
})
import { onMounted, ref , reactive ,onUnmounted} from "vue"
import * as KnowledgeBaseSystemBase from "@/api/knowledgeBase"
import { ElMessage } from "element-plus";


const formData = ref({
  db_name : '192.168.1.23',
  db_type_version: 'MySQL',
  db_address_host: '192.168.68.13:80',
  db_account_password: 'Supcon1304@1304'
})

const tableData = ref([])
const pageNum = ref(1)
const pageSize = ref(20)
const pageTotal = ref(0)
const dialogVisible = ref(false)
const  db_type_version = ref([
  { label: 'SQLServer', value: 'SQLServer' },
  { label: 'Mysql', value: 'Mysql' },
  { label: 'Oracle', value: 'Oracle' }
])


  onMounted(async () => {
    handleQuery(true) // 初始化加载时强制第一页且不带过滤条件

  })

onUnmounted(() => {})


async function pageList() {
const res = await KnowledgeBaseSystemBase.PostKnowledgeBaseTestEnvDataBaseInfoList({
  pageNum: pageNum.value,
  pageSize: pageSize.value,
})
if (res.status === 200) {
  tableData.value = res.data.data.data
  pageTotal.value = res.data.data.total
}
return res
}

async function handleReset() {
  formInline.db_name = '';
  formInline.db_type_version = '';
  formInline.db_address_host = '';
  handleQuery();
}


async function handleQuery(initLoad = false) {
    try {
      // 当所有查询条件为空时调用pageList（修正字段名匹配）
      if ( !formInline.db_name && !formInline.db_type_version  && !formInline.db_address_host) {
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
            field: 'db_name', 
            rule: 'contains',  // 确保实际请求参数也使用contains规则
            value: formInline.db_name?.trim() // 添加trim处理
          },
          {
            field: 'db_type_version',
            rule: 'contains',
            value: formInline.db_type_version
          },
          { 
            field: 'db_address_host', 
            rule: 'contains', 
            value: formInline.db_address_host 
          }
        ].filter(rule => rule.value)
      };
      const res = await KnowledgeBaseSystemBase.PostKnowledgeBaseTestEnvDataBaseInfoList(params);
     
     
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




async function onSizeChange(val) {
  pageNum.value = val;
  const res = await handleQuery();
  ElMessage({
    message: res.data.message,
    type: res.data.code,
    plain: true,
  });
}

async function onPageChange(val) {
  pageNum.value = val;
  const res = await pageList();
  ElMessage({
    message: res.data.message,
    type: res.data.code,
    plain: true,
  });
}

async function onSubmit() {
  try {
    const res = await KnowledgeBaseSystemBase.PostKnowledgeBaseTestEnvDataBaseInfo(formData.value)
    ElMessage({
      message: res?.data?.message || '操作成功',
      type: res?.data?.code === 200 ? 'success' : 'error',
      plain: true,
    })
    formData.value = {
      db_type_version: '',
      db_address_host: '',
      db_name: '',
      db_account_password: ''
    }
    await pageList()
    dialogVisible.value = false
  } catch (error) {
    ElMessage({
      message: error.message || '提交失败',
      type: 'error',
      plain: true,
    })
  }
}

async function onCancel() {
  dialogVisible.value = false
  formData.value = {
    product_type: '',
    product_tag: '',
    know_question_name: '',
    know_question_url: ''
  }
}

async function onDelete(id) {
  try {
    const res = await KnowledgeBaseSystemBase.DeleteKnowledgeBaseTestEnvDataBaseInfo({ id:id })
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



async function onEdit(id,  db_type_version,db_address_host, db_name,  db_account_password) {
  formData.value.id = id
  formData.value.db_type_version = db_type_version
  formData.value.db_address_host = db_address_host
  formData.value.db_name = db_name
  formData.value.db_account_password = db_account_password
  dialogVisible.value = true

}







</script>

<style scoped>
.table-pagination {
  padding-top: 10px;
}



.demo-form-inline .el-input {
  --el-input-width: 220px;
}

.demo-form-inline .el-select {
  --el-select-width: 220px;
}
</style>
