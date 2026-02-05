import { useState, useEffect } from 'react'

export default function DynamicBackground() {
  const [timeOfDay, setTimeOfDay] = useState('day')
  const [stars, setStars] = useState([])
  const [clouds, setClouds] = useState([])
  const [particles, setParticles] = useState([])
  const [celestialRotation, setCelestialRotation] = useState(0)

  useEffect(() => {
    // Déterminer le moment de la journée ET la rotation
    const updateTimeOfDay = () => {
      const now = new Date()
      const hour = now.getHours()
      const minutes = now.getMinutes()
      
      // Calculer l'heure exacte en décimal (ex: 14h30 = 14.5)
      const exactHour = hour + minutes / 60
      
      // Calculer l'angle de rotation (0h = 0°, 6h = 90°, 12h = 180°, 18h = 270°)
      // On fait tourner sur 24h (360°)
      const angle = (exactHour / 24) * 360
      setCelestialRotation(angle)
      
      // Déterminer le moment de la journée pour les couleurs
      if (hour >= 5 && hour < 12) setTimeOfDay('dawn')
      else if (hour >= 12 && hour < 18) setTimeOfDay('day')
      else if (hour >= 18 && hour < 22) setTimeOfDay('dusk')
      else setTimeOfDay('night')
    }

    updateTimeOfDay()
    const interval = setInterval(updateTimeOfDay, 60000) // Check toutes les minutes

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    // Générer les étoiles (uniquement pour la nuit)
    const generatedStars = []
    for (let i = 0; i < 80; i++) {
      generatedStars.push({
        id: i,
        top: `${Math.random() * 60}%`,
        left: `${Math.random() * 100}%`,
        animationDelay: `${Math.random() * 3}s`,
        bright: Math.random() > 0.7
      })
    }
    setStars(generatedStars)

    // Générer les nuages
    const generatedClouds = []
    const cloudTypes = ['small', 'medium', 'large']
    for (let i = 0; i < 6; i++) {
      generatedClouds.push({
        id: i,
        type: cloudTypes[Math.floor(Math.random() * cloudTypes.length)],
        top: `${Math.random() * 40}%`,
        left: `${-200 + Math.random() * 100}px`,
        animationDelay: `${Math.random() * -100}s` // Démarrage aléatoire
      })
    }
    setClouds(generatedClouds)

    // Générer les particules (lucioles)
    const generatedParticles = []
    for (let i = 0; i < 12; i++) {
      generatedParticles.push({
        id: i,
        left: `${Math.random() * 100}%`,
        animationDelay: `${Math.random() * 8}s`,
        animationDuration: `${8 + Math.random() * 4}s`
      })
    }
    setParticles(generatedParticles)
  }, [])

  const showParticles = timeOfDay === 'dusk' || timeOfDay === 'night'

  return (
    <div className={`dashboard-background ${timeOfDay}`}>
      {/* Étoiles (nuit uniquement) */}
      <div className="stars-container">
        {stars.map(star => (
          <div
            key={star.id}
            className={`star ${star.bright ? 'bright' : ''}`}
            style={{
              top: star.top,
              left: star.left,
              animationDelay: star.animationDelay
            }}
          />
        ))}
      </div>

      {/* Container de rotation pour soleil/lune (style Minecraft) */}
      <div 
        className="celestial-orbit" 
        style={{ 
          transform: `rotate(${celestialRotation}deg)` 
        }}
      >
        {/* Soleil - positionné sur l'orbite */}
        <div className="celestial-body sun" />
        
        {/* Lune - à l'opposé du soleil (180°) */}
        <div className="celestial-body moon" />
      </div>

      {/* Nuages */}
      <div className="clouds-container">
        {clouds.map(cloud => (
          <div
            key={cloud.id}
            className={`cloud ${cloud.type}`}
            style={{
              top: cloud.top,
              left: cloud.left,
              animationDelay: cloud.animationDelay
            }}
          />
        ))}
      </div>

      {/* Montagnes en arrière-plan */}
      <div className="mountains">
        <div className="mountain" />
        <div className="mountain tall" />
        <div className="mountain" />
      </div>

      {/* Particules flottantes (lucioles soir/nuit) */}
      {showParticles && (
        <div className="particles-container">
          {particles.map(particle => (
            <div
              key={particle.id}
              className="particle firefly"
              style={{
                left: particle.left,
                animationDelay: particle.animationDelay,
                animationDuration: particle.animationDuration
              }}
            />
          ))}
        </div>
      )}

      {/* Sol avec chemin */}
      <div className="pixel-ground">
        <div className="pixel-path" />
      </div>
    </div>
  )
}
