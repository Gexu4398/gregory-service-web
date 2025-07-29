<template>
  <div class="loading-spinner" :class="{ fullscreen }">
    <div class="spinner-wrapper">
      <div class="spinner" :style="{ width: size + 'px', height: size + 'px' }">
        <div class="bounce1"></div>
        <div class="bounce2"></div>
        <div class="bounce3"></div>
      </div>
      <p v-if="text" class="loading-text">{{ text }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  size?: number
  text?: string
  fullscreen?: boolean
}

withDefaults(defineProps<Props>(), {
  size: 40,
  fullscreen: false,
})
</script>

<style lang="scss" scoped>
.loading-spinner {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  
  &.fullscreen {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(255, 255, 255, 0.9);
    z-index: 9999;
  }
  
  .spinner-wrapper {
    text-align: center;
    
    .spinner {
      margin: 0 auto 16px;
      position: relative;
      
      .bounce1, .bounce2, .bounce3 {
        width: 18px;
        height: 18px;
        background-color: #409eff;
        border-radius: 100%;
        display: inline-block;
        animation: sk-bouncedelay 1.4s infinite ease-in-out both;
      }
      
      .bounce1 {
        animation-delay: -0.32s;
      }
      
      .bounce2 {
        animation-delay: -0.16s;
      }
    }
    
    .loading-text {
      margin: 0;
      color: #666;
      font-size: 14px;
    }
  }
}

@keyframes sk-bouncedelay {
  0%, 80%, 100% {
    transform: scale(0);
  }
  40% {
    transform: scale(1.0);
  }
}
</style> 