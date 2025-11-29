
# FastAPI Backend for OxyHeal Dashboard

Backend API using FastAPI + Supabase for authentication and data storage.

## Quick Start

### 1. Set up Supabase

1. Create a free account at [supabase.com](https://supabase.com)
2. Create a new project
3. Go to Project Settings → API to get your credentials:
   - `SUPABASE_URL` (Project URL)
   - `SUPABASE_KEY` (anon/public key)

### 2. Create Database Tables

Run these SQL commands in Supabase SQL Editor:

```sql
-- Create users table
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  hashed_password TEXT NOT NULL,
  name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create log_entries table
CREATE TABLE log_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  type TEXT,
  metrics JSONB,
  notes TEXT
);

-- Create index for faster queries
CREATE INDEX idx_log_entries_user_id ON log_entries(user_id);
CREATE INDEX idx_log_entries_timestamp ON log_entries(timestamp DESC);
```

### 3. Configure Environment

```bash
cp .env.template .env
# Edit .env and add your Supabase credentials
```

### 4. Install Dependencies

```bash
python -m venv .venv  # Or use existing venv from project root
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

### 5. Run Development Server

```bash
# From backend directory
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Or from project root:
```bash
cd /path/to/oxyheal-dashboard
source .venv/bin/activate
cd backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## API Endpoints

### Authentication
- `POST /auth/signup` - Create new user account
- `POST /auth/login` - Login and get JWT token
- `GET /users/me` - Get current user profile (requires auth)

### Logs
- `POST /logs` - Create new log entry (requires auth)
- `GET /logs` - Get all logs for current user (requires auth)

### Files
- `POST /upload` - Upload file (requires auth)

### Health Check
- `GET /` - API status check

## Production Deployment

### Heroku

1. Create `Procfile`:
```
web: gunicorn -k uvicorn.workers.UvicornWorker app.main:app --bind 0.0.0.0:$PORT
```

2. Deploy:
```bash
heroku create your-app-name
heroku config:set SUPABASE_URL=your-url
heroku config:set SUPABASE_KEY=your-key
heroku config:set JWT_SECRET=your-secret
git push heroku main
```

### Docker

```bash
docker build -t oxyheal-backend .
docker run -p 8000:8000 \
  -e SUPABASE_URL=your-url \
  -e SUPABASE_KEY=your-key \
  -e JWT_SECRET=your-secret \
  oxyheal-backend
```

## Environment Variables

- `SUPABASE_URL` - Your Supabase project URL (required)
- `SUPABASE_KEY` - Your Supabase anon key (required)
- `JWT_SECRET` - Secret key for JWT tokens (required)
- `ALGORITHM` - JWT algorithm (default: HS256)
- `ACCESS_TOKEN_EXPIRE_MINUTES` - Token expiry (default: 60)
- `UPLOAD_DIR` - Local upload directory (default: ./uploads)

## Notes

- File uploads currently save locally. For production, use Supabase Storage or S3.
- JWT tokens are used for authentication (stored in frontend localStorage)
- All user data is stored in Supabase PostgreSQL database
