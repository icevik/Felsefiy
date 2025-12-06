import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Layout from './components/Layout'
import RequireAuth from './components/RequireAuth'
import Dashboard from './pages/Dashboard'
import Projects from './pages/Projects'
import ProjectDetail from './pages/ProjectDetail'
import SessionView from './pages/SessionView'
import Strategies from './pages/Strategies'
import PromptOptimizer from './pages/PromptOptimizer'
import Login from './pages/Login'

// React Router v7 uyumlu yapılandırma
const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />
  },
  {
    path: '/',
    element: (
      <RequireAuth>
        <Layout />
      </RequireAuth>
    ),
    children: [
      { index: true, element: <Dashboard /> },
      { path: 'projects', element: <Projects /> },
      { path: 'projects/:id', element: <ProjectDetail /> },
      { path: 'projects/:projectId/optimizer', element: <PromptOptimizer /> },
      { path: 'sessions/:id', element: <SessionView /> },
      { path: 'strategies', element: <Strategies /> }
    ]
  }
], {
  future: {
    v7_startTransition: true,
    v7_relativeSplatPath: true
  }
})

function App() {
  return <RouterProvider router={router} />
}

export default App
