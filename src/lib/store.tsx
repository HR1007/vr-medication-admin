import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { createSeed, type DemoData, type LogEntry, type LogLevel, type TestRecord } from '../data/seed'

/**
 * Demo "database": the seed data plus every change a visitor makes, persisted
 * to localStorage so deletes / edits survive a reload. resetDemo() restores the seed.
 */
const STORAGE_KEY = 'vrma-data-v2'

function load(): DemoData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw) as DemoData
    localStorage.removeItem('vrma-data-v1') // data saved by an older version of the demo
  } catch {
    // corrupted or unavailable storage — fall back to the seed
  }
  return createSeed()
}

const pad = (n: number) => String(n).padStart(2, '0')
export function nowStamp(d = new Date()) {
  return `${d.getFullYear()}/${pad(d.getMonth() + 1)}/${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

type Store = DemoData & {
  deleteFolder: (folderId: string) => void
  deleteRecords: (recordIds: string[]) => void
  updateRecord: (recordId: string, patch: Partial<Pick<TestRecord, 'grade' | 'studentId' | 'score'>>) => void
  deleteAnswer: (recordId: string, answerId: string) => void
  addLog: (level: LogLevel, title: string, module: string, message: string) => void
  deleteLog: (logId: string) => void
  resetDemo: () => void
}

const StoreContext = createContext<Store | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<DemoData>(load)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    } catch {
      // storage full / unavailable — changes last until reload
    }
  }, [data])

  const addLog = useCallback((level: LogLevel, title: string, module: string, message: string) => {
    const entry: LogEntry = { id: `l${Date.now()}${Math.random().toString(36).slice(2, 6)}`, level, title, module, message, at: nowStamp() }
    setData((d) => ({ ...d, logs: [entry, ...d.logs] }))
  }, [])

  const deleteFolder = useCallback((folderId: string) => {
    setData((d) => ({
      ...d,
      folders: d.folders.filter((f) => f.id !== folderId),
      records: d.records.filter((r) => r.folderId !== folderId),
    }))
  }, [])

  const deleteRecords = useCallback((recordIds: string[]) => {
    const ids = new Set(recordIds)
    setData((d) => ({ ...d, records: d.records.filter((r) => !ids.has(r.id)) }))
  }, [])

  const updateRecord: Store['updateRecord'] = useCallback((recordId, patch) => {
    setData((d) => ({ ...d, records: d.records.map((r) => (r.id === recordId ? { ...r, ...patch } : r)) }))
  }, [])

  const deleteAnswer = useCallback((recordId: string, answerId: string) => {
    setData((d) => ({
      ...d,
      records: d.records.map((r) => (r.id === recordId ? { ...r, answers: r.answers.filter((a) => a.id !== answerId) } : r)),
    }))
  }, [])

  const deleteLog = useCallback((logId: string) => {
    setData((d) => ({ ...d, logs: d.logs.filter((l) => l.id !== logId) }))
  }, [])

  const resetDemo = useCallback(() => setData(createSeed()), [])

  const value = useMemo(
    () => ({ ...data, deleteFolder, deleteRecords, updateRecord, deleteAnswer, addLog, deleteLog, resetDemo }),
    [data, deleteFolder, deleteRecords, updateRecord, deleteAnswer, addLog, deleteLog, resetDemo],
  )

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStore() {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore must be used inside StoreProvider')
  return ctx
}
