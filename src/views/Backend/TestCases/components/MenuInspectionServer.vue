<template>
  <el-button type="primary" @click="add">新增</el-button>

  <el-table :data="tableData">
    <el-table-column type="index" width="50" fixed="left" />
    <el-table-column label="名称" prop="task_name" width="200" />
    <el-table-column label="地址" prop="task_url" width="200" />
    <el-table-column label="用户" prop="task_username" width="100" />
    <el-table-column label="推送环境" prop="push_name" width="150" />
    <el-table-column label="定时状态" width="120">
      <template #default="scope">
        <el-switch
          v-model="scope.row.timing_on"
          @change="onTimingStatusChange(scope.row.id, $event)"
          style="--el-switch-on-color: #13ce66; --el-switch-off-color: #ff4949"
        ></el-switch>
      </template>
    </el-table-column>
    <el-table-column label="推送状态" width="120">
      <template #default="scope">
        <el-switch
          v-model="scope.row.push_on"
          @change="onPushStatusChange(scope.row.id, $event)"
          style="--el-switch-on-color: #13ce66; --el-switch-off-color: #ff4949"
        ></el-switch>
      </template>
    </el-table-column>
    <el-table-column label="定时参数" prop="timing_parameter" width="300" />
    <el-table-column label="操作列" width="400" fixed="right">
      <template #default="scope">
        <div class="action-buttons">
          <el-button link type="primary" v-show="!scope.row.timing_on" size="small" @click="onServerTimingOn(scope.row.id)">开启定时</el-button>
          <el-button link type="primary" v-show="scope.row.timing_on" size="small" @click="onServerTimingOff(scope.row.id)">关闭定时</el-button>
          <el-button link type="primary" v-show="!scope.row.push_on" size="small" @click="onServerPushOn(scope.row.id)">开启推送</el-button>
          <el-button link type="primary" v-show="scope.row.push_on" size="small" @click="onServerPushOff(scope.row.id)">关闭推送</el-button>
          <el-button link type="primary" size="small" @click="onServer(scope.row.id)">手动巡查</el-button>
          <el-button link type="primary" size="small" @click="task_edit(scope.row.id,scope.row.task_name,scope.row.task_url,scope.row.task_username,scope.row.task_password,scope.row.push_environment,scope.row.push_name,scope.row.timing_parameter, scope.row.timing_trigger)">编辑</el-button>
          <el-popconfirm title="确认删除吗" confirm-button-text="是" cancel-button-text="否" @confirm="onDelete(scope.row.id)">
            <template #reference>
              <el-button link type="danger" size="small">删除</el-button>
            </template>
          </el-popconfirm>
        </div>
      </template>
    </el-table-column>
  </el-table>

  <el-pagination
    class="table-pagination"
    v-model:current-page="pageNum"
    v-model:page-size="pageSize"
    :total="pageTotal"
    :page-sizes="[10, 20, 50, 100]"
    layout="total, sizes, prev, pager, next, jumper"
    @size-change="onSizeChange"
    @current-change="onPageChange"
  />

  <el-dialog
    v-model="dialogVisible"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    title="菜单巡查配置"
    width="500"
  >
    <el-form :model="formData">
      <el-form-item label="任务名称">
        <el-input v-model="formData.task_name" placeholder="例：xx环境xx业务菜单"></el-input>
      </el-form-item>
      <el-form-item label="环境地址">
        <el-input v-model="formData.task_url" placeholder="例：http://127.0.0.1:8080"></el-input>
      </el-form-item>
      <el-form-item label="用户名">
        <el-input v-model="formData.task_username" placeholder="例：admin"></el-input>
      </el-form-item>
      <el-form-item label="密码">
        <el-input
          v-model="formData.task_password"
          placeholder="例：abc123@"
          :type="addPassFlag ? 'text' : 'password'"
        >
          <template #suffix>
            <span @click="addPassFlag = !addPassFlag">
              <el-icon v-if="addPassFlag"><View /></el-icon>
              <el-icon v-else><Hide /></el-icon>
            </span>
          </template>
        </el-input>
      </el-form-item>
      <el-form-item label="选择推送环境">
        <el-select v-model="formData.push_environment" clearable placeholder="请选择推送环境">
          <el-option
            v-for="item in pushEnvironment"
            :key="item.push_environment"
            :label="item.push_environment"
            :value="item.push_environment"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="定时模式">
        <el-radio-group v-model="formData.timing_trigger">
          <el-radio label="cron">每日执行</el-radio>
          <el-radio label="interval">间隔执行</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item v-if="formData.timing_trigger === 'cron'">
        <template #label>
          <span>定时参数</span>
          <el-tooltip content="请输入任务每天执行的小时和分钟，例如小时输入 10，分钟输入 30 表示每天 10:30 执行。" placement="top">
            <i class="el-icon-question" style="margin-left: 5px;"></i>
          </el-tooltip>
        </template>
        <el-input-number v-model="formData.parameter_hour" :min="0" :max="23" :controls="false">
          <template #suffix>
            <span>hour</span>
          </template>
        </el-input-number>
        <el-input-number v-model="formData.parameter_minute" :min="0" :max="59" :controls="false">
          <template #suffix>
            <span>minute</span>
          </template>
        </el-input-number>
      </el-form-item>
      <el-form-item v-if="formData.timing_trigger === 'interval'">
        <template #label>
          <span>定时参数</span>
          <el-tooltip content="请输入任务执行的间隔分钟数，例如输入 60 表示每隔 1 小时执行一次。" placement="top">
            <i class="el-icon-question" style="margin-left: 5px;"></i>
          </el-tooltip>
        </template>
        <el-input-number v-model="formData.interval_minutes" :min="0" :controls="false">
          <template #suffix>
            <span>minutes</span>
          </template>
        </el-input-number>
      </el-form-item>
      <el-form-item>
        <el-button @click="onCancel">取消</el-button>
        <el-button type="primary" @click="onSubmit">提交</el-button>
      </el-form-item>
    </el-form>
  </el-dialog>
</template>

<script setup>
import { onMounted, onUnmounted, ref } from "vue";
import {
  MenuInspectionTaskInfoDelete,
  MenuInspectionTaskList,
  MenuInspectionServer,
  MenuInspectionTaskInfoPost,
  MenuInspectionServerTimingOn,
  MenuInspectionServerTimingOff,
  MenuInspectionServerPushOn,
  MenuInspectionServerPushOff,
  PushEnvironmentWebSelect,
} from "@/api/TestCases/index";
import { ElMessage } from "element-plus";
import { View, Hide } from "@element-plus/icons-vue";

// 生命周期函数，每隔10秒请求一次table数据
onMounted(() => {
  pageList();
  pushDetailList();
  const intervalId = setInterval(pageList, 10000);
  onUnmounted(() => {
    clearInterval(intervalId);
  });
});

const formData = ref({
  timing_trigger: 'cron', // 默认定时模式为 cron
});
const tableData = ref([]);
const pageNum = ref(1);
const pageSize = ref(20);
const pageTotal = ref(0);
const dialogVisible = ref(false);
const pushEnvironment = ref([]);

const addPassFlag = ref(false); // 图标显示标识

async function pageList() {
  const res = await MenuInspectionTaskList({
    pageNum: pageNum.value,
    pageSize: pageSize.value,
  });
  if (res.status === 200) {
    tableData.value = res.data.data.data;
    pageTotal.value = res.data.data.total;
  }
  return res;
}

async function pushDetailList() {
  const res = await PushEnvironmentWebSelect();
  pushEnvironment.value = res.data.data.map((item) => ({
    push_name: item.push_name,
    id: item.id,
    push_environment: item.id + "-" + item.push_name,
  }));
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
  const res = await pageList();
  ElMessage({
    message: res.data.message,
    type: res.data.code,
    plain: true,
  });
}

async function onSubmit() {
  let timing_parameter = {};
  if (formData.value.timing_trigger === 'cron') {
    if (formData.value.parameter_hour !== null) {
      timing_parameter.hour = formData.value.parameter_hour;
    }
    if (formData.value.parameter_minute !== null) {
      timing_parameter.minute = formData.value.parameter_minute;
    }
  } else if (formData.value.timing_trigger === 'interval') {
    if (formData.value.interval_minutes !== null) {
      timing_parameter.minutes = formData.value.interval_minutes;
    }
  }
  formData.value.timing_parameter = JSON.stringify(timing_parameter);
  if (formData.value.push_environment && typeof formData.value.push_environment === "string") {
    const push_id = formData.value.push_environment.split("-");
    if (push_id[0]) {
      formData.value.push_environment = push_id[0];
    } else {
      // 处理 push_id[0] 为空的情况
      formData.value.push_environment = null;
    }
  } else {
    // 处理 formData.value.push_environment 为 undefined 或非字符串的情况
    formData.value.push_environment = null;
  }
  const res = await MenuInspectionTaskInfoPost(formData.value);
  ElMessage({
    message: res.data.message,
    type: res.data.code,
    plain: true,
  });
  formData.value = { timing_trigger: 'cron' }; // 重置表单数据，保留默认定时模式
  dialogVisible.value = false;
  await pageList();
}

async function add() {
  formData.value = { timing_trigger: 'cron' }; // 新增时默认定时模式为 cron
  dialogVisible.value = true;
}

async function onCancel() {
  dialogVisible.value = false;
  formData.value = { timing_trigger: 'cron' }; // 取消时重置表单数据，保留默认定时模式
}

async function onDelete(id) {
  const res = await MenuInspectionTaskInfoDelete({ id });
  ElMessage({
    message: res.data.message,
    type: res.data.code,
    plain: true,
  });
  if (pageNum.value > Math.ceil((pageTotal.value - 1) / pageSize.value) && pageNum.value !== 1) {
    pageNum.value = pageNum.value - 1;
  }
  await pageList();
}

async function onServer(id) {
  const res = await MenuInspectionServer({
    task_id: id,
  });
  ElMessage({
    message: res.data.message,
    type: res.data.code,
    plain: true,
  });
}

async function onServerTimingOn(id) {
  const res = await MenuInspectionServerTimingOn({
    task_id: id,
  });
  ElMessage({
    message: res.data.message,
    type: res.data.code,
    plain: true,
  });
  await pageList();
}

async function onServerTimingOff(id) {
  const res = await MenuInspectionServerTimingOff({
    task_id: id,
  });
  ElMessage({
    message: res.data.message,
    type: res.data.code,
    plain: true,
  });
  await pageList();
}

async function onServerPushOn(id) {
  const res = await MenuInspectionServerPushOn({
    task_id: id,
  });
  ElMessage({
    message: res.data.message,
    type: res.data.code,
    plain: true,
  });
  await pageList();
}

async function onServerPushOff(id) {
  const res = await MenuInspectionServerPushOff({
    task_id: id,
  });
  ElMessage({
    message: res.data.message,
    type: res.data.code,
    plain: true,
  });
  await pageList();
}

async function task_edit(id, task_name, task_url, task_username, task_password, push_environment, push_name, timing_parameter, timing_trigger) {
  addPassFlag.value = false;
  let timeObj = {};
  if (timing_parameter) {
    timeObj = JSON.parse(timing_parameter);
  }
  formData.value.id = id;
  formData.value.task_name = task_name;
  formData.value.task_url = task_url;
  formData.value.task_username = task_username;
  formData.value.task_password = task_password;
  formData.value.push_environment = push_environment + "-" + push_name;
  formData.value.timing_trigger = timing_trigger;
  if (timing_trigger === 'cron') {
    formData.value.parameter_hour = timeObj?.hour || '';
    formData.value.parameter_minute = timeObj?.minute || '';
  } else if (timing_trigger === 'interval') {
    formData.value.interval_minutes = timeObj?.minutes || '';
  }
  dialogVisible.value = true;
}

async function onTimingStatusChange(id, value) {
  if (value) {
    await onServerTimingOn(id);
  } else {
    await onServerTimingOff(id);
  }
}

async function onPushStatusChange(id, value) {
  if (value) {
    await onServerPushOn(id);
  } else {
    await onServerPushOff(id);
  }
}
</script>

<style scoped>
.table-pagination {
  padding-top: 10px;
}

.action-buttons {
  display: flex;
  flex-wrap: nowrap;
  gap: 5px;
}
</style>