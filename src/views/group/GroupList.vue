<template>
  <div class="group-list">
    <div class="page-header">
      <div class="header-title">
        <h1>用户组管理</h1>
        <p>管理系统用户组织架构</p>
      </div>
      <div class="header-actions">
        <el-button type="primary" :icon="Plus" @click="handleCreate">
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
            <el-button link type="primary" size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button link type="danger" size="small" @click="handleDelete(row)">删除</el-button>
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
import { getGroups, deleteGroup } from '@/api/group'
import type { Group } from '@/types'

const router = useRouter()
const groups = ref<Group[]>([])
const loading = ref(false)

const fetchGroups = async () => {
  loading.value = true
  try {
    const response = await getGroups()
    groups.value = response.data
  } catch (error) {
    console.error('获取用户组失败:', error)
  } finally {
    loading.value = false
  }
}

// 创建用户组
const handleCreate = () => {
  router.push('/groups/create')
}

// 编辑用户组
const handleEdit = (group: Group) => {
  router.push(`/groups/${group.id}/edit`)
}

// 删除用户组
const handleDelete = async (group: Group) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除用户组 "${group.name}" 吗？`,
      '确认删除',
      {
        type: 'warning',
        confirmButtonText: '确定删除',
        cancelButtonText: '取消'
      }
    )
    
    await deleteGroup(group.id)
    ElMessage.success('用户组删除成功')
    await fetchGroups()
  } catch (error: any) {
    if (error === 'cancel') {
      return
    }
    console.error('删除用户组失败:', error)
    ElMessage.error(error.message || '删除用户组失败')
  }
}

onMounted(() => {
  fetchGroups()
})
</script>

<style scoped lang="scss">
.group-list {
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
}
</style> 