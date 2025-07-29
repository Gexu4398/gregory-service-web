import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { exchangeCodeForToken, getAuthUrl, refreshToken, validateState } from '@/api/auth'
import { ElMessage } from 'element-plus'
import type { User } from '@/types'

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string>('')
  const refreshTokenValue = ref<string>('')
  const user = ref<User | null>(null)
  const permissions = ref<string[]>([])
  const roles = ref<string[]>([])

  // 计算属性
  const isAuthenticated = computed(() => !!token.value)

  // 初始化，从localStorage恢复状态
  const initializeAuth = async () => {
    const savedToken = localStorage.getItem('auth_token')
    const savedRefreshToken = localStorage.getItem('refresh_token')
    const savedUser = localStorage.getItem('user_info')
    const savedPermissions = localStorage.getItem('user_permissions')
    const savedRoles = localStorage.getItem('user_roles')

    if (savedToken) {
      token.value = savedToken
      refreshTokenValue.value = savedRefreshToken || ''
      
      if (savedUser) {
        user.value = JSON.parse(savedUser)
      }
      if (savedPermissions) {
        permissions.value = JSON.parse(savedPermissions)
      }
      if (savedRoles) {
        roles.value = JSON.parse(savedRoles)
      }
    }
  }

  // 跳转到Keycloak登录页
  const redirectToLogin = () => {
    const state = generateState()
    sessionStorage.setItem('oauth_state', state)
    const authUrl = getAuthUrl(state)
    window.location.href = authUrl
  }

  // 处理OAuth回调
  const handleAuthCallback = async (code: string, state: string) => {
    try {
      // 验证state参数
      if (!validateState(state)) {
        throw new Error('无效的state参数')
      }

      const tokenData = await exchangeCodeForToken(code)
      
      // 保存认证信息
      setAuthData(tokenData)
      
      // 解析JWT获取用户信息
      parseTokenData(tokenData.access_token)
      
      ElMessage.success('登录成功')
      
      // 获取重定向路径
      const redirect = sessionStorage.getItem('redirect_after_login') || '/'
      sessionStorage.removeItem('redirect_after_login')
      
      return redirect
    } catch (error) {
      console.error('认证回调处理失败:', error)
      ElMessage.error('登录失败，请重试')
      throw error
    }
  }

  // 解析JWT token获取用户信息和权限
  const parseTokenData = (accessToken: string) => {
    try {
      const payload = JSON.parse(atob(accessToken.split('.')[1]))
      
      // 设置用户信息
      const userInfo: User = {
        id: payload.sub,
        username: payload.preferred_username || payload.username,
        email: payload.email,
        firstName: payload.given_name || '',
        lastName: payload.family_name || '',
        emailVerified: payload.email_verified || false,
        enabled: true,
        groups: payload.groups || [],
        roles: payload.realm_access?.roles || [],
        attributes: {}
      }
      
      user.value = userInfo
      roles.value = userInfo.roles
      permissions.value = payload.scope ? payload.scope.split(' ') : []
      
      // 保存到localStorage
      localStorage.setItem('user_info', JSON.stringify(userInfo))
      localStorage.setItem('user_permissions', JSON.stringify(permissions.value))
      localStorage.setItem('user_roles', JSON.stringify(roles.value))
    } catch (error) {
      console.error('解析token失败:', error)
    }
  }

  // 设置认证数据
  const setAuthData = (tokenData: any) => {
    token.value = tokenData.access_token
    refreshTokenValue.value = tokenData.refresh_token || ''
    
    localStorage.setItem('auth_token', token.value)
    if (refreshTokenValue.value) {
      localStorage.setItem('refresh_token', refreshTokenValue.value)
    }
  }

  // 刷新token
  const refreshAuthToken = async () => {
    try {
      if (!refreshTokenValue.value) {
        throw new Error('没有refresh token')
      }
      
      const tokenData = await refreshToken(refreshTokenValue.value)
      setAuthData(tokenData)
      parseTokenData(tokenData.access_token)
      
      return tokenData.access_token
    } catch (error) {
      console.error('刷新token失败:', error)
      logout()
      throw error
    }
  }

  // 登出
  const logout = (redirectToKeycloak = false) => {
    // 清除本地存储
    token.value = ''
    refreshTokenValue.value = ''
    user.value = null
    permissions.value = []
    roles.value = []
    
    localStorage.removeItem('auth_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('user_info')
    localStorage.removeItem('user_permissions')
    localStorage.removeItem('user_roles')
    sessionStorage.removeItem('oauth_state')
    sessionStorage.removeItem('redirect_after_login')

    if (redirectToKeycloak) {
      // 跳转到Keycloak登出页面
      const keycloakLogoutUrl = `${import.meta.env.VITE_KEYCLOAK_URL}/realms/${import.meta.env.VITE_KEYCLOAK_REALM}/protocol/openid-connect/logout?redirect_uri=${encodeURIComponent(window.location.origin)}`
      window.location.href = keycloakLogoutUrl
    } else {
      // 重新跳转到登录
      redirectToLogin()
    }
  }

  // 检查权限
  const hasPermission = (permission: string): boolean => {
    return permissions.value.includes(permission)
  }

  // 检查角色
  const hasRole = (role: string): boolean => {
    return roles.value.includes(role)
  }

  // 生成随机state
  const generateState = (): string => {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
  }

  return {
    // 状态
    token,
    user,
    permissions,
    roles,
    isAuthenticated,
    
    // 方法
    initializeAuth,
    redirectToLogin,
    handleAuthCallback,
    refreshAuthToken,
    logout,
    hasPermission,
    hasRole,
  }
}) 