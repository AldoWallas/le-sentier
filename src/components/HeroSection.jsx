import { useState, useEffect, useMemo, useRef } from 'react'
import CharacterSprite from './CharacterSprite'
import HeartParticle from './HeartParticle'
import LogbookModal from './LogbookModal'
import '../styles/hero-section.css'

export default function HeroSection({ character, stats, dayCount, onSignOut, showHeart }) {
  const [timeOfDay, setTimeOfDay] = useState('day')
  const [greeting, setGreeting] = useState('')
  const [fadeIn, setFadeIn] = useState(false)
  const [hearts, setHearts] = useState([])
  const [trees, setTrees] = useState([])
  const [menuOpen, setMenuOpen] = useState(false)
  const [logbookOpen, setLogbookOpen] = useState(false)

  // Définition des zones (biomes)
  const zones = useMemo(() => [
    { 
      name: 'plaine', 
      probability: 20, 
      interval: 3000, 
      speed: 15,
      duration: [10000, 15000]
    },
    { 
      name: 'bosquet', 
      probability: 50, 
      interval: 2000, 
      speed: 12,
      duration: [8000, 12000]
    },
    { 
      name: 'forêt', 
      probability: 80, 
      interval: 1000, 
      speed: 10,
      duration: [10000, 15000]
    },
    { 
      name: 'clairière', 
      probability: 35, 
      interval: 2500, 
      speed: 13,
      duration: [8000, 12000]
    }
  ], [])

  const [currentZoneIndex, setCurrentZoneIndex] = useState(0)
  const [currentZone, setCurrentZone] = useState(zones[0])
  const [currentProbability, setCurrentProbability] = useState(20)
  const [currentInterval, setCurrentInterval] = useState(3000)
  const [currentSpeed, setCurrentSpeed] = useState(15)

  // Générer les étoiles UNE SEULE FOIS
  const stars = useMemo(() => {
    return [...Array(60)].map((_, i) => ({
      id: i,
      top: Math.random() * 60,
      left: Math.random() * 100,
      delay: Math.random() * 3
    }))
  }, [])

  // Générer les nuages UNE SEULE FOIS
  const clouds = useMemo(() => {
    return [...Array(5)].map((_, i) => ({
      id: i,
      top: 5 + i * 8,
      delay: i * -25,
      duration: 50 + i * 8
    }))
  }, [])

  // Refs pour éviter de recréer l'interval à chaque changement de valeur
  const probabilityRef = useRef(20)
  const intervalRef = useRef(3000)
  const speedRef = useRef(15)

  // Sync refs avec states
  useEffect(() => {
    probabilityRef.current = currentProbability
  }, [currentProbability])

  useEffect(() => {
    intervalRef.current = currentInterval
  }, [currentInterval])

  useEffect(() => {
    speedRef.current = currentSpeed
  }, [currentSpeed])

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

  // Système de spawn des arbres
  useEffect(() => {
    const getRandomTreeType = () => {
      const rand = Math.random()
      if (rand < 0.5) return 'pine'
      if (rand < 0.85) return 'oak'
      return 'umbrella'
    }

    const spawnTree = () => {
      const probability = probabilityRef.current / 100
      if (Math.random() > probability) return

      const type = getRandomTreeType()
      const treeId = Date.now() + '-' + Math.random()
      
      const newTree = {
        id: treeId,
        type,
        speed: speedRef.current,
        height: type === 'umbrella' ? 95 : type === 'oak' ? 55 : 70 + Math.floor(Math.random() * 4) * 15
      }
      
      setTrees(prev => [...prev, newTree])
      
      // Supprimer l'arbre après son animation
      setTimeout(() => {
        setTrees(prev => prev.filter(t => t.id !== treeId))
      }, speedRef.current * 1000)
    }

    // Utiliser un interval court et vérifier si on doit spawn
    let lastSpawn = Date.now()
    const checkInterval = setInterval(() => {
      const now = Date.now()
      const elapsed = now - lastSpawn
      
      if (elapsed >= intervalRef.current) {
        spawnTree()
        lastSpawn = now
      }
    }, 100) // Vérifier toutes les 100ms

    return () => clearInterval(checkInterval)
  }, []) // Pas de dependencies, on utilise les refs

  // Système de changement de zones
  useEffect(() => {
    const smoothTransition = (startValue, endValue, duration, callback) => {
      const startTime = Date.now()
      const delta = endValue - startValue
      
      const intervalId = setInterval(() => {
        const elapsed = Date.now() - startTime
        const progress = Math.min(elapsed / duration, 1)
        
        // Ease-in-out
        const easedProgress = progress < 0.5
          ? 2 * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 2) / 2
        
        const currentValue = startValue + (delta * easedProgress)
        callback(currentValue)
        
        if (progress >= 1) {
          clearInterval(intervalId)
        }
      }, 50)
      
      return intervalId
    }

    const changeZone = () => {
      const oldZone = currentZone
      const newZoneIndex = (currentZoneIndex + 1) % zones.length
      const newZone = zones[newZoneIndex]
      
      setCurrentZoneIndex(newZoneIndex)
      setCurrentZone(newZone)
      
      // Transitions progressives
      const transitionDuration = 3000
      
      smoothTransition(oldZone.probability, newZone.probability, transitionDuration, (val) => {
        setCurrentProbability(val)
      })
      
      smoothTransition(oldZone.interval, newZone.interval, transitionDuration, (val) => {
        setCurrentInterval(val)
      })
      
      smoothTransition(oldZone.speed, newZone.speed, transitionDuration, (val) => {
        setCurrentSpeed(val)
      })
      
      // Programmer le prochain changement
      const zoneDuration = Math.floor(
        newZone.duration[0] + 
        Math.random() * (newZone.duration[1] - newZone.duration[0])
      )
      
      return setTimeout(changeZone, zoneDuration)
    }

    // Démarrer le premier changement après la durée de la zone initiale
    const initialDuration = Math.floor(
      zones[0].duration[0] + 
      Math.random() * (zones[0].duration[1] - zones[0].duration[0])
    )
    const zoneTimeout = setTimeout(changeZone, initialDuration)
    
    return () => clearTimeout(zoneTimeout)
  }, [zones, currentZone, currentZoneIndex])

  useEffect(() => {
    if (showHeart) {
      const newHeart = { id: Date.now() }
      setHearts(prev => [...prev, newHeart])
    }
  }, [showHeart])

  // Fermer le menu au clic extérieur
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuOpen && !e.target.closest('.ui-menu')) {
        setMenuOpen(false)
      }
    }
    
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [menuOpen])

  const removeHeart = (id) => {
    setHearts(prev => prev.filter(h => h.id !== id))
  }

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
            {stars.map((star) => (
              <div
                key={star.id}
                className="star"
                style={{
                  top: `${star.top}%`,
                  left: `${star.left}%`,
                  animationDelay: `${star.delay}s`
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
          {clouds.map((cloud) => (
            <div
              key={cloud.id}
              className="cloud"
              style={{
                top: `${cloud.top}%`,
                animationDelay: `${cloud.delay}s`,
                animationDuration: `${cloud.duration}s`
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
          {trees.map((tree) => (
            <div
              key={tree.id}
              className={`tree tree-${tree.type}`}
              style={{
                height: `${tree.height}px`,
                animationDuration: `${tree.speed}s`
              }}
            >
              {tree.type === 'pine' && <div className="tree-pine-top" />}
              {tree.type === 'oak' && (
                <>
                  <div className="tree-oak-right" />
                  <div className="tree-oak-top" />
                </>
              )}
            </div>
          ))}
        </div>

        <div className="layer-ground">
          <div className="grass" />
        </div>

        <div className="layer-character">
          <CharacterSprite 
            characterClass="randonneur" 
            animation="walk" 
          />
        </div>

        {/* HEARTS PARTICLES - Positionnés relativement au personnage */}
        {hearts.map(heart => (
          <HeartParticle 
            key={heart.id}
            onComplete={() => removeHeart(heart.id)}
          />
        ))}

        <div className="layer-ui-top">
          <div className="ui-top-left">
            <div className="greeting">{greeting}, TRAVELER</div>
            <div className="day-counter">DAY {dayCount}</div>
          </div>
          
          {/* Menu burger */}
          <div className="ui-menu">
            <button 
              className="ui-menu-toggle" 
              onClick={() => setMenuOpen(!menuOpen)}
              title="Menu"
            >
              ☰
            </button>
            
            {menuOpen && (
              <div className="ui-menu-dropdown">
                <button 
                  className="menu-item"
                  onClick={() => {
                    setMenuOpen(false)
                    setLogbookOpen(true)
                  }}
                >
                  📖 Logbook
                </button>
                <button 
                  className="menu-item"
                  onClick={() => {
                    setMenuOpen(false)
                    onSignOut()
                  }}
                >
                  🚪 Sign out
                </button>
              </div>
            )}
          </div>

          <div className="ui-scroll-hint">
            <div className="scroll-arrow">▼</div>
            <div className="scroll-text">Scroll to see your quests</div>
          </div>

          <div className="ui-version">v0.1.006</div>
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

      {/* Logbook Modal */}
      <LogbookModal 
        isOpen={logbookOpen}
        onClose={() => setLogbookOpen(false)}
        characterId={character?.id}
      />
    </>
  )
}
