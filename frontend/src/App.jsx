import { Route, Routes } from 'react-router-dom'
import { AppLayout } from './components/AppLayout.jsx'
import Landing from './pages/public/Landing.jsx'
import { Login, Recover, Register } from './pages/public/Auth.jsx'
import ProductLink from './pages/public/ProductLink.jsx'
import NotFound from './pages/public/NotFound.jsx'
import MyRequests from './pages/personal/MyRequests.jsx'
import RequestDetail from './pages/personal/RequestDetail.jsx'
import SubmitRequest from './pages/personal/SubmitRequest.jsx'
import Notifications from './pages/personal/Notifications.jsx'
import Teams from './pages/product/Teams.jsx'
import Requests from './pages/product/Requests.jsx'
import Sprints from './pages/product/Sprints.jsx'
import Backlog from './pages/product/Backlog.jsx'
import FeatureDetail from './pages/product/FeatureDetail.jsx'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<Recover />} />
      {/* Link gerado para cada produto e distribuido pela equipa aos clientes */}
      <Route path="/r/:token" element={<ProductLink />} />

      <Route element={<AppLayout />}>
        {/* Area do cliente */}
        <Route path="/me" element={<MyRequests />} />
        <Route path="/me/requests/:requestId" element={<RequestDetail />} />
        <Route path="/me/new/:productId" element={<SubmitRequest />} />
        <Route path="/notifications" element={<Notifications />} />

        {/* Area do produto */}
        <Route path="/p/:productId/requests" element={<Requests />} />
        <Route path="/p/:productId/teams" element={<Teams />} />
        <Route path="/p/:productId/backlog" element={<Backlog />} />
        <Route path="/p/:productId/sprints" element={<Sprints />} />
        <Route path="/p/:productId/funcionalidades/:featureId" element={<FeatureDetail />} />

        {/* Paginas ainda por integrar: mostram o aviso dentro da aplicacao */}
        <Route path="/me/*" element={<NotFound inApp />} />
        <Route path="/account" element={<NotFound inApp />} />
        <Route path="/p/:productId/*" element={<NotFound inApp />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}