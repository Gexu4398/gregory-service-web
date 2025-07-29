<template>
  <div class="profile-container">
    <PageHeader 
      title="个人资料" 
      description="查看和管理您的个人信息"
    />

    <div class="profile-content">
      <el-card class="profile-card">
        <template #header>
          <div class="card-header">
            <span>基本信息</span>
          </div>
        </template>

        <el-descriptions :column="2" border>
          <el-descriptions-item label="用户名">
            {{ userInfo?.username || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="邮箱">
            {{ userInfo?.email || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="姓名">
            {{ userInfo?.firstName || '-' }} {{ userInfo?.lastName || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="邮箱验证">
            <el-tag :type="userInfo?.emailVerified ? 'success' : 'warning'">
              {{ userInfo?.emailVerified ? '已验证' : '未验证' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="账户状态">
            <el-tag :type="userInfo?.enabled ? 'success' : 'danger'">
              {{ userInfo?.enabled ? '启用' : '禁用' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="用户组">
            <el-tag 
              v-for="group in userInfo?.groups" 
              :key="group" 
              class="group-tag"
              type="info"
            >
              {{ group }}
            </el-tag>
            <span v-if="!userInfo?.groups?.length">-</span>
          </el-descriptions-item>
        </el-descriptions>
      </el-card>

      <el-card class="profile-card">
        <template #header>
          <div class="card-header">
            <span>角色权限</span>
          </div>
        </template>

        <div class="roles-section">
          <h4>角色列表</h4>
          <el-tag 
            v-for="role in authStore.roles" 
            :key="role" 
            class="role-tag"
            type="primary"
          >
            {{ role }}
          </el-tag>
          <span v-if="!authStore.roles?.length">无角色</span>
        </div>

        <div class="permissions-section">
          <h4>权限列表</h4>
          <el-tag 
            v-for="permission in authStore.permissions" 
            :key="permission" 
            class="permission-tag"
            type="success"
          >
            {{ permission }}
          </el-tag>
          <span v-if="!authStore.permissions?.length">无权限</span>
        </div>
      </el-card>

      <el-card class="profile-card">
        <template #header>
          <div class="card-header">
            <span>快捷操作</span>
          </div>
        </template>

        <div class="action-buttons">
          <el-button type="primary" @click="goToResetPassword">
            修改密码
          </el-button>
          <el-button type="danger" @click="handleLogout">
            退出登录
          </el-button>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { ElMessageBox } from 'element-plus'
import PageHeader from '@/components/PageHeader.vue'

const router = useRouter()
const authStore = useAuthStore()

// 从auth store获取用户信息
const userInfo = computed(() => authStore.user)

// 修改密码
const goToResetPassword = () => {
  router.push('/reset-password')
}

// 退出登录
const handleLogout = async () => {
  try {
    await ElMessageBox.confirm(
      '确定要退出登录吗？',
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )
    authStore.logout(true) // 重定向到Keycloak登出页面
  } catch {
    // 用户取消操作
  }
}
</script>

<style scoped lang="scss">
.profile-container {
  padding: 20px;
}

.profile-content {
  max-width: 800px;
  margin: 0 auto;
}

.profile-card {
  margin-bottom: 20px;

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-weight: 600;
  }
}

.group-tag,
.role-tag,
.permission-tag {
  margin-right: 8px;
  margin-bottom: 8px;
}

.roles-section,
.permissions-section {
  margin-bottom: 20px;

  h4 {
    margin: 0 0 10px 0;
    color: var(--el-text-color-primary);
  }
}

.action-buttons {
  display: flex;
  gap: 12px;
}
</style> 