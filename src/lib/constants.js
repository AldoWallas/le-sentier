// Rangs de quêtes avec leurs caractéristiques
export const QUEST_RANKS = [
  { 
    id: 'rank_f', 
    name: 'TRIVIAL', 
    emoji: '🌱', 
    xp: 50, 
    flavor: 'Une formalité. Même un gobelin y arriverait.',
    color: '#5dca42'
  },
  { 
    id: 'rank_e', 
    name: 'MINEUR', 
    emoji: '⭐', 
    xp: 100, 
    flavor: 'Un échauffement pour aventurier motivé.',
    color: '#4dc9ff'
  },
  { 
    id: 'rank_d', 
    name: 'NOTABLE', 
    emoji: '💎', 
    xp: 200, 
    flavor: 'Ça commence à sentir l\'aventure sérieuse.',
    color: '#9b59b6'
  },
  { 
    id: 'rank_c', 
    name: 'MAJEUR', 
    emoji: '🔥', 
    xp: 350, 
    flavor: 'Les héros se forgent sur ce genre de quête.',
    color: '#e67e22'
  },
  { 
    id: 'rank_b', 
    name: 'CRITIQUE', 
    emoji: '👑', 
    xp: 500, 
    flavor: 'Seuls les plus braves osent s\'y attaquer.',
    color: '#f4b41a'
  },
  { 
    id: 'rank_a', 
    name: 'ÉPIQUE', 
    emoji: '💀', 
    xp: 1000, 
    flavor: 'Les légendes naissent ici. Prêt à entrer dans l\'histoire ?',
    color: '#e8403e'
  }
]

// Niveaux XP pour les tâches
export const TASK_XP_LEVELS = [
  { value: 10, label: '⚡ RAPIDE', description: '< 15 min' },
  { value: 25, label: '🔧 NORMAL', description: '15-60 min' },
  { value: 50, label: '💪 COSTAUD', description: '1-3h' },
  { value: 100, label: '🔥 INTENSE', description: 'demi-journée+' }
]

// Icônes des classes de personnages
export const CLASS_ICONS = {
  chevalier: '⚔️',
  mage: '🧙',
  ranger: '�',
  barde: '🎵'
}

// Calculer l'XP d'un chapitre (somme tâches + 15% bonus)
export const calculateChapterXP = (tasks) => {
  const tasksXP = tasks.reduce((sum, task) => sum + (task.xp || 0), 0)
  const bonus = Math.floor(tasksXP * 0.15)
  return tasksXP + bonus
}

// Calculer l'XP total d'une quête
export const calculateQuestTotalXP = (quest, chapters, tasks) => {
  let total = 0
  
  // XP des tâches directes sous la quête
  const directTasks = tasks.filter(t => t.quest_id === quest.id && !t.chapter_id)
  total += directTasks.reduce((sum, task) => sum + (task.xp || 0), 0)
  
  // XP des chapitres (incluant leur bonus)
  chapters.forEach(chapter => {
    const chapterTasks = tasks.filter(t => t.chapter_id === chapter.id)
    total += calculateChapterXP(chapterTasks)
  })
  
  // Bonus du rang
  const rank = QUEST_RANKS.find(r => r.id === quest.rank)
  total += rank ? rank.xp : 0
  
  return total
}
