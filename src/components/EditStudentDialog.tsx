import { useEffect, useId, useMemo, useRef, useState, type FormEvent } from 'react'
import { createPortal } from 'react-dom'
import './EditStudentDialog.css'

export type StudentPatch = { grade: number; studentId: string; score: number }

type Props = {
  initial: StudentPatch
  suggestions: string[]
  onCancel: () => void
  onSave: (patch: StudentPatch) => void
}

const ID_PATTERN = /^[A-Za-z0-9]{6,12}$/

/** Edit Confirmation modal from Figma: 年級 / 學號 (with suggestions) / 分數. */
export default function EditStudentDialog({ initial, suggestions, onCancel, onSave }: Props) {
  const [grade, setGrade] = useState(String(initial.grade))
  const [studentId, setStudentId] = useState(initial.studentId)
  const [score, setScore] = useState(String(initial.score))
  const [errors, setErrors] = useState<Partial<Record<keyof StudentPatch, string>>>({})
  const [listOpen, setListOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const firstRef = useRef<HTMLInputElement>(null)
  const listId = useId()

  const matches = useMemo(() => {
    const q = studentId.trim().toUpperCase()
    if (!q || q === initial.studentId.toUpperCase()) return []
    return suggestions.filter((s) => s.toUpperCase().startsWith(q) && s.toUpperCase() !== q).slice(0, 5)
  }, [studentId, suggestions, initial.studentId])

  const onCancelRef = useRef(onCancel)
  useEffect(() => {
    onCancelRef.current = onCancel
  })
  useEffect(() => {
    firstRef.current?.focus()
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onCancelRef.current()
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  const pick = (value: string) => {
    setStudentId(value)
    setListOpen(false)
    setActiveIndex(-1)
  }

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const g = Number(grade)
    const sc = Number(score)
    const next = {
      grade: Number.isInteger(g) && g >= 1 && g <= 4 ? undefined : '年級請輸入 1–4',
      studentId: ID_PATTERN.test(studentId.trim()) ? undefined : '學號需為 6–12 位英數字',
      score: score !== '' && Number.isInteger(sc) && sc >= 0 && sc <= 100 ? undefined : '分數請輸入 0–100 的整數',
    }
    setErrors(next)
    if (next.grade || next.studentId || next.score) return
    onSave({ grade: g, studentId: studentId.trim().toUpperCase(), score: sc })
  }

  const showList = listOpen && matches.length > 0

  return createPortal(
    <div className="dialog-overlay" onMouseDown={(e) => e.target === e.currentTarget && onCancel()}>
      <div className="edit-dialog">
        <form className="edit-dialog__card" onSubmit={submit} noValidate role="dialog" aria-modal="true" aria-labelledby="edit-title">
          <h2 id="edit-title" className="edit-dialog__title">
            編輯學生資訊
          </h2>

          <div className="edit-dialog__fields">
            <label className="edit-field">
              <span className="edit-field__label">年級：</span>
              <input ref={firstRef} className="edit-field__input" inputMode="numeric" value={grade} onChange={(e) => setGrade(e.target.value)} aria-invalid={Boolean(errors.grade)} />
              {errors.grade && <span className="edit-field__error">{errors.grade}</span>}
            </label>

            <div className="edit-field">
              <label className="edit-field__label" htmlFor="edit-student-id">
                學號：
              </label>
              <div className="edit-field__combo">
                <input
                  id="edit-student-id"
                  className="edit-field__input"
                  value={studentId}
                  autoComplete="off"
                  role="combobox"
                  aria-expanded={showList}
                  aria-controls={listId}
                  aria-autocomplete="list"
                  aria-invalid={Boolean(errors.studentId)}
                  onChange={(e) => {
                    setStudentId(e.target.value)
                    setListOpen(true)
                    setActiveIndex(-1)
                  }}
                  onBlur={() => window.setTimeout(() => setListOpen(false), 120)}
                  onKeyDown={(e) => {
                    if (!showList) return
                    if (e.key === 'ArrowDown') {
                      e.preventDefault()
                      setActiveIndex((i) => (i + 1) % matches.length)
                    } else if (e.key === 'ArrowUp') {
                      e.preventDefault()
                      setActiveIndex((i) => (i <= 0 ? matches.length - 1 : i - 1))
                    } else if (e.key === 'Enter' && activeIndex >= 0) {
                      e.preventDefault()
                      pick(matches[activeIndex])
                    }
                  }}
                />
                {showList && (
                  <ul className="edit-field__list" id={listId} role="listbox">
                    {matches.map((m, i) => (
                      <li
                        key={m}
                        role="option"
                        aria-selected={i === activeIndex}
                        className={i === activeIndex ? 'is-active' : undefined}
                        onMouseDown={(e) => {
                          e.preventDefault()
                          pick(m)
                        }}
                      >
                        {m}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              {errors.studentId && <span className="edit-field__error">{errors.studentId}</span>}
            </div>

            <label className="edit-field">
              <span className="edit-field__label">分數：</span>
              <input className="edit-field__input" inputMode="numeric" value={score} onChange={(e) => setScore(e.target.value)} aria-invalid={Boolean(errors.score)} />
              {errors.score && <span className="edit-field__error">{errors.score}</span>}
            </label>
          </div>

          <div className="edit-dialog__actions">
            <button type="button" className="edit-dialog__btn edit-dialog__btn--cancel" onClick={onCancel}>
              取消
            </button>
            <button type="submit" className="edit-dialog__btn edit-dialog__btn--confirm">
              確認修改
            </button>
          </div>
        </form>
        <p className="edit-dialog__note">請確認所有資料正確後再提交</p>
      </div>
    </div>,
    document.body,
  )
}
