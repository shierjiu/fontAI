<template>
  <el-drawer
    v-model="drawerVisible"
    title="Excel 导入"
    width="30%"
    direction="rtl"
    size="400px"
    append-to-body
    destroy-on-close
    class="excel-import-drawer"
    @close="onClose"
  >
    <el-form :model="form" class="drawer-form">
      <el-form-item label="选择文件" required>
        <el-upload
          drag
          multiple
          :limit="1"
          :auto-upload="false"
          :file-list="multiFiles"
          accept=".xls,.xlsx"
          @change="handleMultiChange"
          @remove="handleRemove"
          list-type="text"
        >
          <el-icon class="el-icon--upload"><upload-filled /></el-icon>
          <div class="el-upload__text">
            拖拽文件或<em>点击上传</em>
          </div>
          <template #tip>
            <div class="el-upload__tip">支持 .xls/.xlsx，单文件不超过 20MB</div>
          </template>
        </el-upload>
      </el-form-item>
      <div v-if="previewData.length" class="preview-wrapper">
        <el-table
          :data="previewData"
          :columns="previewColumns"
          max-height="300"
          border
        />
      </div>
    </el-form>
    <template #footer>
      <div class="drawer-footer">
        <el-button @click="onClose">取消</el-button>
        <el-button type="primary" @click="submit">开始导入</el-button>
      </div>
    </template>
  </el-drawer>
</template>

<script setup>
import { ref, watch } from 'vue'
import * as XLSX from 'xlsx'
import dayjs from 'dayjs'
import { ElNotification } from 'element-plus'
import * as AiEvaluation from "@/api/AiEvaluation/index"

const props = defineProps({
  visible: Boolean,
  datasetId: { type: [String, Number], required: true }
});
const emit = defineEmits(['update:visible', 'uploaded']);
const entityId   = ref(null)
// 中间变量同步可视状态
const drawerVisible = ref(props.visible)
watch(
  () => props.visible,
  (val) => (drawerVisible.value = val)
)
watch(
  drawerVisible,
  (val) => emit('update:visible', val)
)

// 表单与文件预览状态
const multiFiles = ref([])
const previewColumns = ref([])
const previewData = ref([])

function onClose() {
  drawerVisible.value = false
}
function clearPreview() {
  multiFiles.value = []
  previewColumns.value = []
  previewData.value = []
}

function handleMultiChange(file, fileList) {
    multiFiles.value = fileList;// 保持最新文件列表
    const rawFile = file.raw;
    const name = rawFile.name.toLowerCase();
    if (!name.endsWith('.xls') && !name.endsWith('.xlsx')) {
        ElNotification.warning('请上传 .xls 或 .xlsx 文件进行预览');
        previewColumns.value = [];
        previewData.value = [];
        return;
    }
    const reader = new FileReader();
    reader.onload = (e)=>{
        try{
            const wb    = XLSX.read(e.target.result, { type: 'binary' });
            const ws    = wb.Sheets[wb.SheetNames[0]];
            const raw   = XLSX.utils.sheet_to_json(ws, {
                header: 1,
                blankrows: false,
                defval: ''
            });
            if(raw.length<=1){
                ElNotification.warning('Excel 文件内容为空或格式不正确');
                previewColumns.value = [];
                previewData.value = [];
                return;
            }
            // 第一行做表头
            const header = raw[0].map(h => String(h).trim());
            console.log('【header】:', header);
            previewColumns.value = header;
            // 剩下的每一行：补齐长度、再只删掉整行全空的
            const dataRows = raw.slice(1)
                .map(row => {
            const r = [...row];
            while (r.length < header.length) r.push('');
            return r;
        }).filter(row => row.some(cell => cell !== ''));
            previewData.value = dataRows.map(row => {
            const obj = {};
            header.forEach((col, i) => {
            obj[col] = row[i];
            });
            return obj;
        });
        } catch (error) {
            console.error('解析 Excel 文件失败:', error);
            ElNotification.error('解析 Excel 文件失败，请检查文件格式');
            previewColumns.value = [];
            previewData.value = [];
        } 
    };
    reader.readAsBinaryString(rawFile);
}

function handleRemove() {
  clearPreview()
}

async function submit() {
  //console.log('开始提交数据', previewData.value)
    const rows = previewData.value.map(item => {
        // 先拿到原始 update_time
        let ut = item.Updated || item.update_time|| item['更新时间'] || item['Update Time'] || '';

        // 如果是数字（Excel 序列号），转换成字符串
        if (typeof ut === 'number') {
          ut = dayjs('1899-12-30')
            .add(ut, 'day')
            .format('YYYY-MM-DD HH:mm:ss')
        }

        // 确保字符串类型也符合格式
        if (typeof ut === 'string') {
          // 如果已经是 YYYY-MM-DD HH:mm:ss 格式就不用动，
          // 否则也可以再 parse 一次：
          const parsed = dayjs(ut)
          if (parsed.isValid()) {
            ut = parsed.format('YYYY-MM-DD HH:mm:ss')
          }
        }
        console.log('item,ut,entityId',item,ut, entityId.value)
        return {
          detail:       item.ID || item.id,
          question:     item.Question || item.question|| item['标准问题'] || '',
          ground_truth: item.ground_truth|| item['Ground Truth'] || item['标准答案'] || '',
          answer:       item['AI Answer'] || item.answer || item['测评答案']||'',
          contexts:     item.Contexts   || item.contexts || item['上下文']||'',
          update_time:  ut,
          entity:       entityId.value,
          tag:          item.Tag         || item.tag || item['问题标签']||'',
          dataset:      props.datasetId
        }
      })
    //console.log('提交的行数据:', rows)
    const payload = {
      dataset:   props.datasetId,
      json_data: JSON.stringify(rows)
    }
    const params={
      pageEnable:true,
      pageNum:1,
      pageSize:20,
      pageRule:[
        {
          field:"dataset",
          rule:"is",
          value:props.datasetId
        }
      ]
    }
    await AiEvaluation.postDatasetItemList(params)
    previewData.value    = []
    previewColumns.value = []
    multiFiles.value     = []
    drawerVisible.value  = false
    try{
        const res = await AiEvaluation.EvaluationExcelImport(payload)
        if(res.data.code==='success'){
            ElNotification.success(res.data.message)
            await AiEvaluation.postDatasetItemList(params)
        }else{
            ElNotification.error(res.data.message)
        }
    }catch{
        ElNotification.error('导入数据失败，请检查网络或文件格式')
    }
  emit('uploaded', payload)
  onClose()
}
</script>

<style scoped>
.excel-import-drawer .drawer-form { padding: 0 24px }
.preview-wrapper { max-height: 300px; overflow: auto; margin: 16px 0 }
.drawer-footer { display: flex; justify-content: flex-end; gap: 12px; padding: 12px 24px; }
</style>
