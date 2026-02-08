import { useState, useEffect } from 'react'
import CharacterSprite from './CharacterSprite'
import '../styles/hero-section.css'

export default function HeroSection({ character, stats, dayCount, onSignOut }) {
  const [timeOfDay, setTimeOfDay] = useState('day')
  const [greeting, setGreeting] = useState('')

  useEffect(() => {
    const updateTime = () => {
      const hour = new Date().getHours()
      
      // Déterminer le moment de la journée
      if (hour >= 5 && hour < 12) {
        setTimeOfDay('dawn')
        setGreeting('BONJOUR')
      } else if (hour >= 12 && hour < 18) {
        setTimeOfDay('day')
        setGreeting('BON APRÈS-MIDI')
      } else if (hour >= 18 && hour < 22) {
        setTimeOfDay('dusk')
        setGreeting('BONSOIR')
      } else {
        setTimeOfDay('night')
        setGreeting('BONNE NUIT')
      }
    }

    updateTime()
    const interval = setInterval(updateTime, 60000)
    return () => clearInterval(interval)
  }, [])

  const getXpProgress = () => {
    if (!character) return 0
    const thresholds = [0, 100, 250, 500, 850, 1300, 1850, 2500, 3300, 4200, 5200]
    const currentLevelXp = thresholds[character.level - 1] || 0
    const nextLevelXp = thresholds[character.level] || thresholds[thresholds.length - 1]
    const progress = ((character.xp - currentLevelXp) / (nextLevelXp - currentLevelXp)) * 100
    return Math.min(100, Math.max(0, progress))
  }

  const xpProgress = getXpProgress()
  const currentLevelXp = [0, 100, 250, 500, 850, 1300, 1850, 2500, 3300, 4200, 5200][character?.level - 1] || 0
  const nextLevelXp = [0, 100, 250, 500, 850, 1300, 1850, 2500, 3300, 4200, 5200][character?.level] || 5200

  return (
    <section className={`hero-section ${timeOfDay}`}>
      {/* Background avec étoiles, nuages, montagnes */}
      <div className="hero-background">
        {/* Étoiles (nuit uniquement) */}
        {(timeOfDay === 'night' || timeOfDay === 'dusk') && (
          <div className="hero-stars">
            {[...Array(50)].map((_, i) => (
              <div
                key={i}
                className="hero-star"
                style={{
                  top: `${Math.random() * 60}%`,
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 3}s`
                }}
              />
            ))}
          </div>
        )}

        {/* Soleil/Lune */}
        <div className="hero-celestial sun" />
        <div className="hero-celestial moon" />

        {/* Nuages */}
        <div className="hero-clouds">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="hero-cloud"
              style={{
                top: `${10 + i * 15}%`,
                animationDelay: `${i * -20}s`,
                animationDuration: `${60 + i * 10}s`
              }}
            />
          ))}
        </div>

        {/* Montagnes en arrière-plan */}
        <div className="hero-mountains">
          <div className="hero-mountain far" />
          <div className="hero-mountain mid" />
          <div className="hero-mountain near" />
        </div>

        {/* Sol avec chemin */}
        <div className="hero-ground">
          <div className="hero-path" />
        </div>
      </div>

      {/* Stats overlay discret */}
     <div className="hero-overlay">
  <div className="hero-greeting">
    {greeting}, VOYAGEUR
  </div>
  <div className="hero-day">
    JOUR {dayCount}
  </div>
  
  <button
    className="sign-out-btn"
    onClick={onSignOut}
    title="Déconnexion"
  >
    ✕
  </button>
</div>

      {/* Personnage au centre */}
      <div className="hero-character-container">
        <CharacterSprite 
          characterClass={character?.class} 
          animation="idle" 
        />
        
        <div className="hero-character-info">
          <div className="hero-character-name">
            {character?.name?.toUpperCase()}
          </div>
          <div className="hero-character-class">
            {character?.class?.charAt(0).toUpperCase() + character?.class?.slice(1)} 
            <span className="hero-level">LVL {character?.level}</span>
          </div>
        </div>

        {/* Barre XP sous le personnage */}
        <div className="hero-xp-bar">
          <div className="hero-xp-fill" style={{ width: `${xpProgress}%` }} />
          <span className="hero-xp-text">
            {character?.xp - currentLevelXp}/{nextLevelXp - currentLevelXp} XP
          </span>
        </div>
      </div>

      {/* Stats discrètes en bas à droite */}
      <div className="hero-stats">
        <div className="hero-stat">
          <span className="hero-stat-icon">🔥</span>
          <span className="hero-stat-value">{stats?.streak || 0}</span>
        </div>
        <div className="hero-stat">
          <span className="hero-stat-value">{stats?.efficiency || 0}%</span>
          <span className="hero-stat-label">Efficacité</span>
        </div>
        <div className="hero-stat">
          <span className="hero-stat-icon">📖</span>
          <span className="hero-stat-value">{stats?.questsProgress || '0/0'}</span>
        </div>
      </div>

      {/* Indicateur de scroll */}
      <div className="hero-scroll-hint">
        <div className="hero-scroll-arrow">▼</div>
        <div className="hero-scroll-text">Scroll pour voir tes quêtes</div>
      </div>
    </section>
  )
}
