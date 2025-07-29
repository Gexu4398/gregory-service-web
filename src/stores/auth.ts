import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import Cookies from 'js-cookie'
import { ElMessage } from 'element-plus'
import * as authApi from '@/api/auth'
import type { User, TokenInfo } from '@/types'

export const useAuthStore = defineStore('auth', () => {
  // 状态
  const user = ref<User | null>(null)
  const token = ref<string | null>(null)
  const refreshTokenValue = ref<string | null>(null)
  const isLoading = ref(false)

  // 计算属性
  const isAuthenticated = computed(() => !!token.value && !!user.value)
  const userRoles = computed(() => user.value?.role?.map(r => r.name) || [])
  const userPermissions = computed(() => {
    const scopes: string[] = []
    user.value?.role?.forEach(role => {
      if (role.scopes) {
        scopes.push(...role.scopes)
      }
    })
    return [...new Set(scopes)] // 去重
  })

  // 初始化认证状态
  const initAuth = async () => {
    const savedToken = Cookies.get('access_token')
    const savedRefreshToken = Cookies.get('refresh_token')
    
    if (savedToken && savedRefreshToken) {
      token.value = savedToken
      refreshTokenValue.value = savedRefreshToken
      try {
        await getCurrentUser()
      } catch (error) {
        // token 可能已过期，尝试刷新
        await tryRefreshToken()
      }
    }
  }

  // 重定向到 Keycloak 登录页
  const redirectToLogin = () => {
    const authUrl = authApi.getAuthUrl()
    window.location.href = authUrl
  }

  // 处理授权码回调
  const handleAuthCallback = async (code: string, state: string) => {
    try {
      isLoading.value = true
      
      // 验证 state 参数
      if (!authApi.validateState(state)) {
        throw new Error('无效的 state 参数')
      }
      
      // 使用授权码换取 token
      const tokenInfo = await authApi.exchangeCodeForToken(code)
      
      // 保存 token
      token.value = tokenInfo.access_token
      refreshTokenValue.value = tokenInfo.refresh_token
      
      // 保存到 Cookie
      Cookies.set('access_token', tokenInfo.access_token, { expires: tokenInfo.expires_in / 86400 })
      Cookies.set('refresh_token', tokenInfo.refresh_token, { expires: 7 }) // 7天
      
      // 获取用户信息
      await getCurrentUser()
      
      ElMessage.success('登录成功')
      return true
    } catch (error: any) {
      ElMessage.error(error.message || '登录失败')
      return false
    } finally {
      isLoading.value = false
    }
  }

  // 登出
  const logout = async (redirectToKeycloak = false) => {
    try {
      if (refreshTokenValue.value) {
        await authApi.logout(refreshTokenValue.value)
      }
    } catch (error) {
      console.error('登出请求失败:', error)
    } finally {
      // 清除本地状态
      user.value = null
      token.value = null
      refreshTokenValue.value = null
      Cookies.remove('access_token')
      Cookies.remove('refresh_token')
      
      if (redirectToKeycloak) {
        // 重定向到 Keycloak 登出页面
        const logoutUrl = authApi.getLogoutUrl(`${window.location.origin}/login`)
        window.location.href = logoutUrl
      } else {
        ElMessage.success('已安全退出')
      }
    }
  }

  // 获取当前用户信息
  const getCurrentUser = async () => {
    try {
      const userData = await authApi.getCurrentUser()
      user.value = userData
    } catch (error) {
      throw error
    }
  }

  // 刷新 token
  const tryRefreshToken = async () => {
    if (!refreshTokenValue.value) {
      await logout()
      return false
    }
    
    try {
      const tokenInfo = await authApi.refreshToken(refreshTokenValue.value)
      
      // 更新 token
      token.value = tokenInfo.access_token
      refreshTokenValue.value = tokenInfo.refresh_token
      
      // 更新 Cookie
      Cookies.set('access_token', tokenInfo.access_token, { expires: tokenInfo.expires_in / 86400 })
      Cookies.set('refresh_token', tokenInfo.refresh_token, { expires: 7 })
      
      // 获取用户信息
      await getCurrentUser()
      return true
    } catch (error) {
      await logout()
      return false
    }
  }

  // 更新用户信息
  const updateUserInfo = async (userData: User) => {
    try {
      const updatedUser = await authApi.updateProfile(userData)
      user.value = updatedUser
      ElMessage.success('个人信息更新成功')
    } catch (error: any) {
      ElMessage.error(error.message || '更新失败')
      throw error
    }
  }

  // 修改密码
  const changePassword = async (data: { originalPassword: string; password: string }) => {
    try {
      await authApi.changePassword(data)
      ElMessage.success('密码修改成功')
    } catch (error: any) {
      ElMessage.error(error.message || '密码修改失败')
      throw error
    }
  }

  // 检查权限
  const hasPermission = (permission: string) => {
    return userPermissions.value.includes(permission)
  }

  // 检查角色
  const hasRole = (role: string) => {
    return userRoles.value.includes(role)
  }

  return {
    // 状态
    user,
    token,
    isLoading,
    
    // 计算属性
    isAuthenticated,
    userRoles,
    userPermissions,
    
    // 方法
    initAuth,
    redirectToLogin,
    handleAuthCallback,
    logout,
    getCurrentUser,
    tryRefreshToken,
    updateUserInfo,
    changePassword,
    hasPermission,
    hasRole,
  }
}) 