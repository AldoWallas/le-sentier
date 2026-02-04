import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import '../styles/new-character.css'

const CLASSES = [
  { id: 'chevalier', name: 'CHEVALIER', icon: '⚔️', desc: 'Discipline, régularité, protection' },
  { id: 'mage', name: 'MAGE', icon: '🧙', desc: 'Connaissance, créativité, transformation' },
  { id: 'ranger', name: 'RANGER', icon: '🏹', desc: 'Exploration, adaptation, autonomie' },
  { id: 'barde', name: 'BARDE', icon: '🎵', desc: 'Expression, connexion, inspiration' },
]

const DURATIONS = [
  { id: 'season', name: '90 JOURS', desc: 'Saison / Sprint' },
  { id: 'year', name: '365 JOURS', desc: 'Année complète' },
  { id: 'unlimited', name: 'ILLIMITÉ', desc: 'Sans fin définie' },
]

export default function NewCharacter() {
  const [step, setStep] = useState(1)
  const [characterClass, setCharacterClass] = useState(null)
  const [duration, setDuration] = useState(null)
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const { user } = useAuth()
  const navigate = useNavigate()

  const calculateTargetDate = (durationType) => {
    if (durationType === 'unlimited') return null
    const days = durationType === 'season' ? 90 : 365
    const target = new Date()
    target.setDate(target.getDate() + days)
    return target.toISOString().split('T')[0]
  }

  const handleCreate = async () => {
    if (!characterClass || !duration || !name.trim()) return
    
    setLoading(true)
    setError('')

    const { error: insertError } = await supabase
      .from('characters')
      .insert({
        user_id: user.id,
        name: name.trim(),
        class: characterClass,
        level: 1,
        xp: 0,
        start_date: new Date().toISOString().split('T')[0],
        target_date: calculateTargetDate(duration),
        is_active: true,
        status: 'active',
        stats: {
          streak_current: 0,
          streak_max: 0,
          tasks_completed: 0,
          epics_completed: 0
        }
      })

    if (insertError) {
      setError(insertError.message)
      setLoading(false)
    } else {
      navigate('/')
    }
  }

  return (
    <div className="new-character-container">
      <div className="new-character-background" />
      
      <div className="new-character-box pixel-border">
        <h1 className="nc-title">NOUVEAU VOYAGE</h1>
        
        {error && <div className="nc-error">{error}</div>}
        
        {/* STEP 1: Choisir la classe */}
        {step === 1 && (
          <div className="nc-step">
            <h2 className="nc-step-title">CHOISIS TA VOIE</h2>
            <div className="class-grid">
              {CLASSES.map(c => (
                <button
                  key={c.id}
                  className={`class-option ${characterClass === c.id ? 'selected' : ''}`}
                  onClick={() => setCharacterClass(c.id)}
                >
                  <span className="class-icon">{c.icon}</span>
                  <span className="class-name">{c.name}</span>
                  <span className="class-desc">{c.desc}</span>
                </button>
              ))}
            </div>
            <button 
              className="pixel-btn primary"
              disabled={!characterClass}
              onClick={() => setStep(2)}
            >
              SUIVANT
            </button>
          </div>
        )}

        {/* STEP 2: Choisir la durée */}
        {step === 2 && (
          <div className="nc-step">
            <h2 className="nc-step-title">DURÉE DU PÉRIPLE</h2>
            <div className="duration-grid">
              {DURATIONS.map(d => (
                <button
                  key={d.id}
                  className={`duration-option ${duration === d.id ? 'selected' : ''}`}
                  onClick={() => setDuration(d.id)}
                >
                  <span className="duration-name">{d.name}</span>
                  <span className="duration-desc">{d.desc}</span>
                </button>
              ))}
            </div>
            <div className="nc-buttons">
              <button className="pixel-btn" onClick={() => setStep(1)}>RETOUR</button>
              <button 
                className="pixel-btn primary"
                disabled={!duration}
                onClick={() => setStep(3)}
              >
                SUIVANT
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Nom du personnage */}
        {step === 3 && (
          <div className="nc-step">
            <h2 className="nc-step-title">TON NOM DE VOYAGEUR</h2>
            <div className="nc-preview">
              <span className="preview-icon">{CLASSES.find(c => c.id === characterClass)?.icon}</span>
              <span className="preview-class">{CLASSES.find(c => c.id === characterClass)?.name}</span>
            </div>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Entre ton nom..."
              className="pixel-input nc-name-input"
              maxLength={20}
            />
            <div className="nc-buttons">
              <button className="pixel-btn" onClick={() => setStep(2)}>RETOUR</button>
              <button 
                className="pixel-btn primary"
                disabled={!name.trim() || loading}
                onClick={handleCreate}
              >
                {loading ? '...' : 'COMMENCER'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
