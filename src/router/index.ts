import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { ElMessage } from 'element-plus'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/auth/callback',
      name: 'AuthCallback',
      component: () => import('@/views/AuthCallback.vue'),
      meta: {
        title: '认证回调',
        requiresAuth: false,
      },
    },
    {
      path: '/',
      component: () => import('@/layouts/AdminLayout.vue'),
      meta: {
        requiresAuth: true,
      },
      children: [
        {
          path: '',
          name: 'Dashboard',
          component: () => import('@/views/Dashboard.vue'),
          meta: {
            title: '仪表板',
            icon: 'Odometer',
          },
        },
        {
          path: '/users',
          name: 'UserManagement',
          component: () => import('@/views/user/UserList.vue'),
          meta: {
            title: '用户管理',
            icon: 'User',
            permission: 'user:crud',
          },
        },
        {
          path: '/users/create',
          name: 'CreateUser',
          component: () => import('@/views/user/CreateUser.vue'),
          meta: {
            title: '新建用户',
            permission: 'user:crud',
          },
        },
        {
          path: '/users/:id/edit',
          name: 'EditUser',
          component: () => import('@/views/user/EditUser.vue'),
          meta: {
            title: '编辑用户',
            permission: 'user:crud',
          },
        },
        {
          path: '/groups',
          name: 'GroupManagement',
          component: () => import('@/views/group/GroupList.vue'),
          meta: {
            title: '用户组管理',
            icon: 'UserFilled',
            permission: 'group:crud',
          },
        },
        {
          path: '/groups/create',
          name: 'CreateGroup',
          component: () => import('@/views/group/CreateGroup.vue'),
          meta: {
            title: '新建用户组',
            permission: 'group:crud',
          },
        },
        {
          path: '/groups/:id/edit',
          name: 'EditGroup',
          component: () => import('@/views/group/EditGroup.vue'),
          meta: {
            title: '编辑用户组',
            permission: 'group:crud',
          },
        },
        {
          path: '/roles',
          name: 'RoleManagement',
          component: () => import('@/views/role/RoleList.vue'),
          meta: {
            title: '角色管理',
            icon: 'Avatar',
            permission: 'role:crud',
          },
        },
        {
          path: '/roles/create',
          name: 'CreateRole',
          component: () => import('@/views/role/CreateRole.vue'),
          meta: {
            title: '新建角色',
            permission: 'role:crud',
          },
        },
        {
          path: '/roles/:id/edit',
          name: 'EditRole',
          component: () => import('@/views/role/EditRole.vue'),
          meta: {
            title: '编辑角色',
            permission: 'role:crud',
          },
        },
        {
          path: '/logs',
          name: 'LogManagement',
          component: () => import('@/views/log/LogList.vue'),
          meta: {
            title: '日志管理',
            icon: 'Document',
            permission: 'log:view',
          },
        },
        {
          path: '/profile',
          name: 'Profile',
          component: () => import('@/views/Profile.vue'),
          meta: {
            title: '个人资料',
            icon: 'Setting',
          },
        },
        {
          path: '/reset-password',
          name: 'ResetPassword',
          component: () => import('@/views/ResetPassword.vue'),
          meta: {
            title: '修改密码',
          },
        },
      ],
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'NotFound',
      component: () => import('@/views/NotFound.vue'),
      meta: {
        title: '页面不存在',
      },
    },
  ],
})

// 路由守卫
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  
  // 设置页面标题
  if (to.meta.title) {
    document.title = `${to.meta.title} - Gregory Service 管理系统`
  }

  // 特殊路由处理
  if (to.path === '/auth/callback') {
    next()
    return
  }

  // 检查是否需要认证
  if (to.meta.requiresAuth !== false) {
    if (!authStore.isAuthenticated) {
      // 保存原始路径用于登录后重定向
      const redirect = to.fullPath
      sessionStorage.setItem('redirect_after_login', redirect)
      // 直接跳转到Keycloak登录页
      authStore.redirectToLogin()
      return
    }

    // 检查权限
    if (to.meta.permission && !authStore.hasPermission(to.meta.permission as string)) {
      ElMessage.error('没有权限访问该页面')
      next('/')
      return
    }
  }

  next()
})

export default router 