<template>
  <div class="page-header">
    <div class="header-content">
      <div class="header-left">
        <h1 class="title">{{ title }}</h1>
        <p v-if="description" class="description">{{ description }}</p>
      </div>
      
      <div v-if="$slots.extra" class="header-right">
        <slot name="extra" />
      </div>
    </div>
    
    <div v-if="showBreadcrumb" class="breadcrumb-wrapper">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item 
          v-for="item in breadcrumbItems" 
          :key="item.path"
          :to="item.path ? { path: item.path } : undefined"
        >
          {{ item.title }}
        </el-breadcrumb-item>
      </el-breadcrumb>
    </div>
  </div>
</template>

<script setup lang="ts">
interface BreadcrumbItem {
  title: string
  path?: string
}

interface Props {
  title: string
  description?: string
  showBreadcrumb?: boolean
  breadcrumbItems?: BreadcrumbItem[]
}

withDefaults(defineProps<Props>(), {
  showBreadcrumb: false,
  breadcrumbItems: () => [],
})
</script>

<style lang="scss" scoped>
.page-header {
  margin-bottom: 24px;
  
  .header-content {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 16px;
    
    .header-left {
      flex: 1;
      
      .title {
        margin: 0 0 8px 0;
        color: #333;
        font-size: 24px;
        font-weight: 600;
        line-height: 1.2;
      }
      
      .description {
        margin: 0;
        color: #666;
        font-size: 14px;
        line-height: 1.4;
      }
    }
    
    .header-right {
      margin-left: 24px;
    }
  }
  
  .breadcrumb-wrapper {
    padding-top: 16px;
    border-top: 1px solid #f0f0f0;
  }
}

// 响应式设计
@media (max-width: 768px) {
  .page-header {
    .header-content {
      flex-direction: column;
      align-items: flex-start;
      
      .header-right {
        margin-left: 0;
        margin-top: 16px;
        width: 100%;
      }
    }
    
    .title {
      font-size: 20px !important;
    }
  }
}
</style> 