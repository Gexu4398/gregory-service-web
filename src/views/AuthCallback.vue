<template>
  <div class="auth-callback">
    <div class="callback-content">
      <div class="loading-wrapper">
        <el-icon class="loading-icon"><Loading /></el-icon>
        <h2>正在处理登录...</h2>
        <p>请稍候，系统正在验证您的身份</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { ElMessage } from 'element-plus'
import { Loading } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

onMounted(async () => {
  try {
    const { code, state, error, error_description } = route.query
    
    // 检查是否有错误
    if (error) {
      ElMessage.error(error_description as string || '认证失败')
      router.push('/login')
      return
    }
    
    // 检查必要参数
    if (!code || !state) {
      ElMessage.error('缺少必要的认证参数')
      router.push('/login')
      return
    }
    
    // 处理授权码
    const success = await authStore.handleAuthCallback(code as string, state as string)
    
    if (success) {
      // 登录成功，跳转到首页或原来要访问的页面
      const redirect = route.query.redirect as string || '/'
      router.push(redirect)
    } else {
      router.push('/login')
    }
  } catch (error) {
    console.error('处理认证回调失败:', error)
    ElMessage.error('登录失败，请重试')
    router.push('/login')
  }
})
</script>

<style lang="scss" scoped>
.auth-callback {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.callback-content {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 60px 40px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  text-align: center;
  max-width: 400px;
}

.loading-wrapper {
  .loading-icon {
    font-size: 48px;
    color: #409eff;
    animation: spin 1s linear infinite;
    margin-bottom: 20px;
  }
  
  h2 {
    margin: 0 0 12px 0;
    color: #333;
    font-size: 24px;
    font-weight: 600;
  }
  
  p {
    margin: 0;
    color: #666;
    font-size: 16px;
  }
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style> 