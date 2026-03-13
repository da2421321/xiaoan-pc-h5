<template>
    <div v-if="isVisible" class="loading-overlay" :class="{ 'is-local': isLocal }">
        <div class="loading-card" :class="{ 'loading-card-small': isLocal }">
            <div class="loading-body">
                <div class="loading-content">
                    <div class="loading-track"></div>
                    <div class="loading-circle"></div>
                    <img src="@/assets/images/avatar1.png" alt="loading" class="loading-avatar" />
                </div>
                <p class="loading-text">{{ loadingText }}</p>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useLoadingStore } from '@/stores/loading';
import { storeToRefs } from 'pinia';
import { computed, getCurrentInstance } from 'vue';

interface Props {
    visible?: boolean
    text?: string
}

const props = defineProps<Props>()

const loadingStore = useLoadingStore()
const { visible: storeVisible, text: storeText } = storeToRefs(loadingStore)

const instance = getCurrentInstance()
const hasVisibleProp = computed(() => {
    return instance?.vnode.props && 'visible' in instance.vnode.props
})

const isVisible = computed(() => {
    return hasVisibleProp.value ? props.visible : storeVisible.value
})

const loadingText = computed(() => {
    return props.text || storeText.value
})

const isLocal = computed(() => {
    return hasVisibleProp.value
})
</script>

<style scoped>
.loading-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.4);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 9999;
    backdrop-filter: blur(2px);
}

.loading-card {
    background: #fff;
    border-radius: 24px;
    width: 280px;
    height: 280px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.loading-card-small {
    width: 180px;
    height: 180px;
    border-radius: 16px;
}

.loading-body {
    display: flex;
    flex-direction: column;
    align-items: center;
}

.loading-content {
    position: relative;
    width: 140px;
    height: 140px;
    display: flex;
    justify-content: center;
    align-items: center;
    margin-bottom: 24px;
}

.is-local .loading-content {
    width: 100px;
    height: 100px;
    margin-bottom: 16px;
}

.loading-track {
    position: absolute;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    border: 4px solid #f5f5f5;
    box-sizing: border-box;
}

.loading-circle {
    position: absolute;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background: conic-gradient(from 0deg,
            transparent 0%,
            transparent 10%,
            #3b82f6 50%,
            transparent 50%,
            transparent 60%,
            #3b82f6 100%);

    -webkit-mask: radial-gradient(farthest-side, transparent calc(100% - 5px), #000 calc(100% - 5px + 1px));
    mask: radial-gradient(farthest-side, transparent calc(100% - 5px), #000 calc(100% - 5px + 1px));
    animation: spin 1.5s linear infinite;
}

.loading-avatar {
    width: 100px;
    height: 100px;
    border-radius: 50%;
    object-fit: cover;
    z-index: 1;
}

.is-local .loading-avatar {
    width: 60px;
    height: 60px;
}

.loading-text {
    color: #999999;
    text-align: center;
    font-size: 14px;
    font-weight: 400;
    margin: 0;
    letter-spacing: 1px;
}

.is-local .loading-text {
    font-size: 12px;
}

@keyframes spin {
    0% {
        transform: rotate(0deg);
    }

    100% {
        transform: rotate(360deg);
    }
}

.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
</style>
