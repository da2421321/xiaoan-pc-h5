import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { UploadUserFile } from 'element-plus'

// 表单数据接口
interface OrderFormData {
    formData: Record<string, string | number | string[]>
    serviceAddressDisplay: string
    serviceAddressData: {
        contact: string
        phone: string
        province: string
        city: string
        district: string
        detailAddress: string
    } | null
    contact: {
        name: string
        phone: string
        installDate: string
        installTimeRange: string
    }
    shipping: {
        status: string
        trackingNumber: string
        courier: string
    }
    otherConfig: {
        serviceName: string
        customServiceName: string
        template: string
    }
    remarkInfo: {
        content: string
    }
    shopInfo: {
        itemName: string
        itemCode: string
    }
    customOrder: {
        customerID: string
        amount: number
        content: string
    }
    fileList: UploadUserFile[]
    customFileList: UploadUserFile[]
    templateFileList: UploadUserFile[]
}

// 默认表单数据
const getDefaultFormData = (): OrderFormData => ({
    formData: {},
    serviceAddressDisplay: '',
    serviceAddressData: null,
    contact: {
        name: '',
        phone: '',
        installDate: '',
        installTimeRange: '',
    },
    shipping: {
        status: '',
        trackingNumber: '',
        courier: '',
    },
    otherConfig: {
        serviceName: '小安派工',
        customServiceName: '',
        template: '小安模板',
    },
    remarkInfo: {
        content: '',
    },
    shopInfo: {
        itemName: '',
        itemCode: '',
    },
    customOrder: {
        customerID: '',
        amount: 0,
        content: '',
    },
    fileList: [],
    customFileList: [],
    templateFileList: [],
})

export const useOrderFormStore = defineStore('orderForm', () => {
    // 按 categoryId 存储表单数据
    const formDataMap = ref<Record<string, OrderFormData>>({})

    // 获取指定分类的表单数据
    const getFormData = (categoryId: string): OrderFormData => {
        if (!formDataMap.value[categoryId]) {
            formDataMap.value[categoryId] = getDefaultFormData()
        }
        return formDataMap.value[categoryId]
    }

    // 更新指定分类的表单数据
    const updateFormData = (categoryId: string, data: Partial<OrderFormData>) => {
        if (!formDataMap.value[categoryId]) {
            formDataMap.value[categoryId] = getDefaultFormData()
        }
        Object.assign(formDataMap.value[categoryId], data)
    }

    // 清空指定分类的表单数据
    const clearFormData = (categoryId: string) => {
        formDataMap.value[categoryId] = getDefaultFormData()
    }

    // 清空所有表单数据
    const clearAllFormData = () => {
        formDataMap.value = {}
    }

    return {
        formDataMap,
        getFormData,
        updateFormData,
        clearFormData,
        clearAllFormData,
    }
})
