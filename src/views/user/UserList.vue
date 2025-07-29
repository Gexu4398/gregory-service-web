<template>
  <div class="user-list">
    <div class="page-header">
      <div class="header-title">
        <h1>用户管理</h1>
        <p>管理系统用户信息</p>
      </div>
      <div class="header-actions">
        <el-button type="primary" :icon="Plus" @click="goToCreate">
          新建用户
        </el-button>
      </div>
    </div>

    <!-- 筛选条件 -->
    <el-card class="filter-card">
      <el-form :model="queryParams" inline @submit.prevent="handleSearch">
        <el-form-item label="关键词">
          <el-input
            v-model="queryParams.keyword"
            placeholder="用户名或姓名"
            clearable
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        
        <el-form-item label="用户组">
          <el-select
            v-model="queryParams.groupId"
            placeholder="选择用户组"
            clearable
            filterable
          >
            <el-option
              v-for="group in groups"
              :key="group.id"
              :label="group.name"
              :value="group.id"
            />
          </el-select>
        </el-form-item>
        
        <el-form-item label="角色">
          <el-select
            v-model="queryParams.roleId"
            placeholder="选择角色"
            clearable
            filterable
          >
            <el-option
              v-for="role in roles"
              :key="role.id"
              :label="role.name"
              :value="role.name"
            />
          </el-select>
        </el-form-item>
        
        <el-form-item label="状态">
          <el-select
            v-model="queryParams.status"
            placeholder="选择状态"
            multiple
            clearable
          >
            <el-option label="正常" value="normal" />
            <el-option label="禁用" value="disable" />
            <el-option label="待审核" value="pending" />
          </el-select>
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 用户表格 -->
    <el-card class="table-card">
      <template #header>
        <div class="table-header">
          <div class="batch-actions" v-if="selectedUsers.length > 0">
            <span class="selected-count">已选择 {{ selectedUsers.length }} 项</span>
            <el-button-group>
              <el-button size="small" @click="handleBatchEnable">启用</el-button>
              <el-button size="small" @click="handleBatchDisable">禁用</el-button>
              <el-button size="small" @click="handleBatchResetPassword">重置密码</el-button>
              <el-button size="small" type="danger" @click="handleBatchDelete">删除</el-button>
            </el-button-group>
          </div>
          
          <div class="table-info">
            共 {{ pagination.total }} 条记录
          </div>
        </div>
      </template>
      
      <el-table
        v-loading="loading"
        :data="users"
        @selection-change="handleSelectionChange"
        stripe
      >
        <el-table-column type="selection" width="55" />
        
        <el-table-column prop="username" label="用户名" min-width="120">
          <template #default="{ row }">
            <div class="user-info">
              <el-avatar :src="row.picture" :size="32">
                {{ row.name?.charAt(0) }}
              </el-avatar>
              <div class="user-details">
                <div class="username">{{ row.username }}</div>
                <div class="name">{{ row.name }}</div>
              </div>
            </div>
          </template>
        </el-table-column>
        
        <el-table-column prop="phoneNumber" label="手机号" width="120" />
        
        <el-table-column prop="group.name" label="用户组" width="120">
          <template #default="{ row }">
            <el-tag v-if="row.group" type="info" size="small">
              {{ row.group.name }}
            </el-tag>
            <span v-else class="text-muted">未分配</span>
          </template>
        </el-table-column>
        
        <el-table-column prop="role" label="角色" width="150">
          <template #default="{ row }">
            <el-tag
              v-for="role in row.role"
              :key="role.id"
              :type="getRoleTagType(role.name)"
              size="small"
              class="role-tag"
            >
              {{ role.name }}
            </el-tag>
            <span v-if="!row.role || row.role.length === 0" class="text-muted">
              未分配
            </span>
          </template>
        </el-table-column>
        
        <el-table-column prop="enabled" label="状态" width="100">
          <template #default="{ row }">
            <el-tag
              :type="row.enabled ? 'success' : 'danger'"
              size="small"
            >
              {{ row.enabled ? '正常' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column prop="lastLoginTime" label="最后登录" width="160">
          <template #default="{ row }">
            <span v-if="row.lastLoginTime">
              {{ formatTime(row.lastLoginTime) }}
            </span>
            <span v-else class="text-muted">从未登录</span>
          </template>
        </el-table-column>
        
        <el-table-column prop="createdAt" label="创建时间" width="160">
          <template #default="{ row }">
            {{ formatTime(row.createdAt) }}
          </template>
        </el-table-column>
        
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button-group>
              <el-button link type="primary" size="small" @click="handleEdit(row)">
                编辑
              </el-button>
              <el-button 
                link 
                :type="row.enabled ? 'warning' : 'success'" 
                size="small" 
                @click="handleToggleStatus(row)"
              >
                {{ row.enabled ? '禁用' : '启用' }}
              </el-button>
              <el-button 
                link 
                type="danger" 
                size="small" 
                @click="handleDelete(row)"
                :disabled="row.id === authStore.user?.id"
              >
                删除
              </el-button>
            </el-button-group>
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
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { useAuthStore } from '@/stores/auth'
import { useUserStore } from '@/stores/user'
import { getGroups } from '@/api/group'
import { getRoles } from '@/api/role'
import { deleteUser, enableUser, disableUsers, resetUserPassword } from '@/api/user'
import type { User, Group, Role, UserQueryParams } from '@/types'
import dayjs from 'dayjs'

const router = useRouter()
const authStore = useAuthStore()
const userStore = useUserStore()

// 状态
const loading = ref(false)
const selectedUsers = ref<User[]>([])
const groups = ref<Group[]>([])
const roles = ref<Role[]>([])

// 查询参数
const queryParams = reactive<UserQueryParams>({
  keyword: '',
  groupId: '',
  roleId: '',
  status: [],
  page: 0,
  size: 20,
})

// 分页信息
const pagination = reactive({
  page: 1,
  size: 20,
  total: 0,
})

// 计算属性
const users = computed(() => userStore.users?.content || [])

// 获取角色标签类型
const getRoleTagType = (roleName: string) => {
  if (roleName === '超级管理员') return 'danger'
  if (roleName.includes('管理员')) return 'warning'
  return 'info'
}

// 格式化时间
const formatTime = (timestamp: number) => {
  return dayjs(timestamp).format('YYYY-MM-DD HH:mm')
}

// 加载数据
const loadData = async () => {
  try {
    loading.value = true
    
    // 加载用户列表
    await userStore.fetchUsers({
      ...queryParams,
      page: pagination.page - 1,
      size: pagination.size,
    })
    
    if (userStore.users) {
      pagination.total = userStore.users.totalElements
    }
    
  } catch (error) {
    console.error('加载用户列表失败:', error)
  } finally {
    loading.value = false
  }
}

// 加载筛选数据
const loadFilterData = async () => {
  try {
    const [groupsData, rolesData] = await Promise.all([
      getGroups(),
      getRoles(),
    ])
    
    groups.value = groupsData
    roles.value = rolesData
  } catch (error) {
    console.error('加载筛选数据失败:', error)
  }
}

// 搜索
const handleSearch = () => {
  pagination.page = 1
  loadData()
}

// 重置
const handleReset = () => {
  Object.assign(queryParams, {
    keyword: '',
    groupId: '',
    roleId: '',
    status: [],
  })
  handleSearch()
}

// 分页处理
const handleSizeChange = (size: number) => {
  pagination.size = size
  pagination.page = 1
  loadData()
}

const handlePageChange = (page: number) => {
  pagination.page = page
  loadData()
}

// 选择处理
const handleSelectionChange = (selection: User[]) => {
  selectedUsers.value = selection
}

// 导航
const goToCreate = () => {
  router.push('/users/create')
}

const handleEdit = (user: User) => {
  router.push(`/users/${user.id}/edit`)
}

// 单个操作
const handleToggleStatus = async (user: User) => {
  try {
    if (user.enabled) {
      await disableUsers([user.id])
    } else {
      await enableUser(user.id)
    }
    await loadData()
  } catch (error) {
    console.error('切换用户状态失败:', error)
  }
}

const handleDelete = async (user: User) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除用户"${user.name}"吗？此操作不可撤销。`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )
    
    await deleteUser(user.id)
    await loadData()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除用户失败:', error)
    }
  }
}

// 批量操作
const handleBatchEnable = async () => {
  try {
    const ids = selectedUsers.value.map(u => u.id)
    await Promise.all(ids.map(id => enableUser(id)))
    await loadData()
    selectedUsers.value = []
  } catch (error) {
    console.error('批量启用失败:', error)
  }
}

const handleBatchDisable = async () => {
  try {
    const ids = selectedUsers.value.map(u => u.id)
    await disableUsers(ids)
    await loadData()
    selectedUsers.value = []
  } catch (error) {
    console.error('批量禁用失败:', error)
  }
}

const handleBatchResetPassword = async () => {
  try {
    await ElMessageBox.confirm(
      `确定要重置选中的 ${selectedUsers.value.length} 个用户的密码吗？`,
      '确认重置',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )
    
    const ids = selectedUsers.value.map(u => u.id)
    await resetUserPassword(ids)
    selectedUsers.value = []
  } catch (error) {
    if (error !== 'cancel') {
      console.error('批量重置密码失败:', error)
    }
  }
}

const handleBatchDelete = async () => {
  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${selectedUsers.value.length} 个用户吗？此操作不可撤销。`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )
    
    await Promise.all(selectedUsers.value.map(user => deleteUser(user.id)))
    await loadData()
    selectedUsers.value = []
  } catch (error) {
    if (error !== 'cancel') {
      console.error('批量删除失败:', error)
    }
  }
}

onMounted(() => {
  loadData()
  loadFilterData()
})
</script>

<style lang="scss" scoped>
.user-list {
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
  
  .filter-card {
    margin-bottom: 20px;
  }
  
  .table-card {
    .table-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      
      .batch-actions {
        display: flex;
        align-items: center;
        gap: 12px;
        
        .selected-count {
          font-size: 14px;
          color: #666;
        }
      }
      
      .table-info {
        font-size: 14px;
        color: #666;
      }
    }
    
    .user-info {
      display: flex;
      align-items: center;
      gap: 8px;
      
      .user-details {
        .username {
          font-weight: 500;
          color: #333;
        }
        
        .name {
          font-size: 12px;
          color: #666;
        }
      }
    }
    
    .role-tag {
      margin-right: 4px;
      margin-bottom: 2px;
    }
    
    .text-muted {
      color: #999;
      font-size: 12px;
    }
    
    .pagination-wrapper {
      margin-top: 20px;
      display: flex;
      justify-content: center;
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .user-list {
    .page-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 12px;
    }
    
    .table-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 12px;
    }
  }
}
</style> 