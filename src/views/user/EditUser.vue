<template>
  <div class="edit-user">
    <div class="page-header">
      <h1>编辑用户</h1>
      <p>修改用户信息</p>
    </div>

    <el-card v-loading="pageLoading">
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="120px"
        class="user-form"
      >
        <el-row :gutter="20">
          <el-col :xs="24" :md="12">
            <el-form-item label="用户名">
              <el-input :value="user?.username" disabled />
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
            <el-form-item label="头像URL" prop="picture">
              <el-input
                v-model="form.picture"
                placeholder="请输入头像URL"
                clearable
              />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-form-item>
          <div class="form-actions">
            <el-button @click="goBack">取消</el-button>
            <el-button type="primary" @click="handleSubmit" :loading="loading">
              保存修改
            </el-button>
          </div>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'
import type { FormInstance, FormRules } from 'element-plus'
import type { UpdateUserRequest, User } from '@/types'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const formRef = ref<FormInstance>()

// 状态
const loading = ref(false)
const pageLoading = ref(false)
const user = ref<User | null>(null)
const userId = route.params.id as string

// 表单数据
const form = reactive<UpdateUserRequest>({
  name: '',
  phoneNumber: '',
  picture: '',
})

// 表单验证规则
const rules: FormRules = {
  name: [
    { required: true, message: '请输入姓名', trigger: 'blur' },
    { min: 2, max: 50, message: '姓名长度在 2 到 50 个字符', trigger: 'blur' },
  ],
  phoneNumber: [
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' },
  ],
}

// 加载用户数据
const loadUser = async () => {
  try {
    pageLoading.value = true
    const userData = await userStore.fetchUser(userId)
    user.value = userData
    
    // 填充表单
    Object.assign(form, {
      name: userData.name,
      phoneNumber: userData.phoneNumber || '',
      picture: userData.picture || '',
    })
  } catch (error) {
    console.error('加载用户数据失败:', error)
    ElMessage.error('用户不存在或已被删除')
    router.push('/users')
  } finally {
    pageLoading.value = false
  }
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        loading.value = true
        await userStore.updateUser(userId, form)
        ElMessage.success('用户信息更新成功')
        router.push('/users')
      } catch (error) {
        console.error('更新用户失败:', error)
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
  loadUser()
})
</script>

<style lang="scss" scoped>
.edit-user {
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