// src/hooks/useGameMessages.js
// Custom hook for game messages - provides clean API for components

import { useMessage } from '../components/MessageContext'
import { MESSAGES, getRandomMessage, getWelcomeMessage } from '../lib/messageLibrary'

export function useGameMessages() {
  const { pushMessage } = useMessage()
  
  return {
    // Welcome message
    welcome: (characterName = null) => {
      const message = getWelcomeMessage(characterName)
      pushMessage(message, 'Narrator', true)
    },
    
    // Task messages
    taskCompleted: (xp, options = {}) => {
      const { isFirst = false, isStreak = false, streakCount = 0, isCritical = false } = options
      
      if (isFirst) {
        pushMessage(MESSAGES.TASK_COMPLETED.first, 'System', true)
      } else if (isCritical) {
        pushMessage(MESSAGES.TASK_COMPLETED.critical(xp), 'System', true)
      } else if (isStreak && streakCount > 0) {
        pushMessage(MESSAGES.TASK_COMPLETED.streak(streakCount), 'System', true)
      } else {
        pushMessage(MESSAGES.TASK_COMPLETED.normal(xp), 'System', true)
      }
    },
    
    // Level up
    levelUp: (level) => {
      pushMessage(MESSAGES.LEVEL_UP(level), 'System', false) // Requires click
    },
    
    // Quest messages
    questCompleted: (questName) => {
      pushMessage(MESSAGES.QUEST.completed(questName), 'System', true)
    },
    
    questStarted: (questName) => {
      pushMessage(MESSAGES.QUEST.started(questName), 'Narrator', true)
    },
    
    questNearCompletion: (questName) => {
      pushMessage(MESSAGES.QUEST.nearCompletion(questName), 'Hero', true)
    },
    
    // Chapter messages
    chapterCompleted: (chapterName) => {
      pushMessage(MESSAGES.CHAPTER.completed(chapterName), 'System', true)
    },
    
    chapterStarted: (chapterName) => {
      pushMessage(MESSAGES.CHAPTER.started(chapterName), 'Narrator', true)
    },
    
    // Milestones
    milestone: (days) => {
      const milestones = {
        7: MESSAGES.MILESTONE.day7,
        30: MESSAGES.MILESTONE.day30,
        100: MESSAGES.MILESTONE.day100,
        365: MESSAGES.MILESTONE.day365
      }
      
      const message = milestones[days]
      if (message) {
        pushMessage(message, 'System', false) // Important milestone, requires click
      }
    },
    
    // Hints
    hint: (type) => {
      const message = MESSAGES.HINTS[type]
      if (message) {
        pushMessage(message, 'Guide', true)
      }
    },
    
    // Random encouragement
    encourage: () => {
      pushMessage(getRandomMessage('ENCOURAGEMENT'), 'Hero', true)
    },
    
    // Hero thought
    heroThought: () => {
      pushMessage(getRandomMessage('HERO_THOUGHTS'), 'Hero', true)
    },
    
    // Warnings
    warn: (type) => {
      const message = MESSAGES.WARNINGS[type]
      if (message) {
        pushMessage(message, 'System', false) // Warnings require click
      }
    },
    
    // Errors
    error: (type = 'generic') => {
      const message = MESSAGES.ERRORS[type] || MESSAGES.ERRORS.generic
      pushMessage(message, 'System', false)
    },
    
    // Events
    event: (eventName) => {
      pushMessage(MESSAGES.EVENTS.achievement(eventName), 'System', false)
    },
    
    // Time-based messages
    timeMessage: () => {
      const hour = new Date().getHours()
      let message
      
      if (hour >= 5 && hour < 12) {
        message = MESSAGES.TIME.morning
      } else if (hour >= 12 && hour < 18) {
        message = MESSAGES.TIME.afternoon
      } else if (hour >= 18 && hour < 22) {
        message = MESSAGES.TIME.evening
      } else {
        message = MESSAGES.TIME.lateNight
      }
      
      pushMessage(message, 'Hero', true)
    },
    
    // Custom message (for one-off messages)
    custom: (text, speaker = 'Narrator', autoClose = true) => {
      pushMessage(text, speaker, autoClose)
    }
  }
}
