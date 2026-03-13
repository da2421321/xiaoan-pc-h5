<template>
    <el-dialog v-model="dialogVisible" width="500px" class="cost-question-dialog" :show-close="true"
        :close-on-click-modal="false" destroy-on-close>
        <template #header>
            <div class="dialog-header-bg">
                <span class="text-[18px] font-bold flex justify-center text-[#333]">费用疑问反馈</span>
            </div>
        </template>

        <div class="px-6 py-8">
            <div class="mb-2 text-[14px] text-gray-600">请输入费用疑问原因：</div>
            <el-input v-model="reason" type="textarea" :rows="4" placeholder="请输入费用疑问原因" maxlength="500" show-word-limit
                class="reason-textarea" />
        </div>

        <template #footer>
            <div class="flex justify-center gap-4 pb-4">
                <el-button @click="handleCancel" class="!px-8 !h-10 !rounded-[8px]">
                    取消
                </el-button>
                <el-button type="primary" :disabled="isSubmitDisabled" :loading="loading" @click="handleSubmit"
                    class="!bg-blue-500 !border-blue-500 !px-8 !h-10 !rounded-[8px]">
                    提交
                </el-button>
            </div>
        </template>
    </el-dialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { getReconciliationSuspicious } from '@/api/reconciliation'

const props = defineProps<{
    visible: boolean
    reconciliationId?: string
}>()

const emit = defineEmits<{
    (e: 'update:visible', value: boolean): void
    (e: 'confirm'): void
}>()

const reason = ref('')
const loading = ref(false)

const dialogVisible = computed({
    get: () => props.visible,
    set: (val) => emit('update:visible', val)
})

// 空输入时禁用提交按钮
const isSubmitDisabled = computed(() => {
    return !reason.value.trim()
})

const handleCancel = () => {
    emit('update:visible', false)
}

const handleSubmit = async () => {
    if (isSubmitDisabled.value) return

    loading.value = true
    try {
        await getReconciliationSuspicious({
            id: props.reconciliationId,
            message: reason.value.trim()
        })
        ElMessage.success('已提交费用疑问反馈')
        emit('confirm')
        emit('update:visible', false)
    } catch (error) {
        console.error('提交失败:', error)
        ElMessage.error('提交失败，请重试')
    } finally {
        loading.value = false
    }
}

// 弹窗关闭时重置表单
watch(() => props.visible, (val) => {
    if (!val) {
        reason.value = ''
    }
})
</script>

<style>
.cost-question-dialog.el-dialog {
    @apply overflow-hidden !p-0 !rounded-[10px] shadow-xl;
}

.cost-question-dialog .el-dialog__header {
    @apply !p-0 !m-0;
}

.cost-question-dialog .el-dialog__headerbtn .el-dialog__close {
    @apply !text-gray-400 !text-xl font-bold;
}

.cost-question-dialog .dialog-header-bg {
    background-image: url('/src/assets/images/titlebg.png');
    @apply bg-cover bg-center bg-no-repeat h-[60px] flex items-center justify-center relative;
}

.cost-question-dialog .el-dialog__body {
    @apply !p-0;
    box-shadow: none !important;
}

.cost-question-dialog .el-dialog__footer {
    @apply !p-0;
    box-shadow: none !important;
    border-top: none !important;
}

.cost-question-dialog .reason-textarea .el-textarea__inner {
    @apply !rounded-[8px] !border-gray-200;
}
</style>
