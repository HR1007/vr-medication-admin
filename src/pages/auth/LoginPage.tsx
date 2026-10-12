import { useState, type FormEvent } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { LockKeyhole, UserRound } from 'lucide-react'
import { useAuth } from '../../lib/auth'
import { useStore } from '../../lib/store'
import { AuthField, AuthShell } from './AuthShell'

type Phase = 'idle' | 'loading' | 'leaving'

const SIGN_IN_DELAY = 900
const LEAVE_DURATION = 600

export default function LoginPage() {
  const { user, login } = useAuth()
  const { addLog } = useStore()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: string } | null)?.from ?? '/folders'

  // Demo account is pre-filled so visitors can sign straight in.
  const [username, setUsername] = useState('Marry1234')
  const [password, setPassword] = useState('demo1234')
  const [remember, setRemember] = useState(false)
  const [errors, setErrors] = useState<{ username?: string; password?: string }>({})
  const [phase, setPhase] = useState<Phase>('idle')

  if (user && phase === 'idle') return <Navigate to={from} replace />

  const ready = username.trim() !== '' && password !== ''

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    const next = {
      username: username.trim() ? undefined : '請輸入使用者名稱',
      password: password ? undefined : '請輸入密碼',
    }
    setErrors(next)
    if (next.username || next.password) return

    setPhase('loading')
    window.setTimeout(() => {
      setPhase('leaving')
      window.setTimeout(() => {
        login(username.trim(), remember)
        addLog('info', '使用者登入', '登入模組', `${username.trim()} 登入後台管理系統`)
        navigate(from, { replace: true })
      }, LEAVE_DURATION)
    }, SIGN_IN_DELAY)
  }

  const busy = phase !== 'idle'

  return (
    <AuthShell leaving={phase === 'leaving'}>
      <div className="auth__heading">
        <h1>虛擬用藥諮詢</h1>
        <p>測驗後台管理系統</p>
      </div>

      <form className="auth__form" onSubmit={onSubmit} noValidate>
        <AuthField
          name="username"
          label="使用者名稱"
          icon={UserRound}
          required
          autoComplete="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          error={errors.username}
          disabled={busy}
        />
        <AuthField
          name="password"
          type="password"
          label="密碼"
          icon={LockKeyhole}
          required
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
          disabled={busy}
        />
        <div className="auth__row">
          <label className="auth__check">
            <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} disabled={busy} />
            Remember me
          </label>
          <Link to="/forgot" className="auth__link">
            忘記密碼？
          </Link>
        </div>

        <button type="submit" className={`auth__submit${ready ? ' is-ready' : ''}${busy ? ' is-loading' : ''}`} disabled={busy}>
          {busy ? '登入中' : '登入'}
        </button>
        <p className="auth__demo-note">作品集互動 Demo：任意帳號密碼皆可登入，資料只會存在你的瀏覽器</p>
      </form>
    </AuthShell>
  )
}
