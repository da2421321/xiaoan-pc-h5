<template>
    <el-dialog v-model="dialogVisible" width="600px" :before-close="handleClose" :close-on-click-modal="false"
        :show-close="true" class="address-dialog">
        <template #header>
            <div
                class="bg-[url('@/assets/images/titlebg.png')] bg-[length:100%_auto] bg-top bg-no-repeat px-6 pb-4 pt-5 text-center">
                <span class="text-lg font-bold text-gray-900">输入地址</span>
            </div>
        </template>

        <div class="px-[40px] pt-3">
            <!-- 智能识别区域 -->
            <div class="mb-5">
                <div class="mb-3 text-[15px] font-bold text-gray-800">智能识别</div>
                <el-popover placement="bottom-start" :width="520" trigger="click"
                    :disabled="recognitionHistory.length === 0" v-model:visible="popoverVisible">
                    <template #reference>
                        <el-input v-model="recognitionText" type="textarea" :rows="4" placeholder="粘贴地址文本，智能识别联系人、电话、地址"
                            resize="none" @input="handleRecognitionDebounced" />
                    </template>
                    <div class="max-h-[300px] overflow-y-auto">
                        <div v-for="(text, index) in recognitionHistory" :key="index"
                            class="mb-2 cursor-pointer rounded bg-gray-50 p-2 text-xs text-gray-600 hover:bg-blue-50 hover:text-blue-600"
                            @click="handleSelectRecognitionHistory(text)">
                            {{ text }}
                        </div>
                    </div>
                </el-popover>
            </div>

            <!-- 联系人信息标题 -->
            <div class="mb-3 mt-4 text-[15px] font-bold text-gray-800">联系人信息</div>

            <!-- 表单区域 -->
            <el-form ref="addressFormRef" :model="addressForm" :rules="rules" label-position="left" label-width="80px"
                class="mt-4">
                <!-- 联系人和联系电话同一行 -->
                <div class="flex gap-5 max-md:flex-col max-md:gap-0">
                    <el-form-item label="联系人" prop="contact" class="flex-1">
                        <el-autocomplete ref="contactAutocompleteRef" v-model="addressForm.contact"
                            :fetch-suggestions="queryContactSearch" placeholder="请输入姓名" class="w-full"
                            :popper-append-to-body="false" clearable>
                            <template #default="{ item }">
                                <div class="flex items-center justify-between w-full">
                                    <span>{{ item.value }}</span>
                                    <el-icon class="delete-icon" @click.stop="deleteContactHistory(item.value)">
                                        <Close />
                                    </el-icon>
                                </div>
                            </template>
                        </el-autocomplete>
                    </el-form-item>

                    <el-form-item label="联系电话" prop="phone" class="flex-1">
                        <el-autocomplete ref="phoneAutocompleteRef" v-model="addressForm.phone"
                            :fetch-suggestions="queryPhoneSearch" placeholder="请输入联系电话" class="w-full"
                            :popper-append-to-body="false" clearable>
                            <template #default="{ item }">
                                <div class="flex items-center justify-between w-full">
                                    <span>{{ item.value }}</span>
                                    <el-icon class="delete-icon" @click.stop="deletePhoneHistory(item.value)">
                                        <Close />
                                    </el-icon>
                                </div>
                            </template>
                        </el-autocomplete>
                    </el-form-item>
                </div>

                <!-- 所在地区 -->
                <el-form-item label="所在地区" required class="region-form-item">
                    <div class="flex w-full gap-3 max-md:flex-col">
                        <el-form-item prop="province" class="flex-1 !mb-0">
                            <el-select v-model="addressForm.province" placeholder="请选择省" @change="handleProvinceChange"
                                clearable class="w-full">
                                <el-option v-for="province in provinces" :key="province.value" :label="province.label"
                                    :value="province.value" />
                            </el-select>
                        </el-form-item>
                        <el-form-item prop="city" class="flex-1 !mb-0">
                            <el-select v-model="addressForm.city" placeholder="请选择市" @change="handleCityChange"
                                clearable :disabled="!addressForm.province" class="w-full">
                                <el-option v-for="city in cities" :key="city.value" :label="city.label"
                                    :value="city.value" />
                            </el-select>
                        </el-form-item>
                        <el-form-item prop="district" class="flex-1 !mb-0">
                            <el-select v-model="addressForm.district" placeholder="请选择区" clearable
                                :disabled="!addressForm.city" class="w-full">
                                <el-option v-for="district in districts" :key="district.value" :label="district.label"
                                    :value="district.value" />
                            </el-select>
                        </el-form-item>
                    </div>
                </el-form-item>

                <!-- 详细地址 -->
                <el-form-item label="详细地址" prop="detailAddress">
                    <el-autocomplete ref="addressAutocompleteRef" v-model="addressForm.detailAddress"
                        :fetch-suggestions="queryAddressSearch" placeholder="请输入详细地址（如xx街道xx号）" class="w-full"
                        :popper-append-to-body="false" clearable>
                        <template #default="{ item }">
                            <div class="flex items-center justify-between w-full">
                                <span>{{ item.value }}</span>
                                <el-icon class="delete-icon" @click.stop="deleteAddressHistory(item.value)">
                                    <Close />
                                </el-icon>
                            </div>
                        </template>
                    </el-autocomplete>
                </el-form-item>
            </el-form>
        </div>

        <template #footer>
            <div class="flex justify-center gap-5 px-[30px] pb-6 pt-2.5 max-md:flex-col max-md:gap-3 max-md:px-4">
                <el-button type="primary" size="large" @click="handleSubmit" :loading="submitting"
                    class="!w-[140px] !border-[#317dfe] !bg-[#317dfe] hover:!border-[#5a9aff] hover:!bg-[#5a9aff] max-md:!w-full">
                    确认
                </el-button>
                <el-button size="large" @click="handleCancel"
                    class="!w-[140px] !border-[#f5f5f5] !bg-[#f5f5f5] !text-gray-800 hover:!border-[#e8e8e8] hover:!bg-[#e8e8e8] max-md:!w-full">
                    关闭
                </el-button>
            </div>
        </template>
    </el-dialog>
</template>

<script setup lang="ts">
import { addressCache, type CityData } from '@/utils/address/addressCache'
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage } from 'element-plus'
import { Close } from '@element-plus/icons-vue'
import { computed, onMounted, reactive, ref, watch, nextTick } from 'vue'
import { getSmartAddress } from '@/api/order'
interface AddressForm {
    contact: string
    phone: string
    province: string
    city: string
    district: string
    detailAddress: string
}

interface RegionOption {
    label: string
    value: string
    id: number
    cityId: number
}

interface Props {
    modelValue: boolean
}

const props = withDefaults(defineProps<Props>(), {
    modelValue: false,
})

const emit = defineEmits<{
    'update:modelValue': [value: boolean]
    submit: [data: AddressForm]
}>()

const dialogVisible = computed({
    get: () => props.modelValue,
    set: (value: boolean) => emit('update:modelValue', value),
})

const addressFormRef = ref<FormInstance>()
const contactAutocompleteRef = ref()
const phoneAutocompleteRef = ref()
const addressAutocompleteRef = ref()
const submitting = ref<boolean>(false)
const recognitionText = ref<string>('')
const recognizing = ref<boolean>(false)

// 防抖定时器
let recognitionTimer: ReturnType<typeof setTimeout> | null = null

const addressForm = reactive<AddressForm>({
    contact: '',
    phone: '',
    province: '',
    city: '',
    district: '',
    detailAddress: '',
})

const cityDataList = ref<CityData[]>([])
const provinces = ref<RegionOption[]>([])
const cities = ref<RegionOption[]>([])
const districts = ref<RegionOption[]>([])
const loading = ref<boolean>(false)

// ========== 输入历史记录功能 ==========
const STORAGE_KEYS = {
    contact: 'address_contact_history',
    phone: 'address_phone_history',
    address: 'address_detail_history',
    recognition: 'address_recognition_history',
}
const MAX_HISTORY_COUNT = 3

// 历史记录响应式变量
const contactHistory = ref<string[]>([])
const phoneHistory = ref<string[]>([])
const addressHistory = ref<string[]>([])
const recognitionHistory = ref<string[]>([])
const popoverVisible = ref<boolean>(false)

// 从 localStorage 加载历史记录
const loadHistory = () => {
    try {
        const contacts = localStorage.getItem(STORAGE_KEYS.contact)
        const phones = localStorage.getItem(STORAGE_KEYS.phone)
        const addresses = localStorage.getItem(STORAGE_KEYS.address)
        const recognitions = localStorage.getItem(STORAGE_KEYS.recognition)

        contactHistory.value = contacts ? JSON.parse(contacts) : []
        phoneHistory.value = phones ? JSON.parse(phones) : []
        addressHistory.value = addresses ? JSON.parse(addresses) : []
        recognitionHistory.value = recognitions ? JSON.parse(recognitions) : []
    } catch (error) {
        console.error('加载历史记录失败:', error)
    }
}

// 监听弹窗可见性，打开时加载历史记录
watch(() => props.modelValue, (val) => {
    if (val) {
        loadHistory()
        // 确保 formRef 存在后再重置
        nextTick(() => {
            if (addressFormRef.value) {
                // 如果是新增模式可能需要重置，这里视情况而定
            }
        })
    }
})

// 保存单条历史记录
const saveToHistory = (key: string, value: string, historyRef: typeof contactHistory) => {
    if (!value || !value.trim()) return

    const trimmedValue = value.trim()
    // 去重：如果已存在则移到最前面
    const newHistory = historyRef.value.filter(item => item !== trimmedValue)
    newHistory.unshift(trimmedValue)

    // 限制最大数量
    if (newHistory.length > MAX_HISTORY_COUNT) {
        newHistory.splice(MAX_HISTORY_COUNT)
    }

    historyRef.value = newHistory
    localStorage.setItem(key, JSON.stringify(newHistory))
}

// 保存所有输入的历史记录
const saveAllHistory = () => {
    saveToHistory(STORAGE_KEYS.contact, addressForm.contact, contactHistory)
    saveToHistory(STORAGE_KEYS.phone, addressForm.phone, phoneHistory)
    saveToHistory(STORAGE_KEYS.address, addressForm.detailAddress, addressHistory)
    saveToHistory(STORAGE_KEYS.recognition, recognitionText.value, recognitionHistory)
}

// el-autocomplete 查询函数
const queryContactSearch = (queryString: string, cb: (results: any[]) => void) => {
    // 如果查询字符串为空，显示所有历史记录
    if (!queryString || queryString.trim() === '') {
        cb(contactHistory.value.map((item) => ({ value: item })))
        return
    }

    // 如果查询字符串与历史记录完全匹配（说明是选择了历史记录或已有完整内容），不显示建议
    const exactMatch = contactHistory.value.some(item => item === queryString)
    if (exactMatch) {
        cb([])
        return
    }

    // 否则显示匹配的历史记录
    const results = contactHistory.value
        .filter((item) => item.toLowerCase().includes(queryString.toLowerCase()))
        .map((item) => ({ value: item }))
    cb(results)
}

const queryPhoneSearch = (queryString: string, cb: (results: any[]) => void) => {
    // 如果查询字符串为空，显示所有历史记录
    if (!queryString || queryString.trim() === '') {
        cb(phoneHistory.value.map((item) => ({ value: item })))
        return
    }

    // 如果查询字符串与历史记录完全匹配，不显示建议
    const exactMatch = phoneHistory.value.some(item => item === queryString)
    if (exactMatch) {
        cb([])
        return
    }

    // 否则显示匹配的历史记录
    const results = phoneHistory.value
        .filter((item) => item.includes(queryString))
        .map((item) => ({ value: item }))
    cb(results)
}

const queryAddressSearch = (queryString: string, cb: (results: any[]) => void) => {
    // 如果查询字符串为空，显示所有历史记录
    if (!queryString || queryString.trim() === '') {
        cb(addressHistory.value.map((item) => ({ value: item })))
        return
    }

    // 如果查询字符串与历史记录完全匹配，不显示建议
    const exactMatch = addressHistory.value.some(item => item === queryString)
    if (exactMatch) {
        cb([])
        return
    }

    // 否则显示匹配的历史记录
    const results = addressHistory.value
        .filter((item) => item.toLowerCase().includes(queryString.toLowerCase()))
        .map((item) => ({ value: item }))
    cb(results)
}

// 删除历史记录函数
const deleteContactHistory = (value: string) => {
    // 更新数据
    contactHistory.value = contactHistory.value.filter(item => item !== value)
    localStorage.setItem(STORAGE_KEYS.contact, JSON.stringify(contactHistory.value))

    // 立即更新下拉列表
    nextTick(() => {
        if (contactAutocompleteRef.value) {
            if (contactHistory.value.length > 0) {
                // 还有历史记录，更新建议列表
                const currentValue = addressForm.contact || ''
                const newSuggestions = contactHistory.value
                    .filter((item) => !currentValue || item.toLowerCase().includes(currentValue.toLowerCase()))
                    .map((item) => ({ value: item }))

                // 直接更新组件的建议列表
                contactAutocompleteRef.value.suggestions = newSuggestions
            } else {
                // 没有历史记录了，先清空建议列表再关闭，防止缓存旧数据
                contactAutocompleteRef.value.suggestions = []
                contactAutocompleteRef.value.close()
            }
        }
    })
}

const deletePhoneHistory = (value: string) => {
    // 更新数据
    phoneHistory.value = phoneHistory.value.filter(item => item !== value)
    localStorage.setItem(STORAGE_KEYS.phone, JSON.stringify(phoneHistory.value))

    // 立即更新下拉列表
    nextTick(() => {
        if (phoneAutocompleteRef.value) {
            if (phoneHistory.value.length > 0) {
                // 还有历史记录，更新建议列表
                const currentValue = addressForm.phone || ''
                const newSuggestions = phoneHistory.value
                    .filter((item) => !currentValue || item.includes(currentValue))
                    .map((item) => ({ value: item }))

                // 直接更新组件的建议列表
                phoneAutocompleteRef.value.suggestions = newSuggestions
            } else {
                // 没有历史记录了，先清空建议列表再关闭，防止缓存旧数据
                phoneAutocompleteRef.value.suggestions = []
                phoneAutocompleteRef.value.close()
            }
        }
    })
}

const deleteAddressHistory = (value: string) => {
    // 更新数据
    addressHistory.value = addressHistory.value.filter(item => item !== value)
    localStorage.setItem(STORAGE_KEYS.address, JSON.stringify(addressHistory.value))

    // 立即更新下拉列表
    nextTick(() => {
        if (addressAutocompleteRef.value) {
            if (addressHistory.value.length > 0) {
                // 还有历史记录，更新建议列表
                const currentValue = addressForm.detailAddress || ''
                const newSuggestions = addressHistory.value
                    .filter((item) => !currentValue || item.toLowerCase().includes(currentValue.toLowerCase()))
                    .map((item) => ({ value: item }))

                // 直接更新组件的建议列表
                addressAutocompleteRef.value.suggestions = newSuggestions
            } else {
                // 没有历史记录了，先清空建议列表再关闭，防止缓存旧数据
                addressAutocompleteRef.value.suggestions = []
                addressAutocompleteRef.value.close()
            }
        }
    })
}

// 选择智能识别历史记录
const handleSelectRecognitionHistory = (text: string) => {
    recognitionText.value = text
    popoverVisible.value = false
    // 触发识别
    handleRecognitionDebounced()
}

const rules: FormRules<AddressForm> = {
    contact: [{ required: true, message: '请输入联系人', trigger: 'blur' }],
    phone: [
        { required: true, message: '请输入联系电话', trigger: 'blur' },
        {
            pattern: /^1[3-9]\d{9}$/,
            message: '请输入正确的手机号码',
            trigger: 'blur',
        },
    ],
    province: [{ required: true, message: '请选择省份', trigger: 'change' }],
    city: [{ required: true, message: '请选择城市', trigger: 'change' }],
    district: [{ required: true, message: '请选择区域', trigger: 'change' }],
    detailAddress: [{ required: true, message: '请输入详细地址', trigger: 'blur' }],
}

// 加载省市区数据（使用缓存）
const loadCityData = async () => {
    try {
        loading.value = true
        const data = await addressCache.getAddressData()
        if (data && data.length > 0) {
            cityDataList.value = data
            provinces.value = data
                .filter((item: CityData) => item.parentId === 0)
                .map((item: CityData) => ({
                    label: item.name,
                    value: item.name,
                    id: item.id,
                    cityId: item.cityId,
                }))
        }
    } catch (error) {
        console.error('加载省市区数据失败:', error)
        ElMessage.error('加载地区数据失败')
    } finally {
        loading.value = false
    }
}

// 省份改变
const handleProvinceChange = (value: string) => {
    addressForm.city = ''
    addressForm.district = ''
    cities.value = []
    districts.value = []

    if (value) {
        const province = cityDataList.value.find((item: CityData) => item.name === value)
        if (province && province.child) {
            cities.value = province.child.map((item: CityData) => ({
                label: item.name,
                value: item.name,
                id: item.id,
                cityId: item.cityId,
            }))
        }
    }
}

// 城市改变
const handleCityChange = (value: string) => {
    addressForm.district = ''
    districts.value = []

    if (value && addressForm.province) {
        const province = cityDataList.value.find(
            (item: CityData) => item.name === addressForm.province
        )
        if (province && province.child) {
            const city = province.child.find((item: CityData) => item.name === value)
            if (city && city.child) {
                districts.value = city.child.map((item: CityData) => ({
                    label: item.name,
                    value: item.name,
                    id: item.id,
                    cityId: item.cityId,
                }))
            }
        }
    }
}

const matchRegion = (list: RegionOption[], keyword: string): RegionOption | undefined => {
    if (!keyword) return undefined
    return list.find(
        (item) => item.label.includes(keyword) || keyword.includes(item.label.replace(/省|市|区|县|自治区|自治州/g, ''))
    )
}

//接口智能识别
const handleRecognition = () => {
    if (!recognitionText.value.trim()) return
    recognizing.value = true
    getSmartAddress(recognitionText.value).then((res: any) => {
        if (res.code === '00000' && res.data && res.data.length > 0) {
            const data = res.data[0]
            if (data) {
                addressForm.contact = data.name || ''
                addressForm.phone = Array.isArray(data.mobile) ? data.mobile[0] : data.mobile || ''

                if (data.xzq) {
                    // 模糊匹配省份
                    const matchedProvince = matchRegion(provinces.value, data.xzq.province)
                    if (matchedProvince) {
                        addressForm.province = matchedProvince.value
                        handleProvinceChange(matchedProvince.value)

                        // 等待城市列表加载后匹配城市
                        setTimeout(() => {
                            const matchedCity = matchRegion(cities.value, data.xzq.city)
                            if (matchedCity) {
                                addressForm.city = matchedCity.value
                                handleCityChange(matchedCity.value)

                                // 等待区县列表加载后匹配区县
                                setTimeout(() => {
                                    const matchedDistrict = matchRegion(districts.value, data.xzq.district)
                                    if (matchedDistrict) {
                                        addressForm.district = matchedDistrict.value
                                    }
                                }, 50)
                            }
                        }, 50)
                    }
                }

                addressForm.detailAddress = data.xzq?.subArea || data.address || ''

                ElMessage.success('智能识别完成，请检查并完善信息')
            }
        } else {
            ElMessage.warning('未能识别地址信息，请手动填写')
        }
    }).catch(() => {
        ElMessage.error('地址识别失败，请手动填写')
    }).finally(() => {
        recognizing.value = false
    })
}

// 防抖版本的识别函数（输入后自动识别）
const handleRecognitionDebounced = () => {
    if (recognitionTimer) {
        clearTimeout(recognitionTimer)
    }
    recognitionTimer = setTimeout(() => {
        if (recognitionText.value.trim()) {
            handleRecognition()
        }
    }, 800)
}

// // 智能识别功能
// const handleRecognition = () => {
//     if (!recognitionText.value.trim()) return

//     try {
//         const text = recognitionText.value
//         const result = AddressParse.parse(text)

//         if (result && result.length > 0) {
//             const addressInfo = result[0]

//             if (addressInfo.name) {
//                 addressForm.contact = addressInfo.name
//             }

//             if (addressInfo.mobile) {
//                 addressForm.phone = addressInfo.mobile
//             }

//             if (addressInfo.province) {
//                 const province = provinces.value.find(
//                     (p: RegionOption) =>
//                         p.label.includes(addressInfo.province) || addressInfo.province.includes(p.label)
//                 )
//                 if (province) {
//                     addressForm.province = province.value
//                     handleProvinceChange(province.value)
//                 }
//             }

//             setTimeout(() => {
//                 if (addressInfo.city) {
//                     const city = cities.value.find(
//                         (c: RegionOption) =>
//                             c.label.includes(addressInfo.city) || addressInfo.city.includes(c.label)
//                     )
//                     if (city) {
//                         addressForm.city = city.value
//                         handleCityChange(city.value)
//                     }
//                 }
//             }, 100)

//             setTimeout(() => {
//                 if (addressInfo.area) {
//                     const district = districts.value.find(
//                         (d: RegionOption) =>
//                             d.label.includes(addressInfo.area) || addressInfo.area.includes(d.label)
//                     )
//                     if (district) {
//                         addressForm.district = district.value
//                     }
//                 }
//             }, 200)

//             const escapeReg = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

//             let detail = ''
//             if (addressInfo.detail && addressInfo.detail.trim()) {
//                 detail = addressInfo.detail.trim()
//             } else {
//                 detail = text
//                 const partsToRemove = [
//                     addressInfo.name,
//                     addressInfo.mobile,
//                     addressInfo.province,
//                     addressInfo.city,
//                     addressInfo.area,
//                 ]
//                 partsToRemove.forEach((p: string | undefined) => {
//                     if (p) {
//                         try {
//                             const reg = new RegExp(escapeReg(p), 'g')
//                             detail = detail.replace(reg, '')
//                         } catch {
//                             detail = detail.split(p).join('')
//                         }
//                     }
//                 })
//                 detail = detail.replace(/^[\s,，:：\-–—]+|[\s,，:：\-–—]+$/g, '').trim()
//             }
//             addressForm.detailAddress = detail

//             ElMessage.success('智能识别完成，请检查并完善信息')
//         } else {
//             ElMessage.warning('未能识别地址信息，请手动填写')
//         }
//     } catch (error) {
//         console.error('地址识别失败:', error)
//         ElMessage.error('地址识别失败，请手动填写')
//     }
// }

const handleClose = (done: () => void) => {
    resetForm()
    done()
}

const handleCancel = () => {
    resetForm()
    dialogVisible.value = false
}

const resetForm = () => {
    recognitionText.value = ''
    addressForm.contact = ''
    addressForm.phone = ''
    addressForm.province = ''
    addressForm.city = ''
    addressForm.district = ''
    addressForm.detailAddress = ''
    cities.value = []
    districts.value = []
    addressFormRef.value?.clearValidate()
}

const handleSubmit = async () => {
    if (!addressFormRef.value) return

    try {
        const valid = await addressFormRef.value.validate()
        if (!valid) return

        submitting.value = true
        await new Promise((resolve) => setTimeout(resolve, 500))

        // 保存输入历史记录
        saveAllHistory()

        ElMessage.success('地址信息提交成功！')
        emit('submit', { ...addressForm })
        dialogVisible.value = false
        resetForm()
    } catch (error) {
        console.error('表单验证失败:', error)
    } finally {
        submitting.value = false
    }
}

onMounted(() => {
    loadCityData()
    loadHistory() // 加载输入历史记录
})
</script>

<style scoped>
:deep(.el-form-item__label) {
    @apply text-sm font-normal text-gray-800 flex items-center justify-start;
}

:deep(.el-form-item__label::before) {
    @apply !text-red-500;
}

:deep(.el-input__wrapper) {
    @apply rounded border-[1.5px] border-solid border-[#DCDFE6] bg-white shadow-none;
}

:deep(.el-input__wrapper:hover) {
    @apply border-gray-400;
}

:deep(.el-input__wrapper.is-focus) {
    @apply border-[#317dfe];
}

:deep(.el-input__inner::placeholder) {
    @apply text-gray-400;
}

:deep(.el-textarea__inner) {
    @apply border-[1.5px] border-solid border-[#dcdfe6] rounded bg-white shadow-none px-3 py-2.5;
}

:deep(.el-textarea__inner:hover) {
    @apply border-gray-400;
}

:deep(.el-textarea__inner:focus) {
    @apply border-[#317dfe];
}

:deep(.el-textarea__inner::placeholder) {
    @apply text-gray-400;
}

:deep(.el-select) {
    --el-component-size: 32px !important;
}

:deep(.el-select .el-input__wrapper) {
    border: 1.5px solid #dcdfe6 !important;
    box-shadow: none !important;
    min-height: 32px;
}

:deep(.el-select .el-input__wrapper:hover) {
    border-color: #9ca3af !important;
}

:deep(.el-select .el-input__wrapper.is-focus) {
    border-color: #317dfe !important;
}

:deep(.el-select.is-disabled .el-input__wrapper) {
    border: 1.5px solid #CDD4DA !important;
    background-color: #f9fafb !important;
}

:deep(.el-autocomplete) {
    width: 100%;
}

:deep(.el-autocomplete .el-input__wrapper) {
    border: 1.5px solid #dcdfe6 !important;
    box-shadow: none !important;
    min-height: 32px;
}

:deep(.el-autocomplete .el-input__wrapper:hover) {
    border-color: #9ca3af !important;
}

:deep(.el-autocomplete .el-input__wrapper.is-focus) {
    border-color: #317dfe !important;
}

.delete-icon {
    color: #999;
    cursor: pointer;
    font-size: 14px;
    transition: color 0.2s;
}

.delete-icon:hover {
    color: #f56c6c;
}
</style>

<style>
.address-dialog.el-dialog {
    @apply overflow-hidden rounded-lg !p-0;
}

.address-dialog .el-dialog__header {
    @apply !m-0 border-none !p-0;
}

.address-dialog .el-dialog__headerbtn {
    @apply !right-4 !top-4 z-10;
}

.address-dialog .el-dialog__body {
    @apply px-0 pb-5 pt-2.5;
}

.address-dialog .el-dialog__footer {
    @apply !p-0;
}
</style>
