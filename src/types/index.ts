// 用户相关类型定义
export interface User {
  id: string
  username: string
  name: string
  picture?: string
  phoneNumber?: string
  group?: Group
  role?: Role[]
  enabled: boolean
  commonIp?: string
  lastLoginIp?: string
  lastLoginTime?: number
  createdAt?: number
  resetAt?: string
}

// 用户组类型定义
export interface Group {
  id: string
  name: string
  path?: string
  parentId?: string
  parentGroup?: string
  children?: Group[]
  attributes?: GroupAttribute[]
}

export interface GroupAttribute {
  name: string
  value: string
}

// 角色类型定义
export interface Role {
  id: string
  name: string
  description?: string
  attributes?: RoleAttribute[]
  scopes?: string[]
}

export interface RoleAttribute {
  name: string
  value: string
}

// 请求类型定义
export interface NewUserRequest {
  username: string
  name: string
  phoneNumber?: string
  password?: string
  groupId?: string
  roleName?: string
}

export interface UpdateUserRequest {
  name: string
  phoneNumber?: string
  picture?: string
}

export interface AcceptUserRequest {
  roleName: string
  memo?: string
}

export interface RejectUserRequest {
  memo: string
}

export interface ResetPasswordRequest {
  originalPassword: string
  password: string
}

export interface NewRoleRequest {
  name: string
  description?: string
  scopes?: string[]
}

export interface RenameRoleRequest {
  newRoleName: string
}

export interface RenameGroupRequest {
  newGroupName: string
}

export interface MoveGroupRequest {
  parentId: string
}

// 通知类型定义
export interface Notification {
  id: string
  title: string
  content: string
  userId: string
  createdAt: number
  isRead: boolean
}

// 业务日志类型定义
export interface BizLog {
  id: string
  type: string
  module: string
  content: string
  targetId?: string
  targetName?: string
  targetType?: string
  ip: string
  username: string
  userId: string
  createdAt: number
}

// 分页响应类型
export interface PageResponse<T> {
  content: T[]
  totalElements: number
  totalPages: number
  size: number
  number: number
  first: boolean
  last: boolean
  empty: boolean
}

// API 响应类型
export interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
}

// 登录相关类型
export interface LoginForm {
  username: string
  password: string
}

export interface TokenInfo {
  access_token: string
  refresh_token: string
  token_type: string
  expires_in: number
}

// 查询参数类型
export interface UserQueryParams {
  groupId?: string
  roleId?: string
  keyword?: string
  status?: string[]
  page?: number
  size?: number
  sort?: string
}

export interface LogQueryParams {
  type?: string
  ip?: string
  username?: string
  q?: string
  module?: string[]
  fromDate?: string
  toDate?: string
  page?: number
  size?: number
  sort?: string
} 