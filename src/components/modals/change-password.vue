<template>
    <el-dialog v-model="dialogVisible" width="500px" class="userdialog" :show-close="true" custom-class="userdialog">
        <template #header>
            <div class="dialog-header-bg">
                <span class="text-[18px] font-bold flex justify-center text-[#333]">修改密码</span>
            </div>
        </template>

        <div class="py-8 px-10">
            <el-form ref="formRef" :model="passwordForm" :rules="rules" label-width="90px" label-position="left">
                <el-form-item label="原密码" prop="oldPassword">
                    <el-input v-model="passwordForm.oldPassword" type="password" placeholder="请输入原密码" show-password />
                </el-form-item>
                <el-form-item label="新密码" prop="newPassword">
                    <el-input v-model="passwordForm.newPassword" type="password" placeholder="请输入新密码" show-password />
                </el-form-item>
                <el-form-item label="确认密码" prop="confirmPassword">
                    <el-input v-model="passwordForm.confirmPassword" type="password" placeholder="请再次输入新密码"
                        show-password />
                </el-form-item>
            </el-form>

            <div class="flex justify-end gap-3 mt-6">
                <el-button @click="handleCancel">取消</el-button>
                <el-button type="primary" :loading="loading" @click="handleSubmit">确认</el-button>
            </div>
        </div>
    </el-dialog>
</template>

<script lang="ts" setup>
import { computed, reactive, ref, watch } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage } from 'element-plus'
import { changePassword } from '@/api/user'
import { useUserStore } from '@/stores/user'

interface PasswordForm {
    oldPassword: string
    newPassword: string
    confirmPassword: string
}

interface ApiResponse {
    success: boolean
    code: string
    message: string
}

const props = defineProps<{
    visible: boolean
}>()

const emit = defineEmits<{
    (e: 'update:visible', value: boolean): void
}>()

const userStore = useUserStore()

const dialogVisible = computed({
    get: () => props.visible,
    set: (val) => emit('update:visible', val)
})

const formRef = ref<FormInstance>()
const loading = ref(false)

const passwordForm = reactive<PasswordForm>({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
})

// 确认密码验证器
const validateConfirmPassword = (_rule: unknown, value: string, callback: (error?: Error) => void) => {
    if (value !== passwordForm.newPassword) {
        callback(new Error('两次输入的密码不一致'))
    } else {
        callback()
    }
}

const rules: FormRules = {
    oldPassword: [
        { required: true, message: '请输入原密码', trigger: 'blur' }
    ],
    newPassword: [
        { required: true, message: '请输入新密码', trigger: 'blur' },
        { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
    ],
    confirmPassword: [
        { required: true, message: '请确认新密码', trigger: 'blur' },
        { validator: validateConfirmPassword, trigger: 'blur' }
    ]
}

// 重置表单
const resetForm = () => {
    passwordForm.oldPassword = ''
    passwordForm.newPassword = ''
    passwordForm.confirmPassword = ''
    formRef.value?.clearValidate()
}

// 取消
const handleCancel = () => {
    dialogVisible.value = false
}

// 提交
const handleSubmit = async () => {
    if (!formRef.value) return

    await formRef.value.validate(async (valid) => {
        if (!valid) return

        loading.value = true
        try {

            const res = await changePassword({
                account: userStore.userInfo?.account || '',
                password: passwordForm.newPassword,
                oldPassword: passwordForm.oldPassword
            }) as ApiResponse

            if (res.code === "200") {
                ElMessage.success('密码修改成功')
                dialogVisible.value = false
            } else {
                ElMessage.error(res.message || '密码修改失败')
            }
        } catch (error) {
            console.log("")
        } finally {
            loading.value = false
        }
    })
}

// 监听弹窗关闭时重置表单
watch(() => props.visible, (val) => {
    if (!val) {
        resetForm()
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
