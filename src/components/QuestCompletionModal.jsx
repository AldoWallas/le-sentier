import { useEffect, useState } from 'react'
import '../styles/task-completion-animation.css'

export default function QuestCompletionModal({ 
  type, // 'quest' ou 'chapter'
  name,
  emoji,
  xpBonus,
  onClose 
}) {
  const [confetti, setConfetti] = useState([])

  useEffect(() => {
    // Générer des confettis
    const newConfetti = []
    for (let i = 0; i < 50; i++) {
      newConfetti.push({
        id: i,
        left: `${Math.random() * 100}%`,
        delay: `${Math.random() * 2}s`,
        duration: `${2 + Math.random() * 2}s`
      })
    }
    setConfetti(newConfetti)
  }, [])

  const title = type === 'quest' ? 'QUÊTE TERMINÉE !' : 'CHAPITRE TERMINÉ !'
  const message = type === 'quest' 
    ? `Tu as triomphé de : ${name}`
    : `Tu as complété : ${name}`

  return (
    <>
      {/* Confettis */}
      <div className="confetti-container">
        {confetti.map(c => (
          <div
            key={c.id}
            className="confetti"
            style={{
              left: c.left,
              animationDelay: c.delay,
              animationDuration: c.duration
            }}
          />
        ))}
      </div>

      {/* Modal */}
      <div className="quest-completion-overlay" onClick={onClose}>
        <div className="quest-completion-content" onClick={e => e.stopPropagation()}>
          <div className="quest-completion-emoji">{emoji}</div>
          <div className="quest-completion-title">{title}</div>
          <div className="quest-completion-message">{message}</div>
          <div className="quest-completion-xp">+{xpBonus} XP</div>
          <button className="quest-completion-button" onClick={onClose}>
            CONTINUER
          </button>
        </div>
      </div>
    </>
  )
}
