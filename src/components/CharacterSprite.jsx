import { useState, useEffect, useRef } from 'react'
import '../styles/character-sprite.css'

export default function CharacterSprite({ 
  characterClass = 'hero',
  animation = 'walk'
}) {
  const [currentFrame, setCurrentFrame] = useState(0)
  const spriteRef = useRef(null)

  // Configuration des animations
  const animations = {
    walk: { frames: 8, speed: 100, startFrame: 0 },
    idle: { frames: 2, speed: 400, startFrame: 8 },
    celebrate: { frames: 4, speed: 150, startFrame: 10, loop: false }
  }

  const config = animations[animation] || animations.walk

  useEffect(() => {
    console.log('🎬 Animation démarrée:', animation, 'Speed:', config.speed, 'Frames:', config.frames)
    
    const interval = setInterval(() => {
      setCurrentFrame(prev => {
        const nextFrame = prev + 1
        console.log('🎞️ Frame:', prev, '→', nextFrame % config.frames)
        
        // Si animation ne boucle pas et terminée, rester sur dernière frame
        if (config.loop === false && nextFrame >= config.frames) {
          return config.frames - 1
        }
        return nextFrame % config.frames
      })
    }, config.speed)

    return () => {
      console.log('🛑 Animation arrêtée')
      clearInterval(interval)
    }
  }, [animation, config.speed, config.frames, config.loop])

  // Forcer backgroundPosition avec !important (écrasé par CSS sinon)
  useEffect(() => {
    if (spriteRef.current) {
      const frameX = (config.startFrame + currentFrame) * 16
      spriteRef.current.style.setProperty('background-position', `-${frameX}px 0px`, 'important')
    }
  }, [currentFrame, config.startFrame])

  // Calculer la position X dans le sprite sheet
  const frameX = (config.startFrame + currentFrame) * 16

  return (
    <div 
      ref={spriteRef}
      className={`character-sprite sprite-sheet ${characterClass} ${animation}`}
      style={{
        backgroundImage: 'url(/sprites/hero-spritesheet.png)',
        backgroundRepeat: 'no-repeat',
        width: '16px',
        height: '16px',
        border: 'none',
        outline: 'none',
        boxShadow: 'none'
      }}
    />
  )
}
