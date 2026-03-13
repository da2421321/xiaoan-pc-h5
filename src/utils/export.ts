import * as XLSX from 'xlsx'

export interface ExportColumn {
    prop: string
    label: string
    formatter?: (value: any, row: any) => string
}

export interface ExportOptions {
    data: any[]
    columns: ExportColumn[]
    filename: string
    sheetName?: string
}

/**
 * 生成带时间戳的文件名
 */
export function generateFilename(prefix: string): string {
    const now = new Date()
    const timestamp = now.toISOString().slice(0, 19).replace(/[T:]/g, '-').replace(/-/g, (m, i) => i < 10 ? '-' : '_')
    return `${prefix}_${timestamp}.xlsx`
}

/**
 * 将数据转换为Excel并下载
 */
export function exportToExcel(options: ExportOptions): void {
    const { data, columns, filename, sheetName = 'Sheet1' } = options

    // 构建表头
    const headers = columns.map(col => col.label)

    // 构建数据行
    const rows = data.map(row => {
        return columns.map(col => {
            const value = row[col.prop]
            if (col.formatter) {
                return col.formatter(value, row)
            }
            return value ?? ''
        })
    })

    // 创建工作表数据
    const wsData = [headers, ...rows]
    const ws = XLSX.utils.aoa_to_sheet(wsData)

    // 设置列宽
    ws['!cols'] = columns.map(() => ({ wch: 15 }))

    // 创建工作簿
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, sheetName)

    // 生成文件名并下载
    const fullFilename = generateFilename(filename)
    XLSX.writeFile(wb, fullFilename)
}
