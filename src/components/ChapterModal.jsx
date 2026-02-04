import { useState, useEffect } from 'react'
import '../styles/modal.css'

export default function ChapterModal({ onClose, onSubmit, initialChapter = null, questName }) {
  const [name, setName] = useState(initialChapter?.name || '')
  const [description, setDescription] = useState(initialChapter?.description || '')

  useEffect(() => {
    if (initialChapter) {
      setName(initialChapter.name)
      setDescription(initialChapter.description || '')
    }
  }, [initialChapter])

  const isEditing = !!initialChapter

  const handleSubmit = (e) => {
    e.preventDefault()
    if (name.trim()) {
      onSubmit(name.trim(), description.trim() || null)
      onClose()
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal pixel-border" onClick={e => e.stopPropagation()}>
        <h3 className="modal-title">{isEditing ? 'ÉDITER CHAPITRE' : 'NOUVEAU CHAPITRE'}</h3>
        {questName && (
          <p className="modal-subtitle">Pour : {questName}</p>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>NOM DU CHAPITRE</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Phase 1 - Prospection"
              className="pixel-input"
              autoFocus
            />
          </div>
          
          <div className="form-group">
            <label>DESCRIPTION (optionnel)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Détails du chapitre..."
              className="pixel-input"
              rows={3}
            />
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
