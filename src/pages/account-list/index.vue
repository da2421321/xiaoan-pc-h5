<template>
  <div class="bg-white pb-4 h-full flex flex-col">
    <div class="text-lg font-semibold px-6 pt-4 pb-2">账号管理</div>
    <div class="mx-6 h-[3px] bg-[#F1F2F6] mb-3"></div>
    <!-- 搜索区域 -->
    <div class="flex flex-wrap items-center justify-between mb-4 px-6 gap-y-2">
      <div class="flex flex-wrap items-center gap-2">
        <el-input v-model="form.keyword" placeholder="请输入姓名、手机号" clearable style="width: 180px" />
        <el-input v-model="form.role" placeholder="请输入角色" clearable style="width: 140px" />
        <el-select v-model="form.status" placeholder="请选择状态" clearable style="width: 140px">
          <el-option label="全部" value="" />
          <el-option label="启用" value="0" />
          <el-option label="停用" value="1" />
        </el-select>
        <el-select v-model="form.type" placeholder="请选择类型" clearable style="width: 140px">
          <el-option label="全部" value="" />
          <el-option label="共享额度" value="0" />
          <el-option label="指定额度" value="1" />
        </el-select>
        <el-date-picker v-model="form.dateRange" type="daterange" range-separator="-" start-placeholder="创建时间(开始)"
          end-placeholder="创建时间(结束)" format="YYYY-MM-DD" value-format="YYYY-MM-DD" clearable style="width: 260px" />
        <el-button type="primary" @click="handleSearch"
          class="!w-20 !h-8 !bg-[#3b82f6] !border-[#3b82f6]">搜索</el-button>
        <el-button @click="handleReset" style="background-color: rgba(205, 212, 218, 1)"
          class="!w-20 !h-8 !text-[#333]">重置</el-button>
      </div>
      <div class="flex items-center gap-2">
        <!-- <el-button type="primary" :loading="exportLoading" @click="handleExport"
          class="!bg-[#0dcaf0] !border-[#0dcaf0]">
          <el-icon class="mr-1" v-if="!exportLoading">
            <Download />
          </el-icon>
          导出Excel
        </el-button> -->
        <el-button type="primary" :icon="Plus" @click="handleAdd"
          class="!bg-[#06b6d4] !border-[#06b6d4]">添加账号</el-button>
      </div>
    </div>

    <!-- 表格区域 -->
    <div class="px-4 flex-1 overflow-auto">
      <CommonTable :data="tableData" :columns="columns" :loading="loading" :current-page="currentPage"
        business-type="account" :page-size="pageSize" :total="total" @current-change="handleCurrentChange"
        @size-change="handleSizeChange">
        <template #useQuota="{ row }">
          ¥{{ (row.mineQuota || 0).toLocaleString() }}
        </template>
        <template #quotaType="{ row }">
          {{ row.creditType == 0 ? '共享额度' : row.creditType == 1 ? '指定额度' : '-' }}
        </template>
        <template #totalQuota="{ row }">
          {{ row.creditType == 1 ? `¥${(row.totalQuota || 0).toLocaleString()}` : '-' }}
        </template>
        <template #status="{ row }">
          <div v-if="row.status == 1"
            class="px-3 py-1 bg-blue-50 text-blue-500 rounded text-sm inline-block cursor-pointer">
            启用
          </div>
          <div v-else
            class="px-3 py-1 bg-white border border-gray-200 text-gray-400 rounded text-sm inline-block cursor-pointer">
            停用
          </div>
        </template>
        <template #operation="{ row }">
          <el-button plain size="small" @click="handleView(row)">
            <el-icon class="mr-1">
              <View />
            </el-icon> 查看
          </el-button>
        </template>
      </CommonTable>
    </div>
    <addaccount v-model:visible="addDialogVisible" :userid="editUserId" @success="handleAddSuccess" />
  </div>
</template>

<script setup lang="ts">
import CommonTable, { type ColumnConfig } from '@/components/CommonTable.vue'
import { exportToExcel, type ExportColumn } from '@/utils/export'
import { Download, Plus, View } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { onMounted, reactive, ref } from 'vue'
import addaccount from './add-account/index.vue'
import { getAccountList } from '@/api/account'
const addDialogVisible = ref(false)
const editUserId = ref('')
const loading = ref(false)

const tableData = ref<any[]>([])

const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(50)

const form = reactive({
  keyword: '',
  role: '',
  status: '',
  type: '',
  dateRange: [] as string[],
})

// 列配置
const columns: ColumnConfig[] = [
  { type: 'index', label: '序号', width: 80, align: 'center' },
  { prop: 'realName', label: '姓名', minWidth: 120 },
  { prop: 'account', label: '手机号', minWidth: 140 },
  { prop: 'roleName', label: '角色', minWidth: 120 },
  { prop: 'mineQuota', label: '占用额度', minWidth: 120, slot: 'useQuota' },
  { prop: 'quotaType', label: '额度类型', minWidth: 120, slot: 'quotaType' },
  { prop: 'totalQuota', label: '授信额度', minWidth: 120, slot: 'totalQuota' },
  { prop: 'status', label: '状态', minWidth: 100, align: 'center', slot: 'status' },
  { prop: 'createTime', label: '创建时间', minWidth: 180 },
  { label: '操作', fixed: 'right', width: 120, align: 'center', slot: 'operation' },
]

const getList = async () => {
  loading.value = true
  try {
    const params = {
      pageNo: currentPage.value,
      pageSize: pageSize.value,
      keyword: form.keyword,
      roleName: form.role,
      status: form.status,
      creditType: form.type,
      startTime: form.dateRange?.[0] || '',
      endTime: form.dateRange?.[1] || '',
    }
    const res = await getAccountList(params) as { data: { rows: any[]; totalRows: number } }

    tableData.value = res.data.rows || []
    total.value = res.data.totalRows || 0
    setTimeout(() => { loading.value = false }, 500)
  } catch (error) {
    console.error('获取列表失败', error)
    ElMessage.error('获取列表失败')
    loading.value = false
  }
}

const handleSearch = () => { currentPage.value = 1; getList() }
const handleReset = () => { form.keyword = ''; form.role = ''; form.status = ''; form.type = ''; form.dateRange = []; handleSearch() }
const handleAdd = () => { editUserId.value = ''; addDialogVisible.value = true }
const handleAddSuccess = () => { getList(); ElMessage.success('操作成功') }
const handleView = (row: any) => {
  editUserId.value = row.uid;
  addDialogVisible.value = true
}
const handleSizeChange = (val: number) => { pageSize.value = val; getList() }
const handleCurrentChange = (val: number) => { currentPage.value = val; getList() }

// 导出Excel
const exportLoading = ref(false)
const accountExportColumns: ExportColumn[] = [
  { prop: 'realName', label: '姓名' },
  { prop: 'account', label: '手机号' },
  { prop: 'roleName', label: '角色' },
  { prop: 'mineQuota', label: '占用额度', formatter: (v) => `¥${(v || 0).toLocaleString()}` },
  { prop: 'creditType', label: '额度类型', formatter: (v) => v == 0 ? '共享额度' : v == 1 ? '指定额度' : '-' },
  { prop: 'totalQuota', label: '授信额度', formatter: (v, row) => row.creditType == 1 ? `¥${(v || 0).toLocaleString()}` : '-' },
  { prop: 'status', label: '状态', formatter: (v) => v == 1 ? '启用' : '停用' },
  { prop: 'createTime', label: '创建时间' }
]

const handleExport = async () => {
  if (tableData.value.length === 0) {
    ElMessage.warning('暂无数据可导出')
    return
  }
  exportLoading.value = true
  try {
    exportToExcel({
      data: tableData.value,
      columns: accountExportColumns,
      filename: '账号列表',
      sheetName: '账号数据'
    })
    ElMessage.success('导出成功')
  } catch (error) {
    console.error('导出失败:', error)
    ElMessage.error('导出失败，请重试')
  } finally {
    exportLoading.value = false
  }
}

onMounted(() => { getList() })
</script>

<style scoped>
:deep(.el-input__wrapper),
:deep(.el-select__wrapper) {
  box-shadow: 0 0 0 1px #e2e8f0 inset !important;
}

:deep(.el-input__wrapper:hover),
:deep(.el-select__wrapper:hover) {
  box-shadow: 0 0 0 1px #cbd5e1 inset !important;
}

:deep(.el-input__wrapper.is-focus),
:deep(.el-select__wrapper.is-focus) {
  box-shadow: 0 0 0 1px #3b82f6 inset !important;
}

:deep(.el-pagination.is-background .el-pager li:not(.is-disabled).is-active) {
  background-color: #3b82f6;
}

:deep(.el-select .el-select__placeholder) {
  color: rgba(85, 85, 85, 1);
}

:deep(.el-date-editor input::placeholder) {
  color: rgba(85, 85, 85, 1) !important;
}

:deep(.el-date-editor .el-range-input::placeholder) {
  color: rgba(85, 85, 85, 1) !important;
}
</style>
