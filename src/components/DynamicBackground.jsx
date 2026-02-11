import { useState, useEffect } from 'react'

export default function DynamicBackground() {
  const [timeOfDay, setTimeOfDay] = useState('day')
  const [stars, setStars] = useState([])
  const [clouds, setClouds] = useState([])
  const [particles, setParticles] = useState([])
  
  // Calculer l'angle initial dès le chargement
  const getInitialAngle = () => {
    const now = new Date()
    const hour = now.getHours()
    const minutes = now.getMinutes()
    const exactHour = hour + minutes / 60
    return (((exactHour - 6) / 24) * 360) - 90
  }
  
  const [celestialRotation, setCelestialRotation] = useState(getInitialAngle())
  const [simulatedHour, setSimulatedHour] = useState(0)

  // ⚡ MODE TEST : Active pour simuler 24h en 1 minute
  const TEST_MODE = false // Mode réel : heure actuelle

  useEffect(() => {
    // Déterminer le moment de la journée ET la rotation
    const updateTimeOfDay = () => {
      let exactHour
      
      if (TEST_MODE) {
        // Mode test : 24h en 1 minute (cycle de 60 secondes)
        const now = Date.now()
        const secondsElapsed = (now / 1000) % 60
        exactHour = (secondsElapsed / 60) * 24 // 0-24h sur 60 secondes
        setSimulatedHour(exactHour)
        // console.log('TEST MODE - Hour:', exactHour.toFixed(2)) // Désactivé
      } else {
        // Mode réel
        const now = new Date()
        const hour = now.getHours()
        const minutes = now.getMinutes()
        exactHour = hour + minutes / 60
      }
      
      // Calculer l'angle de rotation
      // Position de base : soleil en HAUT, lune en BAS
      // On ajoute -90° pour décaler : soleil à l'est au lieu d'en haut
      // 6h (lever) = -90° → soleil tourne à droite (est)
      // 12h (midi) = 0° → soleil en haut (zénith)
      // 18h (coucher) = 90° → soleil à gauche (ouest)
      // 0h (minuit) = -180° → lune en haut
      const angle = (((exactHour - 6) / 24) * 360) - 90
      // console.log('Rotation angle:', angle.toFixed(2), '°') // Désactivé
      setCelestialRotation(angle)
      
      // Déterminer le moment de la journée pour les couleurs (basé sur heure)
      const hour = Math.floor(exactHour)
      if (hour >= 5 && hour < 9) setTimeOfDay('dawn')
      else if (hour >= 9 && hour < 18) setTimeOfDay('day')
      else if (hour >= 18 && hour < 22) setTimeOfDay('dusk')
      else setTimeOfDay('night')
    }

    updateTimeOfDay()
    
    // Mode test : update 60 fois par seconde (fluide)
    // Mode réel : update toutes les 10 secondes
    const interval = setInterval(updateTimeOfDay, TEST_MODE ? 16 : 10000)

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
        animationDelay: `${Math.random() * -100}s`
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
      {/* Debug : Afficher l'heure simulée en mode test */}
      {TEST_MODE && (
        <div style={{
          position: 'fixed',
          top: '10px',
          left: '10px',
          background: 'rgba(0,0,0,0.7)',
          color: 'white',
          padding: '8px 12px',
          borderRadius: '4px',
          fontFamily: 'monospace',
          fontSize: '14px',
          zIndex: 9999
        }}>
          TEST MODE: {simulatedHour.toFixed(2)}h ({timeOfDay})
        </div>
      )}

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
          transform: `rotate(${celestialRotation}deg)`,
          transition: TEST_MODE ? 'none' : 'transform 2s linear'
        }}
      >
        {/* Soleil - positionné sur l'orbite */}
        <div className="celestial-body sun" style={{ 
          transform: `rotate(${-celestialRotation}deg)` 
        }} />
        
        {/* Lune - à l'opposé du soleil (180°) */}
        <div className="celestial-body moon" style={{ 
          transform: `rotate(${-celestialRotation}deg)` 
        }} />
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

      {/* Sol supprimé - géré par HeroSection */}
    </div>
  )
}
