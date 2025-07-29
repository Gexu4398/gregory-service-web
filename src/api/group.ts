import request from './request'
import type { Group, RenameGroupRequest, MoveGroupRequest } from '@/types'

// 获取用户组列表
export const getGroups = (): Promise<Group[]> => {
  return request.get('/group')
}

// 获取用户组详情
export const getGroup = (id: string): Promise<Group> => {
  return request.get(`/group/${id}`)
}

// 新建用户组
export const createGroup = (data: Group): Promise<Group> => {
  return request.post('/group', data)
}

// 重命名用户组
export const renameGroup = (id: string, data: RenameGroupRequest): Promise<Group> => {
  return request.post(`/group/${id}:rename`, data)
}

// 移动用户组
export const moveGroup = (id: string, data: MoveGroupRequest): Promise<Group> => {
  return request.post(`/group/${id}:move`, data)
}

// 删除用户组
export const deleteGroup = (id: string): Promise<void> => {
  return request.delete(`/group/${id}`)
}

// 检查用户组是否存在
export const checkGroupExists = (name: string, parentId?: string): Promise<any> => {
  const params: any = { name }
  if (parentId) {
    params.parentId = parentId
  }
  return request.head('/group', { params })
} 