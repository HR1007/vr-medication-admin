import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import AppLayout from './layout/AppLayout'
import Placeholder from './pages/Placeholder'
import LoginPage from './pages/auth/LoginPage'
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage'
import { ThemeProvider } from './lib/theme'
import { AuthProvider, RequireAuth } from './lib/auth'

// HashRouter keeps deep links working on GitHub Pages, which has no SPA fallback.
export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <HashRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/forgot" element={<ForgotPasswordPage />} />
            <Route
              element={
                <RequireAuth>
                  <AppLayout />
                </RequireAuth>
              }
            >
              <Route path="/folders" element={<Placeholder title="測驗資料夾" description="管理和查看所有VR虛擬用藥測驗諮詢記錄" />} />
              <Route path="/folders/:folderId" element={<Placeholder title="測驗總覽" description="下一階段建置" />} />
              <Route path="/system" element={<Placeholder title="系統操作日誌" description="查看和管理所有系統操作、登入及異常事件記錄" />} />
            </Route>
            <Route path="*" element={<Navigate to="/folders" replace />} />
          </Routes>
        </HashRouter>
      </AuthProvider>
    </ThemeProvider>
  )
}
