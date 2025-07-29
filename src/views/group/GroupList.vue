<template>
  <div class="group-list">
    <div class="page-header">
      <div class="header-title">
        <h1>用户组管理</h1>
        <p>管理系统用户组织架构</p>
      </div>
      <div class="header-actions">
        <el-button type="primary" :icon="Plus">
          新建用户组
        </el-button>
      </div>
    </div>

    <el-card>
      <el-table :data="groups" v-loading="loading" stripe>
        <el-table-column prop="name" label="组名" />
        <el-table-column prop="path" label="路径" />
        <el-table-column label="操作" width="200">
          <template #default="{ row }">
            <el-button link type="primary" size="small">编辑</el-button>
            <el-button link type="danger" size="small">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import { getGroups } from '@/api/group'
import type { Group } from '@/types'

const groups = ref<Group[]>([])
const loading = ref(false)

const loadGroups = async () => {
  try {
    loading.value = true
    groups.value = await getGroups()
  } catch (error) {
    console.error('加载用户组失败:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadGroups()
})
</script>

<style lang="scss" scoped>
.group-list {
  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    
    .header-title {
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
  }
}
</style> 