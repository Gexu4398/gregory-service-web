<template>
  <div class="role-list">
    <div class="page-header">
      <div class="header-title">
        <h1>角色管理</h1>
        <p>管理系统角色和权限</p>
      </div>
      <div class="header-actions">
        <el-button type="primary" :icon="Plus" @click="handleCreate">
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
            <el-button link type="primary" size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button 
              link 
              type="danger" 
              size="small" 
              :disabled="row.name === '超级管理员'" 
              @click="handleDelete(row)"
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
import { useRouter } from 'vue-router'
import { Plus } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getRoles, deleteRole } from '@/api/role'
import type { Role } from '@/types'

const router = useRouter()
const roles = ref<Role[]>([])
const loading = ref(false)

const fetchRoles = async () => {
  loading.value = true
  try {
    const response = await getRoles()
    roles.value = response.data
  } catch (error) {
    console.error('获取角色失败:', error)
  } finally {
    loading.value = false
  }
}

// 创建角色
const handleCreate = () => {
  router.push('/roles/create')
}

// 编辑角色
const handleEdit = (role: Role) => {
  router.push(`/roles/${role.id}/edit`)
}

// 删除角色
const handleDelete = async (role: Role) => {
  if (role.name === '超级管理员') {
    ElMessage.warning('超级管理员角色不能删除')
    return
  }
  
  try {
    await ElMessageBox.confirm(
      `确定要删除角色 "${role.name}" 吗？`,
      '确认删除',
      {
        type: 'warning',
        confirmButtonText: '确定删除',
        cancelButtonText: '取消'
      }
    )
    
    await deleteRole(role.id)
    ElMessage.success('角色删除成功')
    await fetchRoles()
  } catch (error: any) {
    if (error === 'cancel') {
      return
    }
    console.error('删除角色失败:', error)
    ElMessage.error(error.message || '删除角色失败')
  }
}

onMounted(() => {
  fetchRoles()
})
</script>

<style scoped lang="scss">
.role-list {
  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 16px;

    .header-title {
      h1 {
        margin: 0 0 8px 0;
        font-size: 24px;
        font-weight: 600;
      }

      p {
        margin: 0;
        color: var(--el-text-color-secondary);
      }
    }
  }

  .scope-tag {
    margin-right: 4px;
    margin-bottom: 4px;
  }
}
</style> 