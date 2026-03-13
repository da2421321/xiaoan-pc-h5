<template>
  <el-dialog v-model="dialogVisible" width="700px" :show-close="true" class="logistics-dialog !rounded-[14px]"
    custom-class="logistics-dialog">
    <template #header>
      <div class="dialog-header-bg text-center">
        <span class="text-lg font-bold text-gray-900">交付信息</span>
      </div>
    </template>

    <div class="p-6" v-loading="loading">
      <!-- 交付内容 -->
      <div class="mb-6">
        <div class="text-[14px] font-bold text-gray-900 mb-3">交付内容</div>
        <div class="rounded-lg p-4 text-gray-600 text-sm min-h-[60px]" style="border: 1px solid rgba(205, 212, 218, 1)">
          {{ deliveryData?.showCommitDesc || '暂无交付内容' }}
        </div>
      </div>

      <!-- 交付附件 -->
      <div>
        <div class="text-[14px] font-bold text-gray-900 mb-3">交付附件</div>
        <div v-if="hasVouchers" class="grid grid-cols-3 gap-4">
          <!-- 图片列表 -->
          <div v-for="(img, index) in imageList" :key="'img-' + index"
            class="aspect-square rounded-lg overflow-hidden cursor-pointer" @click="handlePreviewImage(index)">
            <el-image :src="img" fit="cover" class="w-full h-full" :preview-src-list="imageList" :initial-index="index"
              hide-on-click-modal>
              <template #error>
                <div class="w-full h-full bg-gray-200 flex items-center justify-center">
                  <el-icon class="text-gray-400 text-2xl">
                    <Picture />
                  </el-icon>
                </div>
              </template>
            </el-image>
          </div>
          <!-- 视频列表 -->
          <div v-for="(video, index) in videoList" :key="'video-' + index"
            class="aspect-square rounded-lg overflow-hidden cursor-pointer relative bg-gray-900"
            @click="handlePlayVideo(video)">
            <video :src="video" class="w-full h-full object-cover" muted></video>
            <div class="absolute inset-0 flex items-center justify-center bg-black/30">
              <div class="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center">
                <el-icon class="text-gray-800 text-xl">
                  <VideoPlay />
                </el-icon>
              </div>
            </div>
          </div>
        </div>
        <div v-else class="text-gray-400 text-sm">暂无交付附件</div>
      </div>
    </div>
  </el-dialog>

  <!-- 视频播放弹窗 -->
  <el-dialog v-model="showVideoPlayer" width="800px" :show-close="true" destroy-on-close>
    <template #header>
      <span class="text-lg font-bold">视频播放</span>
    </template>
    <div class="flex justify-center">
      <video :src="currentVideoUrl" controls autoplay class="max-w-full max-h-[500px]"></video>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { Picture, VideoPlay } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { computed, ref, watch } from 'vue'
import { getOrderDelivery } from '@/api'

// 附件项
interface AttachmentVo {
  id?: string
  workOrderId?: string
  orderId?: string | null
  fileName?: string
  fileUrl?: string
  fileType?: number // 1=视频 2=图片
  source?: number // 1=用户上传 2=后台补充
  createdDate?: string
  createBy?: string
  remark?: string | null
  showType?: number
}

// API响应数据结构
interface DeliveryData {
  id: string
  orderId: string
  showCommitDesc: string // 交付内容
  attachmentVoList: AttachmentVo[] // 交付附件
}

interface ApiResponse {
  success: boolean
  code: string
  message: string
  data: DeliveryData
}

interface Props {
  visible: boolean
  orderId?: number | string
}

const props = withDefaults(defineProps<Props>(), {
  visible: false,
  orderId: '',
})

const emit = defineEmits(['update:visible'])

const dialogVisible = ref(props.visible)
const loading = ref(false)
const deliveryData = ref<DeliveryData | null>(null)
const showVideoPlayer = ref(false)
const currentVideoUrl = ref('')

// 从attachmentVoList中筛选图片 (fileType=2)
const imageList = computed(() => {
  return deliveryData.value?.attachmentVoList
    ?.filter(item => item.fileType === 2 && item.fileUrl)
    .map(item => item.fileUrl!) || []
})

// 从attachmentVoList中筛选视频 (fileType=1)
const videoList = computed(() => {
  return deliveryData.value?.attachmentVoList
    ?.filter(item => item.fileType === 1 && item.fileUrl)
    .map(item => item.fileUrl!) || []
})

const hasVouchers = computed(() => imageList.value.length > 0 || videoList.value.length > 0)

watch(
  () => props.visible,
  (newValue: boolean) => {
    dialogVisible.value = newValue
    if (newValue && props.orderId) {
      loadDeliveryData()
    }
  },
)

watch(dialogVisible, (newValue: boolean) => {
  emit('update:visible', newValue)
})

const loadDeliveryData = async () => {
  if (!props.orderId) return

  loading.value = true
  try {
    const res = await getOrderDelivery(String(props.orderId)) as ApiResponse
    if (res.code === '00000') {
      deliveryData.value = res.data
    } else {
      ElMessage.error(res.message || '获取交付信息失败')
    }
  } catch (error) {
    console.error('加载交付信息失败:', error)
    ElMessage.error('获取交付信息失败')
  } finally {
    loading.value = false
  }
}

const handlePreviewImage = (index: number) => {
  // el-image 组件自带预览功能，点击会自动触发
  console.log('Preview image at index:', index)
}

const handlePlayVideo = (url: string) => {
  currentVideoUrl.value = url
  showVideoPlayer.value = true
}
</script>

<style>
.logistics-dialog.el-dialog {
  @apply overflow-hidden !p-0;
}

.logistics-dialog .el-dialog__header {
  @apply !p-0 !m-0;
}

.logistics-dialog .el-dialog__headerbtn {
  @apply !top-4 !right-4 z-10;
}

.logistics-dialog .dialog-header-bg {
  background-image: url('/src/assets/images/titlebg.png');
  @apply bg-cover bg-top bg-no-repeat py-5 px-6 pb-2.5 m-0;
}
</style>
