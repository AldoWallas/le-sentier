import { useState, useEffect } from 'react'
import { QUEST_RANKS } from '../lib/constants'
import '../styles/modal.css'

export default function QuestModal({ onClose, onSubmit, initialQuest = null }) {
  const [name, setName] = useState(initialQuest?.name || '')
  const [selectedRank, setSelectedRank] = useState(initialQuest?.rank || 'rank_e')
  const [isMainQuest, setIsMainQuest] = useState(initialQuest?.is_main_quest || false)

  useEffect(() => {
    if (initialQuest) {
      setName(initialQuest.name)
      setSelectedRank(initialQuest.rank)
      setIsMainQuest(initialQuest.is_main_quest || false)
    }
  }, [initialQuest])

  const rank = QUEST_RANKS.find(r => r.id === selectedRank)
  const isEditing = !!initialQuest

  const handleSubmit = (e) => {
    e.preventDefault()
    if (name.trim() && rank) {
      onSubmit(name.trim(), selectedRank, rank.xp, isMainQuest)
      onClose()
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal pixel-border" onClick={e => e.stopPropagation()}>
        <h3 className="modal-title">{isEditing ? 'EDIT QUEST' : 'NEW QUEST'}</h3>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>QUEST NAME</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Name this quest..."
              className="pixel-input"
              autoFocus
            />
          </div>
          
          <div className="rank-selector">
            <label className="rank-label">PERCEIVED DIFFICULTY</label>
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

          <div className="form-group" style={{ marginTop: '16px' }}>
            <label className="checkbox-label" style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={isMainQuest}
                onChange={(e) => setIsMainQuest(e.target.checked)}
                style={{ width: '16px', height: '16px' }}
              />
              <span style={{ fontSize: '14px' }}>Main Quest (only one active at a time)</span>
            </label>
          </div>
          
          <div className="modal-actions">
            <button type="button" className="pixel-btn" onClick={onClose}>
              CANCEL
            </button>
            <button type="submit" className="pixel-btn primary" disabled={!name.trim()}>
              {isEditing ? 'UPDATE' : 'CREATE'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
