import { Route, Routes } from 'react-router-dom'
import { AppLayout } from './components/AppLayout.jsx'
import Landing from './pages/public/Landing.jsx'
import { Login, Recover, Register } from './pages/public/Auth.jsx'
import NotFound from './pages/public/NotFound.jsx'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<Recover />} />

      <Route element={<AppLayout />}>
        <Route path="/me/*" element={<NotFound inApp />} />
        <Route path="/notifications" element={<NotFound inApp />} />
        <Route path="/account" element={<NotFound inApp />} />
        <Route path="/p/:productId/*" element={<NotFound inApp />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}