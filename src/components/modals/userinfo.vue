<template>
  <el-dialog
    v-model="dialogVisible"
    width="500px"
    class="userdialog"
    :show-close="true"
    custom-class="userdialog"
  >
    <template #header>
      <div class="dialog-header-bg">
        <span class="text-[18px] font-bold flex justify-center text-[#333]">个人信息</span>
      </div>
    </template>

    <div class="flex justify-center items-center pt-10 px-8">
      <div class="flex gap-3 items-start">
        <div class="relative shrink-0">
          <el-avatar :size="60" :src="userInfo.avatar" class="bg-[#317DFE]">
            <el-icon :size="30" class="text-white">
              <User />
            </el-icon>
          </el-avatar>
          <div class="absolute bottom-1 right-1 translate-x-1 translate-y-1">
            <img class="w-5 h-5" src="/src/assets/images/Camera.png" />
          </div>
        </div>

        <div class="pt-1">
          <div class="mb-5">
            <p class="text-[20px] font-bold text-gray-900 leading-tight mb-1">
              {{ userInfo.realName || userInfo.nickname || '-' }}
            </p>
            <p class="text-[14px] text-gray-500">{{ userInfo.bodyInfo?.name || userInfo.customer?.name || '-' }}</p>
          </div>

          <div class="flex flex-col gap-3">
            <div class="flex items-center gap-2 text-gray-600">
              <img src="/src/assets/images/telephone1.png" class="w-5 h-5 shrink-0" />
              <span class="text-[15px] font-medium">{{ maskPhone(userInfo.account) }}</span>
            </div>
            <div class="flex items-center gap-2 text-gray-600">
              <img src="/src/assets/images/telephone2.png" class="w-5 h-5 shrink-0" />
              <span class="text-[15px]">{{ userInfo.bodyInfo?.address || userInfo.customer?.companyAddress || '-' }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="px-8 pb-8 pt-6 flex justify-center">
      <el-button type="primary" class="min-w-[160px]" :disabled="loading" @click="editVisible = true">
        修改个人信息
      </el-button>
    </div>

    <Loading :visible="loading" />
    <ProfileEdit v-model:visible="editVisible" :user-info="userInfo" @success="handleEditSuccess" />
  </el-dialog>
</template>

<script lang="ts" setup>
import Loading from '@/components/modals/loading.vue'
import ProfileEdit from '@/pages/profile-edit/index.vue'
import { getUserInfo } from '@/api/user'
import { useUserStore, type UserInfo } from '@/stores/user'
import { User } from '@element-plus/icons-vue'
import { computed, ref, watch } from 'vue'

interface CustomerInfo {
  businessUserId?: string
  contactMan?: string
  contactPhone?: string
  contactEmail?: string
  companyAddress?: string
  customerNo?: string
  customerType?: string
  creditCode?: string
  id?: string | number
  legalPerson?: string
  cardNo?: string
  license?: string
  name?: string
  subName?: string
  corporateAccount?: string
  corporateBank?: string
  uid?: number
  nickname?: string
  realName?: string
  userRose?: string
  type?: string
}

interface BodyInfo {
  id?: number | string
  name?: string
  address?: string
  userRose?: string
  type?: string
  personName?: string
  personPhone?: string
  personNumber?: string
  relation?: string
  contactMan?: string
  contactPhone?: string
  provinceId?: string
  province?: string
  cityId?: string
  city?: string
  areaId?: string
  area?: string
  mergerName?: string
}

interface UserInfoResponse {
  uid: number
  avatar?: string
  nickname?: string
  realName?: string
  account?: string
  email?: string
  isCredit?: boolean
  bodyId?: string | number
  userRose?: string
  customer?: CustomerInfo
  bodyInfo?: BodyInfo
}

interface ApiResponse {
  success: boolean
  code: string | number
  message: string
  data: UserInfoResponse
}

const props = defineProps<{
  visible: boolean
}>()

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
}>()

const loading = ref(false)
const editVisible = ref(false)
const userStore = useUserStore()
const userInfo = ref<Partial<UserInfoResponse>>({})

const dialogVisible = computed({
  get: () => props.visible,
  set: (val) => emit('update:visible', val),
})

const maskPhone = (phone: string | undefined) => {
  if (!phone) return '-'
  return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
}

const getUserInfoData = async () => {
  loading.value = true
  try {
    const res = (await getUserInfo()) as ApiResponse
    if (res.success && res.data) {
      userInfo.value = res.data

      const storeInfo: UserInfo = {
        ...userStore.userInfo,
        uid: res.data.uid,
        avatar: res.data.avatar,
        nickname: res.data.nickname,
        realName: res.data.realName,
        account: res.data.account,
        isCredit: res.data.isCredit,
        bodyId: res.data.bodyId,
        bodyInfo: res.data.bodyInfo,
      }
      userStore.setUserInfo(storeInfo)
    }
  } finally {
    loading.value = false
  }
}

const handleEditSuccess = () => {
  getUserInfoData()
}

watch(
  () => props.visible,
  (val) => {
    if (val) {
      getUserInfoData()
      return
    }
    editVisible.value = false
  },
)
</script>

<style scoped>
:deep(.el-dialog__header) {
  padding: 0;
  margin: 0;
}

:deep(.el-dialog__body) {
  padding: 0;
}
</style>

<style>
.userdialog.el-dialog {
  @apply overflow-hidden !p-0 !rounded-[10px] shadow-xl;
}

.userdialog .el-dialog__header {
  @apply !p-0 !m-0;
}

.userdialog .el-dialog__headerbtn .el-dialog__close {
  @apply !text-gray-400 !text-xl font-bold;
}

.userdialog .dialog-header-bg {
  background-image: url('/src/assets/images/titlebg.png');
  @apply bg-cover bg-center bg-no-repeat h-[60px] flex items-center justify-center relative;
}
</style>
