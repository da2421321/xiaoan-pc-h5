<template>
    <el-dialog v-model="dialogVisible" width="500px" class="userdialog" :show-close="true" custom-class="userdialog">
        <template #header>
            <div class="dialog-header-bg">
                <span class="text-[18px] font-bold flex justify-center text-[#333]">个人信息</span>
            </div>
        </template>

        <!-- 头像和用户信息 -->
        <div class="flex justify-center items-center py-10 px-8">
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
                        <p class="text-[20px] font-bold text-gray-900 leading-tight mb-1">{{ userInfo.realName ||
                            userInfo.nickname }}</p>
                        <p class="text-[14px] text-gray-500">{{ userInfo.bodyInfo?.name || '-' }}</p>
                    </div>

                    <div class="flex flex-col gap-3">
                        <div class="flex items-center gap-2 text-gray-600">
                            <img src="/src/assets/images/telephone1.png" class="w-5 h-5 shrink-0" />
                            <span class="text-[15px] font-medium">{{ maskPhone(userInfo.account) }}</span>
                        </div>
                        <div class="flex items-center gap-2 text-gray-600">
                            <img src="/src/assets/images/telephone2.png" class="w-5 h-5 shrink-0" />
                            <span class="text-[15px]">{{ userInfo.bodyInfo?.address || '-' }}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <Loading :visible="loading" />
    </el-dialog>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from 'vue'
import { User, Phone, Message, CreditCard, Camera } from '@element-plus/icons-vue'
import { getUserInfo } from '@/api/user'
import { useUserStore, type UserInfo } from '@/stores/user'
import Loading from '@/components/modals/loading.vue'
// 客户信息接口
interface Customer {
    businessUserId: string
    contactMan: string
    contactPhone: string
    createTime: string
    customerNo: string
    customerType: string
    deleted: number
    id: string
    isApply: number
    levelFlag: string
    merchantNo: string
    name: string
    settlementType: string
    specialContact: string
    subName: string
    techniqueType: string
    techniqueUserId: string
    threshold: number
    type: string
    uid: number
    isCredit: boolean
    isPromoter: boolean
    lastIp: string
    lastLoginTime: string
    nickname: string
    realName: string
    skillFlag: number
    subscribe: boolean
    updateTime: string
    userRose: string
    userType: string
}
// 用户信息接口类型
interface UserInfoResponse {
    uid: number
    avatar: string
    nickname: string
    realName: string
    account: string
    isCredit: boolean
    customer?: Customer
    bodyInfo?: {
        name: string
        address: string
    }
    wallet?: {
        balance: number
        creditLimit: number
        usedCredit: number
    }
}

interface ApiResponse {
    success: boolean
    code: string
    message: string
    data: UserInfoResponse
}

const props = defineProps<{
    visible: boolean
}>()

const loading = ref(false)

const emit = defineEmits<{
    (e: 'update:visible', value: boolean): void
}>()

const dialogVisible = computed({
    get: () => props.visible,
    set: (val) => emit('update:visible', val)
})

const userStore = useUserStore()
const userInfo = ref<Partial<UserInfoResponse>>({})

// 手机号脱敏
const maskPhone = (phone: string | undefined) => {
    if (!phone) return '-'
    return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
}

// 获取用户信息
const getUserInfoData = async () => {
    loading.value = true
    const res = await getUserInfo() as ApiResponse
    if (res.success && res.data) {
        userInfo.value = res.data

        const storeInfo: UserInfo = {
            ...userStore.userInfo, // 保留原有信息（如 isAdmin）
            uid: res.data.uid,
            avatar: res.data.avatar,
            nickname: res.data.nickname,
            realName: res.data.realName,
            account: res.data.account,
            isCredit: res.data.isCredit,
            bodyId: res.data.bodyId,
            bodyInfo: res.data.bodyInfo
        }
        userStore.setUserInfo(storeInfo)
    }
    loading.value = false
}

// 监听弹窗打开时获取数据
watch(() => props.visible, (val) => {
    if (val) {
        getUserInfoData()
    }
})

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