import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { CLASS_ICONS } from '../lib/constants'
import Header from '../components/Header'
import TaskSection from '../components/TaskSection'
import QuestSection from '../components/QuestSection'
import TaskModal from '../components/TaskModal'
import QuestModal from '../components/QuestModal'
import ChapterModal from '../components/ChapterModal'
import DynamicBackground from '../components/DynamicBackground'
import HeroSection from '../components/HeroSection'
import '../styles/dashboard.css'

export default function Dashboard() {
  // Build timestamp to force cache bust: 1739195600000
  const [character, setCharacter] = useState(null)
  const [tasks, setTasks] = useState([])
  const [quests, setQuests] = useState([])
  const [chapters, setChapters] = useState([])
  const [loading, setLoading] = useState(true)
  const [triggerHeart, setTriggerHeart] = useState(0)
  
  // Modals
  const [taskModalOpen, setTaskModalOpen] = useState(false)
  const [taskModalContext, setTaskModalContext] = useState({ task: null, questId: null, chapterId: null })
  const [questModalOpen, setQuestModalOpen] = useState(false)
  const [questToEdit, setQuestToEdit] = useState(null)
  const [chapterModalOpen, setChapterModalOpen] = useState(false)
  const [chapterModalContext, setChapterModalContext] = useState({ chapter: null, questId: null, questName: '' })
  
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    loadData()
  }, [user])

  const loadData = async () => {
    setLoading(true)
    
    const { data: chars } = await supabase
      .from('characters')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .limit(1)
    
    if (!chars || chars.length === 0) {
      navigate('/new-character')
      return
    }
    
    const char = chars[0]
    setCharacter(char)
    
    const { data: tasksData } = await supabase
      .from('tasks')
      .select('*')
      .eq('character_id', char.id)
      .neq('status', 'deleted')
      .is('archived_at', null)
      .order('created_at', { ascending: false })
    
    setTasks(tasksData || [])
    
    const { data: questsData } = await supabase
      .from('quests')
      .select('*')
      .eq('character_id', char.id)
      .neq('status', 'abandoned')
      .order('created_at', { ascending: false })
    
    // Trier : main quests en premier
    const sortedQuests = (questsData || []).sort((a, b) => {
      if (a.is_main_quest && !b.is_main_quest) return -1
      if (!a.is_main_quest && b.is_main_quest) return 1
      return 0
    })
    
    setQuests(sortedQuests)
    
    const { data: chaptersData } = await supabase
      .from('chapters')
      .select('*')
      .in('quest_id', questsData?.map(q => q.id) || [])
      .order('position', { ascending: true })
    
    setChapters(chaptersData || [])
    
    setLoading(false)
  }

  const getDayCount = () => {
    if (!character) return 0
    const start = new Date(character.start_date)
    const today = new Date()
    const diff = Math.floor((today - start) / (1000 * 60 * 60 * 24))
    return diff + 1
  }

  const completeTask = useCallback(async (taskId) => {
    console.log('=== completeTask CALLED ===')
    console.log('TaskId:', taskId)
    
    // Fetch task from Supabase instead of closure
    const { data: task, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', taskId)
      .single()
    
    console.log('Task fetched from DB:', task)
    console.log('Fetch error:', error)
    
    if (!task || error) {
      console.log('ERROR: No task found in DB')
      return
    }

    const newStatus = task.status === 'completed' ? 'pending' : 'completed'
    const completedAt = newStatus === 'completed' ? new Date().toISOString() : null

    console.log('completeTask details:', {
      taskId,
      taskName: task.name,
      oldStatus: task.status,
      newStatus,
      hasCharacter: !!character,
      characterId: character?.id
    })

    await supabase
      .from('tasks')
      .update({ status: newStatus, completed_at: completedAt })
      .eq('id', taskId)

    if (newStatus === 'completed' && character) {
      console.log('>>> Entering completed block')
      
      // Ajouter XP
      const newXp = character.xp + task.xp
      const newLevel = calculateLevel(newXp)
      
      await supabase
        .from('characters')
        .update({ xp: newXp, level: newLevel })
        .eq('id', character.id)
      
      setCharacter(prev => ({ ...prev, xp: newXp, level: newLevel }))

      // Enregistrer dans l'historique
      const quest = quests.find(q => q.id === task.quest_id)
      const chapter = chapters.find(c => c.id === task.chapter_id)
      
      console.log('Saving to task_history:', {
        character_id: character.id,
        task_name: task.name,
        task_xp: task.xp,
        quest_name: quest?.name || null,
        chapter_name: chapter?.name || null
      })
      
      const { data, error } = await supabase
        .from('task_history')
        .insert({
          character_id: character.id,
          task_name: task.name,
          task_xp: task.xp,
          quest_name: quest?.name || null,
          chapter_name: chapter?.name || null,
          completed_at: completedAt
        })

      if (error) {
        console.error('ERROR saving task_history:', error)
      } else {
        console.log('SUCCESS: task_history saved!', data)
      }

      // Déclencher l'animation coeur
      setTriggerHeart(prev => prev + 1)
    }
    
    if (newStatus === 'pending' && character) {
      const newXp = Math.max(0, character.xp - task.xp)
      const newLevel = calculateLevel(newXp)
      
      await supabase
        .from('characters')
        .update({ xp: newXp, level: newLevel })
        .eq('id', character.id)
      
      setCharacter(prev => ({ ...prev, xp: newXp, level: newLevel }))
    }

    setTasks(prev => prev.map(t => 
      t.id === taskId 
        ? { ...t, status: newStatus, completed_at: completedAt }
        : t
    ))
  }, [character, quests, chapters])

  const deleteTask = async (taskId) => {
    await supabase
      .from('tasks')
      .update({ status: 'deleted' })
      .eq('id', taskId)

    setTasks(prev => prev.filter(t => t.id !== taskId))
  }

  const addTask = async (name, xp, questId = null, chapterId = null) => {
    const { data, error } = await supabase
      .from('tasks')
      .insert({
        character_id: character.id,
        quest_id: questId,
        chapter_id: chapterId,
        name,
        xp: parseInt(xp),
        status: 'pending',
        is_ritual: false
      })
      .select()
      .single()

    if (!error && data) {
      setTasks(prev => [data, ...prev])
    }
  }

  const editTask = async (taskId, name, xp) => {
    const { data, error } = await supabase
      .from('tasks')
      .update({ name, xp: parseInt(xp) })
      .eq('id', taskId)
      .select()
      .single()

    if (!error && data) {
      setTasks(prev => prev.map(t => t.id === taskId ? data : t))
    }
  }

  const openEditTask = (task) => {
    setTaskModalContext({ task, questId: task.quest_id, chapterId: task.chapter_id })
    setTaskModalOpen(true)
  }

  const handleTaskModalSubmit = (name, xp) => {
    if (taskModalContext.task) {
      // Mode édition
      editTask(taskModalContext.task.id, name, xp)
    } else {
      // Mode création
      addTask(name, xp, taskModalContext.questId, taskModalContext.chapterId)
    }
  }

  const addQuest = async (name, rank, xpReward, isMainQuest = false) => {
    // Si on active une main quest, désactiver TOUTES les autres
    if (isMainQuest) {
      await supabase
        .from('quests')
        .update({ is_main_quest: false })
        .eq('character_id', character.id)
    }

    const { data, error } = await supabase
      .from('quests')
      .insert({
        character_id: character.id,
        name,
        rank,
        xp_reward: xpReward,
        status: 'active',
        is_main_quest: isMainQuest
      })
      .select()
      .single()

    if (!error && data) {
      setQuests(prev => {
        const updated = [data, ...prev]
        // Trier : main quests en premier
        return updated.sort((a, b) => {
          if (a.is_main_quest && !b.is_main_quest) return -1
          if (!a.is_main_quest && b.is_main_quest) return 1
          return 0
        })
      })
    }
  }

  const editQuest = async (questId, name, rank, xpReward, isMainQuest = false) => {
    // Si on active une main quest, désactiver les autres
    if (isMainQuest) {
      await supabase
        .from('quests')
        .update({ is_main_quest: false })
        .eq('character_id', character.id)
        .eq('is_main_quest', true)
        .neq('id', questId) // Sauf celle qu'on édite
    }

    const { data, error } = await supabase
      .from('quests')
      .update({ name, rank, xp_reward: xpReward, is_main_quest: isMainQuest })
      .eq('id', questId)
      .select()
      .single()

    if (!error && data) {
      setQuests(prev => prev.map(q => q.id === questId ? data : q))
    }
  }

  const deleteQuest = async (questId) => {
    await supabase
      .from('quests')
      .update({ status: 'abandoned' })
      .eq('id', questId)

    setQuests(prev => prev.filter(q => q.id !== questId))
  }

  const openEditQuest = (quest) => {
    setQuestToEdit(quest)
    setQuestModalOpen(true)
  }

  const handleQuestModalSubmit = (name, rank, xpReward, isMainQuest) => {
    if (questToEdit) {
      // Mode édition
      editQuest(questToEdit.id, name, rank, xpReward, isMainQuest)
    } else {
      // Mode création
      addQuest(name, rank, xpReward, isMainQuest)
    }
  }

  const addChapter = async (name, description, questId) => {
    const { data, error } = await supabase
      .from('chapters')
      .insert({
        quest_id: questId,
        name,
        description,
        status: 'active'
      })
      .select()
      .single()

    if (!error && data) {
      setChapters(prev => [...prev, data])
    }
  }

  const editChapter = async (chapterId, name, description) => {
    const { data, error } = await supabase
      .from('chapters')
      .update({ name, description })
      .eq('id', chapterId)
      .select()
      .single()

    if (!error && data) {
      setChapters(prev => prev.map(c => c.id === chapterId ? data : c))
    }
  }

  const deleteChapter = async (chapterId) => {
    await supabase
      .from('chapters')
      .delete()
      .eq('id', chapterId)

    setChapters(prev => prev.filter(c => c.id !== chapterId))
  }

  const openEditChapter = (chapter) => {
    const quest = quests.find(q => q.id === chapter.quest_id)
    setChapterModalContext({ 
      chapter, 
      questId: chapter.quest_id, 
      questName: quest?.name || '' 
    })
    setChapterModalOpen(true)
  }

  const handleChapterModalSubmit = (name, description) => {
    if (chapterModalContext.chapter) {
      // Mode édition
      editChapter(chapterModalContext.chapter.id, name, description)
    } else {
      // Mode création
      addChapter(name, description, chapterModalContext.questId)
    }
  }

  const calculateLevel = (xp) => {
    const thresholds = [0, 100, 250, 500, 850, 1300, 1850, 2500, 3300, 4200, 5200, 
                       6300, 7500, 8800, 10200, 11700, 13300, 15000, 16800, 18700, 20700]
    for (let i = thresholds.length - 1; i >= 0; i--) {
      if (xp >= thresholds[i]) return i + 1
    }
    return 1
  }

  const getXpForNextLevel = (level) => {
    const thresholds = [0, 100, 250, 500, 850, 1300, 1850, 2500, 3300, 4200, 5200, 
                       6300, 7500, 8800, 10200, 11700, 13300, 15000, 16800, 18700, 20700]
    return thresholds[level] || thresholds[thresholds.length - 1]
  }

  const getXpProgress = () => {
    if (!character) return 0
    const currentLevelXp = getXpForNextLevel(character.level - 1)
    const nextLevelXp = getXpForNextLevel(character.level)
    const progress = ((character.xp - currentLevelXp) / (nextLevelXp - currentLevelXp)) * 100
    return Math.min(100, Math.max(0, progress))
  }

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour >= 5 && hour < 12) return 'BONJOUR'
    if (hour >= 12 && hour < 18) return 'BON APRÈS-MIDI'
    if (hour >= 18 && hour < 22) return 'BONSOIR'
    return 'BONNE NUIT'
  }

  const getStats = () => {
    const todayTasks = tasks.filter(t => {
      const created = new Date(t.created_at).toDateString()
      return created === new Date().toDateString()
    })
    const completedToday = todayTasks.filter(t => t.status === 'completed').length
    const totalCompleted = tasks.filter(t => t.status === 'completed').length
    const efficiency = tasks.length > 0 
      ? Math.round((totalCompleted / tasks.length) * 100) 
      : 0
    const completedQuests = quests.filter(e => e.status === 'completed').length

    return {
      streak: character?.stats?.streak_current || 0,
      efficiency,
      questsProgress: `${completedQuests}/${quests.length}`
    }
  }

  const openTaskModal = (questId = null, chapterId = null) => {
    setTaskModalContext({ task: null, questId, chapterId })
    setTaskModalOpen(true)
  }

  const openChapterModal = (questId, questName) => {
    setChapterModalContext({ chapter: null, questId, questName })
    setChapterModalOpen(true)
  }

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-text">CHARGEMENT...</div>
      </div>
    )
  }

  const stats = getStats()

  return (
  <div className="dashboard">
    <HeroSection
      character={character}
      stats={stats}
      dayCount={getDayCount()}
      onSignOut={signOut}
      showHeart={triggerHeart}
    />
    
    <div className="dashboard-container">
        
        <TaskSection 
          tasks={tasks.filter(t => !t.quest_id && !t.chapter_id)}
          onComplete={completeTask}
          onDelete={deleteTask}
          onEdit={openEditTask}
          onAdd={() => openTaskModal()}
        />
        
        <QuestSection 
          quests={quests}
          chapters={chapters}
          tasks={tasks}
          onAddQuest={() => {
            setQuestToEdit(null)
            setQuestModalOpen(true)
          }}
          onEditQuest={openEditQuest}
          onDeleteQuest={deleteQuest}
          onAddChapter={(questId) => {
            const quest = quests.find(q => q.id === questId)
            openChapterModal(questId, quest?.name || '')
          }}
          onEditChapter={openEditChapter}
          onDeleteChapter={deleteChapter}
          onAddTask={openTaskModal}
          onEditTask={openEditTask}
          onDeleteTask={deleteTask}
          onTaskComplete={completeTask}
        />
      </div>

      {taskModalOpen && (
        <TaskModal 
          onClose={() => setTaskModalOpen(false)}
          onSubmit={handleTaskModalSubmit}
          initialTask={taskModalContext.task}
          questId={taskModalContext.questId}
          chapterId={taskModalContext.chapterId}
        />
      )}

      {questModalOpen && (
        <QuestModal 
          onClose={() => {
            setQuestModalOpen(false)
            setQuestToEdit(null)
          }}
          onSubmit={handleQuestModalSubmit}
          initialQuest={questToEdit}
        />
      )}

      {chapterModalOpen && (
        <ChapterModal 
          onClose={() => setChapterModalOpen(false)}
          onSubmit={handleChapterModalSubmit}
          initialChapter={chapterModalContext.chapter}
          questName={chapterModalContext.questName}
        />
      )}
    </div>
  )
}
