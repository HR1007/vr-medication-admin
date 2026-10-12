import { useEffect, useRef, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import './ConfirmDialog.css'

type Props = {
  open: boolean
  icon: ReactNode
  tone?: 'primary' | 'danger'
  title: string
  description: string
  confirmLabel: string
  cancelLabel?: string
  onConfirm: () => void
  onCancel: () => void
}

/** Small centered confirmation dialog (登出 / 刪除 / 匯出 confirmations in Figma). */
export default function ConfirmDialog({
  open,
  icon,
  tone = 'primary',
  title,
  description,
  confirmLabel,
  cancelLabel = '取消',
  onConfirm,
  onCancel,
}: Props) {
  const confirmRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return
    const previous = document.activeElement as HTMLElement | null
    confirmRef.current?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel()
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
      previous?.focus()
    }
  }, [open, onCancel])

  if (!open) return null

  return createPortal(
    <div className="dialog-overlay" onMouseDown={(e) => e.target === e.currentTarget && onCancel()}>
      <div className={`confirm confirm--${tone}`} role="alertdialog" aria-modal="true" aria-labelledby="confirm-title" aria-describedby="confirm-desc">
        <span className="confirm__icon">{icon}</span>
        <h2 id="confirm-title" className="confirm__title">{title}</h2>
        <p id="confirm-desc" className="confirm__desc">{description}</p>
        <div className="confirm__actions">
          <button type="button" className="confirm__btn confirm__btn--ghost" onClick={onCancel}>
            {cancelLabel}
          </button>
          <button ref={confirmRef} type="button" className="confirm__btn confirm__btn--solid" onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
