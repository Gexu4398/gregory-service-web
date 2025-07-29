<template>
  <el-container class="admin-layout">
    <!-- 侧边栏 -->
    <el-aside :width="isCollapse ? '64px' : '200px'" class="sidebar">
      <div class="logo">
        <img v-if="!isCollapse" src="/logo.png" alt="Logo" class="logo-img" />
        <span v-if="!isCollapse" class="logo-text">Gregory Service</span>
        <span v-else class="logo-mini">GS</span>
      </div>
      
      <el-menu
        :default-active="activeMenu"
        class="sidebar-menu"
        :collapse="isCollapse"
        router
        text-color="#ffffff"
        active-text-color="#409eff"
        background-color="#304156"
      >
        <el-menu-item index="/" route="/">
          <el-icon><Odometer /></el-icon>
          <template #title>仪表板</template>
        </el-menu-item>
        
        <el-menu-item 
          v-if="hasPermission('user:crud')"
          index="/users" 
          route="/users"
        >
          <el-icon><User /></el-icon>
          <template #title>用户管理</template>
        </el-menu-item>
        
        <el-menu-item 
          v-if="hasPermission('group:crud')"
          index="/groups" 
          route="/groups"
        >
          <el-icon><UserFilled /></el-icon>
          <template #title>用户组管理</template>
        </el-menu-item>
        
        <el-menu-item 
          v-if="hasPermission('role:crud')"
          index="/roles" 
          route="/roles"
        >
          <el-icon><Avatar /></el-icon>
          <template #title>角色管理</template>
        </el-menu-item>
        
        <el-menu-item 
          v-if="hasPermission('log:view')"
          index="/logs" 
          route="/logs"
        >
          <el-icon><Document /></el-icon>
          <template #title>日志管理</template>
        </el-menu-item>
        
        <el-menu-item index="/profile" route="/profile">
          <el-icon><Setting /></el-icon>
          <template #title>个人资料</template>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <!-- 主内容区 -->
    <el-container>
      <!-- 顶部导航栏 -->
      <el-header class="header">
        <div class="header-left">
          <el-button 
            link 
            @click="toggleSidebar"
            class="collapse-btn"
          >
            <el-icon><Expand v-if="isCollapse" /><Fold v-else /></el-icon>
          </el-button>
          
          <!-- 面包屑导航 -->
          <el-breadcrumb separator="/" class="breadcrumb">
            <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item v-if="currentRoute.meta?.title">
              {{ currentRoute.meta.title }}
            </el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        
        <div class="header-right">
          <!-- 通知 -->
          <el-popover
            placement="bottom"
            title="通知"
            :width="350"
            trigger="click"
          >
            <template #reference>
              <el-badge :value="unreadCount" :hidden="unreadCount === 0">
                <el-button link class="notification-btn">
                  <el-icon><Bell /></el-icon>
                </el-button>
              </el-badge>
            </template>
            
            <div class="notification-list">
              <div v-if="notifications.length === 0" class="no-notifications">
                暂无通知
              </div>
              <div 
                v-for="notification in notifications" 
                :key="notification.id"
                class="notification-item"
                :class="{ unread: !notification.isRead }"
              >
                <div class="notification-title">{{ notification.title }}</div>
                <div class="notification-content">{{ notification.content }}</div>
                <div class="notification-time">
                  {{ formatTime(notification.createdAt) }}
                </div>
              </div>
              
              <div v-if="notifications.length > 0" class="notification-actions">
                <el-button link @click="markAllAsRead">全部标记为已读</el-button>
              </div>
            </div>
          </el-popover>
          
          <!-- 用户菜单 -->
          <el-dropdown @command="handleUserCommand">
            <div class="user-avatar">
              <el-avatar :src="authStore.user?.picture" :size="32">
                {{ authStore.user?.name?.charAt(0) }}
              </el-avatar>
              <span class="username">{{ authStore.user?.name }}</span>
              <el-icon><ArrowDown /></el-icon>
            </div>
            
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">
                  <el-icon><User /></el-icon>
                  个人资料
                </el-dropdown-item>
                <el-dropdown-item command="changePassword">
                  <el-icon><Lock /></el-icon>
                  修改密码
                </el-dropdown-item>
                <el-dropdown-item divided command="logout">
                  <el-icon><SwitchButton /></el-icon>
                  退出登录
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>

      <!-- 主内容 -->
      <el-main class="main-content">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { getNotifications, markAllNotificationsAsRead } from '@/api/notification'
import type { Notification } from '@/types'
import dayjs from 'dayjs'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

// 状态
const isCollapse = ref(false)
const notifications = ref<Notification[]>([])
const unreadCount = ref(0)

// 计算属性
const currentRoute = computed(() => route)
const activeMenu = computed(() => route.path)

// 权限检查
const hasPermission = (permission: string) => {
  return authStore.hasPermission(permission)
}

// 切换侧边栏
const toggleSidebar = () => {
  isCollapse.value = !isCollapse.value
}

// 格式化时间
const formatTime = (timestamp: number) => {
  return dayjs(timestamp).format('MM-DD HH:mm')
}

// 加载通知
const loadNotifications = async () => {
  try {
    const data = await getNotifications({ unreadOnly: false, size: 10 })
    notifications.value = data.content
    unreadCount.value = data.content.filter(n => !n.isRead).length
  } catch (error) {
    console.error('加载通知失败:', error)
  }
}

// 标记所有通知为已读
const markAllAsRead = async () => {
  try {
    await markAllNotificationsAsRead()
    notifications.value.forEach(n => n.isRead = true)
    unreadCount.value = 0
  } catch (error) {
    console.error('标记通知失败:', error)
  }
}

// 处理用户菜单命令
const handleUserCommand = (command: string) => {
  switch (command) {
    case 'profile':
      router.push('/profile')
      break
    case 'changePassword':
      // TODO: 打开修改密码弹窗
      break
    case 'logout':
      authStore.logout().then(() => {
        router.push('/login')
      })
      break
  }
}

onMounted(() => {
  loadNotifications()
  
  // 定时刷新通知
  setInterval(loadNotifications, 30000) // 30秒刷新一次
})
</script>

<style lang="scss" scoped>
.admin-layout {
  height: 100vh;
}

.sidebar {
  background-color: #304156;
  transition: width 0.3s ease;
  
  .logo {
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 16px;
    background-color: #2c3e50;
    
    .logo-img {
      height: 32px;
      margin-right: 8px;
    }
    
    .logo-text {
      color: #ffffff;
      font-size: 16px;
      font-weight: bold;
    }
    
    .logo-mini {
      color: #ffffff;
      font-size: 18px;
      font-weight: bold;
    }
  }
  
  .sidebar-menu {
    border: none;
    
    .el-menu-item {
      height: 48px;
      line-height: 48px;
      
      &:hover {
        background-color: #3d4b61 !important;
      }
      
      &.is-active {
        background-color: #409eff !important;
      }
    }
  }
}

.header {
  background-color: #ffffff;
  border-bottom: 1px solid #e6e6e6;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  
  .header-left {
    display: flex;
    align-items: center;
    
    .collapse-btn {
      margin-right: 16px;
      font-size: 18px;
    }
    
    .breadcrumb {
      font-size: 14px;
    }
  }
  
  .header-right {
    display: flex;
    align-items: center;
    gap: 16px;
    
    .notification-btn {
      font-size: 18px;
    }
    
    .user-avatar {
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      
      .username {
        font-size: 14px;
        color: #333;
      }
    }
  }
}

.main-content {
  background-color: #f5f5f5;
  padding: 20px;
}

.notification-list {
  max-height: 400px;
  overflow-y: auto;
  
  .no-notifications {
    text-align: center;
    color: #999;
    padding: 20px;
  }
  
  .notification-item {
    padding: 12px;
    border-bottom: 1px solid #f0f0f0;
    
    &.unread {
      background-color: #f0f9ff;
    }
    
    .notification-title {
      font-weight: bold;
      margin-bottom: 4px;
    }
    
    .notification-content {
      font-size: 12px;
      color: #666;
      margin-bottom: 4px;
    }
    
    .notification-time {
      font-size: 12px;
      color: #999;
    }
  }
  
  .notification-actions {
    padding: 12px;
    text-align: center;
    border-top: 1px solid #f0f0f0;
  }
}
</style> 