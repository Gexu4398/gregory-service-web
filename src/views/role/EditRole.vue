<template>
  <div class="edit-role">
    <PageHeader 
      title="编辑角色" 
      description="修改角色信息和权限配置" 
    />

    <el-card class="form-card" v-loading="pageLoading">
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
        @submit.prevent="handleSubmit"
      >
        <el-form-item label="角色名称" prop="name" required>
          <el-input
            v-model="form.name"
            placeholder="请输入角色名称"
            maxlength="50"
            show-word-limit
            :disabled="isSuperAdmin"
          />
          <div v-if="isSuperAdmin" class="form-tip">
            超级管理员角色不允许修改名称
          </div>
        </el-form-item>

        <el-form-item label="角色描述" prop="description">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="3"
            placeholder="请输入角色描述（可选）"
            maxlength="200"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="权限配置" prop="scopes">
          <div class="permission-section">
            <div v-if="isSuperAdmin" class="super-admin-notice">
              <el-alert
                title="超级管理员角色拥有所有权限，不可修改"
                type="info"
                :closable="false"
                show-icon
              />
            </div>
            <div v-else class="permission-group" v-for="group in permissionGroups" :key="group.key">
              <h4 class="group-title">{{ group.title }}</h4>
              <el-checkbox-group v-model="form.scopes" class="permission-list">
                <el-checkbox 
                  v-for="permission in group.permissions" 
                  :key="permission.value"
                  :label="permission.value"
                  :disabled="permission.disabled"
                >
                  {{ permission.label }}
                  <span v-if="permission.description" class="permission-desc">
                    ({{ permission.description }})
                  </span>
                </el-checkbox>
              </el-checkbox-group>
            </div>
          </div>
        </el-form-item>

        <el-form-item>
          <el-button 
            type="primary" 
            @click="handleSubmit" 
            :loading="loading"
            :disabled="isSuperAdmin"
          >
            保存修改
          </el-button>
          <el-button @click="handleCancel">取消</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, type FormInstance } from 'element-plus'
import { PageHeader } from '@/components'
import { getRole, updateRole } from '@/api/role'
import type { Role } from '@/types'

const router = useRouter()
const route = useRoute()
const formRef = ref<FormInstance>()
const loading = ref(false)
const pageLoading = ref(true)

const roleId = route.params.id as string

const form = reactive({
  id: roleId,
  name: '',
  description: '',
  scopes: [] as string[]
})

// 是否为超级管理员角色
const isSuperAdmin = computed(() => {
  return form.name === '超级管理员' || form.scopes.includes('system:admin')
})

const rules = computed(() => ({
  name: [
    { required: true, message: '请输入角色名称', trigger: 'blur' },
    { min: 2, max: 50, message: '角色名称长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  scopes: isSuperAdmin.value ? [] : [
    { required: true, message: '请至少选择一个权限', trigger: 'change', type: 'array', min: 1 }
  ]
}))

// 权限分组配置
const permissionGroups = [
  {
    key: 'user',
    title: '用户管理',
    permissions: [
      { value: 'user:read', label: '查看用户', description: '查看用户列表和详情' },
      { value: 'user:create', label: '创建用户', description: '新建用户账号' },
      { value: 'user:update', label: '编辑用户', description: '修改用户信息' },
      { value: 'user:delete', label: '删除用户', description: '删除用户账号' },
      { value: 'user:enable', label: '启用/禁用用户', description: '控制用户状态' },
      { value: 'user:reset-password', label: '重置密码', description: '重置用户密码' }
    ]
  },
  {
    key: 'group',
    title: '用户组管理',
    permissions: [
      { value: 'group:read', label: '查看用户组', description: '查看用户组列表和详情' },
      { value: 'group:create', label: '创建用户组', description: '新建用户组' },
      { value: 'group:update', label: '编辑用户组', description: '修改用户组信息' },
      { value: 'group:delete', label: '删除用户组', description: '删除用户组' },
      { value: 'group:move', label: '移动用户组', description: '调整用户组结构' }
    ]
  },
  {
    key: 'role',
    title: '角色管理',
    permissions: [
      { value: 'role:read', label: '查看角色', description: '查看角色列表和详情' },
      { value: 'role:create', label: '创建角色', description: '新建角色' },
      { value: 'role:update', label: '编辑角色', description: '修改角色信息' },
      { value: 'role:delete', label: '删除角色', description: '删除角色' }
    ]
  },
  {
    key: 'log',
    title: '日志管理',
    permissions: [
      { value: 'log:read', label: '查看日志', description: '查看系统操作日志' }
    ]
  },
  {
    key: 'system',
    title: '系统管理',
    permissions: [
      { value: 'system:admin', label: '系统管理员', description: '拥有所有权限', disabled: true }
    ]
  }
]

// 获取角色详情
const fetchRoleDetail = async () => {
  try {
    const response = await getRole(roleId)
    const role: Role = response.data
    
    form.name = role.name
    form.description = role.description || ''
    form.scopes = role.scopes || []
  } catch (error: any) {
    console.error('获取角色详情失败:', error)
    ElMessage.error('获取角色详情失败')
    router.push('/roles')
  }
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value || isSuperAdmin.value) return

  try {
    await formRef.value.validate()
    loading.value = true

    await updateRole(form)
    
    ElMessage.success('角色修改成功')
    router.push('/roles')
  } catch (error: any) {
    if (error.fields) {
      // 表单验证错误
      return
    }
    console.error('修改角色失败:', error)
    ElMessage.error(error.message || '修改角色失败')
  } finally {
    loading.value = false
  }
}

// 取消操作
const handleCancel = () => {
  router.back()
}

onMounted(async () => {
  try {
    await fetchRoleDetail()
  } finally {
    pageLoading.value = false
  }
})
</script>

<style scoped lang="scss">
.edit-role {
  .form-card {
    margin-top: 16px;
    
    .el-form {
      max-width: 800px;
    }
  }

  .form-tip {
    font-size: 12px;
    color: var(--el-text-color-secondary);
    margin-top: 4px;
  }

  .permission-section {
    border: 1px solid var(--el-border-color);
    border-radius: 4px;
    padding: 16px;
    background-color: var(--el-bg-color-page);

    .super-admin-notice {
      margin-bottom: 16px;
    }

    .permission-group {
      margin-bottom: 24px;

      &:last-child {
        margin-bottom: 0;
      }

      .group-title {
        margin: 0 0 12px 0;
        font-size: 14px;
        font-weight: 500;
        color: var(--el-text-color-primary);
        border-bottom: 1px solid var(--el-border-color-light);
        padding-bottom: 8px;
      }

      .permission-list {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
        gap: 8px;

        .el-checkbox {
          margin-right: 0;
          
          .permission-desc {
            color: var(--el-text-color-secondary);
            font-size: 12px;
          }
        }
      }
    }
  }
}
</style> 