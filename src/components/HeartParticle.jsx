import { useEffect, useState } from 'react'
import '../styles/heart-particle.css'

export default function HeartParticle({ onComplete }) {
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    // Démarrer l'animation immédiatement
    setIsAnimating(true)
    
    // Terminer après 2 secondes (durée de l'animation)
    const timer = setTimeout(() => {
      if (onComplete) onComplete()
    }, 2100)

    return () => clearTimeout(timer)
  }, [onComplete])

  return (
    <div className={`heart-particle ${isAnimating ? 'animating' : ''}`}>
      <div className="pixel-heart">
        <div className="pixel-heart-pixels" />
      </div>
    </div>
  )
}
