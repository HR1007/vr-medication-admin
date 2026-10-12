import { useState, type InputHTMLAttributes, type ReactNode } from 'react'
import { ArrowLeft, Eye, EyeOff, type LucideIcon } from 'lucide-react'
import { asset } from '../../lib/asset'
import './auth.css'

/** Gradient + illustration background with the white rounded card from the Login / Reset Password screens. */
export function AuthShell({ children, leaving = false, onBack }: { children: ReactNode; leaving?: boolean; onBack?: () => void }) {
  return (
    <div className="auth" style={{ backgroundImage: `url(${asset('img/login-bg.jpg')})` }}>
      <div className={`auth__card${leaving ? ' is-leaving' : ''}`}>
        {onBack && (
          <button type="button" className="auth__back" onClick={onBack} aria-label="返回">
            <ArrowLeft size={14} strokeWidth={3} />
          </button>
        )}
        <img className="auth__logo" src={asset('img/school-logo.png')} alt="大仁科技大學 Tajen University" width={400} height={84} />
        {children}
      </div>
    </div>
  )
}

type FieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string
  icon: LucideIcon
  error?: string
  required?: boolean
}

export function AuthField({ label, icon: Icon, error, required, type = 'text', id, ...input }: FieldProps) {
  const [reveal, setReveal] = useState(false)
  const isPassword = type === 'password'
  const fieldId = id ?? input.name

  return (
    <div className="auth-field">
      <label className="auth-field__label" htmlFor={fieldId}>
        <span>{label}</span>
        {required && <span className="auth-field__required">必填</span>}
      </label>
      <div className={`auth-field__box${error ? ' has-error' : ''}`}>
        <Icon size={16} className="auth-field__icon" aria-hidden />
        <input
          id={fieldId}
          type={isPassword && reveal ? 'text' : type}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${fieldId}-error` : undefined}
          {...input}
        />
        {isPassword && (
          <button type="button" className="auth-field__eye" onClick={() => setReveal((r) => !r)} aria-label={reveal ? '隱藏密碼' : '顯示密碼'}>
            {reveal ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>
      {error && (
        <p className="auth-field__error" id={`${fieldId}-error`} role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
