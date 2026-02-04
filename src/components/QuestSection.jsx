import { useState } from 'react'
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
  const [isOpen, setIsOpen] = useState(true)
  const [openQuests, setOpenQuests] = useState({})
  const [openChapters, setOpenChapters] = useState({})

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
                  <div className="quest-info" onClick={() => toggleQuest(quest.id)}>
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
                      className="icon-btn" 
                      onClick={(e) => {
                        e.stopPropagation()
                        onEditQuest(quest)
                      }}
                      title="Éditer"
                    >
                      ✏️
                    </button>
                    <button 
                      className="icon-btn" 
                      onClick={(e) => {
                        e.stopPropagation()
                        if (confirm(`Supprimer la quête "${quest.name}" ?`)) {
                          onDeleteQuest(quest.id)
                        }
                      }}
                      title="Supprimer"
                    >
                      ❌
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
                          <div className="chapter-info" onClick={() => toggleChapter(chapter.id)}>
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
                              className="icon-btn-small" 
                              onClick={(e) => {
                                e.stopPropagation()
                                onEditChapter(chapter)
                              }}
                              title="Éditer"
                            >
                              ✏️
                            </button>
                            <button 
                              className="icon-btn-small" 
                              onClick={(e) => {
                                e.stopPropagation()
                                if (confirm(`Supprimer le chapitre "${chapter.name}" ?`)) {
                                  onDeleteChapter(chapter.id)
                                }
                              }}
                              title="Supprimer"
                            >
                              ❌
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
                              <div className="sub-task-name">{task.name}</div>
                              <div className="sub-task-actions">
                                <button 
                                  className="icon-btn-tiny" 
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    onEditTask(task)
                                  }}
                                  title="Éditer"
                                >
                                  ✏️
                                </button>
                                <button 
                                  className="icon-btn-tiny" 
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    onDeleteTask(task.id)
                                  }}
                                  title="Supprimer"
                                >
                                  ❌
                                </button>
                              </div>
                              <div className="sub-task-xp">+{task.xp}</div>
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
                      <div className="sub-task-name">{task.name}</div>
                      <div className="sub-task-actions">
                        <button 
                          className="icon-btn-tiny" 
                          onClick={(e) => {
                            e.stopPropagation()
                            onEditTask(task)
                          }}
                          title="Éditer"
                        >
                          ✏️
                        </button>
                        <button 
                          className="icon-btn-tiny" 
                          onClick={(e) => {
                            e.stopPropagation()
                            onDeleteTask(task.id)
                          }}
                          title="Supprimer"
                        >
                          ❌
                        </button>
                      </div>
                      <div className="sub-task-xp">+{task.xp}</div>
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
