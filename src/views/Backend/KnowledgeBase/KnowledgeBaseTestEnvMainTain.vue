<template>

   <el-form :inline="true" :model="formInline" class="demo-form-inline">
    <!-- #查询条件 -->
    <el-form-item label="环境名称">
      <el-input v-model="formInline.env_name" placeholder="输入环境名称" clearable />
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
    <el-form-item label="创建日期">
      <el-date-picker
        v-model="formInline.create_date"
        type="date"
        placeholder="选择创建日期"
        clearable
      />
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
    <el-button class="headerButton" type="primary" plain @click="OnAdd">新增</el-button>
    <el-button class="headerButton" type="primary" plain @click="importVisible = false">一键导入</el-button>
  </div>
  <el-table :data="tableData" stripe max-height="880">
    <el-table-column type="index" width="50" fixed="left"/>
    <el-table-column label="环境名称" prop="env_name" width="250" />
    <el-table-column label="账号密码" prop="env_account_password"  width="250" />
    <el-table-column label="环境信息" prop="env_info"  width="250" />
    <el-table-column label="服务器账号" prop="server_account" width="250" />
    <el-table-column label="服务器密码" prop="server_password" width="250" />
    <el-table-column label="服务器信息（宿主机、操作系统、服务器CPU、服务器内存）" prop="server_info" width="250" />
    <el-table-column label="数据库类型及版本" prop="db_type_version" width="250" />
    <el-table-column label="服务器地址+端口" prop="server_address_port" width="250" />
    <el-table-column label="数据库名称" prop="db_name" width="250" />
    <el-table-column label="数据库账号" prop="db_account" width="250" />
    <el-table-column label="数据库密码" prop="db_password" width="250" />
    <el-table-column label="加密狗信息" prop="auth_dog_info" width="250" :formatter="formatAuthDogName" />
    <el-table-column label="产线" prop="production_line" width="250" />
    <el-table-column label="维护人" prop="env_maintainer" width="250" />
    <el-table-column label="环境启停" prop="env_enable" width="250">
      <template #default="scope">
        <el-tag v-if="scope.row.env_enable === true" type="success">启用</el-tag>
        <el-tag v-else type="info">停用</el-tag>
      </template>
    </el-table-column>
    <el-table-column label="创建日期" prop="create_date" width="250" />
    <el-table-column label="备注" prop="env_memo" width="250" />

    <!-- 操作列 -->
    <el-table-column label="操作列" width="300" fixed="right">
      <template #default="scope">
        <el-button class="headerButton" type="primary" plain size="small" @click="onEdit(scope.row)">编辑</el-button>
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

  <!-- 添加环境信息 -->
  <el-dialog v-model="dialogVisible" :close-on-click-modal="false" :close-on-press-escape="false" title="环境信息配置" width="900">
    <el-form :model="formData">
      <el-form-item label="环境名称 ">
        <el-input v-model="formData.env_name" placeholder="例：xx环境名称"></el-input>
      </el-form-item>
      <el-form-item label="环境账号密码">
        <el-input v-model="formData.env_account_password" placeholder="请输入环境账号密码"></el-input>
      </el-form-item>
      <el-form-item label="环境信息">
        <el-input v-model="formData.env_info" placeholder="请输入环境信息"></el-input>
      </el-form-item>
      <el-form-item label="服务器地址+端口">
        <el-input v-model="formData.server_address_port" placeholder="请输入服务器地址+端口"></el-input>
      </el-form-item>
      <el-form-item label="服务器账号">
        <el-input v-model="formData.server_account" placeholder="请输入服务器账号"></el-input>
      </el-form-item>
      <el-form-item label="服务器密码">
        <el-input v-model="formData.server_password" placeholder="请输入服务器密码"></el-input>
      </el-form-item>
      <el-form-item label="服务器信息">
        <el-input v-model="formData.server_info" placeholder="请输入服务器信息（宿主机、操作系统、服务器CPU、服务器内存）"></el-input>
      </el-form-item>
      <!-- <el-form-item label="数据库类型及版本">
        <el-input v-model="formData.db_type_version" placeholder="请输入数据库类型及版本 SqlServer 2019"></el-input>
      </el-form-item> -->
      <el-form-item label="数据库类型及版本">
      <el-select
        v-model="formData.db_type_version"
        placeholder="选择数据库类型版本"
        clearable
      >
        <el-option label="SQLServer" value="SQLServer" />
        <el-option label="MySQL" value="MySQL"/>
        <el-option label="Oracle" value="Oracle" />
    </el-select>
  </el-form-item>
      <el-form-item label="数据库地址+端口">
        <el-input v-model="formData.db_address_port" placeholder="例：10.30.43.102:1433"></el-input>
      </el-form-item>
      <el-form-item label="数据库名称">
        <el-input v-model="formData.db_name" placeholder="例：suptest1"></el-input>
      </el-form-item>
      <el-form-item label="数据库账号">
        <el-input v-model="formData.db_account" placeholder="请输入数据库账号"></el-input>
      </el-form-item>
      <el-form-item label="数据库密码">
        <el-input v-model="formData.db_password" placeholder="请输入数据库密码"></el-input>
      </el-form-item>
      <el-form-item label="关联加密狗">
        <el-select v-model="formData.auth_dog_info" placeholder="请选择加密狗">
          <el-option 
            v-for="dog in AuthDogOptions"
            :key="dog.id"
            :label="dog.auth_dog_name"
            :value="dog.id"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="产线信息">
        <el-input v-model="formData.production_line" placeholder="请输入产线信息"></el-input>
      </el-form-item>
      <el-form-item label="维护人">
        <el-input v-model="formData.env_maintainer" placeholder="请输入维护人"></el-input>
      </el-form-item>
      <el-form-item label="创建日期">
        <el-input v-model="formData.create_date" placeholder="请输入创建日期"></el-input>
      </el-form-item>
      <el-form-item label="环境启停">
        <el-switch v-model="formData.env_enable" active-text="启用" inactive-text="停用"></el-switch>
      </el-form-item>
      <el-form-item label="备注">
        <el-input v-model="formData.env_memo" placeholder="请输入备注"></el-input>
      </el-form-item>
      <el-form-item>
        <el-button @click="onCancel">取消</el-button>
        <el-button type="primary" @click="onSubmit">提交</el-button>   
      </el-form-item>
    </el-form>
  </el-dialog>
</template>

<script setup>

import { onMounted, ref, onUnmounted, reactive, onErrorCaptured } from "vue"
// 获取加密狗列表
import * as KnowledgeBaseTestEnv from "@/api/knowledgeBase"
// import * as KnowledgeBaseTestEnvAuthDog from "@/api/knowledgeBaseAuthDog"
import { ElMessage } from "element-plus";
import dayjs from 'dayjs'

const tableData = ref([])
const pageNum = ref(1)
const pageSize = ref(20)
const pageTotal = ref(0)
const dialogVisible = ref(false)
const AuthDogOptions = ref([]); // 统一使用小驼峰命名
// const AuthDogSelect = ref([])
const formData = ref({})

const formInline = reactive({
  env_name: '',    // 环境名称查询条件
  db_type_version: '',   // 环境类型查询条件
  create_date: '',       // 日期查询条件
})



// let intervalId

onMounted(async () => {
    // 初始化加载数据（使用handleQuery并传递initLoad参数）
    await handleQuery(true);
})

onUnmounted(() => {});




onErrorCaptured((err) => {
  if (err.message.includes('ResizeObserver')) {
    return false; // 阻止错误冒泡
  }
});

async function OnAdd() {
  try {
    // 获取可用的加密狗列表
    // 完全重置表单数据
    formData.value = {
      env_name: '',
      env_account_password: '',
      env_info: '',
      server_address_port: '',
      server_account: '',
      server_password: '',
      server_info: '',
      db_type_version: '',  
      db_address_port: '',
      db_name: '',
      db_account: '',
      db_password: '',
      production_line: '',
      env_maintainer: '',
      create_date: dayjs().format('YYYY-MM-DD'),
      env_enable: false,
      env_memo: '',
      auth_dog_info: null
    };
    const dogRes = await KnowledgeBaseTestEnv.PostKnowledgeBaseTestEnvAuthDogInfoList({
      pageEnable: false,
      pageRule: [{field: "auth_dog_enable", rule: "is", value: true}]
    });
    
    // 更新加密狗选项
    // AuthDogOptions.value = dogRes.data.data.data
    AuthDogOptions.value = dogRes.data.data.data.map(dog => ({
      id: dog.id,
      auth_dog_name: dog.auth_dog_name,
      auth_dog_info: `${dog.id}-${dog.auth_dog_name}`,
    }));

    // 初始化表单数据
    // 设置默认加密狗（选择第一个可用选项）
    const defaultDog = AuthDogOptions.value.length > 0 ? AuthDogOptions.value[0].id : null;
    // const defaultDatabase = AuthDogOptions.value.length > 0 ? AuthDogOptions.value[0].id : null;
    formData.value = {
      env_name: '192.168.1.23',
      env_account_password: 'admin/Supcon@1304',
      env_info: '人大金仓兼容性测试环境',
      server_address_port: '192.168.68.13:80',
      server_account: 'supcon',
      server_password: 'supcon1304',
      server_info: '这是一台兼容性测试服务器',
      db_type_version: 'MySQL',  // 设置默认值为MySQL
      db_address_port: '23',
      db_name: 'test',
      db_account: 'test',
      db_password: 'test',
      production_line: '批次',
      env_maintainer: '测试人',
      create_date: dayjs().format('YYYY-MM-DD'), // 使用dayjs获取当前日期并格式化为"年-月-日"',
      env_enable: false,
      env_memo: '注意安装环境的顺序',
      auth_dog_info: defaultDog  // 设置默认加密狗
    };
    
    // 显示对话框
    dialogVisible.value = true;
    
  } catch (error) {
    console.error('新增环境失败:', error);
    ElMessage.error('打开新增页面失败: ' + (error.response?.data?.message || error.message));
  }
}



// 统一查询处理方法
  /**
   * 处理查询请求
   *
   * @param initLoad 是否为首次加载数据，默认为 false
   * @returns 查询结果，如果查询失败则返回 null
   */
  async function handleQuery(initLoad = false) {
    try {
      // 当所有查询条件为空时调用pageList（修正字段名匹配）
      if (!formInline.env_name && !formInline.db_type_version && !formInline.create_date) {
        const res = await pageList();
        if (res.status === 200) {
          tableData.value = res.data.data?.data || [];
          pageTotal.value = res.data.data?.total || 0;
        }
        return res;
      }

      console.log('发送查询参数:', JSON.stringify({
        pageNum: initLoad ? 1 : pageNum.value,
        pageSize: pageSize.value,
        pageRule: [
          { 
            field: 'env_name',  // 修正字段名为表格中实际存在的env_name
            rule: 'contains',
            value: formInline.env_name?.trim()
          },
          {
            field: 'db_type_version',
            rule: 'is',
            value: formInline.db_type_version
          },
          {
            field: 'create_date',
            rule: 'is',
            value: formInline.create_date ? dayjs(formInline.create_date).format('YYYY-MM-DD') : undefined
          }
        ].filter(rule => rule.value)
      }, null, 2));

      const params = {
        pageNum: initLoad ? 1 : pageNum.value,
        pageSize: pageSize.value,
        pageEnable: true,
        pageRule: [
          { 
            field: 'env_name', 
            rule: 'contains',  // 确保实际请求参数也使用contains规则
            value: formInline.env_name?.trim() // 添加trim处理
          },
          {
            field: 'db_type_version',
            rule: 'is',
            value: formInline.db_type_version
          },
          { 
            field: 'create_date', 
            rule: 'is', 
            value: formInline.create_date ? dayjs(formInline.create_date).format('YYYY-MM-DD') : undefined 
          }
        ].filter(rule => rule.value)
      };
      const res = await KnowledgeBaseTestEnv.PostKnowledgeBaseTestEnvInfoList(params);
      console.log('查询参数',params);
      
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

// 分页查询方法
async function pageList() {
  const res = await KnowledgeBaseTestEnv.PostKnowledgeBaseTestEnvInfoList({
    pageNum: pageNum.value,
    pageSize: pageSize.value,
  })
  console.log('分页查询结果',res);
  if (res.status === 200) {
    tableData.value = res.data.data.data
    pageTotal.value = res.data.data.total
  }
  return res
}


// 重置查询条件
function handleReset() {
  formInline.env_name = ''
  formInline.db_type_version = ''
  formInline.create_date = ''
  handleQuery()
}


async function onSizeChange(val) {
  pageSize.value = val
  if (pageNum.value <= Math.ceil(pageTotal.value / pageSize.value)) {
    const res = await pageList()
    if (res?.data?.code === 200) {
      ElMessage({
        message: res.data.message,
        type: 'success',
        plain: true,
      })
    }
  }
}

async function onPageChange(val) {
  pageNum.value = val;
  const res = await handleQuery();
  ElMessage({
    message: res.data.message,
    type: res.data.code === 200 ? 'success' : 'error',
    plain: true,
  });
}

async function onSubmit() {
  try {
    if (!formData.value.auth_dog_info) {
      ElMessage.error('请选择加密狗信息');
      return;
    }

    // 清理空值字段并格式化日期
    const postData = {
      ...formData.value,
      create_date: formData.value.create_date ? dayjs(formData.value.create_date).format('YYYY-MM-DD') : null
    };
    
    // 移除空字符串字段
    Object.keys(postData).forEach(key => {
      if (postData[key] === '') {
        delete postData[key];
      }
    });
    console.log('提交数据:', JSON.stringify(postData, null, 2));
    const res = await KnowledgeBaseTestEnv.PostKnowledgeBaseTestEnvInfo(postData);
    console.log('提交结果',res);
    ElMessage.success(res.data.message);
    formData.value = {};
    dialogVisible.value = false;
    await pageList();

  } catch (error) {
    console.error('提交失败:', error);
    ElMessage.error('提交过程中发生错误，请稍后重试或联系技术支持。');
  }
}





async function onCancel() {
  dialogVisible.value = false
  formData.value = {}
}

// 格式化加密狗显示名称
function formatAuthDogName(row) {
  const foundDog = AuthDogOptions.value.find(dog => dog.id === row.auth_dog_info);
  return foundDog ? foundDog.auth_dog_name : '未知加密狗';
}

async function onDelete(id) {
  try {
    const res = await KnowledgeBaseTestEnv.DeleteKnowledgeBaseTestEnvInfo({ id:id })
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



 
  async function onEdit(row) {
    try {
      // 获取最新的加密狗列表
      const dogRes = await KnowledgeBaseTestEnv.PostKnowledgeBaseTestEnvAuthDogInfoList({
        pageEnable: false,
        pageRule: [{field: "auth_dog_enable", rule: "is", value: true}]
      });
      
      AuthDogOptions.value = dogRes.data.data.data.map(dog => ({
        id: dog.id,
        auth_dog_name: dog.auth_dog_name,
        auth_dog_info: `${dog.id}-${dog.auth_dog_name}`,
      }));

      // 获取完整的原始数据
      const res = await KnowledgeBaseTestEnv.PostKnowledgeBaseTestEnvInfoList({ id: row.id, pageEnable: false });
      const rowData = res.data.data.data[0];
      
      // 使用接口返回的完整数据填充表单
      formData.value = { 
        ...rowData,
        // 确保加密狗信息使用最新列表中的ID
        auth_dog_info: rowData.auth_dog_info 
      };
      
      dialogVisible.value = true;
    } catch (error) {
      console.error('编辑环境失败:', error);
      ElMessage.error('获取环境详情失败: ' + (error.response?.data?.message || error.message));
    }
  }

// async function onSelect() {
  
// }


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
