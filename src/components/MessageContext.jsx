import { createContext, useContext, useState, useCallback } from 'react'

const MessageContext = createContext()

export function MessageProvider({ children }) {
  const [currentMessage, setCurrentMessage] = useState(null)

  const pushMessage = useCallback((text, speaker = 'Narrateur', autoClose = true) => {
    setCurrentMessage({
      text,
      speaker,
      autoClose,
      id: Date.now() // Pour éviter les doublons
    })
  }, [])

  const clearMessage = useCallback(() => {
    setCurrentMessage(null)
  }, [])

  return (
    <MessageContext.Provider value={{ currentMessage, pushMessage, clearMessage }}>
      {children}
    </MessageContext.Provider>
  )
}

export function useMessage() {
  const context = useContext(MessageContext)
  if (!context) {
    throw new Error('useMessage must be used within MessageProvider')
  }
  return context
}
