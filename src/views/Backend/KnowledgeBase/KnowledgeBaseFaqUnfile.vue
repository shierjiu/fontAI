<template>
  
  <el-form :inline="true" :model="formInline" class="demo-form-inline">
    <!-- #查询条件 -->
    <el-form-item label="问题">
      <el-input v-model="formInline.kb_question_name" placeholder="请输入问题" clearable />
    </el-form-item>
    <el-form-item label="答案">
      <el-input v-model="formInline.kb_question_answer" placeholder="请输入答案" clearable />
    </el-form-item>
    <el-form-item>
      <el-button class="headerButton" type="primary" plain @click="handleQuery">查询</el-button>
    </el-form-item>
    <el-form-item>
      <el-button class="headerButton" type="primary" plain @click="handleReset">重置</el-button>
    </el-form-item>
  </el-form>




  <div class="dataset-container">
    <div class="left-panel">
      <div class="tree-header">
        <el-aside width="300px">
          <el-button class="headerButton" type="primary" plain @click="treeAdd">新增</el-button>
          <el-button class="headerButton" type="primary" plain @click="treeEdit(activeTreeNode.value)" :disabled="!activeTreeNode.value">编辑</el-button>
          <el-popconfirm title="确认删除吗" confirm-button-text="是" cancel-button-text="否" @confirm="treeDelete">
            <template #reference>
              <el-button class="headerButton" type="danger" plain>删除</el-button>
            </template>
          </el-popconfirm>
        </el-aside>
      </div>
      <div class="tree-container">
        <el-tree
          highlight-current
          :data="treeData"
          :props="defaultProps"
          @node-click="treeNodeClick"
          node-key="id"
        >
          <template #default="{ node, data }">
            <div class="tree-node-ref">
              <span class="node-label">{{ data.group_name }}</span>
              <el-space class="action-btns" direction="horizontal" size="small">
                <el-button size="mini" plain circle @click.stop="treeAdd(data)">
                  <el-icon><Plus/></el-icon>
                </el-button>
                <el-button size="mini" plain circle @click.stop="treeEdit(data)">
                  <el-icon><EditPen/></el-icon>
                </el-button>
                <el-button size="mini" type="danger" plain circle @click.stop="treeDelete(data)">
                  <el-icon><Minus/></el-icon>
                </el-button>
              </el-space>
            </div>
          </template>
        </el-tree>
      </div>
    </div>
    <div class="right-panel">
      <div class="button-group">
        <el-button class="headerButton" type="primary" plain @click="onAdd">新增</el-button>
      </div>
      <el-table :data="tableData" stripe max-height="680">
        <el-table-column type="index" width="50"  fixed="left"/>
        <el-table-column label="问题名称" prop="kb_question_name" width="250"/>
        <el-table-column label="问题答案" prop="kb_question_answer" width="200"/>
        <!-- <el-table-column label="关联文件名称" prop="kb_file_name" width="250" :formatter="formatFileName" /> -->
        <el-table-column label="操作列" width="200" fixed="right">
          <template #default="scope">
            <!-- <el-button link type="primary" size="small" @click.prevent="onDownload(scope.row.id, scope.row.testcase_file_name)">下载</el-button> -->
            <el-button class="headerButton" type="primary" plain size="small" @click="onEdit(scope.row)">编辑</el-button>
            <el-popconfirm title="确认删除吗" confirm-button-text="是" cancel-button-text="否" @confirm="onDelete(scope.row.id)">
              <template #reference>
                <el-button class="headerButton" type="danger" plain size="small">删除</el-button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination class="table-pagination" v-model:current-page="pageNum" v-model:page-size="pageSize" :total="pageTotal" :page-sizes="[10, 20, 50, 100]" layout="total, sizes, prev, pager, next, jumper" @size-change="onSizeChange" @current-change="onPageChange"/>
    </div>
  </div>




  <!-- 添加FAQ界面 -->
  <el-dialog v-model="dialogVisible" :close-on-click-modal="false" :close-on-press-escape="false" title="添加FAQ" width="500">
    <el-form :model="formData" label-position="left" label-width="80px">
      <el-form-item label="问题名称"><el-input v-model="formData.kb_question_name" placeholder="例：xx问题名称"></el-input>
      </el-form-item><el-form-item label="问题答案">
        <el-input v-model="formData.kb_question_answer" placeholder="例：http://bap.supcon.com:8081/#/track/case/all?projectId=ff91df4d-128c-4b70-8174-5916b3e07adc"></el-input>
      </el-form-item>
      <!-- <el-form-item label="文件名称">
        <el-select v-model="formData.kb_file" placeholder="请选择文件名称" style="width: 100%">
          <el-option v-for="item in File_Name_Option" :key="item.id" :label="item.file_name" :value="item.id"></el-option>
        </el-select>
      </el-form-item> -->
      <el-form-item>
        <el-button @click="onCancel">取消</el-button>
        <el-button type="primary" @click="onSubmit">提交</el-button>
      </el-form-item>
    </el-form>
  </el-dialog>

 <!-- Faq组 -->
 <el-dialog v-model="treeDialogVisible" :close-on-click-modal="false" :close-on-press-escape="false" title="组名称" width="500">
    <el-form :model="treeFormData" label-position="left" label-width="80px">
      <el-form-item label="组名称"><el-input v-model="formData.group_name"></el-input></el-form-item>
      <el-form-item label="Key"><el-input v-model="formData.group_key"></el-input></el-form-item>
      <el-form-item label="备注"><el-input type="textarea" v-model="formData.group_remark"></el-input></el-form-item>
      <el-form-item>
        <el-button @click="treeCancel">取消</el-button>
        <el-button type="primary" @click="treeSubmit">提交</el-button>
      </el-form-item>
    </el-form>
  </el-dialog>

</template>


<script setup>
import { ref, onMounted, nextTick } from "vue"
import * as KnowledgeBaseFaq from "@/api/knowledgeBase"
import { ElMessage } from "element-plus";

// let intervalId
onMounted(async () => {
  await treeList();
  await handleQuery(true); // 强制初始化加载
  // 初始化文件列表
  const Res = await KnowledgeBaseFaq.PostKnowledgeBaseFaqFileUploadIList({ pageEnable: false });
  File_Name_Option.value = Res.data.data.data.map(item => ({
    id: item.id,
    file_name: item.file_name
  }));
})


const formInline = ref({
  kb_question_name: '',
  kb_question_answer: ''
})

const tableData = ref([])
const pageNum = ref(1)
const pageSize = ref(20)
const pageTotal = ref(0)
const dialogVisible = ref(false)
const formData = ref({})
const treeData = ref([])
const treeFormData = ref({})
const treeDialogVisible = ref(false)
const defaultProps = {children: 'children', label: 'group_name'}
const activeTreeNode = ref({})
const File_Name_Option = ref([])
// const node= ref([])


// function onDevelopment() {
//   ElMessage.info('功能开发中');
// }

async function handleQuery(initLoad = false) {
  try {
    // 当所有查询条件为空时调用pageList（修正字段名匹配）
      if (!formInline.value.kb_question_name && !formInline.value.kb_question_answer ) {
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
          field: 'kb_question_name', 
          rule: 'contains',  // 确保实际请求参数也使用contains规则
          value: formInline.value.kb_question_name?.trim() // 添加trim处理
        },
        {
          field: 'kb_question_answer',
          rule: 'contains',
          value: formInline.value.kb_question_answer?.trim()
        }
       
      ].filter(rule => rule.value)
    };
    const res = await KnowledgeBaseFaq.PostKnowledgeBaseFaqInfoList(params);
    
    
    console.log('过滤后返回的信息');
    console.log(res);

    if (res.status === 200) {
      // 更新表格数据和分页信息
      tableData.value = res.data.data?.data || [];
      console.log(tableData.value);
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

async function handleReset() {
  formInline.value.kb_question_name = '';
  formInline.value.kb_question_answer = '';
  handleQuery();
}

// 树型结构列表数据展示

async function treeList() {
  const res = await  KnowledgeBaseFaq.PostKnowledgeBaseFaqGroupInfoList({
    pageEnable: false
  })
  if (res.status === 200) {
    treeData.value = res.data.data.data
  }
  return res
}

// 树形结构新增
async function treeAdd() {
  formData.value = {} // 清空表单数据
  treeFormData.value = {}
  treeDialogVisible.value = true
}

// 树形结构编辑
async function treeEdit() {
  // 加强空值检查，确保有有效的树节点
  if (!activeTreeNode.value?.id) {
    ElMessage.warning('请先选择要编辑的树节点');
    return;
  }

  try {
    // 使用可选链操作符安全访问属性
    formData.value = {
      id: activeTreeNode.value?.id,
      group_key: activeTreeNode.value?.group_key || '',
      group_name: activeTreeNode.value?.group_name || '',
      group_remark: activeTreeNode.value?.group_remark || '',
    };

    // 使用nextTick确保DOM更新
    await nextTick();
    
    // 安全操作对话框状态
    treeDialogVisible.value = true;

  } catch (error) {
    console.error('打开编辑对话框出错:', error);
    ElMessage.error(`打开编辑界面失败: ${error.message}`);
  }
}

// 树形结构取消
async function treeCancel() {
  treeDialogVisible.value = false;
  treeFormData.value = {}
}

// 树形结构新增组名
async function treeSubmit() {
  try {
    // 新增操作时校验group_key唯一性
    if (!formData.value.id) {
      const checkRes = await KnowledgeBaseFaq.PostKnowledgeBaseFaqGroupInfoList({
        pageEnable: false,
        pageRule: [{
          field: "group_key",
          rule: "is",
          value: formData.value.group_key
        }]
      });

      if (checkRes.data?.data?.total > 0) {
        ElMessage.error('组Key已存在，请修改后重试');
        return;
      }
    }

    const res = await KnowledgeBaseFaq.PostKnowledgeBaseFaqGroupInfo(formData.value);
    ElMessage.success(res.data.message);
    treeFormData.value = {};
    treeDialogVisible.value = false;
    await treeList();
   
  
  } catch (error) {
    console.error('提交出错:', error);
    ElMessage.error(`操作失败: ${error.response?.data?.detail || error.message}`);
  }
}

// 点击树节点刷新表格数据
async function treeNodeClick(node) {
  activeTreeNode.value = node
  await pageList(node.id)
}


async function treeDelete() {
  if (!activeTreeNode.value?.id) {
    ElMessage.warning('请先选择要删除的树节点');
    return;
  }
  
  // 检查节点下是否有子记录
  try {
    const res = await KnowledgeBaseFaq.PostKnowledgeBaseFaqInfoList({
      pageEnable: false,
      pageRule: [{
        field: "group_id", 
        rule: "is",
        value: activeTreeNode.value.id
      }]
    });
    
    if (res.data?.data?.total > 0) {
      ElMessage.error(`该节点包含${res.data.data.total}条子记录，无法删除！`);
      return;
    }

    const id = activeTreeNode.value.id;
    // 确保参数格式与API一致
    const deleteRes = await KnowledgeBaseFaq.DeleteKnowledgeBaseFaqGroupInfo({ id });
    if (deleteRes.data?.code === 200) {
      ElMessage.success(deleteRes.data.message || '删除成功');
      await treeList();
      // 重置分页逻辑优化
      const newTotal = pageTotal.value - 1;
      if (pageNum.value > 1 && (pageNum.value - 1) * pageSize.value >= newTotal) {
        pageNum.value -= 1;
      }
      await pageList();
    } else {
      ElMessage.error(deleteRes.data?.message || '删除失败');
    }
  } catch (error) {
    console.error('删除操作失败:', error);
    ElMessage.error(`删除失败: ${error.response?.data?.detail || error.message}`);
  }
}


// 格式化文件显示名称

// function formatFileName(row) {
//   if (row.kb_file_name == null) return '未关联文件';// 安全处理空值情
//   const currentFileId = String(row.kb_file_name);// 使用String()转换替代直接调用toString()
//   const foundFile = File_Name_Option.value.find(file => // 添加可选链操作符和默认值 
//     String(file?.id ?? '') === currentFileId
//   );
//   return foundFile?.file_name || `未匹配文件(ID:${currentFileId})`;// 返回结果时保留原始ID用于调试
// }

// function formatFileName(row) {
//   const foundFile = File_Name_Option.value.find(file => file.id === row.kb_file_name);
//   return foundFile ? foundFile.kb_file_nam : '未知文件';
// }

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
  pageNum.value = val
  const res = await pageList()
  if (res?.data?.code === 200) {
    ElMessage({
      message: res.data.message,
      type: 'success',
      plain: true,
    })
  }
}

async function pageList(group_id) {
  const params = {
    pageNum: pageNum.value,
    pageSize: pageSize.value,
    pageEnable: true,
    pageRule: []
  };
  // 根据分组筛选对应的文件
  if (group_id) {
    params.pageRule.push({
      field: "kb_group",
      rule: "is",
      value: group_id
    });
  }

  const res = await KnowledgeBaseFaq.PostKnowledgeBaseFaqInfoList(params);
  if (res.status === 200) {
    tableData.value = res.data.data.data
    pageTotal.value = res.data.data.total
  }
  return res
}


// 文件的提交 

async function onAdd() {
  if (!activeTreeNode.value?.id) {
    ElMessage.info("请先选择树节点");
    return;
  }

  try {
    
    formData.value = {}
    const Res = await KnowledgeBaseFaq.PostKnowledgeBaseFaqFileUploadIList({
      pageEnable: true,
      // pageRule: [{field: "auth_dog_enable", rule: "is", value:}]
    });
    
    // 更新文件列表选项
    File_Name_Option.value = Res.data.data.data.map(item => ({
      id: item.id,
      file_name: item.file_name
    }));

    // 初始化表单数据
    // 设置默认文件（选择第一个可用选项）
    const defaultFileName = File_Name_Option.value.length > 0 ? File_Name_Option.value[0].id : null;
    formData.value = {
    kb_question_name: '新问题',
    kb_question_answer: '标准答案',
    kb_group: activeTreeNode.value.id, // 确保使用正确的字段名
    kb_file_name:defaultFileName
    //  formData.value.kb_file_name || File_Name_Option.value[0]?.id || '' // 保留已选文件或初始化
  };
  // 打开对话框
  dialogVisible.value = true;
  } catch (error) {
      console.error('新增环境失败:', error);
      ElMessage.error('打开新增页面失败: ' + (error.response?.data?.message || error.message));
    }
}




  async function onSubmit() {
  // 设置正确字段名并确保kb_file_name是数字类型
  formData.value = {
    ...formData.value,
    kb_group: activeTreeNode.value.id,
    kb_file_name: Number(formData.value.kb_file) || 1 // 转换为数字类型
    // source: "system" // 添加source字段
  };

  // 仅检查必要字段
  if (!formData.value.kb_group) {
    ElMessage.error('请选择知识库组');
    return;
  }

  const res = await KnowledgeBaseFaq.PostKnowledgeBaseFaqInfo(formData.value)
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
    const res = await  KnowledgeBaseFaq.DeleteKnowledgeBaseFaqInfo({ id: id })
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
    // 确保所有依赖数据有效
    if (!row?.id || !activeTreeNode.value?.id) {
      throw new Error('请先选择有效的知识库组和FAQ条目');
    }

    // 获取最新文件列表
    const Res = await KnowledgeBaseFaq.PostKnowledgeBaseFaqFileUploadIList({ pageEnable: false });
    File_Name_Option.value = Res.data.data.data.map(item => ({
      id: item.id,
      file_name: item.file_name
    }));

    // 深拷贝数据避免响应式污染
    const rowData = JSON.parse(JSON.stringify(row));
    const activeNode = JSON.parse(JSON.stringify(activeTreeNode.value));

    // 初始化表单数据
    formData.value = {
      id: rowData.id,
      kb_question_name: rowData.kb_question_name || '',
      kb_question_answer: rowData.kb_question_answer || '',
      kb_file: Number(rowData.kb_file_name) || 0, // 转换为数字类型
      kb_group: activeNode.id
    };

    // 分步执行DOM更新
    // await nextTick();
    dialogVisible.value = true;
    await nextTick(); // 确保对话框渲染完成

  } catch (error) {
    console.error('编辑初始化错误:', error);
    ElMessage.error(`操作失败: ${error.message}`);
    // 强制重置对话框状态
    dialogVisible.value = false;
    await nextTick();
    dialogVisible.value = false;
  }
}





// FAQ 文件上传
// async function FaqUploadFileonSubmit() {
//   try {
//     const res = await KnowledgeBaseFaqUploadFileInfoPost(formData.value)
//     ElMessage({
//       message: res?.data?.message || '操作成功',
//       type: res?.data?.code === 200 ? 'success' : 'error',
//       plain: true,
//     })
//     formData.value = {
//       group_name: '',
//       group_key: '',
//       group_remark: ''
//     }
//     await pageList()
//     dialogVisible.value = false
//   } catch (error) {
//     ElMessage({
//       message: error.message || '提交失败',
//       type: 'error',
//       plain: true,
//     })
//   }
// }





</script>




<style scoped>
.dataset-container {
  display: flex;
  gap: 20px;
  padding: 20px;
  height: 100%;
  position:relative;
}
.left-panel {
  width: 300px;
  display: flex;
  flex-direction: column;
  border-right: 1px solid #dcdfe6;
  padding-right: 20px;
}
.tree-header {
  margin-bottom: 16px;
  display: flex;
  gap: 10px;
}
.tree-container {
  width: 300px;
  min-width: 300px;
  border-right: 1px solid #dcdfe6;
  padding-right: 20px;
  height: calc(100vh - 200px);
  overflow-y: auto;
  flex: 1;
}
.tree-node-ref {
  display: flex;
  align-items: center;
  justify-content: space-between;  
  width: 100%;
}
.tree-node-ref:hover .action-btns {
  display: flex;          /* 悬浮时显示 */
}
.action-btns {
  display: none;          /* 默认隐藏 */
}
.node-label {
  flex: 1 1 0;
  min-width: 0;
  margin-right: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  cursor: default;
}
:deep(.el-tree-node__children) {
  padding-left: 16px;
}
:deep(.el-tree-node__expand-icon) {
  color: #909399;
}
:deep(.el-tree-node__expand-icon.expanded) {
  transform: rotate(90deg);
}
:deep(.el-tree-node__content) {
  height: 32px;
}
:deep(.el-tree-node__content:hover) {
  background-color: #f5f7fa;
}
:deep(.el-tree-node.is-current > .el-tree-node__content) {
  background-color: #ecf5ff;
}
:deep(.el-tree) {
  background: #fff;
}
.right-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
}
.button-group {
  margin-bottom: 16px;
  display: flex;
  gap: 8px;
}
.table-pagination {
  padding-top: 10px;
}



.el-message__content {
  color: red !important;
}
</style>
