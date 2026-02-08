import { useState, useEffect } from 'react'
import '../styles/character-sprite.css'

export default function CharacterSprite({ 
  characterClass, 
  animation = 'walk'
}) {
  const [currentFrame, setCurrentFrame] = useState(0)

  useEffect(() => {
    if (animation === 'walk') {
      const interval = setInterval(() => {
        setCurrentFrame(prev => (prev + 1) % 4)
      }, 200)
      return () => clearInterval(interval)
    }
  }, [animation])

  return (
    <div className={`character-sprite ${characterClass} ${animation}`}>
      <div className={`sprite-frame frame-${currentFrame}`}>
        <div className="sprite-pixels" />
      </div>
    </div>
  )
}
