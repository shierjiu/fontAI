<template>
  <el-drawer
    v-model="props.visible"
    title="新增需求"
    :with-header="true"
    direction="rtl"
    size="40%"
    append-to-body
    destroy-on-close
    class="custom-drawer"
    @close="close"
  >
  <el-form  class="drawer-form" :model="form">
    <el-form-item label="名称" prop="name" required>
        <el-input v-model="form.name" placeholder="请输入名称" />
    </el-form-item>

    <el-form-item label="所属项目" prop="project" required>
       <el-input :value="form.project?.name" disabled placeholder="请选择项目节点" />
    </el-form-item>

      <el-form-item label="智能体" prop="agent" required>
        <el-select 
        v-model="form.agent" 
        placeholder="请选择智能体"
        :popper-options="{
        modifiers: [
        { name: 'flip', enabled: false }
      ]
    }">
          <el-option
            v-for="item in agentOptions"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="内容" prop="content" required>
        <el-input
          type="textarea"
          :rows="4"
          v-model="form.content"
          placeholder="请输入内容"
        />
      </el-form-item>

    <el-form-item label="选择文件" required>
        <el-upload
          drag
          multiple
          :limit="1"
          :auto-upload="false"
          :file-list="multiFiles"
          accept=".doc,.docx,.txt"
          @change="handleMultiChange"
          @remove="handleRemove"
          list-type="text"
          style="width: 100%;"
        >
          <el-icon class="el-icon--upload"><upload-filled /></el-icon>
          <div class="el-upload__text">
            拖拽文件或<em>点击上传</em>
          </div>
          <template #tip>
            <div class="el-upload__tip">支持 .docx/.txt，单文件不超过 20MB</div>
          </template>
        </el-upload> 
    </el-form-item>
  </el-form>
    <template #footer>
        <div class="drawer-footer">
        <el-button @click="close">取消</el-button>
        <el-button type="primary" @click="submit">提交</el-button>
        </div>
    </template>
  </el-drawer>
</template>

<script setup>
import { ref, watch, defineProps, defineEmits, onMounted,reactive} from 'vue';
import {ElMessage} from 'element-plus'
import * as TestCases from "@/api/TestCases/index"
import * as mammoth from 'mammoth'
const props=defineProps({
    visible:Boolean,
    selectedNode: {
      type: Object,
      default: null
    }
})
const emit=defineEmits(['update:visible','refresh-list'])

// 表单数据
const form = reactive({
  name: '',
  project: null,
  agent: '',
  content: '',
});

//智能体数据
const agentOptions = ref([]);

// 文件列表
const multiFiles = ref([]);


//文件变动的时候处理数据
async function handleMultiChange(file,fileList) {
    // 只保留最新的那一个文件
    multiFiles.value = fileList.slice(-1)
    const rawFile = file.raw
    const name = rawFile.name.toLowerCase()
    console.log('name',name)
    // 如果是 .txt
    if (name.endsWith('.txt')){
        const reader = new FileReader()
        reader.onload=(e)=>{
            form.content = e.target.result // 文本内容直接赋值
        }
        reader.readAsText(rawFile, 'UTF-8')
        return
    }
    // 如果是 .docx
    if (name.endsWith('.docx')){
        try{
            // 使用 mammoth 从 ArrayBuffer 中提取原始文本
            const arrayBuffer = await rawFile.arrayBuffer()
            const result = await mammoth.extractRawText({ arrayBuffer })
            // extractRawText 拿到的是纯文本，中间会保留换行
            form.content = result.value
            console.log('form.content',form.content)
        }catch (err){
            console.error('读取 .docx 失败：', err)
             form.content = ''
        }
        return
    }
    // 其它格式不支持
    form.content = ''
}
//开始清除数据
const handleRemove=()=>{
    //console.log('开始清除')
    multiFiles.value = []
    form.content = ''
    form.name=''
    form.agent=''
}
//提交
async function submit() {
  if(!(form.agent&&form.name&&form.content)){
    return
  }
  if(!props.selectedNode || !props.selectedNode.id) {
    ElMessage.error('请选择一个项目节点'); 
    return;
  }
  const params={
    name:form.name,
    project:props.selectedNode.id,
    content:form.content,
    agent:form.agent
  };
  try{
    const res=await TestCases.postTestCase(params)
    if (res.data && (res.data.code === 0 || res.status === 200)){
      ElMessage.success('提交成功');
      close();
      emit('refresh-list');
    }
  }catch(error){
      console.error('提交请求出错：', error);
      ElMessage.error('提交出现异常，请重试');
   }
  }
  
// 关闭抽屉
function close() {
  handleRemove()
  emit('update:visible', false);
}

//获取智能体
async function getAgentList() {
    const res=await TestCases.postAllAgent()
    agentOptions.value=res.data.data.data
    //console.log('智能体列表',agentOptions.value)
}
watch(
  () => props.selectedNode,
  (newNode) => {
    if (newNode) {
      form.project = newNode;
    } else {
      form.project = null;
    }
  },
  { immediate: true }
);
onMounted(()=>{
    getAgentList()
})
</script>

<style scoped>
.custom-drawer .el-drawer__body {
  padding: 24px;
}
</style>