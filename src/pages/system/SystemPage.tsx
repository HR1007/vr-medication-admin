import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { ArrowDownWideNarrow, ArrowUpNarrowWide, CalendarDays, ChevronLeft, Download, EllipsisVertical, RotateCcw, Search, Trash2, X } from 'lucide-react'
import ConfirmDialog from '../../components/ConfirmDialog'
import ExportFlow from '../../components/ExportFlow'
import { downloadCsv } from '../../lib/csv'
import { useStore } from '../../lib/store'
import type { LogEntry, LogLevel } from '../../data/seed'
import './SystemPage.css'

const LEVELS: { id: LogLevel; label: string }[] = [
  { id: 'info', label: '資訊' },
  { id: 'success', label: '成功' },
  { id: 'warning', label: '警告' },
  { id: 'error', label: '錯誤' },
  { id: 'debug', label: '除錯' },
]
const LEVEL_LABEL = Object.fromEntries(LEVELS.map((l) => [l.id, l.label])) as Record<LogLevel, string>

const MODULE_ICON: Record<string, string> = {
  驗證模組: '🔐',
  登入模組: '🔐',
  'VR 模組': '🥽',
  測驗模組: '📋',
  資料模組: '🗂️',
  系統排程: '⚙️',
}

const DELETE_ANIMATION_MS = 650

export default function SystemPage() {
  const { logs, deleteLog, resetDemo } = useStore()

  const [keywordInput, setKeywordInput] = useState('')
  const [dateInput, setDateInput] = useState('')
  const [query, setQuery] = useState({ keyword: '', date: '' })
  const [level, setLevel] = useState<LogLevel | ''>('')
  const [newestFirst, setNewestFirst] = useState(true)

  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [exportIds, setExportIds] = useState<string[] | null>(null)
  const [confirmReset, setConfirmReset] = useState(false)

  useEffect(() => {
    if (!selectedId) return
    const onDown = (e: MouseEvent) => {
      if (!(e.target as Element).closest(`[data-log="${selectedId}"]`)) setSelectedId(null)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [selectedId])

  // Chip counts follow the keyword / date search but ignore the level filter itself.
  const searched = useMemo(() => {
    const k = query.keyword.trim().toLowerCase()
    const d = query.date.replaceAll('-', '/')
    return logs.filter(
      (l) => (!k || `${l.title} ${l.module} ${l.message}`.toLowerCase().includes(k)) && (!d || l.at.startsWith(d)),
    )
  }, [logs, query])

  const visible = useMemo(
    () =>
      searched
        .filter((l) => !level || l.level === level)
        .sort((a, b) => (newestFirst ? b.at.localeCompare(a.at) : a.at.localeCompare(b.at))),
    [searched, level, newestFirst],
  )

  const counts = useMemo(() => {
    const c: Record<string, number> = {}
    for (const l of searched) c[l.level] = (c[l.level] ?? 0) + 1
    return c
  }, [searched])

  const onSearch = (e: FormEvent) => {
    e.preventDefault()
    setQuery({ keyword: keywordInput, date: dateInput })
  }

  const clearAll = () => {
    setKeywordInput('')
    setDateInput('')
    setQuery({ keyword: '', date: '' })
    setLevel('')
  }

  const runDelete = () => {
    const id = confirmDeleteId
    setConfirmDeleteId(null)
    setSelectedId(null)
    if (!id) return
    setDeletingId(id)
    window.setTimeout(() => {
      deleteLog(id)
      setDeletingId(null)
    }, DELETE_ANIMATION_MS)
  }

  const runExport = () => {
    const rows = logs.filter((l) => exportIds?.includes(l.id))
    downloadCsv(
      rows.length === 1 ? `系統日誌_${rows[0].title}` : '系統日誌',
      ['時間', '等級', '事件', '模組', '內容'],
      rows.map((l) => [l.at, LEVEL_LABEL[l.level], l.title, l.module, l.message]),
    )
  }

  const filtered = query.keyword !== '' || query.date !== '' || level !== ''

  return (
    <section className="page system">
      <Link to="/folders" className="back-link">
        <ChevronLeft size={16} /> 回上一頁
      </Link>

      <header className="system__header">
        <div className="page-header">
          <h2 className="page-title">系統操作日誌</h2>
          <p className="page-subtitle">查看和管理所有系統操作、登入及異常事件記錄</p>
        </div>
        <button type="button" className="btn btn--secondary btn--sm system__reset" onClick={() => setConfirmReset(true)}>
          <RotateCcw size={14} /> 重置 Demo 資料
        </button>
      </header>

      <form className="filter-bar system__filters" onSubmit={onSearch} role="search">
        <label className="field">
          <span className="field__label">關鍵字</span>
          <span className="input">
            <Search size={16} />
            <input value={keywordInput} onChange={(e) => setKeywordInput(e.target.value)} placeholder="搜尋動作、使用者、模組..." />
          </span>
        </label>
        <label className="field">
          <span className="field__label">日期</span>
          <span className="input">
            <CalendarDays size={16} />
            <input type="date" value={dateInput} onChange={(e) => setDateInput(e.target.value)} />
          </span>
        </label>
        <label className="field system__level">
          <span className="field__label">等級篩選</span>
          <span className="input">
            <select value={level} onChange={(e) => setLevel(e.target.value as LogLevel | '')}>
              <option value="">全部</option>
              {LEVELS.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.label}
                </option>
              ))}
            </select>
          </span>
        </label>
        <div className="filter-bar__actions">
          <button type="submit" className="btn btn--query system__btn">
            <Search size={16} /> 查詢
          </button>
          <button type="button" className="btn btn--secondary system__btn" onClick={() => setNewestFirst((v) => !v)} aria-label={newestFirst ? '排序：由新到舊' : '排序：由舊到新'}>
            {newestFirst ? <ArrowDownWideNarrow size={16} /> : <ArrowUpNarrowWide size={16} />} 排序
          </button>
        </div>
      </form>

      <div className="log-chips" role="group" aria-label="依等級篩選">
        <button type="button" className={`log-chip log-chip--all${level === '' ? ' is-active' : ''}`} onClick={() => setLevel('')} aria-pressed={level === ''}>
          全部 ({searched.length})
        </button>
        {LEVELS.map((l) => (
          <button
            key={l.id}
            type="button"
            className={`log-chip log-chip--${l.id}${level === l.id ? ' is-active' : ''}`}
            onClick={() => setLevel(level === l.id ? '' : l.id)}
            aria-pressed={level === l.id}
          >
            <span className="log-chip__dot" />
            {l.label} ({counts[l.id] ?? 0})
          </button>
        ))}
      </div>

      <p className="caption">
        所有日誌 共：{visible.length} 筆資料
        {filtered && (
          <button type="button" className="caption__clear" onClick={clearAll}>
            <X size={12} /> 清除篩選
          </button>
        )}
        {visible.length > 0 && (
          <button type="button" className="caption__clear" onClick={() => setExportIds(visible.map((l) => l.id))}>
            <Download size={12} /> 匯出目前列表
          </button>
        )}
      </p>

      {visible.length === 0 ? (
        <div className="empty">{logs.length === 0 ? '目前沒有任何日誌' : '找不到符合條件的日誌'}</div>
      ) : (
        <ul className="log-list">
          {visible.map((log) => (
            <LogItem
              key={log.id}
              log={log}
              selected={selectedId === log.id}
              deleting={deletingId === log.id}
              onToggle={() => setSelectedId(selectedId === log.id ? null : log.id)}
              onDelete={() => setConfirmDeleteId(log.id)}
              onExport={() => {
                setExportIds([log.id])
                setSelectedId(null)
              }}
            />
          ))}
        </ul>
      )}

      <ConfirmDialog
        open={confirmDeleteId !== null}
        tone="danger"
        icon={<X size={28} />}
        title="確認刪除這筆日誌？"
        description="刪除後無法復原，請再次確認。"
        confirmLabel="刪除"
        onCancel={() => setConfirmDeleteId(null)}
        onConfirm={runDelete}
      />

      <ConfirmDialog
        open={confirmReset}
        icon={<RotateCcw size={22} />}
        title="重置 Demo 資料？"
        description="所有資料夾、測驗紀錄與日誌都會回到初始狀態。"
        confirmLabel="重置"
        onCancel={() => setConfirmReset(false)}
        onConfirm={() => {
          setConfirmReset(false)
          resetDemo()
          clearAll()
        }}
      />

      <ExportFlow open={exportIds !== null} onExport={runExport} onClose={() => setExportIds(null)} />
    </section>
  )
}

type ItemProps = {
  log: LogEntry
  selected: boolean
  deleting: boolean
  onToggle: () => void
  onDelete: () => void
  onExport: () => void
}

function LogItem({ log, selected, deleting, onToggle, onDelete, onExport }: ItemProps) {
  if (deleting) {
    return (
      <li className="log-row is-deleting">
        <div className="log-row__trash">
          <Trash2 size={28} />
        </div>
      </li>
    )
  }
  const label = LEVEL_LABEL[log.level]
  return (
    <li className={`log-row${selected ? ' is-selected' : ''}`} data-log={log.id}>
      <article className={`log-card log-card--${log.level}`}>
        <div className="log-card__top">
          <span className="log-card__icon" aria-hidden>
            {MODULE_ICON[log.module] ?? '📝'}
            <span className="log-card__tag">{label}</span>
          </span>
          <div className="log-card__text">
            <h3>
              {log.title}
              <span className="log-card__module"> · {log.module}</span>
            </h3>
            <p>{log.message}</p>
          </div>
          <button type="button" className="folder-card__more log-card__more" onClick={onToggle} aria-label="更多操作" aria-expanded={selected}>
            <EllipsisVertical size={20} />
          </button>
        </div>
        <div className="log-card__bottom">
          <time>{log.at}</time>
          <span className="log-pill">
            <span className="log-chip__dot" />
            {label}
          </span>
        </div>
      </article>
      {selected && (
        <div className="folder-row__actions">
          <button type="button" className="btn btn--sm btn--danger-soft" onClick={onDelete}>
            <Trash2 size={16} /> 刪除
          </button>
          <button type="button" className="btn btn--sm btn--accent-soft" onClick={onExport}>
            <Download size={16} /> 匯出
          </button>
        </div>
      )}
    </li>
  )
}
