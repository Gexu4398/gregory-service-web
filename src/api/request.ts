import axios, { AxiosInstance, AxiosError, AxiosResponse } from 'axios'
import { ElMessage } from 'element-plus'

// 创建 axios 实例
const request: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 请求拦截器
request.interceptors.request.use(
  (config) => {
    // 从localStorage获取认证 token
    const token = localStorage.getItem('auth_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error: AxiosError) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
request.interceptors.response.use(
  (response: AxiosResponse) => {
    return response
  },
  async (error: AxiosError) => {
    // 处理错误响应
    if (error.response) {
      const { status, data } = error.response as any
      
      switch (status) {
        case 401:
          // 检查是否有token
          const token = localStorage.getItem('auth_token')
          if (token) {
            // 有token但401，说明token过期或无效
            ElMessage.error('登录已过期，请重新登录')
            // 清除认证信息
            localStorage.removeItem('auth_token')
            localStorage.removeItem('refresh_token')
            localStorage.removeItem('user_info')
            localStorage.removeItem('user_permissions')
            localStorage.removeItem('user_roles')
            // 动态导入auth store避免循环依赖
            const { useAuthStore } = await import('@/stores/auth')
            const authStore = useAuthStore()
            authStore.redirectToLogin()
          } else {
            // 没有token，说明未登录或权限不足
            ElMessage.error('权限不足，请先登录')
            const { useAuthStore } = await import('@/stores/auth')
            const authStore = useAuthStore()
            authStore.redirectToLogin()
          }
          break
        case 403:
          ElMessage.error('没有权限访问该资源')
          break
        case 404:
          ElMessage.error('请求的资源不存在')
          break
        case 500:
          ElMessage.error('服务器内部错误')
          break
        default:
          ElMessage.error(data?.message || '请求失败')
      }
    } else if (error.request) {
      ElMessage.error('网络连接失败，请检查网络')
    } else {
      ElMessage.error('请求配置错误')
    }
    
    return Promise.reject(error)
  }
)

export default request 