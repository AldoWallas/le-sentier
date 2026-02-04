-- =============================================
-- LE SENTIER - Database Schema
-- À exécuter dans Supabase SQL Editor
-- =============================================

-- Table: characters (personnages/parties)
CREATE TABLE characters (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name VARCHAR(50) NOT NULL,
  class VARCHAR(20) NOT NULL CHECK (class IN ('chevalier', 'mage', 'ranger', 'barde')),
  level INTEGER DEFAULT 1,
  xp INTEGER DEFAULT 0,
  start_date DATE DEFAULT CURRENT_DATE,
  target_date DATE,
  is_active BOOLEAN DEFAULT true,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'victory', 'abandoned')),
  stats JSONB DEFAULT '{"streak_current": 0, "streak_max": 0, "tasks_completed": 0, "epics_completed": 0}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: epics (épopées)
CREATE TABLE epics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  character_id UUID REFERENCES characters(id) ON DELETE CASCADE NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  creature VARCHAR(20) NOT NULL CHECK (creature IN ('rat', 'wolf', 'boar', 'griffon', 'dragon', 'lich')),
  xp_reward INTEGER NOT NULL,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'abandoned')),
  due_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Table: tasks (tâches)
CREATE TABLE tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  character_id UUID REFERENCES characters(id) ON DELETE CASCADE NOT NULL,
  epic_id UUID REFERENCES epics(id) ON DELETE SET NULL,
  name VARCHAR(200) NOT NULL,
  xp INTEGER DEFAULT 10,
  is_ritual BOOLEAN DEFAULT false,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'deleted')),
  due_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  position INTEGER DEFAULT 0
);

-- Table: daily_logs (logs quotidiens pour stats)
CREATE TABLE daily_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  character_id UUID REFERENCES characters(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  tasks_planned INTEGER DEFAULT 0,
  tasks_completed INTEGER DEFAULT 0,
  xp_earned INTEGER DEFAULT 0,
  streak_day INTEGER DEFAULT 0,
  UNIQUE(character_id, date)
);

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

ALTER TABLE characters ENABLE ROW LEVEL SECURITY;
ALTER TABLE epics ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_logs ENABLE ROW LEVEL SECURITY;

-- Policies pour characters
CREATE POLICY "Users can view own characters" ON characters FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own characters" ON characters FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own characters" ON characters FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own characters" ON characters FOR DELETE USING (auth.uid() = user_id);

-- Policies pour epics
CREATE POLICY "Users can view own epics" ON epics FOR SELECT USING (character_id IN (SELECT id FROM characters WHERE user_id = auth.uid()));
CREATE POLICY "Users can insert own epics" ON epics FOR INSERT WITH CHECK (character_id IN (SELECT id FROM characters WHERE user_id = auth.uid()));
CREATE POLICY "Users can update own epics" ON epics FOR UPDATE USING (character_id IN (SELECT id FROM characters WHERE user_id = auth.uid()));
CREATE POLICY "Users can delete own epics" ON epics FOR DELETE USING (character_id IN (SELECT id FROM characters WHERE user_id = auth.uid()));

-- Policies pour tasks
CREATE POLICY "Users can view own tasks" ON tasks FOR SELECT USING (character_id IN (SELECT id FROM characters WHERE user_id = auth.uid()));
CREATE POLICY "Users can insert own tasks" ON tasks FOR INSERT WITH CHECK (character_id IN (SELECT id FROM characters WHERE user_id = auth.uid()));
CREATE POLICY "Users can update own tasks" ON tasks FOR UPDATE USING (character_id IN (SELECT id FROM characters WHERE user_id = auth.uid()));
CREATE POLICY "Users can delete own tasks" ON tasks FOR DELETE USING (character_id IN (SELECT id FROM characters WHERE user_id = auth.uid()));

-- Policies pour daily_logs
CREATE POLICY "Users can view own daily_logs" ON daily_logs FOR SELECT USING (character_id IN (SELECT id FROM characters WHERE user_id = auth.uid()));
CREATE POLICY "Users can insert own daily_logs" ON daily_logs FOR INSERT WITH CHECK (character_id IN (SELECT id FROM characters WHERE user_id = auth.uid()));
CREATE POLICY "Users can update own daily_logs" ON daily_logs FOR UPDATE USING (character_id IN (SELECT id FROM characters WHERE user_id = auth.uid()));

-- =============================================
-- INDEXES
-- =============================================

CREATE INDEX idx_characters_user_id ON characters(user_id);
CREATE INDEX idx_characters_is_active ON characters(is_active);
CREATE INDEX idx_epics_character_id ON epics(character_id);
CREATE INDEX idx_tasks_character_id ON tasks(character_id);
CREATE INDEX idx_tasks_epic_id ON tasks(epic_id);
CREATE INDEX idx_daily_logs_character_id ON daily_logs(character_id);
