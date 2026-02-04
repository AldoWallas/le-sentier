import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import '../styles/login.css'

export default function Login() {
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  
  const { signIn, signUp, signInWithGoogle } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setMessage('')
    setLoading(true)

    if (isSignUp) {
      const { error } = await signUp(email, password)
      if (error) {
        setError(error.message)
      } else {
        setMessage('Vérifie ton email pour confirmer ton compte !')
      }
    } else {
      const { error } = await signIn(email, password)
      if (error) {
        setError(error.message)
      } else {
        navigate('/')
      }
    }
    
    setLoading(false)
  }

  const handleGoogleSignIn = async () => {
    setError('')
    const { error } = await signInWithGoogle()
    if (error) {
      setError(error.message)
    }
  }

  return (
    <div className="login-container">
      <div className="login-background">
        <div className="pixel-stars">
          {[...Array(15)].map((_, i) => (
            <div 
              key={i} 
              className="star" 
              style={{
                top: `${Math.random() * 60}%`,
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`
              }}
            />
          ))}
        </div>
      </div>
      
      <div className="login-box pixel-border">
        <h1 className="login-title">LE SENTIER</h1>
        <p className="login-subtitle">Forge ton chemin</p>
        
        {error && <div className="login-error">{error}</div>}
        {message && <div className="login-message">{message}</div>}
        
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label>EMAIL</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="pixel-input"
            />
          </div>
          
          <div className="form-group">
            <label>MOT DE PASSE</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="pixel-input"
            />
          </div>
          
          <button type="submit" className="pixel-btn primary" disabled={loading}>
            {loading ? '...' : (isSignUp ? 'CRÉER UN COMPTE' : 'ENTRER')}
          </button>
        </form>
        
        <div className="login-divider">
          <span>ou</span>
        </div>
        
        <button onClick={handleGoogleSignIn} className="pixel-btn google-btn">
          CONTINUER AVEC GOOGLE
        </button>
        
        <p className="login-switch">
          {isSignUp ? 'Déjà un compte ?' : 'Pas encore de compte ?'}
          <button onClick={() => setIsSignUp(!isSignUp)}>
            {isSignUp ? 'Se connecter' : 'Créer un compte'}
          </button>
        </p>
      </div>
    </div>
  )
}
