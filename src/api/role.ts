import request from './request'
import type { Role, NewRoleRequest, RenameRoleRequest } from '@/types'

// 获取角色列表
export const getRoles = (): Promise<Role[]> => {
  return request.get('/role')
}

// 获取角色详情
export const getRole = (roleName: string): Promise<Role> => {
  return request.get(`/role/${roleName}`)
}

// 新建角色
export const createRole = (data: NewRoleRequest): Promise<Role> => {
  return request.post('/role', data)
}

// 更新角色权限
export const updateRole = (roleName: string, scopes: string[]): Promise<Role> => {
  return request.put(`/role/${roleName}`, scopes)
}

// 删除角色
export const deleteRole = (roleName: string): Promise<void> => {
  return request.delete(`/role/${roleName}`)
}

// 重命名角色
export const renameRole = (roleName: string, data: RenameRoleRequest): Promise<Role> => {
  return request.post(`/role/${roleName}:rename`, data)
}

// 检查角色是否存在
export const checkRoleExists = (roleName: string): Promise<any> => {
  return request.head('/role', { params: { roleName } })
} 