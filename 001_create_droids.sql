CREATE TABLE IF NOT EXISTS droids (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  manufacturer TEXT,
  year_production INT,
  status TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
