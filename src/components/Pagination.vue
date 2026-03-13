<template>
  <div class="flex justify-between mt-2 items-center">
    <div class="text-gray-500 text-[14px]">
      共{{ total }}条记录，第{{ currentPage }}页/{{ Math.ceil(total / pageSize) }}页
    </div>
    <el-pagination :current-page="currentPage" :page-size="pageSize" :total="total" :page-sizes="pageSizes"
      :layout="layout" @size-change="handleSizeChange" @current-change="handleCurrentChange" background
      class="!justify-end !text-[14px]" />
  </div>
</template>

<script setup lang="ts">
interface PaginationProps {
  total: number
  currentPage: number
  pageSize: number
  pageSizes?: number[]
  layout?: string
}

const props = withDefaults(defineProps<PaginationProps>(), {
  pageSizes: () => [5, 10, 20, 50],
  layout: 'sizes,prev, pager, next, jumper',
})

const currentPage = ref(props.currentPage)
const pageSize = ref(props.pageSize)

const emit = defineEmits<{
  'update:currentPage': [value: number]
  'update:pageSize': [value: number]
  'size-change': [size: number]
  'current-change': [page: number]
}>()

const handleSizeChange = (size: number) => {
  pageSize.value = size
  emit('size-change', size)
  emit('update:pageSize', size)
}

const handleCurrentChange = (page: number) => {
  currentPage.value = page
  emit('current-change', page)
  emit('update:currentPage', page)
}
</script>

<style scoped></style>
