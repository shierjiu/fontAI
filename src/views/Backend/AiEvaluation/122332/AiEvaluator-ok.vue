<template>
  <div class="dataset-container">
    <div class="search-form">
      <el-form>
        <el-input placeholder="搜索名称" clearable />
      </el-form>
    </div>

    <div class="table-container">
       <el-table :data="tableData" style="width: 100%">
        <el-table-column prop="name" label="名称" width="180">
          <template #default="{ row }">
            {{ row.name }}
          </template>
        </el-table-column>
        <el-table-column prop="dataset" label="数据集" width="180">
          <template #default="{ row }">
            {{ row.dataset }}
          </template>
        </el-table-column>
        <el-table-column prop="agent" label="智能体" width="180">
          <template #default="{ row }">
            {{ row.agent }}
          </template>
        </el-table-column>
        <el-table-column prop="entity" label="评测对象" width="180">
          <template #default="{ row }">
            {{ row.entity }}
          </template>
        </el-table-column>
        <el-table-column prop="create_time" label="评测时间" width="180">
          <template #default="{ row }">
            {{ row.create_time }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180">
          <template #default="{ row }">
            <el-button type="text" @click="handleAction(row)">
                 查看
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script setup>
import { ElNotification, ElMessage } from 'element-plus';
//数据部分
const tableData = [
  {
    name: '评测1',
    dataset: '数据集1',
    agent: '智能体1',
    entity: '评测对象1',
    create_time: '2023-10-01 12:00:00',
  },
  {
    name: '评测2',
    dataset: '数据集2',
    agent: '智能体2',
    entity: '评测对象2',
    create_time: '2023-10-02 12:00:00',
  },
];

//函数部分
const handleAction = (row) => {
  ElNotification({
    title: '提示',
    message: `你点击了 ${row.name} 的操作按钮`,
    type: 'info',
  });
};
</script>

<style scoped>
.dataset-container {
  display: flex;
  flex-direction: column; /* 让元素从上到下排列 */
  gap: 20px;
  padding: 20px;
  height: 100%;
}

.search-form {
  flex: 0 1 auto; /* 使搜索框部分自适应大小 */
}

.table-container {
  width: 100%; /* 确保表格占满父容器的宽度 */
}
</style>
