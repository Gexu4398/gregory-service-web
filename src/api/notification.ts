import request from './request'
import type { Notification, PageResponse } from '@/types'

// 获取通知列表
export const getNotifications = (params: { unreadOnly?: boolean; page?: number; size?: number }): Promise<PageResponse<Notification>> => {
  return request.get('/profile/notification', { params })
}

// 标记所有通知为已读
export const markAllNotificationsAsRead = (): Promise<void> => {
  return request.post('/profile/notification:read')
} 