import { useState, useEffect } from 'react'
import '../styles/character-sprite.css'

export default function CharacterSprite({ 
  characterClass, 
  animation = 'idle' // 'idle', 'victory', 'levelup'
}) {
  const [currentFrame, setCurrentFrame] = useState(0)

  useEffect(() => {
    if (animation === 'idle') {
      const interval = setInterval(() => {
        setCurrentFrame(prev => (prev + 1) % 2) // 2 frames pour idle
      }, 600) // Change toutes les 600ms
      return () => clearInterval(interval)
    }
  }, [animation])

  return (
    <div className={`character-sprite ${characterClass} ${animation}`}>
      <div className={`sprite-container frame-${currentFrame}`}>
        {/* Le sprite sera dessiné en CSS avec box-shadow */}
        <div className="sprite-pixel-art" />
      </div>
    </div>
  )
}
