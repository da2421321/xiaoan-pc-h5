<template>
  <el-dialog v-model="visible" width="700px" :before-close="handleClose" class="category-modal"
    custom-class="category-modal">
    <template #header>
      <div class="dialog-header-bg text-center">
        <span class="text-lg font-bold text-gray-900">选择分类</span>
      </div>
    </template>
    <div class="category-content">
      <!-- 加载状态 -->
      <div v-if="loading" class="loading-container">
        <el-loading :loading="true" />
        <span class="loading-text">加载中...</span>
      </div>

      <!-- 分类网格 -->
      <div v-else-if="categories.length > 0" class="category-grid">
        <div v-for="category in categories" :key="category.id" class="category-item"
          @click="handleCategorySelect(category)">
          <div class="category-icon">
            <img :src="category.icon" />
          </div>
          <div class="category-info">
            <div class="category-title">{{ category.name }}</div>
            <div class="category-subtitle">{{ category.remark }}</div>
          </div>
        </div>
      </div>

      <!-- 无数据状态 -->
      <div v-else class="empty-container">
        <el-empty description="暂无项目分类" />
      </div>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { getProjectList } from '@/api'
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'

interface Category {
  id: string
  name: string
  icon?: string
  subtitle?: string
  remark?: string
}

interface Props {
  modelValue: boolean
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const router = useRouter()
const categories = ref<Category[]>([])
const loading = ref(false)

const visible = ref(false)

// 监听父组件传递的显示状态
watch(
  () => props.modelValue,
  (newVal) => {
    visible.value = newVal
    if (newVal) {
      fetchCategories()
    }
  },
  { immediate: true },
)

// 同步显示状态到父组件
watch(visible, (newVal) => {
  emit('update:modelValue', newVal)
})

// 获取分类数据
const fetchCategories = async () => {
  if (categories.value.length > 0) {
    return
  }

  loading.value = true
  try {
    const res = await getProjectList()
    if (res.code === '00000' && res.data) {
      categories.value = res.data
    }
  } catch (error) {
    console.error('获取项目分类失败:', error)
  } finally {
    loading.value = false
  }
}

// 处理分类选择
const handleCategorySelect = (category: Category) => {
  handleClose()
  router.push({
    path: '/Order',
    query: {
      categoryId: category.id,
    },
  })
}

// 关闭弹窗
const handleClose = () => {
  visible.value = false
}
</script>

<style scoped>
.category-content {
  min-height: 300px;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  gap: 16px;
}

.loading-text {
  color: #666;
  font-size: 14px;
}

.category-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.category-item {
  display: flex;
  align-items: center;
  padding: 30px 20px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.category-item:hover {
  border-color: #317dfe;
  box-shadow: 0 4px 12px rgba(49, 125, 254, 0.15);
  transform: translateY(-2px);
}

.category-icon {
  width: 48px;
  height: 48px;
  margin-right: 10px;
  border-radius: 50%;
  background: #f0f7ff;
  display: flex;
  align-items: center;
  justify-content: center;
}

.category-info {
  display: flex;
  justify-content: center;
  flex-direction: column;
}

.category-title {
  font-size: 14px;
  font-weight: 500;
  color: #333;
  margin-bottom: 4px;
}

.category-subtitle {
  font-size: 12px;
  color: #999;
}

.empty-container {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
}

.dialog-footer {
  text-align: right;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .category-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }

  .category-item {
    padding: 16px;
  }

  .category-icon {
    width: 40px;
    height: 40px;
  }
}
</style>
<style>
.category-modal.el-dialog {
  @apply overflow-hidden !p-0 rounded-[10px];
}

.category-modal .el-dialog__header {
  @apply !p-0 !m-0;
}

.category-modal .el-dialog__body {
  padding: 30px;
  background-color: #F4F6FA;
}

.category-modal .el-dialog__headerbtn {
  @apply !top-4 !right-4 z-10;
}

.category-modal .dialog-header-bg {
  background-image: url('/src/assets/images/createorderbg.png');
  @apply bg-cover bg-top bg-no-repeat py-5 px-6 pb-2.5 m-0;
}
</style>
