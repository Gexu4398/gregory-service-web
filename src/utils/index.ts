import dayjs from 'dayjs'

/**
 * 格式化时间
 */
export const formatTime = (timestamp: number | string | Date, format = 'YYYY-MM-DD HH:mm:ss'): string => {
  return dayjs(timestamp).format(format)
}

/**
 * 格式化相对时间
 */
export const formatRelativeTime = (timestamp: number | string | Date): string => {
  return dayjs(timestamp).fromNow()
}

/**
 * 格式化文件大小
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * 防抖函数
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  immediate?: boolean
): ((...args: Parameters<T>) => void) => {
  let timeout: ReturnType<typeof setTimeout> | null = null
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null
      if (!immediate) func(...args)
    }
    
    const callNow = immediate && !timeout
    
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(later, wait)
    
    if (callNow) func(...args)
  }
}

/**
 * 节流函数
 */
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean
  
  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func.apply(this, args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

/**
 * 深拷贝
 */
export const deepClone = <T>(obj: T): T => {
  if (obj === null || typeof obj !== 'object') return obj
  if (obj instanceof Date) return new Date(obj.getTime()) as unknown as T
  if (obj instanceof Array) return obj.map(item => deepClone(item)) as unknown as T
  if (typeof obj === 'object') {
    const clonedObj = {} as T
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key])
      }
    }
    return clonedObj
  }
  return obj
}

/**
 * 生成随机字符串
 */
export const generateRandomString = (length = 8): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

/**
 * 下载文件
 */
export const downloadFile = (blob: Blob, filename: string): void => {
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.URL.revokeObjectURL(url)
}

/**
 * 复制到剪贴板
 */
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text)
      return true
    } else {
      // 降级方案
      const textArea = document.createElement('textarea')
      textArea.value = text
      textArea.style.position = 'fixed'
      textArea.style.left = '-999999px'
      textArea.style.top = '-999999px'
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()
      const result = document.execCommand('copy')
      document.body.removeChild(textArea)
      return result
    }
  } catch (error) {
    console.error('复制失败:', error)
    return false
  }
}

/**
 * 验证手机号
 */
export const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^1[3-9]\d{9}$/
  return phoneRegex.test(phone)
}

/**
 * 验证邮箱
 */
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * 获取文件扩展名
 */
export const getFileExtension = (filename: string): string => {
  return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2)
}

/**
 * 树形数据扁平化
 */
export const flattenTree = <T extends { children?: T[] }>(
  tree: T[], 
  childrenKey = 'children'
): T[] => {
  const result: T[] = []
  
  const flatten = (nodes: T[]) => {
    nodes.forEach(node => {
      result.push(node)
      if (node[childrenKey as keyof T]) {
        flatten(node[childrenKey as keyof T] as T[])
      }
    })
  }
  
  flatten(tree)
  return result
}

/**
 * 扁平数据转树形
 */
export const arrayToTree = <T extends { id: string; parentId?: string }>(
  array: T[],
  idKey = 'id',
  parentIdKey = 'parentId',
  childrenKey = 'children'
): T[] => {
  const tree: T[] = []
  const map = new Map<string, T>()
  
  // 创建映射
  array.forEach(item => {
    map.set(item[idKey as keyof T] as string, { ...item, [childrenKey]: [] })
  })
  
  // 构建树形结构
  array.forEach(item => {
    const node = map.get(item[idKey as keyof T] as string)!
    const parentId = item[parentIdKey as keyof T] as string
    
    if (parentId && map.has(parentId)) {
      const parent = map.get(parentId)!
      if (!parent[childrenKey as keyof T]) {
        parent[childrenKey as keyof T] = [] as any
      }
      (parent[childrenKey as keyof T] as any).push(node)
    } else {
      tree.push(node)
    }
  })
  
  return tree
} 