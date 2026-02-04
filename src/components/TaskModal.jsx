import { useState, useEffect } from 'react'
import { TASK_XP_LEVELS } from '../lib/constants'
import '../styles/modal.css'

export default function TaskModal({ onClose, onSubmit, initialTask = null, questId = null, chapterId = null }) {
  const [name, setName] = useState(initialTask?.name || '')
  const [xp, setXp] = useState(initialTask?.xp || 25)

  useEffect(() => {
    if (initialTask) {
      setName(initialTask.name)
      setXp(initialTask.xp)
    }
  }, [initialTask])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (name.trim()) {
      onSubmit(name.trim(), xp)
      onClose()
    }
  }
  
  const isEditing = !!initialTask

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal pixel-border" onClick={e => e.stopPropagation()}>
        <h3 className="modal-title">{isEditing ? 'ÉDITER TÂCHE' : 'NOUVELLE TÂCHE'}</h3>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>NOM DE LA TÂCHE</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Décrire la tâche..."
              className="pixel-input"
              autoFocus
            />
          </div>
          
          <div className="form-group">
            <label>EFFORT ESTIMÉ</label>
            <div className="xp-selector">
              {TASK_XP_LEVELS.map(level => (
                <button
                  key={level.value}
                  type="button"
                  className={`xp-option ${xp === level.value ? 'selected' : ''}`}
                  onClick={() => setXp(level.value)}
                  title={level.description}
                >
                  <div className="xp-label">{level.label}</div>
                  <div className="xp-value">{level.value} XP</div>
                </button>
              ))}
            </div>
          </div>
          
          <div className="modal-actions">
            <button type="button" className="pixel-btn" onClick={onClose}>
              ANNULER
            </button>
            <button type="submit" className="pixel-btn primary" disabled={!name.trim()}>
              {isEditing ? 'MODIFIER' : 'CRÉER'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
