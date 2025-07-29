<template>
  <div class="edit-group">
    <PageHeader 
      title="编辑用户组" 
      description="修改用户组信息" 
    />

    <el-card class="form-card" v-loading="pageLoading">
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
            保存修改
          </el-button>
          <el-button @click="handleCancel">取消</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, type FormInstance } from 'element-plus'
import { PageHeader } from '@/components'
import { getGroup, getGroups, renameGroup } from '@/api/group'
import type { Group, RenameGroupRequest } from '@/types'

const router = useRouter()
const route = useRoute()
const formRef = ref<FormInstance>()
const loading = ref(false)
const pageLoading = ref(true)
const groupTree = ref<Group[]>([])

const groupId = route.params.id as string

const form = reactive<RenameGroupRequest>({
  id: groupId,
  name: '',
  description: ''
})

const rules = {
  name: [
    { required: true, message: '请输入用户组名称', trigger: 'blur' },
    { min: 2, max: 50, message: '用户组名称长度在 2 到 50 个字符', trigger: 'blur' }
  ]
}

// 获取用户组详情
const fetchGroupDetail = async () => {
  try {
    const response = await getGroup(groupId)
    const group = response.data
    
    form.name = group.name
    form.description = group.description || ''
  } catch (error: any) {
    console.error('获取用户组详情失败:', error)
    ElMessage.error('获取用户组详情失败')
    router.push('/groups')
  }
}

// 获取用户组树形数据
const fetchGroups = async () => {
  try {
    const response = await getGroups()
    // 过滤掉当前组及其子组，避免循环引用
    groupTree.value = filterCurrentGroup(response.data || [], groupId)
  } catch (error) {
    console.error('获取用户组失败:', error)
  }
}

// 过滤掉当前组及其子组
const filterCurrentGroup = (groups: Group[], currentId: string): Group[] => {
  return groups
    .filter(group => group.id !== currentId)
    .map(group => ({
      ...group,
      children: group.children ? filterCurrentGroup(group.children, currentId) : []
    }))
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()
    loading.value = true

    await renameGroup(form)
    
    ElMessage.success('用户组修改成功')
    router.push('/groups')
  } catch (error: any) {
    if (error.fields) {
      // 表单验证错误
      return
    }
    console.error('修改用户组失败:', error)
    ElMessage.error(error.message || '修改用户组失败')
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
    await Promise.all([
      fetchGroupDetail(),
      fetchGroups()
    ])
  } finally {
    pageLoading.value = false
  }
})
</script>

<style scoped lang="scss">
.edit-group {
  .form-card {
    margin-top: 16px;
    
    .el-form {
      max-width: 600px;
    }
  }
}
</style> 