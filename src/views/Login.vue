<template>
  <div class="login-container">
    <div class="login-box">
      <div class="login-header">
        <div class="logo">
          <img src="/logo.png" alt="Logo" class="logo-img" />
          <h2 class="title">Gregory Service</h2>
        </div>
        <p class="subtitle">管理系统</p>
      </div>

      <div class="login-content">
        <p class="login-description">
          请使用您的账户登录系统
        </p>
        
        <el-button
          type="primary"
          size="large"
          class="login-btn"
          :loading="isLoading"
          @click="handleLogin"
        >
          {{ isLoading ? '跳转中...' : '登录系统' }}
        </el-button>
        
        <div class="login-tips">
          <p>登录后将跳转到 Keycloak 认证页面</p>
        </div>
      </div>

      <div class="login-footer">
        <p>&copy; 2024 Gregory Service. All rights reserved.</p>
      </div>
    </div>
    
    <!-- 背景装饰 -->
    <div class="bg-decoration">
      <div class="circle circle-1"></div>
      <div class="circle circle-2"></div>
      <div class="circle circle-3"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()
const isLoading = ref(false)

// 处理登录
const handleLogin = () => {
  isLoading.value = true
  authStore.redirectToLogin()
}

onMounted(() => {
  // 如果已经登录，直接跳转到首页
  if (authStore.isAuthenticated) {
    router.push('/')
  }
})
</script>

<style lang="scss" scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: relative;
  overflow: hidden;
}

.login-box {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 40px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
  position: relative;
  z-index: 1;
}

.login-header {
  text-align: center;
  margin-bottom: 30px;
  
  .logo {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 10px;
    
    .logo-img {
      height: 48px;
      margin-right: 12px;
    }
    
    .title {
      margin: 0;
      color: #333;
      font-size: 24px;
      font-weight: bold;
    }
  }
  
  .subtitle {
    color: #666;
    font-size: 16px;
    margin: 0;
  }
}

.login-content {
  text-align: center;
  margin-bottom: 30px;
  
  .login-description {
    color: #666;
    margin-bottom: 24px;
    font-size: 14px;
  }
  
  .login-btn {
    width: 100%;
    height: 48px;
    font-size: 16px;
    border-radius: 24px;
    margin-bottom: 16px;
  }
  
  .login-tips {
    p {
      color: #999;
      font-size: 12px;
      margin: 0;
    }
  }
}

.login-footer {
  text-align: center;
  
  p {
    color: #999;
    font-size: 14px;
    margin: 0;
  }
}

.bg-decoration {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  
  .circle {
    position: absolute;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.1);
    animation: float 6s ease-in-out infinite;
    
    &.circle-1 {
      width: 200px;
      height: 200px;
      top: 20%;
      left: 10%;
      animation-delay: 0s;
    }
    
    &.circle-2 {
      width: 150px;
      height: 150px;
      top: 60%;
      right: 10%;
      animation-delay: 2s;
    }
    
    &.circle-3 {
      width: 100px;
      height: 100px;
      bottom: 20%;
      left: 60%;
      animation-delay: 4s;
    }
  }
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px) rotate(0deg);
  }
  50% {
    transform: translateY(-20px) rotate(180deg);
  }
}

// 响应式设计
@media (max-width: 480px) {
  .login-box {
    margin: 20px;
    padding: 30px 20px;
  }
  
  .login-header .logo .title {
    font-size: 20px;
  }
}
</style> 