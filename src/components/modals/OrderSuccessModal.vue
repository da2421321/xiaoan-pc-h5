<template>
    <el-dialog v-model="visible" width="500px" :show-close="false" align-center class="success-modal"
        @update:model-value="handleClose">
        <template #header>
            <div class="dialog-header-bg">
                <div class="success-header">
                    <div class="success-icon">
                        <img src="@/assets/images/success.png" class="w-100px h-100px" alt="success" />
                    </div>
                    <button class="close-icon" @click="handleClose">
                        <el-icon :size="24" color="#999">
                            <Close />
                        </el-icon>
                    </button>
                </div>
            </div>
        </template>
        <div class="success-content">
            <h2 class="success-title">下单成功！</h2>
            <p class="success-message">尊敬的用户:您刚刚创建了订单</p>

            <div class="order-info">
                <div class="info-row">
                    <span class="info-label">服务类目：</span>
                    <span class="info-value">{{ orderInfo.serviceName }}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">订单号：</span>
                    <span class="info-value">{{ orderInfo.orderNo }}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">订单金额：</span>
                    <span class="info-value price">￥{{ orderInfo.amount }}元</span>
                </div>
            </div>

            <div class="contact-tip">
                <span class="text-[14px] text-[rgba(137,139,141,1)]">如果您有任何问题，请拨打客服电话</span>
                <span class="phone-number">13544135130</span>
            </div>
        </div>
        <template #footer>
            <div class="success-footer">
                <el-button class="footer-btn close-btn" @click="handleClose"> 关闭 </el-button>
            </div>
        </template>
    </el-dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface OrderInfo {
    serviceName: string
    orderNo: string
    amount: string
}

interface Props {
    modelValue: boolean
    orderInfo: OrderInfo
}

const props = withDefaults(defineProps<Props>(), {
    modelValue: false,
    orderInfo: () => ({
        serviceName: '',
        orderNo: '',
        amount: '',
    }),
})

const emit = defineEmits<{
    'update:modelValue': [value: boolean]
    consult: []
}>()

const visible = computed({
    get: () => props.modelValue,
    set: (value: boolean) => emit('update:modelValue', value),
})

const handleClose = () => {
    emit('update:modelValue', false)
}
</script>

<style>
.success-modal.el-dialog {
    overflow: hidden !important;
    padding: 0 !important;
    border-radius: 10px !important;
}

.success-modal .el-dialog__header {
    padding: 0 !important;
    margin: 0 !important;
    border: none !important;
    border-bottom: none !important;
}

.success-modal .el-dialog__body {
    padding: 0 40px 20px !important;
}

.success-modal .el-dialog__footer {
    padding: 0 40px 30px !important;
    border: none !important;
    border-top: none !important;
}

.success-modal .dialog-header-bg {
    background-image: url('@/assets/images/titlebg.png');
    background-size: cover;
    background-position: top;
    background-repeat: no-repeat;
    padding: 20px 24px 10px;
    margin: 0;
}
</style>

<style scoped>
.success-header {
    position: relative;
    padding: 20px 0;
    text-align: center;
}

.success-icon {
    display: flex;
    justify-content: center;
    align-items: center;
}

.close-icon {
    position: absolute;
    top: 16px;
    right: 16px;
    background: none;
    border: none;
    cursor: pointer;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s;
}

.close-icon:hover {
    opacity: 0.7;
}

.success-content {
    text-align: center;
}

.success-title {
    font-size: 24px;
    font-weight: 600;
    color: #333;
    margin: 0 0 12px 0;
}

.success-message {
    font-size: 14px;
    color: rgba(49, 55, 69, 1);
    margin: 0 0 30px 0;
}

.order-info {
    border-radius: 8px;
    padding: 10px 20px;
    margin-bottom: 20px;
}

.info-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    font-size: 14px;
}
</style>

<style scoped>
.info-row:last-child {
    margin-bottom: 0;
}

.info-label {
    color: rgba(137, 139, 141, 1);
    font-size: 14px;
    flex-shrink: 0;
}

.info-value {
    color: #333;
    font-weight: 500;
    flex: 1;
    flex-wrap: wrap;
    text-align: right;
}

.info-value.price {
    color: #ff4d4f;
    font-size: 16px;
    font-weight: 600;
}

.contact-tip {
    font-size: 14px;
    color: #666;
    line-height: 1.6;
}

.phone-number {
    color: #1890ff;
    font-weight: 500;
}

.success-footer {
    display: flex;
    gap: 12px;
    justify-content: center;
}

.footer-btn {
    height: 44px;
    font-size: 16px;
    border-radius: 8px;
}

.close-btn {
    background: rgba(49, 125, 254, 1);
    width: 200px;
    border: none;
    color: white;
}

.consult-btn {
    display: flex;
    align-items: center;
    justify-content: center;
}
</style>
