<template>
    <el-dialog v-model="dialogVisible" width="630px" :before-close="handleClose">
        <div class="contact-modal">
            <!-- 自定义标题 -->
            <div class="dialog-title">
                联系我们
                <div class="title-underline"></div>
            </div>

            <!-- 联系信息区域 -->
            <div class="contact-info">
                <div class="contact-item">
                    <img src="@/assets/images/adress.png" class="w-[30px] h-[30px] contact-item-icon" />
                    <span class="contact-item-text">深圳市南山区西丽街道丽城社区留仙大道5015号众冠大厦1207</span>
                </div>

                <div class="contact-item">
                    <img src="@/assets/images/phone.png" class="w-[30px] h-[30px] contact-item-icon" />
                    <span class="contact-item-text">18126209770</span>
                </div>

                <div class="contact-item">
                    <img src="@/assets/images/email.png" class="w-[30px] h-[30px] contact-item-icon" />
                    <span class="contact-item-text">baiqing@shenzhenxiaoan.com</span>
                </div>

                <div class="contact-item">
                    <img src="@/assets/images/time.png" class="w-[30px] h-[30px] contact-item-icon" />
                    <span class="contact-item-text">周一至周日 09:00-21:00</span>
                </div>
            </div>

            <!-- 表单区域 -->
            <!-- <el-form
        ref="contactFormRef"
        :model="contactForm"
        :rules="rules"
        label-position="left"
        label-width="100px"
        class="contact-form"
      >
        <el-form-item label="联系人" prop="name">
          <el-input v-model="contactForm.name" placeholder="请输入联系人姓名" clearable />
        </el-form-item>

        <el-form-item label="联系电话" prop="phone">
          <el-input v-model="contactForm.phone" placeholder="请输入取得联系的电话" clearable />
        </el-form-item>

        <el-form-item label="需求内容" prop="content">
          <el-input
            v-model="contactForm.content"
            type="textarea"
            :rows="4"
            placeholder="请详细描述您的需求内容"
            resize="none"
          />
        </el-form-item>
      </el-form> -->
        </div>

        <template #footer>
            <div class="dialog-footer">
                <el-button size="large" @click="dialogVisible = false"
                    class="w-[266px] bg-[rgba(49,125,254,1)] text-white">
                    关闭
                </el-button>
            </div>
        </template>
    </el-dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
    modelValue: boolean
}

const props = withDefaults(defineProps<Props>(), {
    modelValue: false,
})

const emit = defineEmits<{
    'update:modelValue': [value: boolean]
}>()

const dialogVisible = computed({
    get: () => props.modelValue,
    set: (value: boolean) => emit('update:modelValue', value),
})

const handleClose = (done: () => void) => {
    done()
}
</script>

<style scoped>
.contact-modal {
    padding: 20px 50px;
}

.dialog-title {
    font-size: 20px;
    font-weight: 600;
    color: rgba(49, 125, 254, 1);
    margin-bottom: 24px;
    position: relative;
    padding-bottom: 8px;
}

.title-underline {
    position: absolute;
    left: 0;
    bottom: 0;
    width: 80px;
    height: 4px;
    background-color: rgba(49, 125, 254, 1);
}

.contact-info {
    margin-bottom: 10px;
    padding-bottom: 20px;
    border-bottom: 1px solid #f0f0f0;
}

.contact-item {
    display: flex;
    align-items: center;
    margin-bottom: 16px;
    gap: 12px;
}

.contact-item:last-child {
    margin-bottom: 0;
}

.contact-item-icon {
    margin-top: 2px;
    flex-shrink: 0;
}

.contact-item-text {
    color: rgba(85, 85, 85, 1);
    font-size: 15px;
    line-height: 1.6;
    word-break: break-all;
}

.contact-form {
    margin-top: 0;
}

:deep(.el-form-item__label) {
    color: #333;
    font-weight: 500;
    margin-bottom: 0;
    line-height: 40px;
    text-align: right;
    padding-right: 12px;
}

:deep(.el-input__wrapper) {
    padding: 12px 16px;
    background-color: rgba(249, 249, 249, 1);
    border: none;
    box-shadow: none;
}

:deep(.el-input__wrapper:hover),
:deep(.el-input__wrapper.is-focus) {
    border: none;
    box-shadow: none;
}

:deep(.el-input__inner::placeholder) {
    color: rgba(200, 203, 208, 1);
}

:deep(.el-textarea__inner) {
    padding: 12px 16px;
    font-family: inherit;
    background-color: rgba(249, 249, 249, 1);
    border: none;
    box-shadow: none;
}

:deep(.el-textarea__inner:hover),
:deep(.el-textarea__inner:focus) {
    border: none;
    box-shadow: none;
}

:deep(.el-textarea__inner::placeholder) {
    color: rgba(200, 203, 208, 1);
}

.dialog-footer {
    display: flex;
    justify-content: center;
    align-items: center;
}

/* 覆盖按钮 hover 效果 */
:deep(.el-button) {
    border: none !important;
    box-shadow: none !important;
}

:deep(.el-button:hover),
:deep(.el-button:focus) {
    background-color: rgba(49, 125, 254, 1) !important;
    color: white !important;
    border: none !important;
    box-shadow: none !important;
}

:deep(.el-dialog) {
    border-radius: 12px;
}

:deep(.el-dialog__header) {
    display: none;
}

:deep(.el-dialog__body) {
    padding: 24px 24px 20px;
}

:deep(.el-dialog__footer) {
    padding: 0 24px 24px;
}

/* 响应式适配 */
@media (max-width: 768px) {
    :deep(.el-dialog) {
        width: 90% !important;
        margin: 0 5%;
    }
}
</style>
