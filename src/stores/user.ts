import { defineStore } from 'pinia'
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import * as userApi from '@/api/user'
import type { User, NewUserRequest, UpdateUserRequest, UserQueryParams, PageResponse } from '@/types'

export const useUserStore = defineStore('user', () => {
  // 状态
  const users = ref<PageResponse<User> | null>(null)
  const currentUser = ref<User | null>(null)
  const loading = ref(false)
  const onlineUserCount = ref(0)
  const offlineUserCount = ref(0)

  // 获取用户列表
  const fetchUsers = async (params: UserQueryParams = {}) => {
    try {
      loading.value = true
      const data = await userApi.getUsers(params)
      users.value = data
    } catch (error: any) {
      ElMessage.error(error.message || '获取用户列表失败')
    } finally {
      loading.value = false
    }
  }

  // 获取用户详情
  const fetchUser = async (id: string) => {
    try {
      loading.value = true
      const data = await userApi.getUser(id)
      currentUser.value = data
      return data
    } catch (error: any) {
      ElMessage.error(error.message || '获取用户详情失败')
      throw error
    } finally {
      loading.value = false
    }
  }

  // 创建用户
  const createUser = async (userData: NewUserRequest) => {
    try {
      loading.value = true
      const newUser = await userApi.createUser(userData)
      ElMessage.success('用户创建成功')
      return newUser
    } catch (error: any) {
      ElMessage.error(error.message || '用户创建失败')
      throw error
    } finally {
      loading.value = false
    }
  }

  // 更新用户
  const updateUser = async (id: string, userData: UpdateUserRequest) => {
    try {
      loading.value = true
      const updatedUser = await userApi.updateUser(id, userData)
      ElMessage.success('用户更新成功')
      return updatedUser
    } catch (error: any) {
      ElMessage.error(error.message || '用户更新失败')
      throw error
    } finally {
      loading.value = false
    }
  }

  // 删除用户
  const deleteUser = async (id: string) => {
    try {
      loading.value = true
      await userApi.deleteUser(id)
      ElMessage.success('用户删除成功')
    } catch (error: any) {
      ElMessage.error(error.message || '用户删除失败')
      throw error
    } finally {
      loading.value = false
    }
  }

  // 启用用户
  const enableUser = async (id: string) => {
    try {
      await userApi.enableUser(id)
      ElMessage.success('用户已启用')
    } catch (error: any) {
      ElMessage.error(error.message || '启用用户失败')
      throw error
    }
  }

  // 禁用用户
  const disableUsers = async (ids: string[]) => {
    try {
      await userApi.disableUsers(ids)
      ElMessage.success('用户已禁用')
    } catch (error: any) {
      ElMessage.error(error.message || '禁用用户失败')
      throw error
    }
  }

  // 重置密码
  const resetUserPassword = async (ids: string[]) => {
    try {
      await userApi.resetUserPassword(ids)
      ElMessage.success('密码重置成功')
    } catch (error: any) {
      ElMessage.error(error.message || '密码重置失败')
      throw error
    }
  }

  // 获取用户统计数据
  const fetchUserStats = async () => {
    try {
      const [onlineData, offlineData] = await Promise.all([
        userApi.getOnlineUserNum(),
        userApi.getOfflineUserNum()
      ])
      onlineUserCount.value = onlineData.count
      offlineUserCount.value = offlineData.count
    } catch (error: any) {
      ElMessage.error(error.message || '获取用户统计失败')
    }
  }

  return {
    // 状态
    users,
    currentUser,
    loading,
    onlineUserCount,
    offlineUserCount,

    // 方法
    fetchUsers,
    fetchUser,
    createUser,
    updateUser,
    deleteUser,
    enableUser,
    disableUsers,
    resetUserPassword,
    fetchUserStats,
  }
}) 