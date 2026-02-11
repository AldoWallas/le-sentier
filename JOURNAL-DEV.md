# Le Sentier - Journal de Développement

**Version actuelle : v0.1.012**
**Date : 10 février 2026**

---

## 🎯 État du Projet

### ✅ Phase 1 : Complète
- Système 3 niveaux (Quêtes → Chapitres → Tâches)
- CRUD complet pour tous les éléments
- Système de rangs (F à A) avec XP
- UI/UX améliorée (auto-disparition 2s, long-press edit, localStorage)
- Background dynamique avec cycle jour/nuit
- Personnage animé (Kingdom Two Crowns style)

### ✅ Phase 2 : Complète
**Phase 2.1** - Menu burger + Logbook
- Menu burger (☰) avec dropdown : Logbook + Sign out
- Modal Logbook avec design parchemin pixel art
- Traduction complète EN

**Phase 2.2** - Historique des tâches
- Table `task_history` dans Supabase
- Enregistrement automatique des tâches complétées
- Affichage : Date → Heure → Tâche → Contexte (Quest/Chapter) → XP

**Phase 2.3** - Main Quest ⭐
- Colonne `is_main_quest` dans table `quests`
- Checkbox "Main Quest" dans QuestModal
- Étoile dorée (⭐) affichée
- Effet visuel : glow doré + animation pulse douce
- Tri automatique : main quests en haut

---

## 🐛 Problèmes Majeurs Résolus

### 1. Double fichier Dashboard.jsx (CRITIQUE !)
**Symptôme** : Modifications non prises en compte, cache impossible à vider
**Cause** : Deux fichiers Dashboard.jsx existaient
- `./src/components/Dashboard.jsx` (modifié)
- `./src/pages/Dashboard.jsx` (utilisé par Vite)
**Solution** : Supprimer le doublon dans components, ne garder que pages/

### 2. Fonction completeTask ne s'exécutait jamais
**Cause** : Closure React avec state `tasks` obsolète
**Solution** : Fetch task depuis Supabase au lieu d'utiliser `tasks.find()`
```javascript
const { data: task } = await supabase.from('tasks').select('*').eq('id', taskId).single()
```

### 3. Cache Vite/Vercel tenace
**Solution** : 
- `minify: false` dans vite.config.js
- `useCallback` pour les fonctions

---

## 📂 Structure Fichiers Importants

```
le-sentier/
├── src/
│   ├── pages/
│   │   └── Dashboard.jsx          ← LE BON fichier (pas components/)
│   ├── components/
│   │   ├── HeroSection.jsx        ← Menu burger + héros
│   │   ├── LogbookModal.jsx       ← Modal historique
│   │   ├── QuestSection.jsx       ← Affichage quêtes (.main-quest)
│   │   ├── TaskSection.jsx
│   │   ├── QuestModal.jsx         ← Checkbox "Main Quest"
│   │   ├── ChapterModal.jsx
│   │   └── TaskModal.jsx
│   ├── styles/
│   │   ├── sections.css           ← Contient CSS main-quest
│   │   ├── logbook.css
│   │   └── hero-section.css
│   └── lib/
│       ├── supabase.js
│       └── constants.js
├── vite.config.js                 ← minify: false
└── package.json                   ← v1.0.1
```

---

## 🗄️ Base de Données Supabase

### Tables
- `characters` : Personnages (xp, level, start_date)
- `quests` : Quêtes (name, rank, xp_reward, **is_main_quest**, status)
- `chapters` : Chapitres (quest_id, name, description, status)
- `tasks` : Tâches (character_id, quest_id, chapter_id, name, xp, status, completed_at)
- `task_history` : Historique (character_id, task_name, task_xp, quest_name, chapter_name, completed_at)

### Migrations SQL exécutées
1. `migration_task_history.sql` : Création table task_history
2. `migration_main_quest.sql` : Ajout colonne is_main_quest

---

## 🎨 Design & UI

### Palette
- Or : `#ffd700` (main quest, étoiles)
- Parchemin : `#f4e4c1` → `#e8d4a8`
- Pixel art : Police "Press Start 2P", "VT323"

### Animations
- Main quest pulse : 3s ease-in-out infinite
- Tâche complétée : disparition 2s avec fade
- Coeur XP : particule qui monte (HeartParticle)

---

## 🚀 Prochaines Étapes (Phase 3)

### Phase 3.1 : Animations de complétion
- Particules de célébration
- Sons (optionnel)
- Effets visuels satisfaisants

### Phase 3.2 : Cycle jour/nuit amélioré
- Transitions douces
- Couleurs adaptées à l'heure
- Étoiles/lune la nuit

### Phase 3.3 : Stats & Progression
- Dashboard de statistiques
- Graphiques XP over time
- Streaks

---

## ⚠️ Points d'Attention

1. **TOUJOURS modifier `src/pages/Dashboard.jsx`** (PAS components/)
2. Vérifier qu'il n'y a qu'un seul Dashboard.jsx : `find . -name "Dashboard.jsx"`
3. Cache Vercel : Purge CDN Cache si besoin
4. Logs : Pas d'emojis dans le code (problèmes encodage UTF-8)
5. useCallback pour fonctions passées en props (évite closures obsolètes)

---

## 🔧 Commandes Utiles

```bash
# Vérifier doublons
find . -name "Dashboard.jsx" -type f

# Clean rebuild
rm -rf node_modules/.vite dist
npm run build

# Dev local
npm run dev

# Preview production locale
npm run preview

# Deploy Vercel
git add -A
git commit -m "message"
git push origin main
```

---

## 📞 Support

- Repo GitHub : https://github.com/AldoWallas/le-sentier
- App en ligne : https://le-sentier.vercel.app
- Supabase : Projet QuestV1.0 (West EU Ireland)

---

**Dernière mise à jour** : 10 février 2026, 17:00
**Prochaine session** : Phase 3 - Animations & Polish
