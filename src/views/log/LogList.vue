<template>
  <div class="log-list">
    <div class="page-header">
      <h1>日志管理</h1>
      <p>查看系统操作日志</p>
    </div>

    <!-- 筛选条件 -->
    <el-card class="filter-card">
      <el-form :model="queryParams" inline>
        <el-form-item label="操作类型">
          <el-select v-model="queryParams.type" placeholder="选择类型" clearable>
            <el-option label="新建" value="新建" />
            <el-option label="编辑" value="编辑" />
            <el-option label="删除" value="删除" />
            <el-option label="审核" value="审核" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="模块">
          <el-select v-model="queryParams.module" placeholder="选择模块" clearable>
            <el-option label="用户管理" value="用户管理" />
            <el-option label="角色管理" value="角色管理" />
            <el-option label="用户组管理" value="用户组管理" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="用户名">
          <el-input v-model="queryParams.username" placeholder="输入用户名" clearable />
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 日志表格 -->
    <el-card>
      <el-table :data="logs" v-loading="loading" stripe>
        <el-table-column prop="type" label="操作类型" width="100">
          <template #default="{ row }">
            <el-tag :type="getTypeColor(row.type)" size="small">
              {{ row.type }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column prop="module" label="模块" width="120" />
        <el-table-column prop="content" label="操作内容" min-width="200" />
        <el-table-column prop="username" label="操作用户" width="120" />
        <el-table-column prop="ip" label="IP地址" width="140" />
        
        <el-table-column prop="createdAt" label="操作时间" width="180">
          <template #default="{ row }">
            {{ formatTime(row.createdAt) }}
          </template>
        </el-table-column>
      </el-table>
      
      <!-- 分页 -->
      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.size"
          :total="pagination.total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { getLogs } from '@/api/log'
import type { BizLog, LogQueryParams } from '@/types'
import dayjs from 'dayjs'

const loading = ref(false)
const logs = ref<BizLog[]>([])

// 查询参数
const queryParams = reactive<LogQueryParams>({
  type: '',
  module: '',
  username: '',
  page: 0,
  size: 20,
})

// 分页信息
const pagination = reactive({
  page: 1,
  size: 20,
  total: 0,
})

// 获取类型颜色
const getTypeColor = (type: string) => {
  switch (type) {
    case '新建': return 'success'
    case '编辑': return 'warning'
    case '删除': return 'danger'
    case '审核': return 'info'
    default: return 'info'
  }
}

// 格式化时间
const formatTime = (timestamp: number) => {
  return dayjs(timestamp).format('YYYY-MM-DD HH:mm:ss')
}

// 加载数据
const loadLogs = async () => {
  try {
    loading.value = true
    const data = await getLogs({
      ...queryParams,
      page: pagination.page - 1,
      size: pagination.size,
    })
    
    logs.value = data.content
    pagination.total = data.totalElements
  } catch (error) {
    console.error('加载日志失败:', error)
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  pagination.page = 1
  loadLogs()
}

// 重置
const handleReset = () => {
  Object.assign(queryParams, {
    type: '',
    module: '',
    username: '',
  })
  handleSearch()
}

// 分页处理
const handleSizeChange = (size: number) => {
  pagination.size = size
  pagination.page = 1
  loadLogs()
}

const handlePageChange = (page: number) => {
  pagination.page = page
  loadLogs()
}

onMounted(() => {
  loadLogs()
})
</script>

<style lang="scss" scoped>
.log-list {
  .page-header {
    margin-bottom: 20px;
    
    h1 {
      margin: 0 0 4px 0;
      color: #333;
      font-size: 24px;
    }
    
    p {
      margin: 0;
      color: #666;
      font-size: 14px;
    }
  }
  
  .filter-card {
    margin-bottom: 20px;
  }
  
  .pagination-wrapper {
    margin-top: 20px;
    display: flex;
    justify-content: center;
  }
}
</style> 