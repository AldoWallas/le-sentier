import { useEffect, useState } from 'react'
import '../styles/task-completion-animation.css'

export default function TaskCompletionAnimation({ xp, onComplete }) {
  const [particles, setParticles] = useState([])

  useEffect(() => {
    // Générer les particules d'explosion
    const newParticles = []
    const particleCount = 8
    
    for (let i = 0; i < particleCount; i++) {
      const angle = (i / particleCount) * Math.PI * 2
      const velocity = 100 + Math.random() * 50
      
      newParticles.push({
        id: i,
        angle,
        velocity,
        size: 4 + Math.random() * 4
      })
    }
    
    setParticles(newParticles)
    
    // Appeler onComplete après l'animation
    const timer = setTimeout(() => {
      if (onComplete) onComplete()
    }, 1500)
    
    return () => clearTimeout(timer)
  }, [onComplete])

  return (
    <div className="task-completion-container">
      {/* Particules d'explosion */}
      {particles.map(particle => (
        <div
          key={particle.id}
          className="explosion-particle"
          style={{
            '--angle': `${particle.angle}rad`,
            '--velocity': `${particle.velocity}px`,
            width: `${particle.size}px`,
            height: `${particle.size}px`
          }}
        />
      ))}
      
      {/* XP qui monte */}
      <div className="xp-gained">+{xp} XP</div>
    </div>
  )
}
