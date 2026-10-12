import { useEffect, useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { AlignLeft, FolderOpen, LogOut, MessageSquare, Moon, Search, Settings, Sun, UserRound } from 'lucide-react'
import { asset } from '../lib/asset'
import { useTheme } from '../lib/theme'
import { useAuth } from '../lib/auth'
import { useStore } from '../lib/store'
import ConfirmDialog from '../components/ConfirmDialog'
import './AppLayout.css'

type NavItem = { to: string; label: string; icon: typeof FolderOpen; end?: boolean }

/** 「測驗總覽」 only appears in the menu once a folder has been opened, as in the Figma screens. */
function buildNavItems(pathname: string): NavItem[] {
  const folderId = pathname.match(/^\/folders\/([^/]+)/)?.[1]
  const items: NavItem[] = [{ to: '/folders', label: '測驗資料夾', icon: FolderOpen, end: true }]
  if (folderId) items.push({ to: `/folders/${folderId}`, label: '測驗總覽', icon: MessageSquare })
  if (pathname.startsWith('/system')) items.push({ to: '/system', label: '系統日誌', icon: Settings })
  return items
}

const COLLAPSE_KEY = 'vrma-sidebar-collapsed'
const narrowScreen = () => window.matchMedia('(max-width: 1023px)').matches
/** On phones the expanded sidebar overlays the page, so it closes after each navigation. */
const phoneScreen = () => window.matchMedia('(max-width: 767px)').matches

export default function AppLayout() {
  const { theme, toggleTheme } = useTheme()
  const { pathname } = useLocation()
  const navItems = buildNavItems(pathname)
  const { user, logout } = useAuth()
  const { addLog } = useStore()
  const navigate = useNavigate()
  const [confirmLogout, setConfirmLogout] = useState(false)
  const [collapsed, setCollapsed] = useState(() => {
    if (narrowScreen()) return true
    try {
      return localStorage.getItem(COLLAPSE_KEY) === '1'
    } catch {
      return false
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(COLLAPSE_KEY, collapsed ? '1' : '0')
    } catch {
      // ignore
    }
  }, [collapsed])

  return (
    <div className="app">
      <header className="topnav">
        <div className="topnav__brand">
          <span className="topnav__logo">
            <img src={asset('img/app-logo.png')} alt="" width={32} height={32} />
          </span>
          <h1 className="topnav__title">虛擬用藥諮詢後台管理系統</h1>
        </div>

        <button
          type="button"
          className="theme-toggle"
          data-theme-state={theme}
          onClick={toggleTheme}
          aria-label={theme === 'light' ? '切換為暗色主題' : '切換為亮色主題'}
          aria-pressed={theme === 'dark'}
        >
          <span className="theme-toggle__icon theme-toggle__icon--sun"><Sun size={16} /></span>
          <span className="theme-toggle__icon theme-toggle__icon--moon"><Moon size={16} /></span>
          <span className="theme-toggle__knob" />
        </button>

        <NavLink to="/system" className={({ isActive }) => `topnav__system${isActive ? ' is-active' : ''}`}>
          <Settings size={20} />
          <span>系統日誌</span>
        </NavLink>
      </header>

      <div className="app__body">
        <aside className={`sidebar${collapsed ? ' is-collapsed' : ''}`} aria-label="主選單">
          <div className="sidebar__content">
            <div className="sidebar__logo">
              <button
                type="button"
                className="sidebar__toggle"
                onClick={() => setCollapsed((c) => !c)}
                aria-label={collapsed ? '展開側欄' : '收合側欄'}
                aria-expanded={!collapsed}
              >
                <AlignLeft size={22} />
              </button>
              {!collapsed && <img className="sidebar__school" src={asset('img/school-logo-sidebar.png')} alt="大仁科技大學" width={138} height={24} />}
            </div>

            {collapsed ? (
              <button type="button" className="sidebar__icon-btn" onClick={() => setCollapsed(false)} aria-label="搜尋">
                <Search size={22} />
              </button>
            ) : (
              <label className="sidebar__search">
                <Search size={22} />
                <input type="search" placeholder="搜尋..." aria-label="搜尋選單" />
              </label>
            )}

            <nav className="sidebar__nav">
              {navItems.map(({ to, label, icon: Icon, end }) => (
                <NavLink
                  key={label}
                  to={to}
                  end={end}
                  onClick={() => phoneScreen() && setCollapsed(true)}
                  className={({ isActive }) => `sidebar__item${isActive ? ' is-active' : ''}`}
                  title={collapsed ? label : undefined}
                >
                  <Icon size={22} />
                  {!collapsed && <span>{label}</span>}
                </NavLink>
              ))}
            </nav>
          </div>

          <div className="sidebar__user">
            {collapsed ? (
              <button type="button" className="avatar" onClick={() => setConfirmLogout(true)} aria-label="登出">
                <UserRound size={22} />
                <span className="avatar__status" />
              </button>
            ) : (
              <span className="avatar">
                <UserRound size={22} />
                <span className="avatar__status" />
              </span>
            )}
            {!collapsed && (
              <>
                <span className="sidebar__user-text">
                  <strong>{user?.displayName}</strong>
                  <small>{user?.role}</small>
                </span>
                <button type="button" className="sidebar__logout" onClick={() => setConfirmLogout(true)}>
                  <LogOut size={22} />
                  <span>登出</span>
                </button>
              </>
            )}
          </div>
        </aside>

        {!collapsed && <div className="sidebar-backdrop" onClick={() => setCollapsed(true)} aria-hidden />}

        <main className="app__main">
          <Outlet />
        </main>
      </div>

      <ConfirmDialog
        open={confirmLogout}
        icon={<UserRound size={22} />}
        title="確認登出？"
        description="登出後需重新登入帳號。"
        confirmLabel="登出"
        onCancel={() => setConfirmLogout(false)}
        onConfirm={() => {
          setConfirmLogout(false)
          addLog('info', '使用者登出', '登入模組', `${user?.displayName ?? ''} 登出後台管理系統`)
          logout()
          navigate('/login', { replace: true })
        }}
      />
    </div>
  )
}
