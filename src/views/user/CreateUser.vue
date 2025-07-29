<template>
  <div class="create-user">
    <div class="page-header">
      <h1>新建用户</h1>
      <p>创建新的系统用户</p>
    </div>

    <el-card>
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="120px"
        class="user-form"
      >
        <el-row :gutter="20">
          <el-col :xs="24" :md="12">
            <el-form-item label="用户名" prop="username">
              <el-input
                v-model="form.username"
                placeholder="请输入用户名"
                clearable
              />
            </el-form-item>
          </el-col>
          
          <el-col :xs="24" :md="12">
            <el-form-item label="姓名" prop="name">
              <el-input
                v-model="form.name"
                placeholder="请输入姓名"
                clearable
              />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :xs="24" :md="12">
            <el-form-item label="手机号" prop="phoneNumber">
              <el-input
                v-model="form.phoneNumber"
                placeholder="请输入手机号"
                clearable
              />
            </el-form-item>
          </el-col>
          
          <el-col :xs="24" :md="12">
            <el-form-item label="密码" prop="password">
              <el-input
                v-model="form.password"
                type="password"
                placeholder="请输入密码"
                show-password
                clearable
              />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :xs="24" :md="12">
            <el-form-item label="用户组" prop="groupId">
              <el-select
                v-model="form.groupId"
                placeholder="请选择用户组"
                clearable
                filterable
                class="w-full"
              >
                <el-option
                  v-for="group in groups"
                  :key="group.id"
                  :label="group.name"
                  :value="group.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
          
          <el-col :xs="24" :md="12">
            <el-form-item label="角色" prop="roleName">
              <el-select
                v-model="form.roleName"
                placeholder="请选择角色"
                clearable
                filterable
                class="w-full"
              >
                <el-option
                  v-for="role in roles"
                  :key="role.id"
                  :label="role.name"
                  :value="role.name"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-form-item>
          <div class="form-actions">
            <el-button @click="goBack">取消</el-button>
            <el-button type="primary" @click="handleSubmit" :loading="loading">
              创建用户
            </el-button>
          </div>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { getGroups } from '@/api/group'
import { getRoles } from '@/api/role'
import type { FormInstance, FormRules } from 'element-plus'
import type { NewUserRequest, Group, Role } from '@/types'

const router = useRouter()
const userStore = useUserStore()
const formRef = ref<FormInstance>()

// 状态
const loading = ref(false)
const groups = ref<Group[]>([])
const roles = ref<Role[]>([])

// 表单数据
const form = reactive<NewUserRequest>({
  username: '',
  name: '',
  phoneNumber: '',
  password: '',
  groupId: '',
  roleName: '',
})

// 表单验证规则
const rules: FormRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 50, message: '用户名长度在 3 到 50 个字符', trigger: 'blur' },
    { pattern: /^[a-zA-Z0-9_]+$/, message: '用户名只能包含字母、数字和下划线', trigger: 'blur' },
  ],
  name: [
    { required: true, message: '请输入姓名', trigger: 'blur' },
    { min: 2, max: 50, message: '姓名长度在 2 到 50 个字符', trigger: 'blur' },
  ],
  phoneNumber: [
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' },
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于 6 个字符', trigger: 'blur' },
  ],
}

// 加载数据
const loadData = async () => {
  try {
    const [groupsData, rolesData] = await Promise.all([
      getGroups(),
      getRoles(),
    ])
    
    groups.value = groupsData
    roles.value = rolesData
  } catch (error) {
    console.error('加载数据失败:', error)
  }
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        loading.value = true
        await userStore.createUser(form)
        ElMessage.success('用户创建成功')
        router.push('/users')
      } catch (error) {
        console.error('创建用户失败:', error)
      } finally {
        loading.value = false
      }
    }
  })
}

// 返回
const goBack = () => {
  router.back()
}

onMounted(() => {
  loadData()
})
</script>

<style lang="scss" scoped>
.create-user {
  .page-header {
    margin-bottom: 20px;
    
    h1 {
      margin: 0 0 4px 0;
      color: #333;
      font-size: 24px;
    }
    
    p {
      margin: 0;
      color: #666;
      font-size: 14px;
    }
  }
  
  .user-form {
    max-width: 800px;
    
    .form-actions {
      display: flex;
      gap: 12px;
      
      .el-button {
        min-width: 100px;
      }
    }
  }
}
</style> 