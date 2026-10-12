/** Build a CSV (with BOM so Excel opens Chinese correctly) and trigger a download. */
export function downloadCsv(filename: string, header: string[], rows: (string | number)[][]) {
  const escape = (cell: string | number) => {
    const s = String(cell)
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
  }
  const body = [header, ...rows].map((row) => row.map(escape).join(',')).join('\r\n')
  const blob = new Blob(['﻿', body], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename.endsWith('.csv') ? filename : `${filename}.csv`
  document.body.append(link)
  link.click()
  link.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}
