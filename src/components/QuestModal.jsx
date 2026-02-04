import { useState } from 'react'
import { QUEST_RANKS } from '../lib/constants'
import '../styles/modal.css'

export default function QuestModal({ onClose, onAdd }) {
  const [name, setName] = useState('')
  const [selectedRank, setSelectedRank] = useState('rank_e')

  const rank = QUEST_RANKS.find(r => r.id === selectedRank)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (name.trim() && rank) {
      onAdd(name.trim(), selectedRank, rank.xp)
      onClose()
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal pixel-border" onClick={e => e.stopPropagation()}>
        <h3 className="modal-title">NOUVELLE QUÊTE</h3>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>NOM DE LA QUÊTE</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nommer cette quête..."
              className="pixel-input"
              autoFocus
            />
          </div>
          
          <div className="rank-selector">
            <label className="rank-label">DIFFICULTÉ PERÇUE</label>
            <div className="rank-grid">
              {QUEST_RANKS.map(r => (
                <button
                  key={r.id}
                  type="button"
                  className={`rank-option ${selectedRank === r.id ? 'selected' : ''}`}
                  onClick={() => setSelectedRank(r.id)}
                  style={{
                    borderColor: selectedRank === r.id ? r.color : undefined
                  }}
                >
                  <span className="rank-emoji">{r.emoji}</span>
                  <span className="rank-name">{r.name}</span>
                </button>
              ))}
            </div>
            
            <div className="rank-info">
              <div className="rank-flavor">{rank?.flavor}</div>
              <div className="rank-xp">+{rank?.xp} XP</div>
            </div>
          </div>
          
          <div className="modal-actions">
            <button type="button" className="pixel-btn" onClick={onClose}>
              ANNULER
            </button>
            <button type="submit" className="pixel-btn primary" disabled={!name.trim()}>
              CRÉER
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
