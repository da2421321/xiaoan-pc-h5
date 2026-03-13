<template>
  <footer class="bg-[#fff] border-t border-gray-200">
    <!-- 主要内容区域 -->
    <div class="max-w-7xl mx-auto px-6 py-10">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
        <!-- 客服热线 -->
        <div class="space-y-3">
          <div class="flex items-center gap-2 text-gray-600">
            <el-icon :size="16">
              <Phone />
            </el-icon>
            <span class="text-sm">客服热线</span>
          </div>
          <div class="text-2xl font-semibold text-[#317DFE]">13544135130</div>
          <div class="text-sm text-gray-500">工作时间：9:00-18:00</div>
        </div>

        <!-- 了解小安 -->
        <div class="space-y-3">
          <div class="text-base font-medium text-gray-800">了解小安</div>
          <ul class="space-y-2">
            <li>
              <a href="javascript:;" class="text-sm text-gray-500 hover:text-[#317DFE] transition-colors">服务简介</a>
            </li>
            <li>
              <a href="javascript:;" class="text-sm text-gray-500 hover:text-[#317DFE] transition-colors">合作伙伴</a>
            </li>
            <li>
              <a href="javascript:;" class="text-sm text-gray-500 hover:text-[#317DFE] transition-colors">新闻动态</a>
            </li>
            <li>
              <a href="javascript:;" class="text-sm text-gray-500 hover:text-[#317DFE] transition-colors">关于我们</a>
            </li>
          </ul>
        </div>

        <!-- 快速下单 -->
        <div class="space-y-3">
          <div class="text-base font-medium text-gray-800">快速下单</div>
          <ul class="space-y-2" v-if="!loading && categories.length > 0">
            <li v-for="category in categories.slice(0, 5)" :key="category.id">
              <a href="javascript:;" class="text-sm text-gray-500 hover:text-[#317DFE] transition-colors"
                @click="navigateToOrder(category)">{{ category.title }}</a>
            </li>
            <li>
              <a href="javascript:;" class="text-sm text-gray-500 hover:text-[#317DFE] transition-colors"
                @click="router.push('/Order')">查看全部</a>
            </li>
          </ul>
          <div v-else-if="loading" class="text-sm text-gray-400">加载中...</div>
          <div v-else class="text-sm text-gray-400">暂无分类数据</div>
        </div>

        <!-- 二维码区域 -->
        <div class="flex flex-col items-center space-y-2">
          <div
            class="w-28 h-28 bg-white border border-gray-200 rounded-lg p-2 flex items-center justify-center overflow-hidden">
            <!-- 如果有二维码图片，替换下面的占位区域 -->
            <div class="w-full h-full bg-gray-50 flex items-center justify-center">
              <div class="text-center">
                <el-icon :size="32" class="text-gray-300">
                  <Connection />
                </el-icon>
                <div class="text-xs text-gray-400 mt-1">二维码</div>
              </div>
            </div>
          </div>
          <div class="text-xs text-gray-500 text-center">扫描关注公众号快捷下单</div>
        </div>
      </div>
    </div>

    <!-- 底部版权信息 -->
    <div class="border-t border-gray-200 bg-white">
      <div class="max-w-7xl mx-auto px-6 py-4">
        <div class="flex flex-col md:flex-row items-center justify-center gap-2 text-xs text-gray-400">
          <span>Copyright © 2016-2025 All Rights Reserved</span>
          <span class="hidden md:inline">公司名称：深圳小安网络信息技术有限公司</span>
        </div>
        <div class="flex flex-col md:flex-row items-center justify-center gap-2 mt-2 text-xs text-gray-400">
          <div class="flex items-center gap-1">
            <el-icon :size="12">
              <Location />
            </el-icon>
            <span>粤公网安备44030702001662号</span>
          </div>
          <span>粤ICP备15095348号-1</span>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { getProjectList } from '@/api'
import { Connection, Location, Phone } from '@element-plus/icons-vue'
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

defineOptions({
  name: 'FooterComponent',
})

interface Category {
  icon: string
  title: string
  subtitle: string
  id: string
}

interface ProjectItem {
  icon: string
  name: string
  subtitle?: string
  id: string
}

const router = useRouter()
const categories = ref<Category[]>([])
const loading = ref(true)

// 获取项目分类数据
const fetchCategories = async () => {
  try {
    loading.value = true
    const res = await getProjectList()
    if (res.code === '00000') {
      categories.value = res.data.map((item: ProjectItem) => {
        return {
          icon: item.icon,
          title: item.name,
          subtitle: item.subtitle || '',
          id: item.id,
        }
      })
    }
  } catch (error) {
    console.error('获取项目分类失败:', error)
  } finally {
    loading.value = false
  }
}

// 导航到订单页面并选择分类
const navigateToOrder = (category: Category) => {
  router.push({
    path: '/Order',
    query: {
      categoryId: category.id,
    },
  })
}

onMounted(() => {
  fetchCategories()
})
</script>

<style scoped>
/* 使用 Tailwind 已涵盖大部分样式，此处仅作补充 */
</style>
