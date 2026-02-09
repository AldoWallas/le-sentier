import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import '../styles/logbook.css'

export default function LogbookModal({ isOpen, onClose, characterId }) {
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [groupedHistory, setGroupedHistory] = useState({})

  useEffect(() => {
    if (isOpen && characterId) {
      fetchHistory()
    }
  }, [isOpen, characterId])

  const fetchHistory = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('task_history')
        .select('*')
        .eq('character_id', characterId)
        .order('completed_at', { ascending: false })
        .limit(100) // Limiter à 100 dernières entrées

      if (error) throw error

      setHistory(data || [])
      groupByDate(data || [])
    } catch (error) {
      console.error('Error fetching history:', error)
    } finally {
      setLoading(false)
    }
  }

  const groupByDate = (items) => {
    const grouped = {}
    
    items.forEach(item => {
      const date = new Date(item.completed_at)
      const dateKey = date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })
      
      if (!grouped[dateKey]) {
        grouped[dateKey] = []
      }
      grouped[dateKey].push(item)
    })
    
    setGroupedHistory(grouped)
  }

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (!isOpen) return null

  return (
    <div className="logbook-overlay" onClick={onClose}>
      <div className="logbook-modal" onClick={(e) => e.stopPropagation()}>
        {/* Bordure pixel art */}
        <div className="logbook-border">
          {/* Parchemin intérieur */}
          <div className="logbook-parchment">
            {/* Header */}
            <div className="logbook-header">
              <h2 className="logbook-title">📖 LOGBOOK</h2>
              <button className="logbook-close" onClick={onClose}>✕</button>
            </div>

            {/* Content */}
            <div className="logbook-content">
              {loading ? (
                <div className="logbook-loading">Loading...</div>
              ) : Object.keys(groupedHistory).length === 0 ? (
                <div className="logbook-empty">
                  <p>No completed tasks yet.</p>
                  <p className="logbook-hint">Complete your first task to start your journey!</p>
                </div>
              ) : (
                <div className="logbook-timeline">
                  {Object.entries(groupedHistory).map(([date, items]) => (
                    <div key={date} className="logbook-day">
                      <div className="logbook-date">
                        <span className="date-marker">◆</span>
                        {date}
                      </div>
                      
                      <div className="logbook-entries">
                        {items.map((item) => (
                          <div key={item.id} className="logbook-entry">
                            <div className="entry-time">{formatTime(item.completed_at)}</div>
                            <div className="entry-content">
                              <div className="entry-task">{item.task_name}</div>
                              {(item.quest_name || item.chapter_name) && (
                                <div className="entry-context">
                                  {item.quest_name && (
                                    <span className="context-quest">🗺️ {item.quest_name}</span>
                                  )}
                                  {item.chapter_name && (
                                    <span className="context-chapter">📖 {item.chapter_name}</span>
                                  )}
                                </div>
                              )}
                              <div className="entry-xp">+{item.task_xp} XP</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="logbook-footer">
              <span className="logbook-stats">
                {history.length} task{history.length !== 1 ? 's' : ''} completed
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
