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
        <div
          class="relative shrink-0 avatar-edit-trigger"
          :class="{ 'is-uploading': avatarUploading }"
          @click="openAvatarPicker"
        >
          <input
            ref="avatarInputRef"
            type="file"
            accept=".jpg,.jpeg,.png,.webp"
            class="hidden-input"
            @change="handleAvatarSelect"
          />
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
import { uploadFileByUnToken } from '@/api/common'
import Loading from '@/components/modals/loading.vue'
import ProfileEdit from '@/pages/profile-edit/index.vue'
import { editMemberProfile, getUserInfo } from '@/api/user'
import { useUserStore, type UserInfo } from '@/stores/user'
import { User } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
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
  success?: boolean
  code?: string | number
  message?: string
  data?: UserInfoResponse
}

const props = defineProps<{
  visible: boolean
}>()

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
}>()

const loading = ref(false)
const avatarUploading = ref(false)
const editVisible = ref(false)
const userStore = useUserStore()
const userInfo = ref<Partial<UserInfoResponse>>({})
const avatarInputRef = ref<HTMLInputElement | null>(null)

const dialogVisible = computed({
  get: () => props.visible,
  set: (val) => emit('update:visible', val),
})

const maskPhone = (phone: string | undefined) => {
  if (!phone) return '-'
  return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
}

const isRequestSuccess = (res: ApiResponse) => {
  return (
    res?.success === true ||
    res?.code === 0 ||
    res?.code === '0' ||
    res?.code === '00000' ||
    res?.code === 200 ||
    res?.code === '200'
  )
}

const parseOptionalNumber = (value: unknown) => {
  if (value === undefined || value === null || value === '') return undefined
  const parsed = Number(value)
  return Number.isNaN(parsed) ? undefined : parsed
}

const getUserInfoData = async () => {
  loading.value = true
  try {
    const res = (await getUserInfo()) as ApiResponse
    if (isRequestSuccess(res) && res.data) {
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

const openAvatarPicker = () => {
  if (loading.value || avatarUploading.value) return
  avatarInputRef.value?.click()
}

const uploadAvatarFile = async (file: File) => {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('secretFlag', 'N')
  formData.append('fileLocation', '1')

  const uploadRes = await uploadFileByUnToken(formData)
  const fileUrl = (uploadRes as { data?: { fileUrl?: string } })?.data?.fileUrl || ''
  if (!fileUrl) {
    throw new Error('头像上传失败，请重试')
  }
  return fileUrl
}

const updateAvatar = async (avatarUrl: string) => {
  const source = userInfo.value || {}
  const userRose = source.userRose || source.customer?.userRose || source.bodyInfo?.userRose || '0'
  const hasBodyInfo = Boolean(source.bodyInfo || source.bodyId)
  const bodyPayload = hasBodyInfo
    ? {
        id: parseOptionalNumber(source.bodyInfo?.id || source.bodyId),
        userRose,
        type: source.bodyInfo?.type || '1',
        name: source.bodyInfo?.name || source.customer?.name || '',
        personName: source.bodyInfo?.personName || source.customer?.legalPerson || source.realName || '',
        personPhone: source.bodyInfo?.personPhone || source.customer?.contactPhone || source.account || '',
        personNumber: source.bodyInfo?.personNumber || '',
        relation: source.bodyInfo?.relation || '',
        contactMan: source.bodyInfo?.contactMan || '',
        contactPhone: source.bodyInfo?.contactPhone || '',
        provinceId: source.bodyInfo?.provinceId || '',
        province: source.bodyInfo?.province || '',
        cityId: source.bodyInfo?.cityId || '',
        city: source.bodyInfo?.city || '',
        areaId: source.bodyInfo?.areaId || '',
        area: source.bodyInfo?.area || '',
        mergerName: source.bodyInfo?.mergerName || '',
        address: source.bodyInfo?.address || source.customer?.companyAddress || '',
      }
    : undefined

  const res = (await editMemberProfile({
    uid: source.uid,
    userRose,
    avatar: avatarUrl,
    personInfo: {
      type: source.customer?.type || '1',
      name: source.customer?.name || source.bodyInfo?.name || '',
      contactMan: source.customer?.contactMan || source.customer?.legalPerson || source.realName || '',
      contactPhone: source.customer?.contactPhone || source.account || '',
      contactEmail: source.customer?.contactEmail || source.email || '',
      subName: source.customer?.subName || '',
      creditCode: source.customer?.creditCode || '',
      legalPerson: source.customer?.legalPerson || source.realName || '',
      cardNo: source.customer?.cardNo || '',
      license: source.customer?.license || '',
      companyAddress: source.customer?.companyAddress || source.bodyInfo?.address || '',
      corporateAccount: source.customer?.corporateAccount || '',
      corporateBank: source.customer?.corporateBank || '',
    },
    body: bodyPayload,
  })) as ApiResponse

  if (!isRequestSuccess(res)) {
    throw new Error(res?.message || '头像更新失败，请重试')
  }
}

const handleAvatarSelect = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  const maxSize = 5 * 1024 * 1024
  const allowTypes = ['image/jpeg', 'image/png', 'image/webp']
  if (!allowTypes.includes(file.type)) {
    ElMessage.warning('仅支持 JPG、PNG、WEBP 格式')
    target.value = ''
    return
  }

  if (file.size > maxSize) {
    ElMessage.warning('头像大小不能超过 5MB')
    target.value = ''
    return
  }

  avatarUploading.value = true
  loading.value = true
  try {
    const avatarUrl = await uploadAvatarFile(file)
    await updateAvatar(avatarUrl)
    userInfo.value = { ...userInfo.value, avatar: avatarUrl }
    userStore.setUserInfo({ ...userStore.userInfo, avatar: avatarUrl })
    ElMessage.success('头像更新成功')
    await getUserInfoData().catch(() => undefined)
  } catch (error) {
    ElMessage.error((error as { message?: string })?.message || '头像更新失败，请稍后重试')
  } finally {
    avatarUploading.value = false
    loading.value = false
    target.value = ''
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
.avatar-edit-trigger {
  cursor: pointer;
}

.avatar-edit-trigger.is-uploading {
  cursor: not-allowed;
  opacity: 0.8;
}

.hidden-input {
  display: none;
}

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
