import { useRef, useState, type ClipboardEvent, type FormEvent, type KeyboardEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { CircleCheck, LockKeyhole, Mail } from 'lucide-react'
import { AuthField, AuthShell } from './AuthShell'

type Step = 'email' | 'code' | 'verified' | 'password' | 'done'

const CODE_LENGTH = 5
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const maskEmail = (email: string) => {
  const [name, domain = ''] = email.split('@')
  return `${name}@${domain.slice(0, 1)}...${domain.slice(domain.lastIndexOf('.'))}`
}

/** Reset Password/1–5: email → code → verified → new password → done. */
export default function ForgotPasswordPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState<Step>('email')
  const [email, setEmail] = useState('Marry1234@themail.com')
  const [emailError, setEmailError] = useState<string>()
  const [code, setCode] = useState<string[]>(Array(CODE_LENGTH).fill(''))
  const [codeError, setCodeError] = useState<string>()
  const [resent, setResent] = useState(false)
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [passwordErrors, setPasswordErrors] = useState<{ password?: string; confirm?: string }>({})
  const codeRefs = useRef<(HTMLInputElement | null)[]>([])

  const goBack = () => {
    if (step === 'email' || step === 'done') navigate('/login')
    else if (step === 'code') setStep('email')
    else setStep('code')
  }

  const submitEmail = (e: FormEvent) => {
    e.preventDefault()
    if (!EMAIL_PATTERN.test(email.trim())) return setEmailError('請輸入有效的電子郵件地址')
    setEmailError(undefined)
    setCode(Array(CODE_LENGTH).fill(''))
    setStep('code')
  }

  const setDigit = (index: number, value: string) => {
    const digit = value.replace(/\D/g, '').slice(-1)
    setCode((prev) => prev.map((d, i) => (i === index ? digit : d)))
    setCodeError(undefined)
    if (digit && index < CODE_LENGTH - 1) codeRefs.current[index + 1]?.focus()
  }

  const onCodeKey = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) codeRefs.current[index - 1]?.focus()
  }

  const onCodePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    const digits = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, CODE_LENGTH)
    if (!digits) return
    e.preventDefault()
    setCode(Array.from({ length: CODE_LENGTH }, (_, i) => digits[i] ?? ''))
    codeRefs.current[Math.min(digits.length, CODE_LENGTH - 1)]?.focus()
  }

  const submitCode = (e: FormEvent) => {
    e.preventDefault()
    if (code.some((d) => d === '')) return setCodeError(`請輸入 ${CODE_LENGTH} 位數驗證碼`)
    setStep('verified')
  }

  const resend = () => {
    setResent(true)
    window.setTimeout(() => setResent(false), 3000)
  }

  const submitPassword = (e: FormEvent) => {
    e.preventDefault()
    const next = {
      password: password.length < 8 ? '密碼至少需要 8 個字元' : undefined,
      confirm: confirm !== password ? '兩次輸入的密碼不一致' : undefined,
    }
    setPasswordErrors(next)
    if (!next.password && !next.confirm) setStep('done')
  }

  return (
    <AuthShell onBack={goBack}>
      {step === 'email' && (
        <form className="auth__form" onSubmit={submitEmail} noValidate>
          <div className="auth__step-heading">
            <h1>忘記密碼</h1>
            <p>請輸入您的電子郵件地址傳送驗證碼以重設密碼</p>
          </div>
          <AuthField
            name="email"
            type="email"
            label="您的電子信箱"
            icon={Mail}
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={emailError}
          />
          <button type="submit" className="auth__submit">
            傳送驗證碼
          </button>
        </form>
      )}

      {step === 'code' && (
        <form className="auth__form" onSubmit={submitCode} noValidate>
          <div className="auth__step-heading">
            <h1>檢查您的信箱</h1>
            <p>
              我們已向 {maskEmail(email)} 發送了重置連結，請輸入您重置郵件中提到的 {CODE_LENGTH} 位數驗證碼
            </p>
          </div>
          <div className="auth__code" role="group" aria-label="驗證碼">
            {code.map((digit, i) => (
              <input
                key={i}
                ref={(el) => {
                  codeRefs.current[i] = el
                }}
                inputMode="numeric"
                autoComplete={i === 0 ? 'one-time-code' : 'off'}
                maxLength={1}
                aria-label={`第 ${i + 1} 位`}
                value={digit}
                onChange={(e) => setDigit(i, e.target.value)}
                onKeyDown={(e) => onCodeKey(i, e)}
                onPaste={onCodePaste}
                autoFocus={i === 0}
              />
            ))}
          </div>
          {codeError && (
            <p className="auth-field__error" role="alert">
              {codeError}
            </p>
          )}
          <p className="auth__hint">
            還沒收到郵件？{' '}
            <button type="button" className="auth__link auth__link--primary" onClick={resend}>
              重新發送郵件
            </button>
          </p>
          {resent && (
            <p className="auth__toast" role="status">
              已重新發送驗證碼（Demo：任意 {CODE_LENGTH} 位數字皆可）
            </p>
          )}
          <button type="submit" className="auth__submit">
            驗證
          </button>
        </form>
      )}

      {step === 'verified' && (
        <div className="auth__form">
          <div className="auth__success">
            <CircleCheck size={64} strokeWidth={1.5} />
          </div>
          <div className="auth__step-heading">
            <h1>密碼重設</h1>
            <p>您的密碼已成功重設！點選確認設定新密碼</p>
          </div>
          <button type="button" className="auth__submit" onClick={() => setStep('password')} autoFocus>
            確認
          </button>
        </div>
      )}

      {step === 'password' && (
        <form className="auth__form" onSubmit={submitPassword} noValidate>
          <div className="auth__step-heading">
            <h1>設置新密碼</h1>
            <p>請建立一組新密碼，並為了安全起見，請確保它與先前的密碼不同</p>
          </div>
          <AuthField
            name="new-password"
            type="password"
            label="您的新密碼"
            icon={LockKeyhole}
            required
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={passwordErrors.password}
            autoFocus
          />
          <AuthField
            name="confirm-password"
            type="password"
            label="再次輸入新密碼"
            icon={LockKeyhole}
            required
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            error={passwordErrors.confirm}
          />
          <button type="submit" className="auth__submit">
            更新密碼
          </button>
        </form>
      )}

      {step === 'done' && (
        <div className="auth__form">
          <div className="auth__success">
            <CircleCheck size={64} strokeWidth={1.5} />
          </div>
          <div className="auth__step-heading">
            <h1>新密碼設置完成</h1>
            <p>您的新密碼已設置完成！點選確認重新登入</p>
          </div>
          <button type="button" className="auth__submit" onClick={() => navigate('/login')} autoFocus>
            確認
          </button>
        </div>
      )}
    </AuthShell>
  )
}
