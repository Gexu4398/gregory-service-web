<template>
  <div class="create-group">
    <PageHeader 
      title="新建用户组" 
      description="创建新的用户组，用于组织用户结构" 
    />

    <el-card class="form-card">
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
        @submit.prevent="handleSubmit"
      >
        <el-form-item label="组名称" prop="name" required>
          <el-input
            v-model="form.name"
            placeholder="请输入用户组名称"
            maxlength="50"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="父组" prop="parentId">
          <el-tree-select
            v-model="form.parentId"
            :data="groupTree"
            :props="{ value: 'id', label: 'name', children: 'children' }"
            placeholder="请选择父组（可选）"
            clearable
            check-strictly
            :render-after-expand="false"
          />
        </el-form-item>

        <el-form-item label="组描述" prop="description">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="3"
            placeholder="请输入用户组描述（可选）"
            maxlength="200"
            show-word-limit
          />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleSubmit" :loading="loading">
            创建用户组
          </el-button>
          <el-button @click="handleCancel">取消</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, type FormInstance } from 'element-plus'
import { PageHeader } from '@/components'
import { createGroup, getGroups } from '@/api/group'
import type { NewGroupRequest, Group } from '@/types'

const router = useRouter()
const formRef = ref<FormInstance>()
const loading = ref(false)
const groupTree = ref<Group[]>([])

const form = reactive<NewGroupRequest>({
  name: '',
  parentId: '',
  description: ''
})

const rules = {
  name: [
    { required: true, message: '请输入用户组名称', trigger: 'blur' },
    { min: 2, max: 50, message: '用户组名称长度在 2 到 50 个字符', trigger: 'blur' }
  ]
}

// 获取用户组树形数据
const fetchGroups = async () => {
  try {
    const response = await getGroups()
    groupTree.value = response.data || []
  } catch (error) {
    console.error('获取用户组失败:', error)
  }
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()
    loading.value = true

    await createGroup(form)
    
    ElMessage.success('用户组创建成功')
    router.push('/groups')
  } catch (error: any) {
    if (error.fields) {
      // 表单验证错误
      return
    }
    console.error('创建用户组失败:', error)
    ElMessage.error(error.message || '创建用户组失败')
  } finally {
    loading.value = false
  }
}

// 取消操作
const handleCancel = () => {
  router.back()
}

onMounted(() => {
  fetchGroups()
})
</script>

<style scoped lang="scss">
.create-group {
  .form-card {
    margin-top: 16px;
    
    .el-form {
      max-width: 600px;
    }
  }
}
</style> 