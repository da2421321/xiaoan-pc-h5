<template>
  <el-dialog v-model="dialogVisible" width="920px" append-to-body destroy-on-close class="profile-edit-dialog"
    custom-class="profile-edit-dialog">
    <template #header>
      <div class="dialog-header-bg">
        <span class="text-[18px] font-bold flex justify-center text-[#333]">修改个人信息</span>
      </div>
    </template>

    <div class="profile-edit-body">
      <el-form ref="formRef" :model="form" :rules="rules" label-position="top" require-asterisk-position="right"
        class="profile-edit-form">
        <div class="form-grid">
          <template v-if="isPersonalType">
            <el-form-item label="客户名称" prop="enterpriseName" class="form-item-full">
              <el-input v-model="form.enterpriseName" placeholder="请输入客户名称" />
            </el-form-item>
            <el-form-item label="联系人" prop="contactMan">
              <el-input v-model="form.contactMan" placeholder="请输入联系人" />
            </el-form-item>
            <el-form-item label="联系人手机号码" prop="contactPhone">
              <el-input v-model="form.contactPhone" placeholder="请输入联系人手机号码" />
            </el-form-item>
            <el-form-item label="邮箱" prop="email" class="form-item-full">
              <el-input v-model="form.email" placeholder="请输入邮箱" />
            </el-form-item>
          </template>

          <template v-else>
            <el-form-item label="企业名称" prop="enterpriseName" class="form-item-full">
              <el-input v-model="form.enterpriseName" placeholder="请输入企业名称" />
            </el-form-item>

            <el-form-item label="企业简称" prop="enterpriseShortName">
              <el-input v-model="form.enterpriseShortName" placeholder="请输入企业简称" />
            </el-form-item>
            <el-form-item label="统一社会信用代码" prop="creditCode">
              <el-input v-model="form.creditCode" placeholder="请输入统一社会信用代码" />
            </el-form-item>

            <el-form-item label="营业执照照片" prop="licenseFile" class="form-item-full">
              <div class="license-upload" @click="openLicensePicker">
                <input ref="licenseInputRef" type="file" accept=".jpg,.jpeg,.png,.pdf" class="hidden-input"
                  @change="handleLicenseSelect" />
                <el-icon class="upload-icon">
                  <UploadFilled />
                </el-icon>
                <p class="upload-main-text">
                  {{ licenseDisplayText }}
                </p>
                <p class="upload-sub-text">支持 JPG/PNG/PDF，大小不超过 10MB</p>
              </div>
            </el-form-item>

            <el-form-item label="法人" prop="legalPerson">
              <el-input v-model="form.legalPerson" placeholder="请输入法人姓名" />
            </el-form-item>
            <el-form-item label="法人身份证号码" prop="legalIdCard">
              <el-input v-model="form.legalIdCard" placeholder="请输入法人身份证号码" />
            </el-form-item>

            <el-form-item label="邮箱" prop="email" class="form-item-full">
              <el-input v-model="form.email" placeholder="请输入邮箱" />
            </el-form-item>

            <el-form-item label="公司地址" prop="companyAddress" class="form-item-full">
              <el-input v-model="form.companyAddress" placeholder="请输入公司地址" />
            </el-form-item>

            <div class="form-divider" />

            <el-form-item label="对公账户号" prop="bankAccount">
              <el-input v-model="form.bankAccount" placeholder="请输入对公账户号" />
            </el-form-item>
            <el-form-item label="对公账户开户行" prop="bankName">
              <el-select v-model="form.bankName" placeholder="请选择对公账户开户行" class="w-full">
                <el-option v-for="item in bankOptions" :key="item" :label="item" :value="item" />
              </el-select>
            </el-form-item>
          </template>
        </div>
      </el-form>

      <div class="action-row">
        <el-button :disabled="submitLoading" @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleSubmit">保存</el-button>
      </div>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { editMemberProfile, getBankBasePage, uploadFileByUnToken } from '@/api'
import { UploadFilled } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { computed, reactive, ref, watch } from 'vue'

defineOptions({
  name: 'ProfileEditDialog',
})

interface CustomerInfo {
  name?: string
  subName?: string
  contactMan?: string
  contactPhone?: string
  contactEmail?: string
  creditCode?: string
  legalPerson?: string
  cardNo?: string
  license?: string
  companyAddress?: string
  corporateAccount?: string
  corporateBank?: string
  userRose?: string
  type?: string
}

interface BodyInfo {
  id?: number | string
  userRose?: string
  type?: string
  name?: string
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
  address?: string
}

interface UserProfileSource {
  uid?: number
  userRose?: string
  avatar?: string
  realName?: string
  nickname?: string
  account?: string
  email?: string
  bodyId?: number | string
  customer?: CustomerInfo
  bodyInfo?: BodyInfo
}

interface ProfileEditForm {
  enterpriseName: string
  contactMan: string
  contactPhone: string
  enterpriseShortName: string
  creditCode: string
  licenseFile: File | null
  legalPerson: string
  legalIdCard: string
  email: string
  companyAddress: string
  bankAccount: string
  bankName: string
}

interface ApiResponse {
  success?: boolean
  code?: number | string
  message?: string
}

const props = defineProps<{
  visible: boolean
  userInfo?: Partial<UserProfileSource>
}>()

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
  (e: 'success'): void
}>()

const formRef = ref<FormInstance>()
const licenseInputRef = ref<HTMLInputElement | null>(null)
const submitLoading = ref(false)
const bankOptions = ref<string[]>(['中国工商银行', '中国农业银行', '中国银行', '中国建设银行', '交通银行'])
const existingLicenseUrl = ref('')
const existingLicenseName = ref('')
const bankOptionsLoaded = ref(false)
const profileType = ref('1')

const PERSONAL_TYPE = '0'

const resolveProfileType = (source: Partial<UserProfileSource>) => {
  return source.customer?.type || source.bodyInfo?.type || '1'
}

const dialogVisible = computed({
  get: () => props.visible,
  set: (value: boolean) => emit('update:visible', value),
})

const form = reactive<ProfileEditForm>({
  enterpriseName: '',
  contactMan: '',
  contactPhone: '',
  enterpriseShortName: '',
  creditCode: '',
  licenseFile: null,
  legalPerson: '',
  legalIdCard: '',
  email: '',
  companyAddress: '',
  bankAccount: '',
  bankName: '',
})

const isPersonalType = computed(() => profileType.value === PERSONAL_TYPE)

const getFileName = (url: string) => {
  const segments = url.split('/')
  return segments[segments.length - 1] || '已上传营业执照'
}

const licenseDisplayText = computed(() => {
  if (form.licenseFile) return `已选择：${form.licenseFile.name}`
  if (existingLicenseName.value) return `已上传：${existingLicenseName.value}`
  return '点击上传营业执照'
})

const validateEmail = (_rule: unknown, value: string, callback: (error?: Error) => void) => {
  if (!value) {
    callback()
    return
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (emailPattern.test(value)) {
    callback()
    return
  }

  callback(new Error('请输入正确的邮箱格式'))
}

const rules: FormRules<ProfileEditForm> = {
  email: [{ validator: validateEmail, trigger: 'blur' }],
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

const resetForm = () => {
  form.enterpriseName = ''
  form.contactMan = ''
  form.contactPhone = ''
  form.enterpriseShortName = ''
  form.creditCode = ''
  form.licenseFile = null
  form.legalPerson = ''
  form.legalIdCard = ''
  form.email = ''
  form.companyAddress = ''
  form.bankAccount = ''
  form.bankName = ''
  existingLicenseUrl.value = ''
  existingLicenseName.value = ''
}

const syncFormFromUserInfo = () => {
  resetForm()

  const source = props.userInfo || {}
  profileType.value = resolveProfileType(source)
  form.enterpriseName = source.customer?.name || source.bodyInfo?.name || ''
  form.contactMan = source.customer?.contactMan || source.bodyInfo?.contactMan || source.customer?.legalPerson || source.realName || ''
  form.contactPhone = source.customer?.contactPhone || source.bodyInfo?.contactPhone || source.account || ''
  form.enterpriseShortName = source.customer?.subName || ''
  form.creditCode = source.customer?.creditCode || ''
  form.legalPerson = source.customer?.legalPerson || source.realName || ''
  form.legalIdCard = source.customer?.cardNo || ''
  form.email = source.customer?.contactEmail || source.email || ''
  form.companyAddress = source.customer?.companyAddress || source.bodyInfo?.address || ''
  form.bankAccount = source.customer?.corporateAccount || ''
  form.bankName = source.customer?.corporateBank || ''

  existingLicenseUrl.value = source.customer?.license || ''
  existingLicenseName.value = existingLicenseUrl.value ? getFileName(existingLicenseUrl.value) : ''
}

const openLicensePicker = () => {
  licenseInputRef.value?.click()
}

const handleLicenseSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  const maxSize = 10 * 1024 * 1024
  const allowTypes = ['image/jpeg', 'image/png', 'application/pdf']

  if (!allowTypes.includes(file.type)) {
    ElMessage.warning('仅支持 JPG、PNG、PDF 格式')
    target.value = ''
    return
  }

  if (file.size > maxSize) {
    ElMessage.warning('文件大小不能超过 10MB')
    target.value = ''
    return
  }

  form.licenseFile = file
  existingLicenseUrl.value = ''
  existingLicenseName.value = file.name
  formRef.value?.validateField('licenseFile')
  target.value = ''
}

const uploadLicenseFile = async (file: File) => {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('secretFlag', 'N')
  formData.append('fileLocation', '1')

  const uploadRes = await uploadFileByUnToken(formData)
  const fileUrl = (uploadRes as { data?: { fileUrl?: string } })?.data?.fileUrl || ''
  if (!fileUrl) {
    throw new Error('营业执照上传失败，请重试')
  }
  return fileUrl
}

const fetchBankOptions = async () => {
  if (bankOptionsLoaded.value) return

  try {
    const res = await getBankBasePage({ pageNumber: 1, pageSize: 100 })
    const rows = res?.data?.rows ?? []
    const loadedOptions = Array.from(
      new Set(
        rows
          .map((item) => item.shortName || item.fullName)
          .filter((item): item is string => Boolean(item)),
      ),
    )

    if (loadedOptions.length > 0) {
      bankOptions.value = loadedOptions
    }
    bankOptionsLoaded.value = true
  } catch {
    bankOptionsLoaded.value = true
  }
}

const handleSubmit = async () => {
  if (!formRef.value || submitLoading.value) return

  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

  submitLoading.value = true
  try {
    const source = props.userInfo || {}
    const currentType = resolveProfileType(source)
    const isPersonal = currentType === PERSONAL_TYPE
    const businessLicensePhoto = isPersonal
      ? source.customer?.license || existingLicenseUrl.value
      : form.licenseFile
        ? await uploadLicenseFile(form.licenseFile)
        : existingLicenseUrl.value
    const userRose = source.userRose || source.customer?.userRose || source.bodyInfo?.userRose || '0'
    const hasBodyInfo = Boolean(source.bodyInfo || source.bodyId)
    const bodyPayload = hasBodyInfo
      ? {
        id: parseOptionalNumber(source.bodyInfo?.id || source.bodyId),
        userRose,
        type: source.bodyInfo?.type || currentType,
        name: form.enterpriseName,
        personName: source.bodyInfo?.personName || form.contactMan || form.legalPerson,
        personPhone: source.bodyInfo?.personPhone || form.contactPhone,
        personNumber: source.bodyInfo?.personNumber || '',
        relation: source.bodyInfo?.relation || '',
        contactMan: source.bodyInfo?.contactMan || form.contactMan,
        contactPhone: source.bodyInfo?.contactPhone || form.contactPhone,
        provinceId: source.bodyInfo?.provinceId || '',
        province: source.bodyInfo?.province || '',
        cityId: source.bodyInfo?.cityId || '',
        city: source.bodyInfo?.city || '',
        areaId: source.bodyInfo?.areaId || '',
        area: source.bodyInfo?.area || '',
        mergerName: source.bodyInfo?.mergerName || '',
        address: isPersonal ? source.bodyInfo?.address || source.customer?.companyAddress || '' : form.companyAddress,
      }
      : undefined

    const res = await editMemberProfile({
      uid: source.uid,
      userRose,
      avatar: source.avatar,
      personInfo: {
        type: currentType,
        name: form.enterpriseName,
        contactMan: form.contactMan,
        contactPhone: form.contactPhone,
        contactEmail: form.email,
        subName: isPersonal ? source.customer?.subName || '' : form.enterpriseShortName,
        creditCode: isPersonal ? source.customer?.creditCode || '' : form.creditCode,
        legalPerson: isPersonal ? source.customer?.legalPerson || form.contactMan : form.legalPerson,
        cardNo: isPersonal ? source.customer?.cardNo || '' : form.legalIdCard,
        license: businessLicensePhoto,
        companyAddress: isPersonal ? source.customer?.companyAddress || '' : form.companyAddress,
        corporateAccount: isPersonal ? source.customer?.corporateAccount || '' : form.bankAccount,
        corporateBank: isPersonal ? source.customer?.corporateBank || '' : form.bankName,
      },
      body: bodyPayload,
    })

    if (!isRequestSuccess(res as ApiResponse)) {
      ElMessage.error((res as ApiResponse)?.message || '个人信息修改失败')
      return
    }

    ElMessage.success('个人信息修改成功')
    emit('success')
    dialogVisible.value = false
  } catch (error) {
    ElMessage.error((error as { message?: string })?.message || '个人信息修改失败')
  } finally {
    submitLoading.value = false
  }
}

watch(
  () => props.visible,
  (value) => {
    if (value) {
      syncFormFromUserInfo()
      formRef.value?.clearValidate()
      if (!isPersonalType.value) {
        fetchBankOptions()
      }
      return
    }

    formRef.value?.clearValidate()
  },
  { immediate: true },
)
</script>

<style scoped>
:deep(.el-dialog__header) {
  padding: 0;
  margin: 0;
}

:deep(.el-dialog__body) {
  padding: 0;
}

.profile-edit-body {
  padding: 28px 32px 24px;
}

.profile-edit-form {
  width: 100%;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0 18px;
}

.form-item-full {
  grid-column: 1 / -1;
}

.license-upload {
  height: 126px;
  border: 1px dashed rgba(206, 216, 236, 1);
  border-radius: 8px;
  width: 100%;
  background: rgba(244, 247, 255, 1);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.hidden-input {
  display: none;
}

.upload-icon {
  font-size: 22px;
  color: rgba(58, 126, 246, 1);
}

.upload-main-text {
  margin: 8px 0 6px;
  color: rgba(58, 126, 246, 1);
  font-size: 14px;
  line-height: 20px;
}

.upload-sub-text {
  margin: 0;
  color: rgba(118, 126, 145, 1);
  font-size: 12px;
  line-height: 18px;
}

.form-divider {
  grid-column: 1 / -1;
  height: 2px;
  border: 0;
  background: repeating-linear-gradient(to right,
      rgba(214, 223, 237, 1) 0 7px,
      transparent 7px 24px);
  margin: 22px 0 30px;
}

.action-row {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
}

@media (max-width: 768px) {
  .profile-edit-body {
    padding: 20px 16px 18px;
  }

  .form-grid {
    grid-template-columns: minmax(0, 1fr);
    gap: 0;
  }

  .action-row {
    justify-content: stretch;
  }

  .action-row :deep(.el-button) {
    flex: 1;
  }
}
</style>

<style>
.profile-edit-dialog.el-dialog {
  @apply overflow-hidden !p-0 !rounded-[10px] shadow-xl;
}

.profile-edit-dialog .el-dialog__header {
  @apply !p-0 !m-0;
}

.profile-edit-dialog .el-dialog__headerbtn .el-dialog__close {
  @apply !text-gray-400 !text-xl font-bold;
}

.profile-edit-dialog .dialog-header-bg {
  background-image: url('/src/assets/images/titlebg.png');
  @apply bg-cover bg-center bg-no-repeat h-[60px] flex items-center justify-center relative;
}
</style>
