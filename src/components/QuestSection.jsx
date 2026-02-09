import { useState, useRef, useEffect } from 'react'
import { QUEST_RANKS } from '../lib/constants'
import '../styles/sections.css'

export default function QuestSection({ 
  quests, 
  chapters,
  tasks,
  onAddQuest,
  onEditQuest,
  onDeleteQuest,
  onAddChapter,
  onEditChapter,
  onDeleteChapter,
  onAddTask,
  onEditTask,
  onDeleteTask,
  onTaskComplete 
}) {
  // Charger l'état depuis localStorage AVANT le useState
  const getSavedState = () => {
    try {
      const saved = localStorage.getItem('questSection_isOpen')
      if (saved !== null) {
        return JSON.parse(saved)
      }
    } catch (error) {
      console.error('Erreur lecture localStorage:', error)
    }
    return true // Par défaut : ouvert
  }

  const getSavedQuests = () => {
    try {
      const saved = localStorage.getItem('questSection_openQuests')
      if (saved !== null) {
        return JSON.parse(saved)
      }
    } catch (error) {
      console.error('Erreur lecture localStorage:', error)
    }
    return {} // Par défaut : tout fermé
  }

  const getSavedChapters = () => {
    try {
      const saved = localStorage.getItem('questSection_openChapters')
      if (saved !== null) {
        return JSON.parse(saved)
      }
    } catch (error) {
      console.error('Erreur lecture localStorage:', error)
    }
    return {} // Par défaut : tout fermé
  }

  const [isOpen, setIsOpen] = useState(getSavedState)
  const [openQuests, setOpenQuests] = useState(getSavedQuests)
  const [openChapters, setOpenChapters] = useState(getSavedChapters)
  const [longPressItem, setLongPressItem] = useState(null)
  const longPressTimer = useRef(null)

  // Sauvegarder l'état de la section dans localStorage
  useEffect(() => {
    try {
      localStorage.setItem('questSection_isOpen', JSON.stringify(isOpen))
      console.log('QuestSection state sauvegardé:', isOpen)
    } catch (error) {
      console.error('Erreur sauvegarde localStorage:', error)
    }
  }, [isOpen])

  // Sauvegarder les quêtes ouvertes dans localStorage
  useEffect(() => {
    try {
      localStorage.setItem('questSection_openQuests', JSON.stringify(openQuests))
      console.log('OpenQuests state sauvegardé:', openQuests)
    } catch (error) {
      console.error('Erreur sauvegarde localStorage:', error)
    }
  }, [openQuests])

  // Sauvegarder les chapitres ouverts dans localStorage
  useEffect(() => {
    try {
      localStorage.setItem('questSection_openChapters', JSON.stringify(openChapters))
      console.log('OpenChapters state sauvegardé:', openChapters)
    } catch (error) {
      console.error('Erreur sauvegarde localStorage:', error)
    }
  }, [openChapters])

  const toggleQuest = (questId) => {
    setOpenQuests(prev => ({ ...prev, [questId]: !prev[questId] }))
  }

  const toggleChapter = (chapterId) => {
    setOpenChapters(prev => ({ ...prev, [chapterId]: !prev[chapterId] }))
  }

  const getQuestProgress = (questId) => {
    const questTasks = tasks.filter(t => 
      t.quest_id === questId || 
      chapters.some(c => c.quest_id === questId && c.id === t.chapter_id)
    )
    if (questTasks.length === 0) return { done: 0, total: 0, percent: 0 }
    
    const done = questTasks.filter(t => t.status === 'completed').length
    return { done, total: questTasks.length, percent: (done / questTasks.length) * 100 }
  }

  const getChapterProgress = (chapterId) => {
    const chapterTasks = tasks.filter(t => t.chapter_id === chapterId)
    if (chapterTasks.length === 0) return { done: 0, total: 0, percent: 0 }
    
    const done = chapterTasks.filter(t => t.status === 'completed').length
    return { done, total: chapterTasks.length, percent: (done / chapterTasks.length) * 100 }
  }

  const getQuestChapters = (questId) => {
    return chapters.filter(c => c.quest_id === questId)
  }

  const getDirectTasks = (questId) => {
    return tasks.filter(t => t.quest_id === questId && !t.chapter_id)
  }

  const getChapterTasks = (chapterId) => {
    return tasks.filter(t => t.chapter_id === chapterId)
  }

  // Appui long pour éditer
  const handleLongPressStart = (item, onEdit) => {
    longPressTimer.current = setTimeout(() => {
      setLongPressItem(item.id)
      onEdit(item)
      if (navigator.vibrate) {
        navigator.vibrate(50)
      }
    }, 500)
  }

  const handleLongPressEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current)
    }
    setTimeout(() => setLongPressItem(null), 200)
  }

  return (
    <section className={`section ${isOpen ? 'open' : ''}`}>
      <div className="section-header" onClick={() => setIsOpen(!isOpen)}>
        <h2 className="section-title">QUÊTES</h2>
        <span className="section-toggle">▼</span>
      </div>
      
      <div className="section-content">
        <div className="section-inner">
          {quests.map(quest => {
            const progress = getQuestProgress(quest.id)
            const isQuestOpen = openQuests[quest.id]
            const questChapters = getQuestChapters(quest.id)
            const directTasks = getDirectTasks(quest.id)
            const rank = QUEST_RANKS.find(r => r.id === quest.rank)
            
            return (
              <div key={quest.id} className={`quest-item ${isQuestOpen ? 'open' : ''}`}>
                <div className="quest-header">
                  <span className="quest-icon" onClick={() => toggleQuest(quest.id)}>{rank?.emoji || '❓'}</span>
                  <div 
                    className={`quest-info ${longPressItem === quest.id ? 'long-press-active' : ''}`} 
                    onClick={() => toggleQuest(quest.id)}
                    onMouseDown={() => handleLongPressStart(quest, onEditQuest)}
                    onMouseUp={handleLongPressEnd}
                    onMouseLeave={handleLongPressEnd}
                    onTouchStart={() => handleLongPressStart(quest, onEditQuest)}
                    onTouchEnd={handleLongPressEnd}
                  >
                    <div className="quest-name">{quest.name.toUpperCase()}</div>
                    <div className="quest-progress-bar">
                      <div 
                        className="quest-progress-fill" 
                        style={{ width: `${progress.percent}%` }}
                      />
                    </div>
                  </div>
                  <div className="quest-stats" onClick={() => toggleQuest(quest.id)}>{progress.done}/{progress.total}</div>
                  <div className="quest-header-actions">
                    <button 
                      className="task-btn-delete-subtle" 
                      onClick={(e) => {
                        e.stopPropagation()
                        if (confirm(`Supprimer la quête "${quest.name}" ?`)) {
                          onDeleteQuest(quest.id)
                        }
                      }}
                      title="Supprimer"
                    >
                      ✕
                    </button>
                  </div>
                  <span className="quest-toggle" onClick={() => toggleQuest(quest.id)}>▶</span>
                </div>
                
                <div className="quest-children">
                  {/* Chapitres */}
                  {questChapters.map(chapter => {
                    const chapterProgress = getChapterProgress(chapter.id)
                    const isChapterOpen = openChapters[chapter.id]
                    const chapterTasks = getChapterTasks(chapter.id)
                    
                    return (
                      <div key={chapter.id} className={`chapter-item ${isChapterOpen ? 'open' : ''}`}>
                        <div className="chapter-header">
                          <span className="chapter-icon" onClick={() => toggleChapter(chapter.id)}>📖</span>
                          <div 
                            className={`chapter-info ${longPressItem === chapter.id ? 'long-press-active' : ''}`} 
                            onClick={() => toggleChapter(chapter.id)}
                            onMouseDown={() => handleLongPressStart(chapter, onEditChapter)}
                            onMouseUp={handleLongPressEnd}
                            onMouseLeave={handleLongPressEnd}
                            onTouchStart={() => handleLongPressStart(chapter, onEditChapter)}
                            onTouchEnd={handleLongPressEnd}
                          >
                            <div className="chapter-name">{chapter.name}</div>
                            <div className="chapter-progress-bar">
                              <div 
                                className="chapter-progress-fill" 
                                style={{ width: `${chapterProgress.percent}%` }}
                              />
                            </div>
                          </div>
                          <div className="chapter-stats" onClick={() => toggleChapter(chapter.id)}>{chapterProgress.done}/{chapterProgress.total}</div>
                          <div className="chapter-header-actions">
                            <button 
                              className="task-btn-delete-subtle" 
                              onClick={(e) => {
                                e.stopPropagation()
                                if (confirm(`Supprimer le chapitre "${chapter.name}" ?`)) {
                                  onDeleteChapter(chapter.id)
                                }
                              }}
                              title="Supprimer"
                            >
                              ✕
                            </button>
                          </div>
                          <span className="chapter-toggle" onClick={() => toggleChapter(chapter.id)}>▶</span>
                        </div>
                        
                        <div className="chapter-tasks">
                          {chapterTasks.map(task => (
                            <div 
                              key={task.id} 
                              className={`sub-task ${task.status === 'completed' ? 'completed' : ''}`}
                            >
                              <div 
                                className="sub-task-checkbox"
                                onClick={() => onTaskComplete(task.id)}
                              >
                                {task.status === 'completed' ? '✓' : '○'}
                              </div>
                              <div 
                                className={`sub-task-name ${longPressItem === task.id ? 'long-press-active' : ''}`}
                                onMouseDown={() => handleLongPressStart(task, onEditTask)}
                                onMouseUp={handleLongPressEnd}
                                onMouseLeave={handleLongPressEnd}
                                onTouchStart={() => handleLongPressStart(task, onEditTask)}
                                onTouchEnd={handleLongPressEnd}
                              >
                                {task.name}
                              </div>
                              <div className="sub-task-actions">
                                <button 
                                  className="task-btn-delete-subtle" 
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    onDeleteTask(task.id)
                                  }}
                                  title="Supprimer"
                                >
                                  ✕
                                </button>
                              </div>
                            </div>
                          ))}
                          
                          <button 
                            className="add-sub-btn" 
                            onClick={(e) => {
                              e.stopPropagation()
                              onAddTask(quest.id, chapter.id)
                            }}
                          >
                            + Tâche
                          </button>
                        </div>
                      </div>
                    )
                  })}
                  
                  {/* Tâches directes sous la quête */}
                  {directTasks.map(task => (
                    <div 
                      key={task.id} 
                      className={`sub-task ${task.status === 'completed' ? 'completed' : ''}`}
                    >
                      <div 
                        className="sub-task-checkbox"
                        onClick={() => onTaskComplete(task.id)}
                      >
                        {task.status === 'completed' ? '✓' : '○'}
                      </div>
                      <div 
                        className={`sub-task-name ${longPressItem === task.id ? 'long-press-active' : ''}`}
                        onMouseDown={() => handleLongPressStart(task, onEditTask)}
                        onMouseUp={handleLongPressEnd}
                        onMouseLeave={handleLongPressEnd}
                        onTouchStart={() => handleLongPressStart(task, onEditTask)}
                        onTouchEnd={handleLongPressEnd}
                      >
                        {task.name}
                      </div>
                      <div className="sub-task-actions">
                        <button 
                          className="task-btn-delete-subtle" 
                          onClick={(e) => {
                            e.stopPropagation()
                            onDeleteTask(task.id)
                          }}
                          title="Supprimer"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                  
                  {/* Boutons d'ajout */}
                  <div className="quest-actions">
                    <button 
                      className="add-sub-btn" 
                      onClick={(e) => {
                        e.stopPropagation()
                        onAddChapter(quest.id)
                      }}
                    >
                      + Chapitre
                    </button>
                    <button 
                      className="add-sub-btn" 
                      onClick={(e) => {
                        e.stopPropagation()
                        onAddTask(quest.id, null)
                      }}
                    >
                      + Tâche directe
                    </button>
                  </div>
                  
                  <div className="quest-xp-reward">
                    Bonus quête : +{rank?.xp || 0} XP
                  </div>
                </div>
              </div>
            )
          })}
          
          {quests.length === 0 && (
            <p className="empty-message">Aucune quête en cours</p>
          )}
          
          <button className="add-btn" onClick={onAddQuest}>
            + NOUVELLE QUÊTE
          </button>
        </div>
      </div>
    </section>
  )
}
