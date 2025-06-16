<template>
  <el-drawer
    v-model="drawerVisible"
    title="知识库"
    :with-header="true"
    direction="rtl"
    size="30%"
    append-to-body
    destroy-on-close
    class="custom-drawer"
    @close="close"
  >
    <el-form-item label="选择文件" required>
      <el-upload
        drag
        multiple
        :limit="1"
        :auto-upload="false"
        :file-list="multiFiles"
        accept=".zip,.tar,.gz"
        @change="handleMultiChange"
        @remove="handleRemove"
        list-type="text"
      >
        <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
        <div class="el-upload__text">拖拽文件到此处或<em>点击上传</em></div>
        <template #tip>
          <div class="el-upload__tip">支持 ZIP/TAR/GZ，单文件不超过 20MB</div>
          <div class="preview-files" v-if="fileNames.length">
            <el-tag
              v-for="(name, idx) in fileNames"
              :key="idx"
              type="info"
              class="preview-tag"
              @click="download(name)"
            >
              {{ name }}
            </el-tag>
          </div>
        </template>
      </el-upload>
    </el-form-item>

    <template #footer>
      <div class="drawer-footer">
        <el-button @click="close">取消</el-button>
        <el-button type="primary" @click="submit">开始上传</el-button>
      </div>
    </template>
  </el-drawer>
</template>

<script setup>
import { ref, watch, defineProps, defineEmits, onMounted } from 'vue';
import { ElMessage, ElNotification } from 'element-plus';
import { UploadFilled } from '@element-plus/icons-vue';
import * as AiEvaluation from '@/api/AiEvaluation';
const props = defineProps({
  visible: Boolean,
  datasetId: { type: [String, Number], required: true }
});
const emit = defineEmits(['update:visible', 'uploaded']);
const drawerVisible = ref(props.visible)
const fileNames = ref([]);
const multiFiles = ref([]);

// 关闭抽屉
function close() {
  emit('update:visible', false);
}

// 拉取已上传文件列表
async function fetchFileList() {
  const params={
    pageEnable:true,
    pageNum:1,
    pageSize:20,
    pageRule:[{
      field:"dataset",
      rule:"is",
      value:props.datasetId
    }]
  }
  if (!props.datasetId) return;
  try {
    const res = await AiEvaluation.postDatasetItemFileList(params);
    const files=res.data.data.data
    const name=files.map(f=>f.name)
    fileNames.value = name
  } catch (e) {
    ElNotification.error('获取文件列表失败：' + e.message);
  }
}

// 选择文件
function handleMultiChange(file, fileList) {
  multiFiles.value = fileList;
}
// 移除文件
function handleRemove(file, fileList) {
  multiFiles.value = fileList;
}

// 提交上传
async function submit() {
  if (!multiFiles.value.length) {
    ElMessage.warning('请先选择文件');
    return;
  }
  const formData = new FormData();
  formData.append('file', multiFiles.value[0].raw);
  formData.append('dataset', props.datasetId);
  try {
    const res = await AiEvaluation.EvaluationFileImport(formData);
    if (res.status === 200) {
      ElNotification.success('文件上传成功');
      emit('uploaded');
      fetchFileList();
    } else {
      ElNotification.error(res.data?.message || '文件上传失败');
    }
  } catch (e) {
    ElNotification.error('上传异常：' + e.message);
  }
}

// 下载文件
function download(name) {
  AiEvaluation.downloadDatasetFile({ dataset: props.datasetId }).then(res => {
    const blob = new Blob([res.data], { type: 'application/zip' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }).catch(e => {
    ElNotification.error('下载失败：' + e.message);
  });
}

// 进入、可视时刷新列表
onMounted(fetchFileList);
watch(() => props.visible, val => {
  drawerVisible.value = val
  console.log('[子组件] props.visible 改为', val, '同步后 drawerVisible =', drawerVisible.value)
})
// local → emit 更新给父组件
watch(drawerVisible, val => {
  console.log('[子组件] drawerVisible 变为 =', val)
  emit('update:visible', val)
})
</script>

<style scoped>
.custom-drawer .el-drawer__body {
  padding: 24px;
}
.preview-files {
  margin-top: 8px;
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}
.preview-tag {
  cursor: pointer;
  margin: 0;
}
.drawer-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 12px 24px;
  border-top: 1px solid var(--el-border-color-light);
}
</style>