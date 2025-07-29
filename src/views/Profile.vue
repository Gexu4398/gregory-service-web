<template>
  <div class="profile">
    <div class="page-header">
      <h1>个人资料</h1>
      <p>管理您的个人信息和账户设置</p>
    </div>

    <el-row :gutter="20">
      <!-- 个人信息 -->
      <el-col :xs="24" :lg="16">
        <el-card class="profile-card">
          <template #header>
            <div class="card-header">
              <span>基本信息</span>
              <el-button 
                v-if="!isEditing" 
                type="primary" 
                @click="startEdit"
              >
                编辑
              </el-button>
              <div v-else>
                <el-button @click="cancelEdit">取消</el-button>
                <el-button type="primary" @click="saveProfile" :loading="loading">
                  保存
                </el-button>
              </div>
            </div>
          </template>
          
          <div class="profile-content">
            <div class="avatar-section">
              <el-avatar :src="form.picture" :size="80">
                {{ form.name?.charAt(0) }}
              </el-avatar>
              <div class="avatar-info">
                <div class="username">{{ authStore.user?.username }}</div>
                <div class="roles">
                  <el-tag
                    v-for="role in authStore.user?.role"
                    :key="role.id"
                    type="info"
                    size="small"
                    class="role-tag"
                  >
                    {{ role.name }}
                  </el-tag>
                </div>
              </div>
            </div>
            
            <el-form
              ref="formRef"
              :model="form"
              :rules="rules"
              label-width="100px"
              class="profile-form"
            >
              <el-form-item label="姓名" prop="name">
                <el-input
                  v-model="form.name"
                  :disabled="!isEditing"
                  placeholder="请输入姓名"
                />
              </el-form-item>
              
              <el-form-item label="手机号" prop="phoneNumber">
                <el-input
                  v-model="form.phoneNumber"
                  :disabled="!isEditing"
                  placeholder="请输入手机号"
                />
              </el-form-item>
              
              <el-form-item label="头像URL" prop="picture">
                <el-input
                  v-model="form.picture"
                  :disabled="!isEditing"
                  placeholder="请输入头像URL"
                />
              </el-form-item>
              
              <el-form-item label="用户组">
                <el-input
                  :value="authStore.user?.group?.name || '未分配'"
                  disabled
                />
              </el-form-item>
            </el-form>
          </div>
        </el-card>
      </el-col>
      
      <!-- 密码修改 -->
      <el-col :xs="24" :lg="8">
        <el-card class="password-card">
          <template #header>
            <span>修改密码</span>
          </template>
          
          <el-form
            ref="passwordFormRef"
            :model="passwordForm"
            :rules="passwordRules"
            label-width="100px"
          >
            <el-form-item label="原密码" prop="originalPassword">
              <el-input
                v-model="passwordForm.originalPassword"
                type="password"
                placeholder="请输入原密码"
                show-password
              />
            </el-form-item>
            
            <el-form-item label="新密码" prop="password">
              <el-input
                v-model="passwordForm.password"
                type="password"
                placeholder="请输入新密码"
                show-password
              />
            </el-form-item>
            
            <el-form-item label="确认密码" prop="confirmPassword">
              <el-input
                v-model="passwordForm.confirmPassword"
                type="password"
                placeholder="请确认新密码"
                show-password
              />
            </el-form-item>
            
            <el-form-item>
              <el-button 
                type="primary" 
                @click="changePassword"
                :loading="passwordLoading"
                class="w-full"
              >
                修改密码
              </el-button>
            </el-form-item>
          </el-form>
        </el-card>
        
        <!-- 账户信息 -->
        <el-card class="account-info-card">
          <template #header>
            <span>账户信息</span>
          </template>
          
          <div class="info-list">
            <div class="info-item">
              <span class="label">用户名</span>
              <span class="value">{{ authStore.user?.username }}</span>
            </div>
            <div class="info-item">
              <span class="label">最后登录</span>
              <span class="value">
                {{ authStore.user?.lastLoginTime ? formatTime(authStore.user.lastLoginTime) : '从未登录' }}
              </span>
            </div>
            <div class="info-item">
              <span class="label">创建时间</span>
              <span class="value">
                {{ authStore.user?.createdAt ? formatTime(authStore.user.createdAt) : '-' }}
              </span>
            </div>
            <div class="info-item">
              <span class="label">常用IP</span>
              <span class="value">{{ authStore.user?.commonIp || '-' }}</span>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import type { FormInstance, FormRules } from 'element-plus'
import type { User } from '@/types'
import dayjs from 'dayjs'

const authStore = useAuthStore()
const formRef = ref<FormInstance>()
const passwordFormRef = ref<FormInstance>()

// 状态
const isEditing = ref(false)
const loading = ref(false)
const passwordLoading = ref(false)

// 表单数据
const form = reactive<Partial<User>>({
  name: '',
  phoneNumber: '',
  picture: '',
})

const passwordForm = reactive({
  originalPassword: '',
  password: '',
  confirmPassword: '',
})

// 表单验证规则
const rules: FormRules = {
  name: [
    { required: true, message: '请输入姓名', trigger: 'blur' },
    { min: 2, max: 50, message: '姓名长度在 2 到 50 个字符', trigger: 'blur' },
  ],
  phoneNumber: [
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' },
  ],
}

const passwordRules: FormRules = {
  originalPassword: [
    { required: true, message: '请输入原密码', trigger: 'blur' },
  ],
  password: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于 6 个字符', trigger: 'blur' },
  ],
  confirmPassword: [
    { required: true, message: '请确认新密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== passwordForm.password) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur',
    },
  ],
}

// 格式化时间
const formatTime = (timestamp: number) => {
  return dayjs(timestamp).format('YYYY-MM-DD HH:mm:ss')
}

// 开始编辑
const startEdit = () => {
  isEditing.value = true
  if (authStore.user) {
    Object.assign(form, {
      name: authStore.user.name,
      phoneNumber: authStore.user.phoneNumber,
      picture: authStore.user.picture,
    })
  }
}

// 取消编辑
const cancelEdit = () => {
  isEditing.value = false
  Object.assign(form, {
    name: authStore.user?.name || '',
    phoneNumber: authStore.user?.phoneNumber || '',
    picture: authStore.user?.picture || '',
  })
}

// 保存个人资料
const saveProfile = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        loading.value = true
        await authStore.updateUserInfo({
          ...authStore.user,
          ...form,
        } as User)
        isEditing.value = false
      } catch (error) {
        console.error('保存个人资料失败:', error)
      } finally {
        loading.value = false
      }
    }
  })
}

// 修改密码
const changePassword = async () => {
  if (!passwordFormRef.value) return
  
  await passwordFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        passwordLoading.value = true
        await authStore.changePassword({
          originalPassword: passwordForm.originalPassword,
          password: passwordForm.password,
        })
        
        // 清空表单
        Object.assign(passwordForm, {
          originalPassword: '',
          password: '',
          confirmPassword: '',
        })
        passwordFormRef.value?.resetFields()
      } catch (error) {
        console.error('修改密码失败:', error)
      } finally {
        passwordLoading.value = false
      }
    }
  })
}

onMounted(() => {
  if (authStore.user) {
    Object.assign(form, {
      name: authStore.user.name,
      phoneNumber: authStore.user.phoneNumber,
      picture: authStore.user.picture,
    })
  }
})
</script>

<style lang="scss" scoped>
.profile {
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
  
  .profile-card,
  .password-card,
  .account-info-card {
    margin-bottom: 20px;
    
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
  }
  
  .profile-content {
    .avatar-section {
      display: flex;
      align-items: center;
      margin-bottom: 24px;
      padding-bottom: 24px;
      border-bottom: 1px solid #f0f0f0;
      
      .avatar-info {
        margin-left: 16px;
        
        .username {
          font-size: 18px;
          font-weight: 600;
          color: #333;
          margin-bottom: 8px;
        }
        
        .roles {
          .role-tag {
            margin-right: 8px;
          }
        }
      }
    }
  }
  
  .info-list {
    .info-item {
      display: flex;
      justify-content: space-between;
      padding: 12px 0;
      border-bottom: 1px solid #f5f5f5;
      
      &:last-child {
        border-bottom: none;
      }
      
      .label {
        color: #666;
        font-size: 14px;
      }
      
      .value {
        color: #333;
        font-size: 14px;
        text-align: right;
      }
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .profile {
    .avatar-section {
      flex-direction: column;
      text-align: center;
      
      .avatar-info {
        margin-left: 0;
        margin-top: 16px;
      }
    }
  }
}
</style> 