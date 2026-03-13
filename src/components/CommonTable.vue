<template>
    <div class="common-table-wrapper">
        <Loading :visible="loading" />
        <el-table :data="data" style="width: 100%" :header-cell-style="mergedHeaderCellStyle"
            :cell-style="mergedCellStyle" :row-style="mergedRowStyle">
            <template v-for="column in columns" :key="column.prop || column.label">

                <el-table-column v-if="column.type === 'index'" type="index" :label="column.label"
                    :width="column.width || 80" :align="column.align || 'center'" :fixed="column.fixed" />

                <el-table-column v-else-if="column.type === 'selection'" type="selection" :width="column.width || 55"
                    :align="column.align || 'center'" :fixed="column.fixed" />

                <el-table-column v-else-if="column.slot" :prop="column.prop" :label="column.label" :width="column.width"
                    :min-width="column.minWidth" :align="column.align" :fixed="column.fixed"
                    :show-overflow-tooltip="column.showOverflowTooltip" :sortable="column.sortable">
                    <template #default="scope">
                        <slot :name="column.slot" :row="scope.row" :index="scope.$index">
                            {{ scope.row[column.prop!] }}
                        </slot>
                    </template>
                </el-table-column>

                <el-table-column v-else-if="column.formatter" :prop="column.prop" :label="column.label"
                    :width="column.width" :min-width="column.minWidth" :align="column.align" :fixed="column.fixed"
                    :show-overflow-tooltip="column.showOverflowTooltip" :sortable="column.sortable"
                    :formatter="column.formatter" />

                <el-table-column v-else :prop="column.prop" :label="column.label" :width="column.width"
                    :min-width="column.minWidth" :align="column.align" :fixed="column.fixed"
                    :show-overflow-tooltip="column.showOverflowTooltip" :sortable="column.sortable" />
            </template>

            <template #empty>
                <slot name="empty">
                    <div class="py-10 text-gray-400 flex items-center flex-col">
                        <img :src="emptyState.image" :alt="emptyState.alt" class="w-24 h-24">
                        {{ emptyState.text }}
                    </div>
                </slot>
            </template>
        </el-table>

        <Pagination v-if="showPagination && data.length > 0" :current-page="currentPage" :page-size="pageSize"
            :total="total" :page-sizes="pageSizes" @current-change="handleCurrentChange"
            @size-change="handleSizeChange" />
    </div>
</template>

<script setup lang="ts">
import Pagination from '@/components/Pagination.vue'
import Loading from '@/components/modals/loading.vue'
import { computed } from 'vue'


export interface ColumnConfig {
    prop?: string
    label: string
    width?: number | string
    minWidth?: number | string
    align?: 'left' | 'center' | 'right'
    fixed?: boolean | 'left' | 'right'
    type?: 'index' | 'selection'
    slot?: string
    formatter?: (row: any, column: any, cellValue: any, index: number) => string
    showOverflowTooltip?: boolean
    sortable?: boolean | 'custom'
}


interface Props {
    data: any[]
    columns: ColumnConfig[]
    loading?: boolean
    showPagination?: boolean
    currentPage?: number
    pageSize?: number
    total?: number
    pageSizes?: number[]
    headerCellStyle?: Record<string, any>
    rowStyle?: Record<string, any>
    cellStyle?: Record<string, any>
    emptyText?: string
    search?: boolean
    emptyImage?: string
    emptyAlt?: string
    businessType?: 'account' | 'bill' | 'order' | 'product' | 'user' | 'custom' | 'credit'
}


const defaultHeaderCellStyle = {
    background: '#f8fafc',
    color: 'rgba(85, 85, 85, 1)',
    fontWeight: '500',
    height: '48px',
}

const defaultRowStyle = {
    height: '56px',
}

const defaultCellStyle = {
    color: '#333',
}

const props = withDefaults(defineProps<Props>(), {
    loading: false,
    showPagination: true,
    currentPage: 1,
    pageSize: 10,
    total: 0,
    pageSizes: () => [5, 10, 20, 50],
    emptyText: '暂无数据',
    emptyImage: '',
    emptyAlt: 'empty',
    businessType: 'custom'
})

const emit = defineEmits<{
    'current-change': [page: number]
    'size-change': [size: number]
    'update:currentPage': [page: number]
    'update:pageSize': [size: number]
}>()

const mergedHeaderCellStyle = computed(() => ({
    ...defaultHeaderCellStyle,
    ...props.headerCellStyle,
}))

const mergedRowStyle = computed(() => ({
    ...defaultRowStyle,
    ...props.rowStyle,
}))

const mergedCellStyle = computed(() => ({
    ...defaultCellStyle,
    ...props.cellStyle,
}))

// 业务类型对应的空状态文本映射
const businessTypeTextMap = {
    account: '暂时没有账号信息哦~',
    bill: '暂时没有对账信息哦~',
    order: '暂时没有订单信息哦~',
    product: '暂时没有商品信息哦~',
    user: '暂时没有用户信息哦~',
    custom: '暂无数据',
    credit: '暂时没有额度信息哦~'
} as const

// 空状态计算属性
const emptyState = computed(() => {
    // 如果有自定义的emptyText，优先使用
    if (props.emptyText !== '暂无数据') {
        return {
            image: props.emptyImage || new URL('@/assets/images/empty.png', import.meta.url).href,
            alt: props.emptyAlt || 'empty',
            text: props.emptyText
        }
    }

    // 搜索状态显示固定文本
    if (props.search) {
        return {
            image: new URL('@/assets/images/empty.png', import.meta.url).href,
            alt: 'empty',
            text: '没有搜索到信息哦~'
        }
    }

    // 根据业务类型显示对应文本
    const defaultText = businessTypeTextMap[props.businessType as keyof typeof businessTypeTextMap]

    return {
        image: new URL('@/assets/images/tb.png', import.meta.url).href,
        alt: 'tb',
        text: defaultText
    }
})


const handleCurrentChange = (page: number) => {
    emit('current-change', page)
    emit('update:currentPage', page)
}

const handleSizeChange = (size: number) => {
    emit('size-change', size)
    emit('update:pageSize', size)
}
</script>

<style scoped>
.common-table-wrapper {
    width: 100%;
}
</style>
