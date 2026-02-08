import { useState, useEffect } from 'react'
import CharacterSprite from './CharacterSprite'
import '../styles/hero-section.css'

export default function HeroSection({ character, stats, dayCount, onSignOut }) {
  const [timeOfDay, setTimeOfDay] = useState('day')
  const [greeting, setGreeting] = useState('')
  const [fadeIn, setFadeIn] = useState(false)

  useEffect(() => {
    const updateTime = () => {
      const hour = new Date().getHours()
      
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
    
    setTimeout(() => setFadeIn(true), 300)
    
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
    <>
      {/* SECTION PAYSAGE */}
      <section className={`hero-landscape ${timeOfDay} ${fadeIn ? 'fade-in-active' : ''}`}>
        <div className="horizon-line" />
        <div className="layer-sky" />

        {(timeOfDay === 'night' || timeOfDay === 'dusk') && (
          <div className="layer-stars">
            {[...Array(60)].map((_, i) => (
              <div
                key={i}
                className="star"
                style={{
                  top: `${Math.random() * 60}%`,
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 3}s`
                }}
              />
            ))}
          </div>
        )}

        <div className="layer-celestial">
          <div className="celestial sun" />
          <div className="celestial moon" />
        </div>

        <div className="layer-clouds">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="cloud"
              style={{
                top: `${5 + i * 8}%`,
                animationDelay: `${i * -25}s`,
                animationDuration: `${50 + i * 8}s`
              }}
            />
          ))}
        </div>

        <div className="layer-mountains-far">
          {[...Array(8)].map((_, i) => (
            <div key={i} className={`mountain far-${(i % 3) + 1}`} />
          ))}
        </div>

        <div className="layer-mountains-near">
          {[...Array(6)].map((_, i) => (
            <div key={i} className={`mountain near-${(i % 2) + 1}`} />
          ))}
        </div>

        <div className="layer-trees">
          {[...Array(15)].map((_, i) => (
            <div
              key={i}
              className="tree"
              style={{
                left: `${i * 150}px`,
                height: `${70 + (i % 4) * 20}px`
              }}
            />
          ))}
        </div>

        <div className="layer-ground">
          <div className="grass" />
        </div>

        <div className="layer-character">
          <CharacterSprite 
            characterClass={character?.class} 
            animation="walk" 
          />
        </div>

        <div className="layer-ui-top">
          <div className="ui-top-left">
            <div className="greeting">{greeting}, VOYAGEUR</div>
            <div className="day-counter">JOUR {dayCount}</div>
          </div>
          
          <button 
            className="ui-sign-out" 
            onClick={onSignOut}
            title="Déconnexion"
          >
            ✕
          </button>

          <div className="ui-scroll-hint">
            <div className="scroll-arrow">▼</div>
            <div className="scroll-text">Scroll pour voir tes quêtes</div>
          </div>

          <div className="ui-version">v0.1.005</div>
        </div>
      </section>

      {/* BANDEAU UI EN BAS */}
      <section className="hero-info-bar">
        <div className="info-bar-content">
          <div className="character-info-compact">
            <span className="character-name-compact">
              {character?.name?.toUpperCase()}
            </span>
            <span className="character-class-compact">
              {character?.class?.charAt(0).toUpperCase() + character?.class?.slice(1)}
            </span>
            <span className="character-level-compact">
              LVL {character?.level}
            </span>
          </div>

          <div className="xp-bar-compact">
            <div className="xp-fill-compact" style={{ width: `${xpProgress}%` }} />
            <span className="xp-text-compact">
              {character?.xp - currentLevelXp}/{nextLevelXp - currentLevelXp} XP
            </span>
          </div>
        </div>
      </section>
    </>
  )
}
