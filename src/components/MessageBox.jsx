import { useEffect, useState } from 'react'
import { useMessage } from './MessageContext'
import '../styles/message-box.css'

export default function MessageBox() {
  const { currentMessage, clearMessage } = useMessage()
  const [displayedText, setDisplayedText] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [isFadingOut, setIsFadingOut] = useState(false)

  // Effet typewriter
  useEffect(() => {
    if (!currentMessage) {
      setDisplayedText('')
      setIsTyping(false)
      setIsFadingOut(false)
      return
    }

    setIsTyping(true)
    setDisplayedText('')
    setIsFadingOut(false)
    
    const text = currentMessage.text
    let index = 0

    const typeInterval = setInterval(() => {
      if (index < text.length) {
        setDisplayedText(text.substring(0, index + 1))
        index++
      } else {
        setIsTyping(false)
        clearInterval(typeInterval)
        
        // Auto-close après 4 secondes avec fade-out si autoClose = true
        if (currentMessage.autoClose) {
          setTimeout(() => {
            setIsFadingOut(true) // Commence le fade-out
            setTimeout(() => {
              clearMessage() // Supprime après l'animation
            }, 300) // Durée du fade-out
          }, 4000) // 4 secondes au lieu de 5
        }
      }
    }, 30) // 30ms par lettre

    return () => clearInterval(typeInterval)
  }, [currentMessage, clearMessage])

  if (!currentMessage) return null

  return (
    <div className={`message-box-container ${isFadingOut ? 'fading-out' : ''}`}>
      <div className="message-box">
        <div className="message-speaker">
          ► {currentMessage.speaker}:
        </div>
        <div className="message-text">
          {displayedText}
          {isTyping && <span className="message-cursor">▮</span>}
        </div>
        
        {!currentMessage.autoClose && !isTyping && (
          <button 
            className="message-button"
            onClick={clearMessage}
          >
            Continuer
          </button>
        )}
      </div>
    </div>
  )
}
