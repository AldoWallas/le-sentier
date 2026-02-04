import { useState } from 'react'
import '../styles/sections.css'

export default function TaskSection({ tasks, onComplete, onDelete, onAdd }) {
  const [isOpen, setIsOpen] = useState(true)

  const getTaskAge = (createdAt) => {
    const created = new Date(createdAt)
    const now = new Date()
    const days = Math.floor((now - created) / (1000 * 60 * 60 * 24))
    return days
  }

  return (
    <section className={`section ${isOpen ? 'open' : ''}`}>
      <div className="section-header" onClick={() => setIsOpen(!isOpen)}>
        <h2 className="section-title">QUÊTES DU JOUR</h2>
        <span className="section-toggle">▼</span>
      </div>
      
      <div className="section-content">
        <div className="section-inner">
          <ul className="task-list">
            {tasks.map(task => {
              const age = getTaskAge(task.created_at)
              const isOld = age >= 3
              const isCritical = age >= 5
              
              return (
                <li 
                  key={task.id} 
                  className={`task-item ${task.status === 'completed' ? 'completed' : ''}`}
                >
                  <div 
                    className="task-checkbox" 
                    onClick={() => onComplete(task.id)}
                  />
                  <div className="task-content">
                    <div className="task-text">{task.name}</div>
                    <div className="task-meta">
                      <span className="xp">+{task.xp} XP</span>
                      {isOld && (
                        <span className={`warning ${isCritical ? 'critical' : ''}`}>
                          ⚠️ {age}j
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="task-actions">
                    <button 
                      className="task-btn" 
                      onClick={() => onDelete(task.id)}
                    >
                      ✕
                    </button>
                  </div>
                </li>
              )
            })}
          </ul>
          
          {tasks.length === 0 && (
            <p className="empty-message">Aucune quête pour le moment</p>
          )}
          
          <button className="add-btn" onClick={onAdd}>
            + NOUVELLE QUÊTE
          </button>
        </div>
      </div>
    </section>
  )
}
