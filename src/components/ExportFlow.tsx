import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Check, Folder } from 'lucide-react'
import ConfirmDialog from './ConfirmDialog'
import './ExportFlow.css'

type Stage = 'confirm' | 'progress' | 'done'

const PROGRESS_MS = 1600
const DONE_MS = 1400

type Props = { open: boolean; onExport: () => void; onClose: () => void }

/**
 * Donwnload Confirmation sequence from Figma: confirm → 下載中 progress bar → 匯出完成.
 * `onExport` runs when the progress finishes (that is when the CSV is downloaded).
 */
export default function ExportFlow({ open, ...rest }: Props) {
  // Mounting the inner flow on open gives every export a fresh 'confirm' stage.
  return open ? <ExportSequence {...rest} /> : null
}

function ExportSequence({ onExport, onClose }: Omit<Props, 'open'>) {
  const [stage, setStage] = useState<Stage>('confirm')
  // Callbacks live in refs so parent re-renders (e.g. the store updating) don't restart the timers.
  const onExportRef = useRef(onExport)
  const onCloseRef = useRef(onClose)
  useEffect(() => {
    onExportRef.current = onExport
    onCloseRef.current = onClose
  })

  useEffect(() => {
    if (stage === 'progress') {
      const t = window.setTimeout(() => {
        onExportRef.current()
        setStage('done')
      }, PROGRESS_MS)
      return () => window.clearTimeout(t)
    }
    if (stage === 'done') {
      const t = window.setTimeout(() => onCloseRef.current(), DONE_MS)
      return () => window.clearTimeout(t)
    }
  }, [stage])

  if (stage === 'confirm') {
    return (
      <ConfirmDialog
        open
        icon={<Folder size={22} />}
        title="確認要匯出資料嗎？"
        description="將測驗資料匯出至指定資料夾。"
        confirmLabel="確認"
        onCancel={onClose}
        onConfirm={() => setStage('progress')}
      />
    )
  }

  return createPortal(
    <div className="dialog-overlay" onMouseDown={(e) => stage === 'done' && e.target === e.currentTarget && onClose()}>
      <div className="export-status" role="status" aria-live="polite">
        {stage === 'progress' ? (
          <>
            <div className="export-status__track">
              <span className="export-status__bar" style={{ animationDuration: `${PROGRESS_MS}ms` }} />
            </div>
            <span className="export-status__chip">下載中.....</span>
          </>
        ) : (
          <>
            <span className="export-status__icon">
              <Folder size={20} />
            </span>
            <span className="export-status__done">
              <Check size={18} strokeWidth={3} /> 匯出完成
            </span>
          </>
        )}
      </div>
    </div>,
    document.body,
  )
}
