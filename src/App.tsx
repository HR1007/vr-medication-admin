import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import AppLayout from './layout/AppLayout'
import Placeholder from './pages/Placeholder'
import LoginPage from './pages/auth/LoginPage'
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage'
import FoldersPage from './pages/folders/FoldersPage'
import TestsPage from './pages/tests/TestsPage'
import { StoreProvider } from './lib/store'
import { ThemeProvider } from './lib/theme'
import { AuthProvider, RequireAuth } from './lib/auth'

// HashRouter keeps deep links working on GitHub Pages, which has no SPA fallback.
export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <StoreProvider>
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
              <Route path="/folders" element={<FoldersPage />} />
              <Route path="/folders/:folderId" element={<TestsPage />} />
              <Route path="/folders/:folderId/records/:recordId" element={<Placeholder title="學生作答記錄" description="下一階段建置" />} />
              <Route path="/system" element={<Placeholder title="系統操作日誌" description="查看和管理所有系統操作、登入及異常事件記錄" />} />
            </Route>
            <Route path="*" element={<Navigate to="/folders" replace />} />
          </Routes>
        </HashRouter>
        </StoreProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}
