import { useState, useEffect } from 'react'
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
import '../styles/dashboard.css'

export default function Dashboard() {
  const [character, setCharacter] = useState(null)
  const [tasks, setTasks] = useState([])
  const [quests, setQuests] = useState([])
  const [chapters, setChapters] = useState([])
  const [loading, setLoading] = useState(true)
  
  // Modals
  const [taskModalOpen, setTaskModalOpen] = useState(false)
  const [taskModalContext, setTaskModalContext] = useState({ questId: null, chapterId: null })
  const [questModalOpen, setQuestModalOpen] = useState(false)
  const [chapterModalOpen, setChapterModalOpen] = useState(false)
  const [chapterModalContext, setChapterModalContext] = useState({ questId: null, questName: '' })
  
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    loadData()
  }, [user])

  const loadData = async () => {
    setLoading(true)
    
    // Charger le personnage actif
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
    
    // Charger les tâches (non archivées)
    const { data: tasksData } = await supabase
      .from('tasks')
      .select('*')
      .eq('character_id', char.id)
      .neq('status', 'deleted')
      .is('archived_at', null)
      .order('created_at', { ascending: false })
    
    setTasks(tasksData || [])
    
    // Charger les quêtes
    const { data: questsData } = await supabase
      .from('quests')
      .select('*')
      .eq('character_id', char.id)
      .neq('status', 'abandoned')
      .order('created_at', { ascending: false })
    
    setQuests(questsData || [])
    
    // Charger les chapitres
    const { data: chaptersData } = await supabase
      .from('chapters')
      .select('*')
      .in('quest_id', questsData?.map(q => q.id) || [])
      .order('position', { ascending: true })
    
    setChapters(chaptersData || [])
    
    setLoading(false)
  }

  // Calculer le jour du périple
  const getDayCount = () => {
    if (!character) return 0
    const start = new Date(character.start_date)
    const today = new Date()
    const diff = Math.floor((today - start) / (1000 * 60 * 60 * 24))
    return diff + 1
  }

  // Compléter une tâche
  const completeTask = async (taskId) => {
    const task = tasks.find(t => t.id === taskId)
    if (!task) return

    const newStatus = task.status === 'completed' ? 'pending' : 'completed'
    const completedAt = newStatus === 'completed' ? new Date().toISOString() : null

    await supabase
      .from('tasks')
      .update({ status: newStatus, completed_at: completedAt })
      .eq('id', taskId)

    // Mettre à jour l'XP si complété
    if (newStatus === 'completed' && character) {
      const newXp = character.xp + task.xp
      const newLevel = calculateLevel(newXp)
      
      await supabase
        .from('characters')
        .update({ xp: newXp, level: newLevel })
        .eq('id', character.id)
      
      setCharacter(prev => ({ ...prev, xp: newXp, level: newLevel }))
    }
    
    // Si décomplété, retirer l'XP
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
  }

  // Supprimer une tâche
  const deleteTask = async (taskId) => {
    await supabase
      .from('tasks')
      .update({ status: 'deleted' })
      .eq('id', taskId)

    setTasks(prev => prev.filter(t => t.id !== taskId))
  }

  // Ajouter une tâche
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

  // Ajouter une quête
  const addQuest = async (name, rank, xpReward) => {
    const { data, error } = await supabase
      .from('quests')
      .insert({
        character_id: character.id,
        name,
        rank,
        xp_reward: xpReward,
        status: 'active'
      })
      .select()
      .single()

    if (!error && data) {
      setQuests(prev => [data, ...prev])
    }
  }

  // Ajouter un chapitre
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

  // Calculer le niveau basé sur l'XP
  const calculateLevel = (xp) => {
    const thresholds = [0, 100, 250, 500, 850, 1300, 1850, 2500, 3300, 4200, 5200, 
                       6300, 7500, 8800, 10200, 11700, 13300, 15000, 16800, 18700, 20700]
    for (let i = thresholds.length - 1; i >= 0; i--) {
      if (xp >= thresholds[i]) return i + 1
    }
    return 1
  }

  // XP pour le niveau suivant
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

  // Obtenir le greeting selon l'heure
  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour >= 5 && hour < 12) return 'BONJOUR'
    if (hour >= 12 && hour < 18) return 'BON APRÈS-MIDI'
    if (hour >= 18 && hour < 22) return 'BONSOIR'
    return 'BONNE NUIT'
  }

  // Stats rapides
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

  // Handlers pour ouvrir les modals
  const openTaskModal = (questId = null, chapterId = null) => {
    setTaskModalContext({ questId, chapterId })
    setTaskModalOpen(true)
  }

  const openChapterModal = (questId, questName) => {
    setChapterModalContext({ questId, questName })
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
      <div className="dashboard-background">
        <div className="pixel-ground">
          <div className="pixel-path" />
        </div>
      </div>
      
      <div className="dashboard-container">
        <Header 
          greeting={getGreeting()}
          dayCount={getDayCount()}
          character={character}
          classIcon={CLASS_ICONS[character?.class]}
          xpProgress={getXpProgress()}
          xpCurrent={character?.xp}
          xpNext={getXpForNextLevel(character?.level)}
          stats={stats}
          onSignOut={signOut}
        />
        
        <TaskSection 
          tasks={tasks.filter(t => !t.quest_id && !t.chapter_id)}
          onComplete={completeTask}
          onDelete={deleteTask}
          onAdd={() => openTaskModal()}
        />
        
        <QuestSection 
          quests={quests}
          chapters={chapters}
          tasks={tasks}
          onAddQuest={() => setQuestModalOpen(true)}
          onAddChapter={(questId) => {
            const quest = quests.find(q => q.id === questId)
            openChapterModal(questId, quest?.name || '')
          }}
          onAddTask={openTaskModal}
          onTaskComplete={completeTask}
        />
      </div>

      {taskModalOpen && (
        <TaskModal 
          onClose={() => setTaskModalOpen(false)}
          onAdd={(name, xp) => addTask(name, xp, taskModalContext.questId, taskModalContext.chapterId)}
          questId={taskModalContext.questId}
          chapterId={taskModalContext.chapterId}
        />
      )}

      {questModalOpen && (
        <QuestModal 
          onClose={() => setQuestModalOpen(false)}
          onAdd={addQuest}
        />
      )}

      {chapterModalOpen && (
        <ChapterModal 
          onClose={() => setChapterModalOpen(false)}
          onAdd={(name, description) => addChapter(name, description, chapterModalContext.questId)}
          questName={chapterModalContext.questName}
        />
      )}
    </div>
  )
}
