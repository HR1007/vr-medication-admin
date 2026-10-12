import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowDownWideNarrow, ArrowUpNarrowWide, CalendarDays, CircleCheck, Clock3, Download, EllipsisVertical, Folder, Search, Trash2, X } from 'lucide-react'
import ConfirmDialog from '../../components/ConfirmDialog'
import ExportFlow from '../../components/ExportFlow'
import { downloadCsv } from '../../lib/csv'
import { useStore } from '../../lib/store'
import { recordCsv } from '../../lib/exporters'
import './FoldersPage.css'

const DELETE_ANIMATION_MS = 650

export default function FoldersPage() {
  const { folders, records, deleteFolder, addLog, resetDemo } = useStore()
  const navigate = useNavigate()

  const [nameInput, setNameInput] = useState('')
  const [dateInput, setDateInput] = useState('')
  const [filter, setFilter] = useState({ name: '', date: '' })
  const [newestFirst, setNewestFirst] = useState(true)

  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [exportId, setExportId] = useState<string | null>(null)

  // Click anywhere outside the selected row closes its 刪除 / 匯出 actions.
  useEffect(() => {
    if (!selectedId) return
    const onDown = (e: MouseEvent) => {
      if (!(e.target as Element).closest(`[data-folder-row="${selectedId}"]`)) setSelectedId(null)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [selectedId])

  const stats = useMemo(() => {
    const map = new Map<string, { total: number; pending: number }>()
    for (const r of records) {
      const s = map.get(r.folderId) ?? { total: 0, pending: 0 }
      s.total++
      if (r.status === 'pending') s.pending++
      map.set(r.folderId, s)
    }
    return map
  }, [records])

  const visible = useMemo(() => {
    const name = filter.name.trim().toLowerCase()
    const date = filter.date.replaceAll('-', '/')
    return folders
      .filter((f) => (!name || f.name.toLowerCase().includes(name)) && (!date || f.date === date))
      .sort((a, b) => (newestFirst ? b.date.localeCompare(a.date) : a.date.localeCompare(b.date)))
  }, [folders, filter, newestFirst])

  const onSearch = (e: FormEvent) => {
    e.preventDefault()
    setFilter({ name: nameInput, date: dateInput })
  }

  const clearFilter = () => {
    setNameInput('')
    setDateInput('')
    setFilter({ name: '', date: '' })
  }

  const confirmDelete = () => {
    const folder = folders.find((f) => f.id === confirmDeleteId)
    setConfirmDeleteId(null)
    setSelectedId(null)
    if (!folder) return
    setDeletingId(folder.id)
    window.setTimeout(() => {
      deleteFolder(folder.id)
      addLog('warning', '刪除資料夾', '資料模組', `刪除測驗資料夾「${folder.name}」及其所有測驗紀錄`)
      setDeletingId(null)
    }, DELETE_ANIMATION_MS)
  }

  const exportFolder = () => {
    const folder = folders.find((f) => f.id === exportId)
    if (!folder) return
    const rows = records.filter((r) => r.folderId === folder.id)
    downloadCsv(`${folder.name}_測驗資料`, ...recordCsv(rows))
    addLog('success', '匯出資料', '資料模組', `匯出「${folder.name}」共 ${rows.length} 筆測驗紀錄`)
  }

  const filtered = filter.name !== '' || filter.date !== ''
  const deleteTarget = folders.find((f) => f.id === confirmDeleteId)

  return (
    <section className="page">
      <header className="page-header">
        <h2 className="page-title">測驗資料夾</h2>
        <p className="page-subtitle">管理和查看所有VR虛擬用藥測驗諮詢記錄</p>
      </header>

      <form className="filter-bar" onSubmit={onSearch} role="search">
        <label className="field">
          <span className="field__label">名稱</span>
          <span className="input">
            <Search size={16} />
            <input value={nameInput} onChange={(e) => setNameInput(e.target.value)} placeholder="輸入名稱搜尋" />
          </span>
        </label>
        <label className="field">
          <span className="field__label">日期</span>
          <span className="input">
            <CalendarDays size={16} />
            <input type="date" value={dateInput} onChange={(e) => setDateInput(e.target.value)} aria-label="選擇日期" />
          </span>
        </label>
        <div className="filter-bar__actions">
          <button type="submit" className="btn btn--query">
            <Search size={16} />
            查詢
          </button>
          <button
            type="button"
            className="btn btn--secondary"
            onClick={() => setNewestFirst((v) => !v)}
            aria-label={newestFirst ? '排序：日期由新到舊，點擊改為由舊到新' : '排序：日期由舊到新，點擊改為由新到舊'}
          >
            {newestFirst ? <ArrowDownWideNarrow size={16} /> : <ArrowUpNarrowWide size={16} />}
            排序
          </button>
        </div>
      </form>

      <p className="caption">
        所有測驗 共：{visible.length} 筆資料
        {filtered && (
          <button type="button" className="caption__clear" onClick={clearFilter}>
            <X size={12} /> 清除篩選
          </button>
        )}
      </p>

      {visible.length === 0 ? (
        <div className="empty">
          {folders.length === 0 ? (
            <>
              <p>目前沒有任何測驗資料夾</p>
              <button type="button" className="btn btn--primary" onClick={resetDemo}>
                重置 Demo 資料
              </button>
            </>
          ) : (
            <>
              <p>找不到符合條件的資料夾</p>
              <button type="button" className="btn btn--secondary" onClick={clearFilter}>
                清除篩選
              </button>
            </>
          )}
        </div>
      ) : (
        <ul className="folder-list">
          {visible.map((folder) => {
            const s = stats.get(folder.id) ?? { total: 0, pending: 0 }
            const done = s.pending === 0
            const selected = selectedId === folder.id
            const deleting = deletingId === folder.id
            return (
              <li key={folder.id} className={`folder-row${selected ? ' is-selected' : ''}${deleting ? ' is-deleting' : ''}`} data-folder-row={folder.id}>
                {deleting ? (
                  <div className="folder-row__trash" aria-label={`正在刪除 ${folder.name}`}>
                    <Trash2 size={28} />
                  </div>
                ) : (
                  <>
                    <article className="folder-card">
                      <button type="button" className="folder-card__open" onClick={() => navigate(`/folders/${folder.id}`)} aria-label={`開啟 ${folder.name}`} />
                      <div className="folder-card__top">
                        <span className="folder-card__icon">
                          <Folder size={22} />
                          {s.pending > 0 && <span className="folder-card__badge" aria-label={`${s.pending} 筆未完成`}>{s.pending}</span>}
                        </span>
                        <h3 className="folder-card__name">{folder.name}</h3>
                        <button
                          type="button"
                          className="folder-card__more"
                          onClick={() => setSelectedId(selected ? null : folder.id)}
                          aria-label="更多操作"
                          aria-expanded={selected}
                        >
                          <EllipsisVertical size={20} />
                        </button>
                      </div>
                      <div className="folder-card__bottom">
                        <span className="folder-card__date">
                          {folder.date} · {s.total} 筆測驗
                        </span>
                        <span className={`status-pill${done ? ' status-pill--done' : ''}`}>
                          {done ? <CircleCheck size={16} /> : <Clock3 size={16} />}
                          {done ? '已完成' : '未完成'}
                        </span>
                      </div>
                    </article>
                    {selected && (
                      <div className="folder-row__actions">
                        <button type="button" className="btn btn--sm btn--danger-soft" onClick={() => setConfirmDeleteId(folder.id)}>
                          <Trash2 size={16} /> 刪除
                        </button>
                        <button
                          type="button"
                          className="btn btn--sm btn--accent-soft"
                          onClick={() => {
                            setExportId(folder.id)
                            setSelectedId(null)
                          }}
                        >
                          <Download size={16} /> 匯出
                        </button>
                      </div>
                    )}
                  </>
                )}
              </li>
            )
          })}
        </ul>
      )}

      <ConfirmDialog
        open={deleteTarget !== undefined}
        tone="danger"
        icon={<X size={28} />}
        title="確認刪除測驗資料夾？"
        description={`「${deleteTarget?.name ?? ''}」刪除後無法復原，請再次確認。`}
        confirmLabel="刪除"
        onCancel={() => setConfirmDeleteId(null)}
        onConfirm={confirmDelete}
      />

      <ExportFlow open={exportId !== null} onExport={exportFolder} onClose={() => setExportId(null)} />
    </section>
  )
}
