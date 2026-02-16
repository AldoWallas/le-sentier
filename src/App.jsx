import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import { MessageProvider } from './components/MessageContext'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import NewCharacter from './pages/NewCharacter'

function PrivateRoute({ children }) {
  const { user, loading } = useAuth()
  
  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-text">CHARGEMENT...</div>
      </div>
    )
  }
  
  return user ? children : <Navigate to="/login" />
}

function App() {
  return (
    <MessageProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/new-character"
          element={
            <PrivateRoute>
              <NewCharacter />
            </PrivateRoute>
          }
        />
      </Routes>
    </MessageProvider>
  )
}

export default App
