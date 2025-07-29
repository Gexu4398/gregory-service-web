<template>
  <div class="role-list">
    <div class="page-header">
      <div class="header-title">
        <h1>角色管理</h1>
        <p>管理系统角色和权限</p>
      </div>
      <div class="header-actions">
        <el-button type="primary" :icon="Plus">
          新建角色
        </el-button>
      </div>
    </div>

    <el-card>
      <el-table :data="roles" v-loading="loading" stripe>
        <el-table-column prop="name" label="角色名" />
        <el-table-column prop="description" label="描述" />
        <el-table-column prop="scopes" label="权限" min-width="200">
          <template #default="{ row }">
            <el-tag
              v-for="scope in row.scopes"
              :key="scope"
              type="info"
              size="small"
              class="scope-tag"
            >
              {{ scope }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200">
          <template #default="{ row }">
            <el-button link type="primary" size="small">编辑</el-button>
            <el-button 
              link 
              type="danger" 
              size="small"
              :disabled="row.name === '超级管理员'"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import { getRoles } from '@/api/role'
import type { Role } from '@/types'

const roles = ref<Role[]>([])
const loading = ref(false)

const loadRoles = async () => {
  try {
    loading.value = true
    roles.value = await getRoles()
  } catch (error) {
    console.error('加载角色失败:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadRoles()
})
</script>

<style lang="scss" scoped>
.role-list {
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
  
  .scope-tag {
    margin-right: 4px;
    margin-bottom: 2px;
  }
}
</style> 