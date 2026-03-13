<template>
    <el-dialog v-model="visible" :title="title" width="700px" :before-close="handleClose" class="agreement-dialog">
        <div class="agreement-content" v-loading="loading">
            <div v-if="content" class="content-text" v-html="content"></div>
            <div v-else-if="!loading && !content" class="content-text">
                <p class="text-center text-gray-400">暂无协议内容</p>
            </div>
            <!-- 备用静态内容 -->
            <div v-if="false && type === 'user'" class="content-text">
                <h3>用户协议</h3>
                <p>欢迎您使用我们的服务！</p>

                <h4>1. 服务条款的接受</h4>
                <p>
                    在使用本服务之前，请您仔细阅读本协议。您使用本服务即表示您已阅读、理解并同意接受本协议的所有条款和条件。
                </p>

                <h4>2. 服务说明</h4>
                <p>本服务为您提供便捷的在线服务平台，包括但不限于信息浏览、订单管理、消息通知等功能。</p>

                <h4>3. 用户账号</h4>
                <p>3.1 您需要注册一个账号才能使用本服务的部分功能。</p>
                <p>3.2 您应当对您的账号和密码的安全负责，并对通过您的账号进行的所有活动负责。</p>
                <p>3.3 您不得将账号转让、出借或以其他方式提供给第三方使用。</p>

                <h4>4. 用户行为规范</h4>
                <p>4.1 您在使用本服务时应当遵守相关法律法规。</p>
                <p>4.2 您不得利用本服务从事违法违规活动。</p>
                <p>4.3 您应当尊重他人的合法权益。</p>

                <h4>5. 知识产权</h4>
                <p>
                    本服务所涉及的所有内容（包括但不限于文字、图片、音频、视频等）的知识产权归我们或相关权利人所有。
                </p>

                <h4>6. 免责声明</h4>
                <p>6.1 我们将尽力确保服务的稳定性和安全性，但不对服务的中断、延迟或数据丢失承担责任。</p>
                <p>6.2 对于因不可抗力导致的服务中断，我们不承担责任。</p>

                <h4>7. 协议的变更</h4>
                <p>
                    我们保留随时修改本协议的权利。修改后的协议将在网站上公布，您继续使用本服务即表示接受修改后的协议。
                </p>

                <h4>8. 联系我们</h4>
                <p>如您对本协议有任何疑问，请通过平台提供的联系方式与我们联系。</p>
            </div>

            <div v-else-if="type === 'privacy'" class="content-text">
                <h3>隐私协议</h3>
                <p>我们非常重视您的隐私保护。本隐私政策说明我们如何收集、使用、披露和保护您的个人信息。</p>

                <h4>1. 信息收集</h4>
                <p>1.1 我们可能收集的信息包括：</p>
                <p>- 注册信息：手机号码等</p>
                <p>- 使用信息：访问时间、浏览记录等</p>
                <p>- 设备信息：设备型号、操作系统版本等</p>

                <h4>2. 信息使用</h4>
                <p>2.1 我们收集和使用您的个人信息用于以下目的：</p>
                <p>- 提供、维护和改进我们的服务</p>
                <p>- 处理您的订单和请求</p>
                <p>- 向您发送服务相关的通知</p>
                <p>- 进行数据分析以改善用户体验</p>

                <h4>3. 信息共享</h4>
                <p>3.1 除以下情况外，我们不会向第三方共享您的个人信息：</p>
                <p>- 获得您的明确同意</p>
                <p>- 为提供服务所必需的合作伙伴</p>
                <p>- 法律法规要求的情况</p>

                <h4>4. 信息安全</h4>
                <p>我们采用行业标准的安全措施来保护您的个人信息，包括但不限于数据加密、访问控制等。</p>

                <h4>5. Cookie使用</h4>
                <p>我们使用Cookie和类似技术来识别您的身份、记住您的偏好设置，以提供更好的服务体验。</p>

                <h4>6. 未成年人保护</h4>
                <p>
                    我们不会有意收集未满18周岁未成年人的个人信息。如果您是未成年人的监护人，发现我们收集了未成年人的信息，请联系我们。
                </p>

                <h4>7. 您的权利</h4>
                <p>您有权访问、更正、删除您的个人信息，或撤回您的同意。</p>

                <h4>8. 隐私政策的更新</h4>
                <p>我们可能会不时更新本隐私政策。更新后的政策将在网站上公布。</p>

                <h4>9. 联系我们</h4>
                <p>如您对本隐私政策有任何疑问或建议，请通过平台提供的联系方式与我们联系。</p>
            </div>
        </div>

        <template #footer>
            <div class="dialog-footer">
                <el-button type="primary" @click="handleClose">我知道了</el-button>
            </div>
        </template>
    </el-dialog>
</template>

<script lang="ts" setup>
import { getAgreement } from '@/api'
import { ElMessage } from 'element-plus'
import { computed, ref, watch } from 'vue'

interface Props {
    modelValue: boolean
    type: 'user' | 'privacy'
}

const props = defineProps<Props>()
const emit = defineEmits<{
    'update:modelValue': [value: boolean]
}>()

const content = ref('')
const loading = ref(false)

const visible = computed({
    get: () => props.modelValue,
    set: (value: boolean) => emit('update:modelValue', value),
})

const title = computed(() => {
    return props.type === 'user' ? '用户协议' : '隐私协议'
})

// 加载协议内容
const loadAgreement = async () => {
    if (!props.modelValue) return

    loading.value = true
    try {
        const res = await getAgreement({
            pageNo: 1,
            pageSize: 1,
            type: props.type === 'user' ? 4 : 5,
            siteCode: 'zh_CN',
        })
        if (res.code === '00000') {
            content.value = res.data.rows[0].detail || ''
        } else {
            ElMessage.error(res.message || '加载协议失败')
        }
    } catch (error) {
        console.error('加载协议失败:', error)
        ElMessage.error('加载协议失败，请稍后重试')
    } finally {
        loading.value = false
    }
}

// 监听弹窗打开和类型变化
watch(
    () => [props.modelValue, props.type],
    () => {
        if (props.modelValue) {
            loadAgreement()
        }
    },
    { immediate: true },
)

const handleClose = () => {
    visible.value = false
}
</script>

<style scoped>
.agreement-content {
    max-height: 500px;
    overflow-y: auto;
    padding: 0 10px;
}

.content-text {
    color: rgba(34, 34, 34, 1);
    line-height: 1.8;
}

.content-text h3 {
    font-size: 20px;
    font-weight: bold;
    margin-bottom: 20px;
    text-align: center;
    color: rgba(49, 125, 254, 1);
}

.content-text h4 {
    font-size: 16px;
    font-weight: bold;
    margin: 20px 0 10px 0;
    color: rgba(34, 34, 34, 1);
}

.content-text p {
    font-size: 14px;
    margin: 8px 0;
    color: rgba(102, 102, 102, 1);
    text-indent: 0;
}

.dialog-footer {
    text-align: center;
}

:deep(.el-dialog__header) {
    border-bottom: 1px solid rgba(233, 238, 244, 1);
    padding: 20px;
}

:deep(.el-dialog__body) {
    padding: 20px;
}

:deep(.el-dialog__footer) {
    border-top: 1px solid rgba(233, 238, 244, 1);
    padding: 15px 20px;
}

:deep(.el-button--primary) {
    background: rgba(49, 125, 254, 1) !important;
    border-color: rgba(49, 125, 254, 1) !important;
    min-width: 120px;
}

/* 动态内容样式 */
.content-text :deep(h1),
.content-text :deep(h2),
.content-text :deep(h3) {
    font-size: 20px;
    font-weight: bold;
    margin-bottom: 20px;
    text-align: center;
    color: rgba(49, 125, 254, 1);
}

.content-text :deep(h4),
.content-text :deep(h5),
.content-text :deep(h6) {
    font-size: 16px;
    font-weight: bold;
    margin: 20px 0 10px 0;
    color: rgba(34, 34, 34, 1);
}

.content-text :deep(p) {
    font-size: 14px;
    margin: 8px 0;
    color: rgba(102, 102, 102, 1);
    line-height: 1.8;
}

.content-text :deep(ul),
.content-text :deep(ol) {
    margin: 10px 0;
    padding-left: 20px;
}

.content-text :deep(li) {
    font-size: 14px;
    color: rgba(102, 102, 102, 1);
    line-height: 1.8;
    margin: 5px 0;
}
</style>
