import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowUp, BookOpen, CalendarDays, ChevronLeft, Clock3, Download, FileText, Pencil, Play, Square, Trash2, UserPen, UserRound, X } from 'lucide-react'
import ConfirmDialog from '../../components/ConfirmDialog'
import ExportFlow from '../../components/ExportFlow'
import EditStudentDialog from '../../components/EditStudentDialog'
import { downloadCsv } from '../../lib/csv'
import { useStore } from '../../lib/store'
import { useSpeech } from '../../lib/useSpeech'
import './RecordPage.css'

/** Every scenario in the demo has four questions. */
const TOTAL_QUESTIONS = 4
const DELETE_ANIMATION_MS = 650

const formatDuration = (sec: number) => `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`
const formatStamp = (stamp: string) => stamp.replaceAll('/', '-').replace(' ', '-')

export default function RecordPage() {
  const { folderId = '', recordId = '' } = useParams()
  const { folders, records, updateRecord, deleteAnswer, addLog } = useStore()
  const folder = folders.find((f) => f.id === folderId)
  const record = records.find((r) => r.id === recordId && r.folderId === folderId)

  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [exportId, setExportId] = useState<string | null>(null)
  const [editing, setEditing] = useState(false)
  const [saved, setSaved] = useState(false)
  const [showTop, setShowTop] = useState(false)
  const speech = useSpeech()

  const roster = useMemo(() => [...new Set(records.map((r) => r.studentId))].sort(), [records])

  // The dashboard scrolls inside <main>, not the window.
  useEffect(() => {
    const main = document.querySelector('.app__main')
    if (!main) return
    const onScroll = () => setShowTop(main.scrollTop > 240)
    main.addEventListener('scroll', onScroll, { passive: true })
    return () => main.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (!selectedId) return
    const onDown = (e: MouseEvent) => {
      if (!(e.target as Element).closest(`[data-answer="${selectedId}"]`)) setSelectedId(null)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [selectedId])

  if (!folder || !record) {
    return (
      <section className="page">
        <Link to={folder ? `/folders/${folder.id}` : '/folders'} className="back-link">
          <ChevronLeft size={16} /> 回上一頁
        </Link>
        <div className="empty">
          <p>找不到這筆作答紀錄，可能已被刪除。</p>
          <Link to={folder ? `/folders/${folder.id}` : '/folders'} className="btn btn--primary">
            返回測驗總覽
          </Link>
        </div>
      </section>
    )
  }

  const answered = record.answers.length
  const percent = Math.round((answered / TOTAL_QUESTIONS) * 1000) / 10

  const runDelete = () => {
    const answer = record.answers.find((a) => a.id === confirmDeleteId)
    setConfirmDeleteId(null)
    setSelectedId(null)
    if (!answer) return
    if (speech.playingId === answer.id) speech.stop()
    setDeletingId(answer.id)
    window.setTimeout(() => {
      deleteAnswer(record.id, answer.id)
      addLog('warning', '刪除作答紀錄', '測驗模組', `刪除 ${record.studentName}（${record.studentId}）的一筆作答紀錄`)
      setDeletingId(null)
    }, DELETE_ANIMATION_MS)
  }

  const runExport = () => {
    const list = record.answers.filter((a) => a.id === exportId)
    downloadCsv(`${record.studentId}_${folder.name}_作答紀錄`, ['學號', '姓名', '題號', '問題', '學生回答'], list.map((a) => [record.studentId, record.studentName, record.answers.indexOf(a) + 1, a.question, a.answer]))
    addLog('success', '匯出資料', '測驗模組', `匯出 ${record.studentName} 的作答紀錄`)
  }

  const stats = [
    { icon: UserRound, label: '學號', value: record.studentId },
    { icon: BookOpen, label: '年級', value: String(record.grade) },
    { icon: FileText, label: '測驗分數', value: record.status === 'done' ? String(record.score) : '—' },
    { icon: CalendarDays, label: '測驗時間', value: formatStamp(record.testedAt) },
    { icon: Clock3, label: '測驗總時長', value: formatDuration(record.durationSeconds) },
  ]

  return (
    <section className="page record">
      <Link to={`/folders/${folder.id}`} className="back-link">
        <ChevronLeft size={16} /> 回上一頁
      </Link>

      <div className="record-summary">
        <dl className="record-summary__stats">
          {stats.map(({ icon: Icon, label, value }) => (
            <div key={label} className="record-summary__stat">
              <dt>
                <Icon size={16} /> {label}
              </dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>
        <div className="record-progress">
          <div className="record-progress__head">
            <span>答題進度</span>
            <span>
              <strong>
                {answered} / {TOTAL_QUESTIONS}
              </strong>{' '}
              題已完成
            </span>
          </div>
          <div className="record-progress__track" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent} aria-label="答題進度">
            <span style={{ width: `${percent}%` }} />
          </div>
          <span className="record-progress__pct">{percent.toFixed(1)} % 完成</span>
        </div>
      </div>

      <div className="record__edit-row">
        {saved && (
          <span className="record__saved" role="status">
            已更新學生資訊
          </span>
        )}
        <button type="button" className="btn record__edit" onClick={() => setEditing(true)}>
          <UserPen size={16} /> 編輯學生資訊
        </button>
      </div>

      <header className="record__heading">
        <h2 className="page-title">測驗名稱：{folder.name} 學生問作答記錄</h2>
        <span className="tests__count">
          {record.studentName} · 共{answered}筆資料
        </span>
      </header>

      {answered === 0 ? (
        <div className="empty">這位學生目前沒有作答紀錄</div>
      ) : (
        <ol className="answer-list">
          {record.answers.map((a, i) => {
            const selected = selectedId === a.id
            const playing = speech.playingId === a.id
            if (deletingId === a.id) {
              return (
                <li key={a.id} className="answer-row is-deleting">
                  <div className="answer-row__trash">
                    <Trash2 size={28} />
                  </div>
                </li>
              )
            }
            return (
              <li key={a.id} className={`answer-row${selected ? ' is-selected' : ''}`} data-answer={a.id}>
                <article className="answer-card">
                  <span className="answer-card__no">{i + 1}</span>
                  <div className="answer-card__body">
                    <div className="answer-card__q">
                      <div>
                        <h3>問題</h3>
                        <p>{a.question}</p>
                      </div>
                      <button type="button" className={`btn answer-card__edit${selected ? ' is-on' : ''}`} onClick={() => setSelectedId(selected ? null : a.id)} aria-expanded={selected}>
                        <Pencil size={16} /> 編輯
                      </button>
                    </div>
                    <blockquote className="answer-card__a">
                      <h4>學生回答</h4>
                      <p>{a.answer}</p>
                    </blockquote>
                    <div className="answer-card__audio">
                      <span>學生回答錄音檔</span>
                      <button
                        type="button"
                        className={`answer-card__play${playing ? ' is-playing' : ''}`}
                        onClick={() => (playing ? speech.stop() : speech.play(a.id, a.answer, a.audioSeconds))}
                        aria-label={playing ? '停止播放' : `播放第 ${i + 1} 題學生回答`}
                      >
                        {playing ? <Square size={14} /> : <Play size={14} />}
                        {playing ? '停止' : '播放'}
                      </button>
                      {playing && (
                        <span className="answer-card__wave" aria-hidden>
                          <span style={{ width: `${speech.progress * 100}%` }} />
                        </span>
                      )}
                      <span className="answer-card__len">{formatDuration(a.audioSeconds)}</span>
                    </div>
                  </div>
                </article>
                {selected && (
                  <div className="folder-row__actions">
                    <button type="button" className="btn btn--sm btn--danger-soft" onClick={() => setConfirmDeleteId(a.id)}>
                      <Trash2 size={16} /> 刪除
                    </button>
                    <button
                      type="button"
                      className="btn btn--sm btn--accent-soft"
                      onClick={() => {
                        setExportId(a.id)
                        setSelectedId(null)
                      }}
                    >
                      <Download size={16} /> 匯出
                    </button>
                  </div>
                )}
              </li>
            )
          })}
        </ol>
      )}

      {showTop && (
        <button type="button" className="scroll-top" onClick={() => document.querySelector('.app__main')?.scrollTo({ top: 0, behavior: 'smooth' })} aria-label="回到頂端">
          <ArrowUp size={24} />
        </button>
      )}

      <ConfirmDialog
        open={confirmDeleteId !== null}
        tone="danger"
        icon={<X size={28} />}
        title="確認刪除作答紀錄？"
        description="刪除後無法復原，請再次確認。"
        confirmLabel="刪除"
        onCancel={() => setConfirmDeleteId(null)}
        onConfirm={runDelete}
      />

      <ExportFlow open={exportId !== null} onExport={runExport} onClose={() => setExportId(null)} />

      {editing && (
        <EditStudentDialog
          initial={{ grade: record.grade, studentId: record.studentId, score: record.score }}
          suggestions={roster.filter((id) => id !== record.studentId)}
          onCancel={() => setEditing(false)}
          onSave={(patch) => {
            updateRecord(record.id, patch)
            addLog('info', '編輯學生資訊', '測驗模組', `更新 ${record.studentName} 的資料：年級 ${patch.grade}、學號 ${patch.studentId}、分數 ${patch.score}`)
            setEditing(false)
            setSaved(true)
            window.setTimeout(() => setSaved(false), 2500)
          }}
        />
      )}
    </section>
  )
}
