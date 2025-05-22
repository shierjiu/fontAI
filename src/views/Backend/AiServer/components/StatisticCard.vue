<template>
  <el-row :gutter="40" class="statistic-card-row">
    <el-col :xs="12" :sm="12" :lg="6" class="statistic-card-col">
      <div class="statistic-card">
        <div class="statistic-card-icon-wrapper icon-1">
          <el-icon class="statistic-card-icon "><Histogram /></el-icon>
        </div>
        <div class="statistic-card-content">
          <div class="statistic-card-text">
            所有Agent
          </div>
          <el-statistic class="statistic-card-num" :value="99"></el-statistic>
        </div>
      </div>
    </el-col>
  </el-row>
</template>

<script setup>
import {Histogram} from "@element-plus/icons-vue"
</script>

<style scoped>
.statistic-card-row {
  margin: 0 !important;

  .statistic-card-col {
    margin-bottom: 32px;
  }

  .statistic-card {
    height: 108px;
    cursor: pointer;
    font-size: 12px;
    position: relative;
    overflow: hidden;
    color: #666;
    background: #fff;
    box-shadow: 4px 4px 40px rgba(0, 0, 0, .05);
    border-color: rgba(0, 0, 0, .05);

    &:hover {
      .statistic-card-icon-wrapper {
        color: #fff;
      }

      .icon-1 {
        background: #40c9c6;
      }

      .icon-2 {
        background: #36a3f7;
      }

      .icon-3 {
        background: #f4516c;
      }

      .icon-4 {
        background: #34bfa3
      }
    }

    .icon-1 {
      color: #40c9c6;
    }

    .icon-2 {
      color: #36a3f7;
    }

    .icon-3 {
      color: #f4516c;
    }

    .icon-4 {
      color: #34bfa3
    }

    .statistic-card-icon-wrapper {
      float: left;
      margin: 14px 0 0 14px;
      padding: 16px;
      transition: all 0.38s ease-out;
      border-radius: 6px;
    }

    .statistic-card-icon {
      float: left;
      font-size: 48px;
    }

    .statistic-card-content {
      float: right;
      font-weight: bold;
      margin: 26px 26px 26px 0;

      .statistic-card-text {
        line-height: 18px;
        color: rgba(0, 0, 0, 0.45);
        font-size: 16px;
        margin-bottom: 12px;
      }

      .statistic-card-num {
        font-size: 20px;
      }
    }
  }
}

@media (max-width:550px) {
  .statistic-card-content {
    display: none;
  }

  .statistic-card-icon {
    float: none !important;
    width: 100%;
    height: 100%;
    margin: 0 !important;

    el-icon {
      display: block;
      margin: 14px auto !important;
      float: none !important;
    }
  }
}
</style>