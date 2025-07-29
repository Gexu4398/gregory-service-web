import request from './request'
import type { BizLog, LogQueryParams, PageResponse } from '@/types'

// 获取日志列表
export const getLogs = (params: LogQueryParams): Promise<PageResponse<BizLog>> => {
  return request.get('/log', { params })
} 