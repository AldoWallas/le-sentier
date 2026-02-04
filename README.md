# Le Sentier 🗡️

App de productivité gamifiée RPG pixel art.

## Setup

### 1. Créer les tables dans Supabase

1. Va dans ton projet Supabase
2. Clique sur **SQL Editor** (icône dans le menu de gauche)
3. Copie-colle le contenu de `supabase-schema.sql`
4. Clique sur **Run**

### 2. Configurer les variables d'environnement

Crée un fichier `.env` à la racine avec :

```
VITE_SUPABASE_URL=https://ton-projet.supabase.co
VITE_SUPABASE_ANON_KEY=ta-clé-anon
```

### 3. Installer et lancer

```bash
npm install
npm run dev
```

## Déploiement sur Vercel

1. Push le code sur GitHub
2. Va sur vercel.com
3. Importe le repo
4. Ajoute les variables d'environnement dans Vercel
5. Deploy !

## Structure

```
src/
├── components/     # Composants réutilisables
├── contexts/       # Contextes React (auth)
├── lib/            # Config (Supabase client)
├── pages/          # Pages de l'app
└── styles/         # Fichiers CSS
```

## Tech Stack

- React + Vite
- Supabase (Auth + PostgreSQL)
- Vercel (Hosting)
