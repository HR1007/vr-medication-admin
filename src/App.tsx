import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import AppLayout from './layout/AppLayout'
import LoginPage from './pages/auth/LoginPage'
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage'
import FoldersPage from './pages/folders/FoldersPage'
import TestsPage from './pages/tests/TestsPage'
import RecordPage from './pages/record/RecordPage'
import SystemPage from './pages/system/SystemPage'
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
              <Route path="/folders/:folderId/records/:recordId" element={<RecordPage />} />
              <Route path="/system" element={<SystemPage />} />
            </Route>
            <Route path="*" element={<Navigate to="/folders" replace />} />
          </Routes>
        </HashRouter>
        </StoreProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}
