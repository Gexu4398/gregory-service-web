import request from './request'
import type { User, TokenInfo } from '@/types'

// 获取 Keycloak 授权 URL
export const getAuthUrl = (): string => {
  const params = new URLSearchParams({
    client_id: import.meta.env.VITE_KEYCLOAK_CLIENT_ID,
    redirect_uri: `${window.location.origin}/auth/callback`,
    response_type: 'code',
    scope: 'openid profile email',
    state: generateState(),
  })
  
  return `${import.meta.env.VITE_KEYCLOAK_URL}/realms/${import.meta.env.VITE_KEYCLOAK_REALM}/protocol/openid-connect/auth?${params}`
}

// 生成随机 state 参数
const generateState = (): string => {
  const state = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
  sessionStorage.setItem('oauth_state', state)
  return state
}

// 验证 state 参数
export const validateState = (state: string): boolean => {
  const savedState = sessionStorage.getItem('oauth_state')
  sessionStorage.removeItem('oauth_state')
  return savedState === state
}

// 使用授权码换取 token
export const exchangeCodeForToken = async (code: string): Promise<TokenInfo> => {
  const response = await fetch(`${import.meta.env.VITE_KEYCLOAK_URL}/realms/${import.meta.env.VITE_KEYCLOAK_REALM}/protocol/openid-connect/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: import.meta.env.VITE_KEYCLOAK_CLIENT_ID,
      code,
      redirect_uri: `${window.location.origin}/auth/callback`,
    }),
  })
  
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error_description || '获取 token 失败')
  }
  
  return response.json()
}

// 刷新 token
export const refreshToken = async (refresh_token: string): Promise<TokenInfo> => {
  const response = await fetch(`${import.meta.env.VITE_KEYCLOAK_URL}/realms/${import.meta.env.VITE_KEYCLOAK_REALM}/protocol/openid-connect/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      client_id: import.meta.env.VITE_KEYCLOAK_CLIENT_ID,
      refresh_token,
    }),
  })
  
  if (!response.ok) {
    throw new Error('刷新 token 失败')
  }
  
  return response.json()
}

// 登出
export const logout = async (refresh_token: string): Promise<void> => {
  try {
    await fetch(`${import.meta.env.VITE_KEYCLOAK_URL}/realms/${import.meta.env.VITE_KEYCLOAK_REALM}/protocol/openid-connect/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: import.meta.env.VITE_KEYCLOAK_CLIENT_ID,
        refresh_token,
      }),
    })
  } catch (error) {
    console.error('登出请求失败:', error)
  }
}

// 获取 Keycloak 登出 URL
export const getLogoutUrl = (redirectUrl?: string): string => {
  const params = new URLSearchParams({
    client_id: import.meta.env.VITE_KEYCLOAK_CLIENT_ID,
  })
  
  if (redirectUrl) {
    params.append('post_logout_redirect_uri', redirectUrl)
  }
  
  return `${import.meta.env.VITE_KEYCLOAK_URL}/realms/${import.meta.env.VITE_KEYCLOAK_REALM}/protocol/openid-connect/logout?${params}`
}

// 获取当前用户信息
export const getCurrentUser = (): Promise<User> => {
  return request.get('/profile')
}

// 更新个人资料
export const updateProfile = (user: User): Promise<User> => {
  return request.put('/profile', user)
}

// 修改密码
export const changePassword = (data: { originalPassword: string; password: string }): Promise<void> => {
  return request.post('/profile/reset-password', data)
} 