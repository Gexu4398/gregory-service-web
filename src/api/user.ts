import request from './request'
import type { 
  User, 
  NewUserRequest, 
  UpdateUserRequest, 
  UserQueryParams,
  PageResponse,
  AcceptUserRequest,
  RejectUserRequest
} from '@/types'

// 获取用户列表
export const getUsers = (params: UserQueryParams): Promise<PageResponse<User>> => {
  return request.get('/user', { params })
}

// 获取用户详情
export const getUser = (id: string): Promise<User> => {
  return request.get(`/user/${id}`)
}

// 新建用户
export const createUser = (data: NewUserRequest): Promise<User> => {
  return request.post('/user', data)
}

// 更新用户
export const updateUser = (id: string, data: UpdateUserRequest): Promise<User> => {
  return request.put(`/user/${id}`, data)
}

// 删除用户
export const deleteUser = (id: string): Promise<void> => {
  return request.delete(`/user/${id}`)
}

// 启用用户
export const enableUser = (id: string): Promise<void> => {
  return request.post(`/user/${id}:enable`)
}

// 禁用用户
export const disableUsers = (ids: string[]): Promise<void> => {
  return request.post('/user/:disable', ids, {
    params: { id: ids }
  })
}

// 重置密码
export const resetUserPassword = (ids: string[]): Promise<void> => {
  return request.post('/user/:reset-password', ids, {
    params: { id: ids }
  })
}

// 分配角色
export const assignRole = (ids: string[], roleName: string): Promise<void> => {
  return request.post(`/user/:role/${roleName}`, ids, {
    params: { id: ids }
  })
}

// 分配用户组
export const assignGroup = (ids: string[], groupId: string): Promise<void> => {
  return request.post(`/user/:group/${groupId}`, ids, {
    params: { id: ids }
  })
}

// 审批通过用户
export const acceptUsers = (ids: string[], data: AcceptUserRequest): Promise<void> => {
  return request.post('/user/:accept', data, {
    params: { id: ids }
  })
}

// 驳回用户
export const rejectUsers = (ids: string[], data: RejectUserRequest): Promise<void> => {
  return request.post('/user/:reject', data, {
    params: { id: ids }
  })
}

// 获取在线用户数
export const getOnlineUserNum = (): Promise<{ count: number }> => {
  return request.get('/user/onlineNum')
}

// 获取离线用户数
export const getOfflineUserNum = (): Promise<{ count: number }> => {
  return request.get('/user/offlineNum')
}

// 检查用户状态
export const checkUserStatus = (username: string): Promise<any> => {
  return request.head('/user', { params: { username } })
} 