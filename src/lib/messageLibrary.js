// src/lib/messageLibrary.js
// Centralized message library for Le Sentier

export const MESSAGES = {
  // Welcome messages by time of day
  WELCOME: {
    dawn: (name) => `Good morning${name ? ' ' + name : ', traveler'}! A new day begins.`,
    day: (name) => `Good afternoon${name ? ' ' + name : ', traveler'}! Welcome to Le Sentier.`,
    dusk: (name) => `Good evening${name ? ' ' + name : ', traveler'}! The night falls gently.`,
    night: (name) => `Good night${name ? ' ' + name : ', traveler'}! Rest well.`
  },
  
  // Task completion messages
  TASK_COMPLETED: {
    first: "Congratulations! Your first task completed! +10 XP",
    normal: (xp) => `Task accomplished! +${xp} XP`,
    streak: (count) => `${count} tasks in a row! You're on fire! 🔥`,
    critical: (xp) => `Perfect execution! Double XP! +${xp} XP`
  },
  
  // Level up
  LEVEL_UP: (level) => `Congratulations! You've reached level ${level}!`,
  
  // Quest messages
  QUEST: {
    completed: (name) => `Quest "${name}" completed! Well done!`,
    started: (name) => `New quest: ${name}`,
    failed: "This quest has failed... Don't get discouraged!",
    nearCompletion: (name) => `Almost there! "${name}" is nearly complete.`
  },
  
  // Chapter messages
  CHAPTER: {
    completed: (name) => `Chapter "${name}" finished! Moving forward!`,
    started: (name) => `New chapter: ${name}`
  },
  
  // Milestones (day streaks)
  MILESTONE: {
    day7: "7 days on Le Sentier! Keep it up!",
    day30: "30 days! You're a dedicated traveler!",
    day100: "100 days! You're a legend!",
    day365: "One full year! You're an inspiration!"
  },
  
  // Tutorial / Hints
  HINTS: {
    noTasks: "You have no active tasks. Create one to get started!",
    firstQuest: "Tip: Quests help you organize tasks by theme.",
    firstChapter: "Chapters are great for breaking down big quests into steps.",
    idle: "It's been a while... Ready to continue your journey?",
    lowXP: "Don't forget to complete tasks to gain XP!",
    nearLevel: "You're close to leveling up! Keep going!"
  },
  
  // Random encouragements
  ENCOURAGEMENT: [
    "Every step counts, keep going!",
    "You're making great progress!",
    "One day at a time...",
    "The journey is as important as the destination.",
    "Small wins add up to big victories.",
    "You've got this!",
    "Progress, not perfection.",
    "Keep moving forward!"
  ],
  
  // Hero thoughts (internal monologue)
  HERO_THOUGHTS: [
    "Time to make some progress...",
    "I can feel myself getting stronger.",
    "What should I tackle next?",
    "Every completed task is a victory.",
    "I'm on the right path.",
    "Focus on what matters.",
    "One step closer to my goals."
  ],
  
  // Warnings / Alerts
  WARNINGS: {
    deleteQuest: "Warning: Deleting a quest also deletes all its tasks!",
    deleteChapter: "Warning: Deleting a chapter deletes all its tasks!",
    noInternet: "No connection... Your data will be saved later.",
    unsavedChanges: "You have unsaved changes!"
  },
  
  // Errors
  ERRORS: {
    saveFailed: "Save failed. Please try again.",
    loadFailed: "Failed to load data. Refresh the page.",
    generic: "Something went wrong. Please try again."
  },
  
  // Special events
  EVENTS: {
    newFeature: "New feature unlocked! Check it out.",
    maintenance: "Scheduled maintenance in progress...",
    achievement: (name) => `Achievement unlocked: ${name}!`
  },
  
  // Time-based messages
  TIME: {
    morning: "The morning is perfect for new beginnings.",
    afternoon: "Making progress in the afternoon!",
    evening: "Evening is a great time to reflect on the day.",
    lateNight: "Working late? Don't forget to rest!"
  }
}

// Helper: Get random message from a category
export function getRandomMessage(category) {
  const messages = MESSAGES[category]
  if (!messages || !Array.isArray(messages)) {
    console.warn(`Message category "${category}" not found or not an array`)
    return "..."
  }
  return messages[Math.floor(Math.random() * messages.length)]
}

// Helper: Get welcome message based on time
export function getWelcomeMessage(name) {
  const hour = new Date().getHours()
  
  if (hour >= 5 && hour < 12) {
    return MESSAGES.WELCOME.dawn(name)
  } else if (hour >= 12 && hour < 18) {
    return MESSAGES.WELCOME.day(name)
  } else if (hour >= 18 && hour < 22) {
    return MESSAGES.WELCOME.dusk(name)
  } else {
    return MESSAGES.WELCOME.night(name)
  }
}

// Helper: Get speaker name based on message type
export function getSpeaker(type) {
  const speakers = {
    system: 'System',
    narrator: 'Narrator',
    hero: 'Hero',
    guide: 'Guide'
  }
  return speakers[type] || 'Narrator'
}
