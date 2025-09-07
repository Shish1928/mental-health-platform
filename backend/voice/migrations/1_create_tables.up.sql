CREATE TABLE voice_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  language VARCHAR(10) DEFAULT 'en',
  is_anonymous BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE voice_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES voice_sessions(id) ON DELETE CASCADE,
  audio_transcript TEXT NOT NULL,
  ai_response TEXT NOT NULL,
  sentiment_score DOUBLE PRECISION,
  risk_level VARCHAR(10) DEFAULT 'low' CHECK (risk_level IN ('low', 'medium', 'high')),
  processing_time_ms INTEGER,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_voice_sessions_user_id ON voice_sessions(user_id);
CREATE INDEX idx_voice_interactions_session_id ON voice_interactions(session_id);
CREATE INDEX idx_voice_interactions_timestamp ON voice_interactions(timestamp);
