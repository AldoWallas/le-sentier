import { useState, useEffect, useRef } from 'react'
import '../styles/sections.css'

export default function TaskSection({ tasks, onComplete, onDelete, onEdit, onAdd }) {
  // Charger l'état depuis localStorage AVANT le useState
  const getSavedState = () => {
    try {
      const saved = localStorage.getItem('taskSection_isOpen')
      if (saved !== null) {
        return JSON.parse(saved)
      }
    } catch (error) {
      console.error('Erreur lecture localStorage:', error)
    }
    return true // Par défaut : ouvert
  }

  const [isOpen, setIsOpen] = useState(getSavedState)
  const [completingTasks, setCompletingTasks] = useState(new Set())
  const [longPressTask, setLongPressTask] = useState(null)
  const longPressTimer = useRef(null)

  // Sauvegarder l'état dans localStorage à chaque changement
  useEffect(() => {
    try {
      localStorage.setItem('taskSection_isOpen', JSON.stringify(isOpen))
      console.log('TaskSection state sauvegardé:', isOpen)
    } catch (error) {
      console.error('Erreur sauvegarde localStorage:', error)
    }
  }, [isOpen])

  // Fonction toggle simplifiée
  const toggleOpen = () => {
    setIsOpen(prev => !prev)
  }

  const getTaskAge = (createdAt) => {
    const created = new Date(createdAt)
    const now = new Date()
    const days = Math.floor((now - created) / (1000 * 60 * 60 * 24))
    return days
  }

  // Gérer la complétion avec auto-disparition
  const handleComplete = (taskId) => {
    const task = tasks.find(t => t.id === taskId)
    
    // Si la tâche n'est PAS encore complétée, on la complète
    if (task && task.status !== 'completed') {
      onComplete(taskId)
      
      // Marquer comme "en train de disparaître"
      setCompletingTasks(prev => new Set(prev).add(taskId))
      
      // Supprimer après 2 secondes (1.2s attente + 0.8s animation)
      setTimeout(() => {
        onDelete(taskId)
        setCompletingTasks(prev => {
          const next = new Set(prev)
          next.delete(taskId)
          return next
        })
      }, 2000)
    } else {
      // Si déjà complétée, on peut la dé-compléter
      onComplete(taskId)
    }
  }

  // Appui long pour éditer
  const handleMouseDown = (task) => {
    longPressTimer.current = setTimeout(() => {
      setLongPressTask(task.id)
      onEdit(task)
      // Vibration si disponible
      if (navigator.vibrate) {
        navigator.vibrate(50)
      }
    }, 500) // 500ms = appui long
  }

  const handleMouseUp = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current)
    }
    setTimeout(() => setLongPressTask(null), 200)
  }

  const handleMouseLeave = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current)
    }
  }

  // Toucher pour mobile
  const handleTouchStart = (task) => {
    longPressTimer.current = setTimeout(() => {
      setLongPressTask(task.id)
      onEdit(task)
      if (navigator.vibrate) {
        navigator.vibrate(50)
      }
    }, 500)
  }

  const handleTouchEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current)
    }
    setTimeout(() => setLongPressTask(null), 200)
  }

  return (
    <section className={`section ${isOpen ? 'open' : ''}`}>
      <div className="section-header section-header-clickable" onClick={toggleOpen}>
        <h2 className="section-title">DAILY TASKS</h2>
        <span className="section-toggle">▼</span>
      </div>
      
      <div className="section-content">
        <div className="section-inner">
          <ul className="task-list">
            {tasks.map(task => {
              const age = getTaskAge(task.created_at)
              const isOld = age >= 3
              const isCritical = age >= 5
              const isCompleting = completingTasks.has(task.id)
              const isLongPress = longPressTask === task.id
              
              return (
                <li 
                  key={task.id} 
                  className={`task-item ${task.status === 'completed' ? 'completed' : ''} ${isCompleting ? 'fading-out' : ''}`}
                >
                  <div 
                    className="task-checkbox" 
                    onClick={() => handleComplete(task.id)}
                  />
                  <div 
                    className={`task-content ${isLongPress ? 'long-press-active' : ''}`}
                    onMouseDown={() => handleMouseDown(task)}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseLeave}
                    onTouchStart={() => handleTouchStart(task)}
                    onTouchEnd={handleTouchEnd}
                  >
                    <div className="task-text">{task.name}</div>
                    {/* XP masqué, mais warning toujours visible */}
                    {isOld && (
                      <div className="task-meta">
                        <span className={`warning ${isCritical ? 'critical' : ''}`}>
                          ⚠️ {age}j
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="task-actions">
                    {/* Bouton delete discret (croix grise) */}
                    <button 
                      className="task-btn task-btn-delete-subtle" 
                      onClick={(e) => {
                        e.stopPropagation()
                        onDelete(task.id)
                      }}
                      title="Delete"
                    >
                      ✕
                    </button>
                  </div>
                </li>
              )
            })}
          </ul>
          
          {tasks.length === 0 && (
            <p className="empty-message">No tasks yet</p>
          )}
          
          <button className="add-btn" onClick={onAdd}>
            + NEW TASK
          </button>
        </div>
      </div>
    </section>
  )
}
