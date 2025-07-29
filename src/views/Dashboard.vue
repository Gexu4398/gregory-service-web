<template>
  <div class="dashboard">
    <div class="dashboard-header">
      <h1>仪表板</h1>
      <p>欢迎使用 Gregory Service 管理系统</p>
    </div>

    <!-- 统计卡片 -->
    <el-row :gutter="20" class="stats-row">
      <el-col :xs="24" :sm="12" :md="6">
        <div class="stat-card">
          <div class="stat-icon online">
            <el-icon><UserFilled /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ userStats.onlineCount }}</div>
            <div class="stat-label">在线用户</div>
          </div>
        </div>
      </el-col>
      
      <el-col :xs="24" :sm="12" :md="6">
        <div class="stat-card">
          <div class="stat-icon offline">
            <el-icon><User /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ userStats.offlineCount }}</div>
            <div class="stat-label">离线用户</div>
          </div>
        </div>
      </el-col>
      
      <el-col :xs="24" :sm="12" :md="6">
        <div class="stat-card">
          <div class="stat-icon total">
            <el-icon><Avatar /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ userStats.totalCount }}</div>
            <div class="stat-label">总用户数</div>
          </div>
        </div>
      </el-col>
      
      <el-col :xs="24" :sm="12" :md="6">
        <div class="stat-card">
          <div class="stat-icon groups">
            <el-icon><Collection /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ groupStats.count }}</div>
            <div class="stat-label">用户组数</div>
          </div>
        </div>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="content-row">
      <!-- 最近活动 -->
      <el-col :xs="24" :lg="12">
        <el-card class="activity-card">
          <template #header>
            <div class="card-header">
              <span>最近活动</span>
              <el-button link @click="goToLogs">查看更多</el-button>
            </div>
          </template>
          
          <div class="activity-list">
            <div 
              v-for="log in recentLogs" 
              :key="log.id"
              class="activity-item"
            >
              <div class="activity-icon">
                <el-icon><Document /></el-icon>
              </div>
              <div class="activity-content">
                <div class="activity-title">{{ log.content }}</div>
                <div class="activity-meta">
                  <span class="activity-user">{{ log.username }}</span>
                  <span class="activity-time">{{ formatTime(log.createdAt) }}</span>
                </div>
              </div>
            </div>
            
            <div v-if="recentLogs.length === 0" class="no-activity">
              暂无活动记录
            </div>
          </div>
        </el-card>
      </el-col>
      
      <!-- 系统信息 -->
      <el-col :xs="24" :lg="12">
        <el-card class="system-card">
          <template #header>
            <div class="card-header">
              <span>系统信息</span>
            </div>
          </template>
          
          <div class="system-info">
            <div class="info-item">
              <span class="info-label">系统版本</span>
              <span class="info-value">v1.0.0</span>
            </div>
            <div class="info-item">
              <span class="info-label">后端服务</span>
              <span class="info-value status-online">
                <el-icon><Check /></el-icon>
                正常运行
              </span>
            </div>
            <div class="info-item">
              <span class="info-label">数据库</span>
              <span class="info-value status-online">
                <el-icon><Check /></el-icon>
                连接正常
              </span>
            </div>
            <div class="info-item">
              <span class="info-label">认证服务</span>
              <span class="info-value status-online">
                <el-icon><Check /></el-icon>
                Keycloak 运行中
              </span>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 快速操作 -->
    <el-row :gutter="20" class="quick-actions">
      <el-col :span="24">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>快速操作</span>
            </div>
          </template>
          
          <div class="actions-grid">
            <el-button 
              v-if="hasPermission('user:crud')"
              type="primary" 
              :icon="Plus" 
              @click="goToCreateUser"
            >
              新建用户
            </el-button>
            <el-button 
              v-if="hasPermission('group:crud')"
              type="success" 
              :icon="FolderAdd" 
              @click="goToGroups"
            >
              管理用户组
            </el-button>
            <el-button 
              v-if="hasPermission('role:crud')"
              type="warning" 
              :icon="Key" 
              @click="goToRoles"
            >
              管理角色
            </el-button>
            <el-button 
              type="info" 
              :icon="Setting" 
              @click="goToProfile"
            >
              个人设置
            </el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useUserStore } from '@/stores/user'
import { getLogs } from '@/api/log'
import { getGroups } from '@/api/group'
import { Plus, FolderAdd, Key, Setting, Check } from '@element-plus/icons-vue'
import type { BizLog } from '@/types'
import dayjs from 'dayjs'

const router = useRouter()
const authStore = useAuthStore()
const userStore = useUserStore()

// 状态
const userStats = ref({
  onlineCount: 0,
  offlineCount: 0,
  totalCount: 0,
})

const groupStats = ref({
  count: 0,
})

const recentLogs = ref<BizLog[]>([])
const loading = ref(false)

// 权限检查
const hasPermission = (permission: string) => {
  return authStore.hasPermission(permission)
}

// 格式化时间
const formatTime = (timestamp: number) => {
  return dayjs(timestamp).format('YYYY-MM-DD HH:mm')
}

// 加载统计数据
const loadStats = async () => {
  try {
    loading.value = true
    
    // 加载用户统计
    await userStore.fetchUserStats()
    userStats.value.onlineCount = userStore.onlineUserCount
    userStats.value.offlineCount = userStore.offlineUserCount
    userStats.value.totalCount = userStats.value.onlineCount + userStats.value.offlineCount
    
    // 加载用户组统计
    const groups = await getGroups()
    groupStats.value.count = groups.length
    
    // 加载最近日志
    const logsData = await getLogs({ page: 0, size: 5, sort: 'createdAt,desc' })
    recentLogs.value = logsData.content
    
  } catch (error) {
    console.error('加载统计数据失败:', error)
  } finally {
    loading.value = false
  }
}

// 导航方法
const goToCreateUser = () => {
  router.push('/users/create')
}

const goToGroups = () => {
  router.push('/groups')
}

const goToRoles = () => {
  router.push('/roles')
}

const goToProfile = () => {
  router.push('/profile')
}

const goToLogs = () => {
  router.push('/logs')
}

onMounted(() => {
  loadStats()
})
</script>

<style lang="scss" scoped>
.dashboard {
  .dashboard-header {
    margin-bottom: 24px;
    
    h1 {
      margin: 0 0 8px 0;
      color: #333;
      font-size: 28px;
      font-weight: 600;
    }
    
    p {
      margin: 0;
      color: #666;
      font-size: 16px;
    }
  }
  
  .stats-row {
    margin-bottom: 24px;
    
    .stat-card {
      background: white;
      border-radius: 8px;
      padding: 24px;
      box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
      display: flex;
      align-items: center;
      margin-bottom: 20px;
      
      .stat-icon {
        width: 48px;
        height: 48px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 16px;
        font-size: 24px;
        
        &.online {
          background-color: #f0f9ff;
          color: #3b82f6;
        }
        
        &.offline {
          background-color: #f9fafb;
          color: #6b7280;
        }
        
        &.total {
          background-color: #ecfdf5;
          color: #10b981;
        }
        
        &.groups {
          background-color: #fef3c7;
          color: #f59e0b;
        }
      }
      
      .stat-content {
        .stat-value {
          font-size: 32px;
          font-weight: bold;
          color: #333;
          line-height: 1;
          margin-bottom: 4px;
        }
        
        .stat-label {
          font-size: 14px;
          color: #666;
        }
      }
    }
  }
  
  .content-row {
    margin-bottom: 24px;
    
    .activity-card,
    .system-card {
      margin-bottom: 20px;
      
      .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
    }
    
    .activity-list {
      .activity-item {
        display: flex;
        align-items: flex-start;
        padding: 12px 0;
        border-bottom: 1px solid #f0f0f0;
        
        &:last-child {
          border-bottom: none;
        }
        
        .activity-icon {
          width: 32px;
          height: 32px;
          background-color: #f3f4f6;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 12px;
          color: #6b7280;
          flex-shrink: 0;
        }
        
        .activity-content {
          flex: 1;
          
          .activity-title {
            font-size: 14px;
            color: #333;
            margin-bottom: 4px;
          }
          
          .activity-meta {
            font-size: 12px;
            color: #999;
            
            .activity-user {
              margin-right: 8px;
            }
          }
        }
      }
      
      .no-activity {
        text-align: center;
        color: #999;
        padding: 40px 0;
      }
    }
    
    .system-info {
      .info-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px 0;
        border-bottom: 1px solid #f0f0f0;
        
        &:last-child {
          border-bottom: none;
        }
        
        .info-label {
          font-size: 14px;
          color: #666;
        }
        
        .info-value {
          font-size: 14px;
          color: #333;
          
          &.status-online {
            color: #10b981;
            display: flex;
            align-items: center;
            gap: 4px;
          }
        }
      }
    }
  }
  
  .quick-actions {
    .actions-grid {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
      
      .el-button {
        flex: 1;
        min-width: 120px;
      }
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .dashboard {
    .stats-row {
      .stat-card {
        padding: 16px;
        
        .stat-content .stat-value {
          font-size: 24px;
        }
      }
    }
    
    .actions-grid {
      .el-button {
        width: 100%;
        margin-bottom: 8px;
      }
    }
  }
}
</style> 