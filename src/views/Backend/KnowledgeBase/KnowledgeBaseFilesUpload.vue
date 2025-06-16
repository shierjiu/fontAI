<template>
<el-form :inline="true" :model="formInline" class="demo-form-inline">
    <!-- #查询条件 -->
    <el-form-item label="文件名称">
      <el-input v-model="formInline.file_name" placeholder="请输入文件名称" clearable />
    </el-form-item>
    <el-form-item label="文件">
      <el-input v-model="formInline.file" placeholder="请输入文件" clearable />
    </el-form-item>
    <el-form-item>
      <el-button class="headerButton" type="primary" plain @click="handleQuery">查询</el-button>
    </el-form-item>
    <el-form-item>
      <el-button class="headerButton" type="primary" plain @click="handleReset">重置</el-button>
    </el-form-item>
  </el-form>




  <div class="container">
    <el-button class="headerButton" type="primary" plain @click="FileAdd">单个文件上传</el-button>
    <el-button class="headerButton" type="primary" plain @click="MultFileAdd">批量文件上传</el-button>
    <el-table :data="tableData" stripe max-height="680" style="width: 100%" @filter-change="debounceFilter" @sort-change="debounceSort">
      <el-table-column type="index" width="50" fixed="left"/>
      <el-table-column label="文件名" width="250">
        <template #default="{row}">
          <el-link type="primary" @click="handlePreview(row)">{{ row.file_name }}</el-link>
        </template>
      </el-table-column>
      <el-table-column label="文件" prop="file" width="250" :formatter="formatFileName" />
      <el-table-column label="操作列" width="300" fixed="right">
        <template #default="scope">
          <el-button class="headerButton" type="primary" plain size="small" @click.prevent="onDownload(scope.row.id, scope.row.file_name)">下载</el-button>
          <!-- <el-button link type="primary" size="large"  @click="importVisible = false">下载</el-button>
          -->
          <el-button class="headerButton" type="primary" plain size="small" @click="edit(scope.row)">编辑</el-button>
          <el-popconfirm title="确认删除吗" @confirm="onDelete(scope.row.id)">
            <template #reference>
              <el-button link type="danger" size="small">删除</el-button>
            </template>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>



    <el-pagination class="table-pagination" v-model:current-page="pageNum" v-model:page-size="pageSize" :total="pageTotal" :page-sizes="[10, 20, 50, 100]"
  layout="total, sizes, prev, pager, next, jumper" @size-change="onSizeChange" @current-change="onPageChange"/>

  <!-- 单个文件添加 -->
  <el-dialog v-model="dialogVisible" :close-on-click-modal="false" :close-on-press-escape="false" title="单文件添加" width="500">
    <el-form :model="formData">
      <el-form-item label="文件名称">
        <el-input v-model="formData.file_name" placeholder="例：xx文件名称"></el-input>
      </el-form-item>
      <el-form-item label="文件实体" :formatter="formatFileName">
        <el-input v-model="formData.file"  placeholder="例：xx文件"></el-input>
      </el-form-item>
      <el-form-item label="文件上传" required>
        <el-upload 
          class="knowledgebase-test-file-upload" 
          drag 
          :limit="1" 
          :on-exceed="onExceed" 
          :action="uploadAction" 
          :on-success="onSuccess" 
          :on-remove="onRemove" 
          :file-list="fileList"
          accept=".txt, .doc, .docx"
          :on-preview="handlePreview"
          :before-upload="beforeUpload">
          <el-icon class="el-icon--upload"><upload-filled /></el-icon>
          <div class="el-upload__text">拖拽 或 <em>点击</em> 上传文件</div>
          <template #tip>
            <div class="el-upload__tip">支持txt/word，单个文件不超过10MB</div>
          </template>
        </el-upload>
      </el-form-item>
      <el-dialog v-model="previewVisible" title="文件预览">
        <pre>{{ previewContent }}</pre>
      </el-dialog>
      <el-form-item>
        <el-button @click="onCancel">取消</el-button>
        <el-button type="primary" @click="onSubmit">提交</el-button>
      </el-form-item>
    </el-form>
  </el-dialog>



<!-- 多文件添加 -->
    <el-dialog v-model="MultiFiledialogVisible" :close-on-click-modal="false" :close-on-press-escape="false" title="批量文件上传" width="500">
      <el-form :model="multiformData">
        <el-form-item label="批量上传" required>
          <el-upload
            class="knowledgebase-Multi-file-upload"
            drag
            multiple
            :limit="50"
            :auto-upload="false"
            :file-list="multiFiles"
            accept=".txt,.doc,.docx,.pdf,.xls,.xlsx"
            :before-upload="beforeMultiUpload"
            :on-exceed="handleExceed"
            :on-change="handleMultiChange"
            :on-remove="handleRemove"
            list-type="text">
            <el-icon class="el-icon--upload"><upload-filled /></el-icon>
            <div class="el-upload__text">拖拽文件到此处或<em>点击上传</em></div>
            <el-dialog v-model="previewVisible" title="文件预览">
              <pre>{{ previewContent }}</pre>
            </el-dialog>
            <template #tip>
              <div class="el-upload__tip">支持文档/文本格式，单个文件不超过20MB</div>
            </template>
          </el-upload>
        </el-form-item>
        <el-form-item>
          <el-button class="headerButton" type="primary" plain @click="MultFileonCancel = false">取消</el-button>
          <el-button class="headerButton" type="primary" @click="MultFileonSubmit">开始上传</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>

  </div> 
</template>


<script setup>

import { onMounted, ref, onUnmounted } from "vue"
import { debounce } from 'lodash-es'
import { ElMessage, ElLoading } from "element-plus"; // 确保ElLoading已导入
import {BASE_URL} from "@/utils/request";



// 初始化查询表单
const formInline = ref({
  file_name: '',
  file: ''
})

import * as KnowledgeBaseFaqFileUpload from "@/api/knowledgeBase"

const uploadAction = BASE_URL + "/knowledge_base_faq/KnowledgeBaseFileRead/upload"
const tableData = ref([])
const pageNum = ref(1)
const pageSize = ref(20)
const pageTotal = ref(0)
const dialogVisible = ref(false)
const MultiFiledialogVisible = ref(false)


// this.resizeObserver = new ResizeObserver(debounce(() => {
//   // 处理逻辑
// }, 200));
const formData = ref({
  file: null, // 存储文件对象
  file_name: '',
  group_id: null
})
const fileList = ref([])
const multiFiles = ref([]) // 声明多文件列表
// 表格过滤防抖处理（300ms）
const debounceFilter = debounce((filters) => {
  console.log('过滤条件变更:', filters);
  pageList();
}, 300);

// 表格排序防抖处理
const debounceSort = debounce(({ prop, order }) => {
  console.log('排序字段:', prop, '排序方式:', order);
  pageList();
}, 300);

// 分页防抖处理
// const debouncePageList = debounce(pageList, 200);
onUnmounted(() => {
  window.removeEventListener('error', handleResizeObserverError)
})

// 查询处理
async function handleQuery(initLoad = false) {
  try {
    // 当所有查询条件为空时调用pageList（修正字段名匹配）
      if (!formInline.value.file_name && !formInline.value.file) {
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
          field: 'file_name', 
          rule: 'contains',  // 确保实际请求参数也使用contains规则
          value: formInline.value.file_name?.trim() // 添加trim处理
        },
        {
          field: 'file',
          rule: 'contains',
          value: formInline.value.file?.trim()
        }
      ].filter(rule => rule.value)
    };
    const res = await KnowledgeBaseFaqFileUpload.KnowledgeBaseFaqFileUploadInfoList(params);
    
    
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

// 重置表单处理
async function handleReset() {
  formInline.value = { file_name: '', file: '' };
  await pageList();
}



// 多文件上传前校验
const beforeMultiUpload = (file) => {
  const isLt20M = file.size / 1024 / 1024 <= 20
  if (!isLt20M) {
    ElMessage.error('单个文件大小不能超过20MB')
    return false
  }
  return true
}

// 处理多文件选择变化
const handleMultiChange = (file, fileList) => {
  multiFiles.value = fileList
}

// 处理多文件移除
const handleRemove = (file, fileList) => {
  multiFiles.value = fileList
}

// 处理文件超出限制
const handleExceed = () => {
  ElMessage.warning('最多只能上传50个文件')
}
const previewVisible = ref(false)
const previewContent = ref('')

const beforeUpload = (file) => {
  formData.value.file = file // 存储文件对象
  formData.value.file_name = file.name // 自动填充文件名
  return true
}

// 获取文件扩展名辅助函数
const getFileExtension = (fileName) => {
  const parts = fileName.split('.');
  return parts.length > 1 ? parts.pop().toLowerCase() : '';
};

// 文件预览处理
const handlePreview = async (row) => {
  try {
    // 显示加载状态
    // let  loadingInstance= null;
    // loadingInstance = ElLoading.service({
    //   lock: true,
    //   text: '正在加载预览...',
    //   background: 'rgba(0, 0, 0, 0.7)'
    // });

    // 请求文件预览接口
    const response = await fetch(`${BASE_URL}/knowledge_base_faq/KnowledgeBaseFileRead/preview?id=${row.id}`);
    
    // 处理HTTP错误状态
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `请求失败，状态码：${response.status}`);
    }

    // 获取内容类型和文件名
    const contentType = response.headers.get('Content-Type') || '';
    const fileName = row.file_name.toLowerCase();
    
    // 处理不同类型文件
    if (contentType.startsWith('text/')) {
      // 文本文件直接显示
      previewContent.value = await response.text();
      previewVisible.value = true;
    } else if (fileName.endsWith('.pdf')) {
      // PDF文件使用浏览器内置预览
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
      URL.revokeObjectURL(url);
    } else if (['.doc', '.docx', '.xls', '.xlsx'].some(ext => fileName.endsWith(ext))) {
      // Office文档使用Google Docs Viewer
      // 生成带时间戳的下载链接避免缓存问题
      const fileUrl = encodeURIComponent(`${BASE_URL}/knowledge_base_faq/KnowledgeBaseFileRead/download?id=${row.id}&t=${Date.now()}`);
      // 添加文件类型参数提高Google Docs Viewer识别精度
      window.open(`https://docs.google.com/viewer?url=${fileUrl}&embedded=true&filetype=${getFileExtension(row.file_name)}`, '_blank');
    } else {
      // 其他文件类型尝试直接打开
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.target = '_blank';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  } catch (error) {
      console.error('文件预览失败详情:', {
        fileName: row.file_name,
        fileId: row.id,
        error: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
      });
      ElMessage.error(`文件预览失败：${row.file_name}（${error.message}）`);
  } finally {

    // loadingInstance.value.close();
  }
};
// const loading = ref()


// let intervalId

// 全局ResizeObserver错误处理器
function handleResizeObserverError(e) {
  const resizeObserverErrors = [
    'ResizeObserver loop limit exceeded',
    'ResizeObserver loop completed with undelivered notifications',
    'ResizeObserver cannot observe this element',
    'ResizeObserver is not defined'
  ];
  
  if (resizeObserverErrors.some(msg => e.message?.includes(msg))) {
    e.preventDefault();
    e.stopImmediatePropagation();
    e.stopPropagation();
  }
  return true;
}

// ResizeObserver实例引用
const ro = ref(null);
let observedElements = new WeakSet();
const isMounted = ref(true); // 添加挂载状态检查

onMounted(() => {
  // 初始化ResizeObserver安全处理
  isMounted.value = true;
  if (typeof ResizeObserver === 'function' && !window.__resizeObserverPatched__) {
    window.__resizeObserverPatched__ = true;
    ro.value = new ResizeObserver(debounce((entries) => {
      if (!isMounted.value) return;
      try {
        if (!isMounted.value) return; // 组件卸载后停止处理
        
        entries.forEach(entry => {
          // 确保元素仍存在于DOM中且只观察一次
          if (!entry.target.isConnected || observedElements.has(entry.target)) {
            ro.value?.unobserve(entry.target);
            return;
          }
          
          observedElements.add(entry.target);
          
          // 使用requestAnimationFrame优化性能
          requestAnimationFrame(() => {
            const newWidth = Math.round(entry.contentRect.width);
            const newHeight = Math.round(entry.contentRect.height);
            const prevWidth = parseInt(entry.target.dataset.lastWidth || 0);
            const prevHeight = parseInt(entry.target.dataset.lastHeight || 0);

            // 尺寸变化超过2px才处理，减少触发频率
            if (Math.abs(newWidth - prevWidth) > 2 || 
                Math.abs(newHeight - prevHeight) > 2) {
              entry.target.dataset.lastWidth = newWidth;
              entry.target.dataset.lastHeight = newHeight;
            }
          });
        });
      } catch (error) {
        console.debug('ResizeObserver处理异常:', error);
      }
    }, 150, { leading: true, trailing: true })); // 增加防抖时间到150ms

    // 在数据加载后观察表格容器
    const observeAfterLoad = () => {
      const tableContainer = document.querySelector('.el-table__body-wrapper');
      if (tableContainer && tableContainer.isConnected && !observedElements.has(tableContainer)) {
        ro.value.observe(tableContainer, { box: 'border-box' });
        observedElements.add(tableContainer);
      }
    };

    // 初始加载后观察
    setTimeout(observeAfterLoad, 300);
    
    // 创建防抖分页处理函数
    // const debouncedPageHandler = debounce(async () => {
    //   const result = await pageList();
    //   setTimeout(observeAfterLoad, 100);
    //   return result;
    // }, 200);

    // 使用响应式对象管理分页处理器
    // const pageHandlers = ref({
    //   change: debounce((val) => {
    //     pageNum.value = val;
    //     debouncedPageHandler();
    //   }, 200),
    //   sizeChange: debounce(debouncedPageHandler, 200)
    // });
  }

  window.addEventListener('error', handleResizeObserverError, { capture: true });
  // 带重试机制的初始加载
  let retryCount = 0;
  const initLoad = () => {
    pageList().catch(() => {
      if (retryCount++ < 3) setTimeout(initLoad, 500);
    });
  };
  setTimeout(initLoad, 200);
});


onUnmounted(() => {
  // 彻底清理观察器和事件监听
  isMounted.value = false;
  if (window.__resizeObserverPatched__) {
    window.__resizeObserverPatched__ = false;
    window.removeEventListener('error', handleResizeObserverError, { capture: true });
  }
  if (ro.value) {
    try {
      // 彻底清理所有观察目标和待处理回调
      ro.value._debounced?.flush(); // 立即执行所有待处理回调
      ro.value._debounced?.cancel(); // 取消后续回调
      ro.value.disconnect(); // 断开所有观察
      ro.value = null; // 释放引用
    } catch (error) {
      console.debug('ResizeObserver清理异常:', error);
    }
  }
  observedElements = new WeakSet(); // 重置观察元素集合 (ESLint修复：使用let声明)
});


async function pageList() {
    const res = await KnowledgeBaseFaqFileUpload.PostKnowledgeBaseFaqFileUploadInfoList({
      pageNum: pageNum.value,
      pageSize: pageSize.value
    });
    
    if (res.status === 200) {
      tableData.value = res.data.data.data
      pageTotal.value = res.data?.data?.total || 0
    }
    return res
        // 更新表格数据和分页信息
        

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

// 分页大小变化处理 (带防抖)
async function onSizeChange() {
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

async function FileAdd() {
  try {
    // 完全重置表单数据和文件列表
    formData.value = {
      file: null,
      file_name: '',
      group_id: null
    };
    fileList.value = [];
    dialogVisible.value = true;
  } catch (error) {
    console.error('初始化表单失败:', error);
    ElMessage.error('初始化失败，请稍后重试');
  }
}


async function MultFileAdd() {
  FormData.value = { }
  MultiFiledialogVisible.value = true
}




// 添加文件名格式化方法
function formatFileName(row) {
  // 显示文件名或文件对象的name属性
  return row.file?.name || row.file || '-';
}


async function onSubmit() {
  // 验证必填字段
  if (!formData.value.file) {
    ElMessage.error('请先上传文件');
    return;
  }
  if (!formData.value.file_name) {
    ElMessage.error('请输入文件名称');
    return;
  }

    const formPayload = new FormData();
    formPayload.append('file_name', formData.value.file_name);
    // 确保文件字段使用后端要求的名称，并正确附加文件对象
    formPayload.append('file', formData.value.file.raw || formData.value.file); 
    
    if (formData.value.group_id) {
      formPayload.append('group_id', formData.value.group_id);
    }

    // 添加文件调试信息
    console.log('上传文件详情:', {
      name: formData.value.file.name,
      size: (formData.value.file.size / 1024 / 1024).toFixed(2) + 'MB',
      type: formData.value.file.type
    });

    // 根据是否编辑模式选择创建或更新接口，POST方法需要明确传递ID
    const apiMethod = formData.value.id 
      ? KnowledgeBaseFaqFileUpload.PostKnowledgeBaseFaqFileUploadInfo
      : KnowledgeBaseFaqFileUpload.PostKnowledgeBaseFaqFileUploadInfo;
      
    // 构建PUT请求专用参数
    if (formData.value.id) {
      const id = formData.value.id.toString();
      formPayload.append('id', id);
      formPayload.delete('file'); // 删除重复的file字段
    }
      
    // 确保始终包含文件字段
    if (formData.value.file) {
      formPayload.append('file', formData.value.file.raw || formData.value.file);
    }
    
    // 添加ID用于更新操作
    if (formData.value.id) {
      formPayload.append('id', formData.value.id);
    }

    const res = await apiMethod(formPayload, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
      },
      baseURL: BASE_URL
    }).catch(error => {
      console.error('API请求失败详情:', {
        config: error.config,
        response: error.response?.data,
        message: error.message
      });
      ElMessage.error(`请求失败: ${error.message}`);
      throw error;
    });

    if (res.data.code !== 200) {
      ElMessage({
      message: res.data.message,
      type: 'success',
      plain: true,
    });
    }

   
    fileList.value = [];
    dialogVisible.value = false;
    await pageList();
  

}


// 多文件上传处理
async function MultFileonSubmit() {
  if (multiFiles.value.length === 0) {
    ElMessage.warning('请先选择要上传的文件');
    return;
  }

  const loadingService = ElLoading.service({
    lock: true,
    text: '文件上传中...',
    background: 'rgba(0, 0, 0, 0.7)'
  });

  try {
    let successCount = 0;
    const errorFiles = []; // 在循环外声明
    const successFiles = []; // 新增成功文件列表

    // 逐个处理上传文件
    for (const file of multiFiles.value) {
      try {
        const formPayload = new FormData();
        formPayload.append('file_name', file.name);
        
        // 统一获取文件对象（处理element-plus上传组件的raw字段）
        const fileObj = file.raw || file;
  

        // 添加文件到表单数据（使用后端要求的字段名）
        formPayload.append('file', fileObj); 
        
        // 添加调试信息
        console.log('上传文件详情:', {
          name: file.name,
          size: (fileObj.size / 1024 / 1024).toFixed(2) + 'MB',
          type: fileObj.type
        });
        
        // if (formData.value.group_id) {
        //   formPayload.append('group_id', formData.value.group_id);
        // }

        const res = await KnowledgeBaseFaqFileUpload.PostKnowledgeBaseFaqFileUploadInfo(formPayload);

        if (res.data.code === 200) {
          successCount++;
          successFiles.push(file.name); // 收集成功文件名
          ElMessage({
          message: res.data.message,
          type: 'success',
          plain: true,
        });
        } else {
          errorFiles.push(file.name);
        }
      } catch (error) {
        const fileObj = file.raw || file; // 确保文件对象存在
        const errorDetails = {
          fileName: file.name,
          status: error.response?.status,
          error: error.response?.data?.message || error.message,
          request: { 
            size: (fileObj.size / 1024 / 1024).toFixed(2) + 'MB',
            type: fileObj.type,
            headers: error.config?.headers
          },
          stack: error.stack
        };
        console.error('文件上传失败详情:', errorDetails);
        errorFiles.push(`${file.name} (${errorDetails.error})`);
      }
    }

    // 显示上传结果
    if (successCount > 0) {
      ElMessage.success({
        message: `成功上传 ${successCount} 个文件:<br>${successFiles.join('，')}`,
        dangerouslyUseHTMLString: true,
        duration: 6000
      });
    }
    
  
    // 确保errorFiles是数组且包含元素
    if (Array.isArray(errorFiles) && errorFiles.length) {
      // ElMessage.error(`以下文件上传失败：${errorFiles.filter(Boolean).join('，')}`);
    }

    // 重置状态并刷新列表
    multiFiles.value = [];
    await pageList();
    MultiFiledialogVisible.value = false;
  } catch (error) {
    ElMessage.error('上传过程发生错误: ' + error.message);
  } finally {
    loadingService.close();
  }
}




async function onCancel() {
  dialogVisible.value = false
  formData.value = {
    file: '',
    file_name: ''
  }
}



async function  MultFileonCancel() {
 
  MultiFiledialogVisible.value = false
  formData.value = {}
  
}

async function onDelete(id) {
  try {
    const res = await KnowledgeBaseFaqFileUpload.DeleteKnowledgeBaseFaqFileUploadInfo({ id:id })
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



async function edit(row) {
  formData.value = {
    id: row.id,
    file_name: row.file_name,
    file: '', // 清空文件引用，强制用户重新上传
    group_id: row.group_id
  };
  fileList.value = [{
    name: row.file_name,
    url: `${BASE_URL}/knowledge_base/KnowledgeBaseFileRead/download?id=${row.id}` // 直接使用下载链接
  }];
  dialogVisible.value = true;
}



function onExceed() {
  ElMessage ({
    message: "只允许上传一个文件",
    type: "warning",
    plain: true,
  })
}

function onSuccess(response) {
  if (response.data?.code === 200) {
    formData.value.file = response.data.file; // 设置文件路径
    formData.value.file_name = response.data.file_name; // 设置文件名
  }
}

function onRemove() {
  formData.value.file = '';
  formData.value.file_name = '';
}


async function onDownload(id, name) {
  try {
    const response = await fetch(`${BASE_URL}/knowledge_base/download?id=${id}`);
    console.log("当前返回的response地址为：",response)
    if (!response.ok) throw new Error('文件下载失败');
    
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  } catch (error) {
    console.error('文件下载错误:', {
      fileId: id,
      error: error.stack
    });
    ElMessage.error(`${name} 下载失败: ${error.message}`);
  }
}

</script>


<style scoped>
/* 增强布局稳定性 */
.table-pagination {
  padding-top: 10px;
  position: relative;
  z-index: 1;
}

.knowledgebase-test-file-upload {
  max-width: 2048px;
  width: 100%;
}

/* 添加布局约束 */
.el-table__body-wrapper {
  overflow-anchor: none;
  min-height: 400px;
  max-height: calc(100vh - 200px);
}

.el-dialog__body {
  overflow: auto !important;
  contain: strict;
}


.knowledgebase-Multi-file-upload {
  max-width: 2048px;
  width: 100%;
}

.demo-form-inline .el-input {
  --el-input-width: 220px;
}

.demo-form-inline .el-select {
  --el-select-width: 220px;
}
</style>
