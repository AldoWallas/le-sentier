import '../styles/header.css'
import '../styles/character-sprite.css'
import CharacterSprite from './CharacterSprite'


export default function Header({
  greeting, 
  dayCount, 
  character, 
  classIcon,
  xpProgress, 
  xpCurrent, 
  xpNext,
  stats,
  onSignOut 
}) {
  return (
    <header className="header pixel-border">
      <button className="sign-out-btn" onClick={onSignOut} title="Déconnexion">
        ✕
      </button>
      
      <p className="greeting">{greeting}, VOYAGEUR</p>
      <h1 className="day-counter">
        JOUR {dayCount}
        <span>de ton périple</span>
      </h1>

      <div className="character-hud">
        <CharacterSprite
            characterClass={character?.class}
        animation="idle"
            />
        <div className="character-info">
          <div className="character-name">
            {character?.name?.toUpperCase()}
            <span className="character-level">LVL {character?.level}</span>
          </div>
          <div className="character-class">
            {character?.class?.charAt(0).toUpperCase() + character?.class?.slice(1)}
          </div>
        </div>
      </div>

      <div className="xp-container">
        <div className="xp-label">EXP</div>
        <div className="xp-bar">
          <div className="xp-fill" style={{ width: `${xpProgress}%` }} />
          <span className="xp-text">{xpCurrent}/{xpNext}</span>
        </div>
      </div>

      <div className="stats-row">
        <div className="stat-box">
          <div className="stat-value streak">{stats.streak}</div>
          <div className="stat-label">Streak</div>
        </div>
        <div className="stat-box">
          <div className="stat-value">{stats.efficiency}%</div>
          <div className="stat-label">Efficacité</div>
        </div>
        <div className="stat-box">
          <div className="stat-value">{stats.epicsProgress}</div>
          <div className="stat-label">Épopées</div>
        </div>
      </div>
    </header>
  )
}
