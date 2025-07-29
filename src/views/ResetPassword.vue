<template>
  <div class="reset-password">
    <PageHeader 
      title="修改密码" 
      description="修改当前登录用户的密码" 
    />

    <el-card class="form-card">
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="120px"
        @submit.prevent="handleSubmit"
      >
        <el-form-item label="当前密码" prop="oldPassword" required>
          <el-input
            v-model="form.oldPassword"
            type="password"
            placeholder="请输入当前密码"
            show-password
            autocomplete="current-password"
          />
        </el-form-item>

        <el-form-item label="新密码" prop="newPassword" required>
          <el-input
            v-model="form.newPassword"
            type="password"
            placeholder="请输入新密码"
            show-password
            autocomplete="new-password"
          />
          <div class="password-tips">
            <p>密码要求：</p>
            <ul>
              <li>长度至少 8 位</li>
              <li>包含大小写字母</li>
              <li>包含数字</li>
              <li>可以包含特殊字符</li>
            </ul>
          </div>
        </el-form-item>

        <el-form-item label="确认新密码" prop="confirmPassword" required>
          <el-input
            v-model="form.confirmPassword"
            type="password"
            placeholder="请再次输入新密码"
            show-password
            autocomplete="new-password"
          />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleSubmit" :loading="loading">
            修改密码
          </el-button>
          <el-button @click="handleReset">重置</el-button>
          <el-button @click="handleCancel">取消</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 安全提示 -->
    <el-card class="security-tips">
      <template #header>
        <div class="card-header">
          <span>安全提示</span>
        </div>
      </template>
      <el-alert
        title="为了您的账户安全，请定期修改密码"
        type="info"
        :closable="false"
        show-icon
      >
        <ul class="tips-list">
          <li>使用强密码，包含大小写字母、数字和特殊字符</li>
          <li>不要使用与个人信息相关的密码</li>
          <li>不要在多个网站使用相同密码</li>
          <li>如发现异常登录，请立即修改密码并联系管理员</li>
        </ul>
      </el-alert>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox, type FormInstance } from 'element-plus'
import { PageHeader } from '@/components'
import { useAuthStore } from '@/stores/auth'
import { resetUserPassword } from '@/api/user'
import type { ResetPasswordRequest } from '@/types'

const router = useRouter()
const authStore = useAuthStore()
const formRef = ref<FormInstance>()
const loading = ref(false)

const form = reactive<ResetPasswordRequest>({
  userId: authStore.user?.id || '',
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// 自定义验证规则
const validatePassword = (rule: any, value: string, callback: any) => {
  if (!value) {
    callback(new Error('请输入新密码'))
    return
  }
  
  // 密码强度验证
  const minLength = 8
  const hasUpperCase = /[A-Z]/.test(value)
  const hasLowerCase = /[a-z]/.test(value)
  const hasNumbers = /\d/.test(value)
  
  if (value.length < minLength) {
    callback(new Error(`密码长度至少 ${minLength} 位`))
    return
  }
  
  if (!hasUpperCase) {
    callback(new Error('密码必须包含大写字母'))
    return
  }
  
  if (!hasLowerCase) {
    callback(new Error('密码必须包含小写字母'))
    return
  }
  
  if (!hasNumbers) {
    callback(new Error('密码必须包含数字'))
    return
  }
  
  callback()
}

const validateConfirmPassword = (rule: any, value: string, callback: any) => {
  if (!value) {
    callback(new Error('请确认新密码'))
    return
  }
  
  if (value !== form.newPassword) {
    callback(new Error('两次输入的密码不一致'))
    return
  }
  
  callback()
}

const rules = {
  oldPassword: [
    { required: true, message: '请输入当前密码', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, validator: validatePassword, trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, validator: validateConfirmPassword, trigger: 'blur' }
  ]
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()
    
    // 确认操作
    await ElMessageBox.confirm(
      '修改密码后需要重新登录，确定要继续吗？',
      '确认修改',
      {
        type: 'warning',
        confirmButtonText: '确定修改',
        cancelButtonText: '取消'
      }
    )
    
    loading.value = true

    await resetUserPassword({
      userId: form.userId,
      newPassword: form.newPassword
    })
    
    ElMessage.success('密码修改成功，请重新登录')
    
    // 清除登录状态并跳转到登录页
    setTimeout(async () => {
      await authStore.logout()
      router.push('/login')
    }, 1500)
    
  } catch (error: any) {
    if (error === 'cancel') {
      // 用户取消操作
      return
    }
    
    if (error.fields) {
      // 表单验证错误
      return
    }
    
    console.error('修改密码失败:', error)
    ElMessage.error(error.message || '修改密码失败')
  } finally {
    loading.value = false
  }
}

// 重置表单
const handleReset = () => {
  if (formRef.value) {
    formRef.value.resetFields()
  }
  
  form.oldPassword = ''
  form.newPassword = ''
  form.confirmPassword = ''
}

// 取消操作
const handleCancel = () => {
  router.back()
}
</script>

<style scoped lang="scss">
.reset-password {
  .form-card {
    margin-top: 16px;
    
    .el-form {
      max-width: 500px;
    }
  }

  .password-tips {
    margin-top: 8px;
    padding: 12px;
    background-color: var(--el-bg-color-page);
    border-radius: 4px;
    font-size: 12px;
    color: var(--el-text-color-secondary);

    p {
      margin: 0 0 8px 0;
      font-weight: 500;
    }

    ul {
      margin: 0;
      padding-left: 16px;

      li {
        margin-bottom: 4px;
      }
    }
  }

  .security-tips {
    margin-top: 24px;

    .card-header {
      font-weight: 500;
    }

    .tips-list {
      margin: 8px 0 0 0;
      padding-left: 16px;
      color: var(--el-text-color-regular);

      li {
        margin-bottom: 4px;
      }
    }
  }
}
</style> 