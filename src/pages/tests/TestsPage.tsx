import { useMemo, useState, type FormEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowRight, ChevronDown, ChevronLeft, ChevronUp, Download, Search, Trash2, X } from 'lucide-react'
import ConfirmDialog from '../../components/ConfirmDialog'
import ExportFlow from '../../components/ExportFlow'
import { downloadCsv } from '../../lib/csv'
import { recordCsv } from '../../lib/exporters'
import { useStore } from '../../lib/store'
import type { TestRecord } from '../../data/seed'
import './TestsPage.css'

const PAGE_SIZE = 5
const DELETE_ANIMATION_MS = 650

type Filters = { studentId: string; grade: string; date: string; status: string; from: string; to: string }
const EMPTY_FILTERS: Filters = { studentId: '', grade: '', date: '', status: '', from: '', to: '' }

/** "2024/12/13 09:30" → comparable "2024-12-13T09:30" */
const toIso = (stamp: string) => stamp.replaceAll('/', '-').replace(' ', 'T')

function formatTime(stamp: string) {
  const [date, time] = stamp.split(' ')
  const [h, m] = time.split(':').map(Number)
  const suffix = h >= 12 ? 'PM' : 'AM'
  const hour = h % 12 === 0 ? 12 : h % 12
  return { date, time: `${String(hour).padStart(2, '0')}:${String(m).padStart(2, '0')} ${suffix}` }
}

function matches(r: TestRecord, f: Filters) {
  if (f.studentId && !r.studentId.includes(f.studentId.trim())) return false
  if (f.grade && r.grade !== Number(f.grade)) return false
  if (f.date && !r.testedAt.startsWith(f.date.replaceAll('-', '/'))) return false
  if (f.status && r.status !== f.status) return false
  if (f.from && toIso(r.testedAt) < f.from) return false
  if (f.to && toIso(r.testedAt) > f.to) return false
  return true
}

export default function TestsPage() {
  const { folderId = '' } = useParams()
  const { folders, records, deleteRecords, addLog } = useStore()
  const folder = folders.find((f) => f.id === folderId)

  const [draft, setDraft] = useState<Filters>(EMPTY_FILTERS)
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS)
  const [advanced, setAdvanced] = useState(false)
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState<Set<string>>(new Set())
  const [exporting, setExporting] = useState(false)

  const folderRecords = useMemo(() => records.filter((r) => r.folderId === folderId), [records, folderId])
  const visible = useMemo(() => folderRecords.filter((r) => matches(r, filters)), [folderRecords, filters])

  const pageCount = Math.max(1, Math.ceil(visible.length / PAGE_SIZE))
  const currentPage = Math.min(page, pageCount)
  const pageRows = visible.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)
  const pageIds = pageRows.map((r) => r.id)
  const allOnPageSelected = pageIds.length > 0 && pageIds.every((id) => selected.has(id))

  if (!folder) {
    return (
      <section className="page">
        <Link to="/folders" className="back-link">
          <ChevronLeft size={16} /> 回上一頁
        </Link>
        <div className="empty">
          <p>找不到這個測驗資料夾，可能已被刪除。</p>
          <Link to="/folders" className="btn btn--primary">
            回到測驗資料夾
          </Link>
        </div>
      </section>
    )
  }

  const set = (key: keyof Filters) => (value: string) => setDraft((d) => ({ ...d, [key]: value }))

  const onSearch = (e: FormEvent) => {
    e.preventDefault()
    setFilters(draft)
    setPage(1)
    setSelected(new Set())
  }

  const clearFilters = () => {
    setDraft(EMPTY_FILTERS)
    setFilters(EMPTY_FILTERS)
    setPage(1)
  }

  const toggle = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  const togglePage = () =>
    setSelected((prev) => {
      const next = new Set(prev)
      pageIds.forEach((id) => (allOnPageSelected ? next.delete(id) : next.add(id)))
      return next
    })

  const runDelete = () => {
    const ids = [...selected]
    setConfirmDelete(false)
    setDeleting(new Set(ids))
    window.setTimeout(() => {
      deleteRecords(ids)
      addLog('warning', '刪除測驗紀錄', '測驗模組', `從「${folder.name}」刪除 ${ids.length} 筆測驗紀錄`)
      setDeleting(new Set())
      setSelected(new Set())
    }, DELETE_ANIMATION_MS)
  }

  const runExport = () => {
    const rows = selected.size > 0 ? visible.filter((r) => selected.has(r.id)) : visible
    downloadCsv(`${folder.name}_測驗總覽`, ...recordCsv(rows))
    addLog('success', '匯出資料', '測驗模組', `匯出「${folder.name}」共 ${rows.length} 筆測驗紀錄`)
  }

  const filtered = Object.values(filters).some(Boolean)
  const first = visible.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1
  const last = Math.min(currentPage * PAGE_SIZE, visible.length)

  return (
    <section className="page tests">
      <Link to="/folders" className="back-link">
        <ChevronLeft size={16} /> 回上一頁
      </Link>

      <form className="tests-filter" onSubmit={onSearch} role="search" aria-label="篩選測驗">
        <div className="tests-filter__row">
          <label className="field tests-filter__wide">
            <span className="field__label">學號</span>
            <span className="input">
              <input value={draft.studentId} onChange={(e) => set('studentId')(e.target.value)} placeholder="輸入學號" inputMode="numeric" />
            </span>
          </label>
          <label className="field">
            <span className="field__label">年級</span>
            <span className="input">
              <select value={draft.grade} onChange={(e) => set('grade')(e.target.value)}>
                <option value="">全部年級</option>
                {[1, 2, 3, 4].map((g) => (
                  <option key={g} value={g}>
                    {g} 年級
                  </option>
                ))}
              </select>
            </span>
          </label>
          <label className="field">
            <span className="field__label">日期</span>
            <span className="input">
              <input type="date" value={draft.date} onChange={(e) => set('date')(e.target.value)} />
            </span>
          </label>
        </div>

        <div className="tests-filter__bar">
          <button type="button" className="tests-filter__toggle" onClick={() => setAdvanced((v) => !v)} aria-expanded={advanced} aria-controls="advanced-filters">
            {advanced ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            {advanced ? 'Hide advanced filters' : 'Show advanced filters'}
          </button>
          <button type="submit" className="btn btn--primary">
            <Search size={16} /> 查詢
          </button>
        </div>

        {advanced && (
          <div className="tests-filter__row tests-filter__advanced" id="advanced-filters">
            <label className="field tests-filter__wide">
              <span className="field__label">All Tests</span>
              <span className="input">
                <select value={draft.status} onChange={(e) => set('status')(e.target.value)}>
                  <option value="">全部狀態</option>
                  <option value="done">已完成</option>
                  <option value="pending">未完成</option>
                </select>
              </span>
            </label>
            <label className="field">
              <span className="field__label">時間範圍（自）</span>
              <span className="input">
                <input type="datetime-local" value={draft.from} onChange={(e) => set('from')(e.target.value)} />
              </span>
            </label>
            <label className="field">
              <span className="field__label">時間範圍（至）</span>
              <span className="input">
                <input type="datetime-local" value={draft.to} onChange={(e) => set('to')(e.target.value)} />
              </span>
            </label>
          </div>
        )}
      </form>

      <header className="tests__heading">
        <h2 className="page-title">測驗總覽</h2>
        <span className="tests__count">
          {folder.name} · 共{visible.length}筆資料
          {filtered && (
            <button type="button" className="caption__clear" onClick={clearFilters}>
              <X size={12} /> 清除篩選
            </button>
          )}
        </span>
      </header>

      <div className="table-card">
        <div className="table-card__toolbar">
          <label className="table-check">
            <input type="checkbox" checked={allOnPageSelected} onChange={togglePage} disabled={pageIds.length === 0} aria-label="選取本頁全部" />
            <span>
              已選取{selected.size}筆，共 {visible.length} 筆
            </span>
          </label>
          <div className="table-card__actions">
            <button type="button" className="btn btn--sm btn--danger-soft" disabled={selected.size === 0} onClick={() => setConfirmDelete(true)}>
              <Trash2 size={16} /> 刪除
            </button>
            <button type="button" className="btn btn--sm btn--accent-soft" disabled={visible.length === 0} onClick={() => setExporting(true)}>
              <Download size={16} /> 匯出
            </button>
          </div>
        </div>

        <div className="table-scroll">
          <table className="tests-table">
            <thead>
              <tr>
                <th className="col-check">
                  <span className="visually-hidden">選取</span>
                </th>
                <th>
                  測驗
                  <br />
                  編號
                </th>
                <th>
                  測驗
                  <br />
                  名稱
                </th>
                <th>學號</th>
                <th>姓名</th>
                <th>年級</th>
                <th>測驗時間</th>
                <th>測驗成績</th>
                <th>測驗狀況</th>
                <th>考官</th>
              </tr>
            </thead>
            <tbody>
              {pageRows.length === 0 && (
                <tr>
                  <td colSpan={10} className="tests-table__empty">
                    {folderRecords.length === 0 ? '這個資料夾目前沒有測驗紀錄' : '找不到符合條件的測驗紀錄'}
                  </td>
                </tr>
              )}
              {pageRows.map((r) => {
                if (deleting.has(r.id)) {
                  return (
                    <tr key={r.id} className="tests-table__deleting">
                      <td colSpan={10}>
                        <div className="tests-table__trash">
                          <Trash2 size={26} />
                        </div>
                      </td>
                    </tr>
                  )
                }
                const t = formatTime(r.testedAt)
                const isSelected = selected.has(r.id)
                return (
                  <tr key={r.id} className={isSelected ? 'is-selected' : undefined}>
                    <td className="col-check">
                      <input type="checkbox" checked={isSelected} onChange={() => toggle(r.id)} aria-label={`選取 ${r.studentName}`} />
                    </td>
                    <td className="col-muted">{r.no}</td>
                    <td>
                      <Link to={`/folders/${folder.id}/records/${r.id}`} className="tests-table__link">
                        {r.testName}
                      </Link>
                    </td>
                    <td>{r.studentId}</td>
                    <td>{r.studentName}</td>
                    <td>{r.grade}</td>
                    <td>
                      {t.date}
                      <br />
                      {t.time}
                    </td>
                    <td>{r.status === 'done' ? r.score : '—'}</td>
                    <td>
                      <span className={`table-pill table-pill--${r.status}`}>{r.status === 'done' ? '已完成' : '未完成'}</span>
                    </td>
                    <td>{r.examiner}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        <nav className="table-card__footer" aria-label="分頁">
          <span>
            顯示測驗 {first} 到 {last} 筆，共 {visible.length} 筆
          </span>
          <div className="pager">
            <button type="button" className="pager__btn" disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)}>
              <ChevronLeft size={16} /> 上一頁
            </button>
            {Array.from({ length: pageCount }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                type="button"
                className={`pager__num${n === currentPage ? ' is-current' : ''}`}
                onClick={() => setPage(n)}
                aria-current={n === currentPage ? 'page' : undefined}
              >
                {n}
              </button>
            ))}
            <button type="button" className="pager__btn" disabled={currentPage === pageCount} onClick={() => setPage(currentPage + 1)}>
              下一頁 <ArrowRight size={16} />
            </button>
          </div>
        </nav>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        tone="danger"
        icon={<X size={28} />}
        title="確認刪除測驗紀錄？"
        description={`將刪除已選取的 ${selected.size} 筆紀錄，刪除後無法復原，請再次確認。`}
        confirmLabel="刪除"
        onCancel={() => setConfirmDelete(false)}
        onConfirm={runDelete}
      />

      <ExportFlow open={exporting} onExport={runExport} onClose={() => setExporting(false)} />
    </section>
  )
}
