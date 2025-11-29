# 🚀 Deployment Guide - OxyHeal

This guide covers deploying OxyHeal to various platforms.

## 📋 Table of Contents

- [Heroku Deployment](#heroku-deployment)
- [Vercel (Frontend)](#vercel-frontend)
- [Railway](#railway)
- [Environment Variables](#environment-variables)

---

## 🟣 Heroku Deployment

### Prerequisites

1. [Heroku CLI](https://devcenter.heroku.com/articles/heroku-cli) installed
2. Heroku account created
3. Git repository initialized

### Option 1: Deploy Backend API to Heroku

#### Step 1: Login to Heroku

```bash
heroku login
```

#### Step 2: Create a New Heroku App

```bash
# Create app (choose a unique name)
heroku create oxyheal-api

# Or auto-generate name
heroku create
```

#### Step 3: Add Python Buildpack

```bash
heroku buildpacks:set heroku/python -a oxyheal-api
```

#### Step 4: Set Environment Variables

```bash
# Set all required environment variables
heroku config:set SUPABASE_URL="https://your-project.supabase.co" -a oxyheal-api
heroku config:set SUPABASE_SERVICE_ROLE_KEY="your_service_role_key" -a oxyheal-api
heroku config:set JWT_SECRET="your_very_long_secret_key_here" -a oxyheal-api
heroku config:set ALGORITHM="HS256" -a oxyheal-api
heroku config:set ACCESS_TOKEN_EXPIRE_MINUTES="60" -a oxyheal-api
heroku config:set UPLOAD_DIR="/tmp/uploads" -a oxyheal-api
```

#### Step 5: Deploy

```bash
# Push to Heroku
git push heroku main

# Or if you're on a different branch
git push heroku your-branch:main
```

#### Step 6: Verify Deployment

```bash
# Open app in browser
heroku open -a oxyheal-api

# Check logs
heroku logs --tail -a oxyheal-api

# Check API
curl https://oxyheal-api.herokuapp.com/
```

Your backend API will be available at: `https://oxyheal-api.herokuapp.com`

#### Step 7: Enable Dyno

```bash
# Scale up the web dyno
heroku ps:scale web=1 -a oxyheal-api

# Check dyno status
heroku ps -a oxyheal-api
```

### Option 2: Deploy Using Docker (Heroku Container Registry)

```bash
# Login to Heroku Container Registry
heroku container:login

# Create app
heroku create oxyheal-api

# Set environment variables
heroku config:set SUPABASE_URL="your_url" -a oxyheal-api
heroku config:set SUPABASE_SERVICE_ROLE_KEY="your_key" -a oxyheal-api
heroku config:set JWT_SECRET="your_secret" -a oxyheal-api

# Build and push Docker image
heroku container:push web -a oxyheal-api --context-path ./backend

# Release the image
heroku container:release web -a oxyheal-api

# Open app
heroku open -a oxyheal-api
```

---

## 🔷 Vercel (Frontend)

Vercel is perfect for deploying the React frontend.

### Step 1: Install Vercel CLI

```bash
npm i -g vercel
```

### Step 2: Login to Vercel

```bash
vercel login
```

### Step 3: Deploy Frontend

```bash
# Run from project root
vercel

# Follow the prompts:
# - Set up and deploy? Yes
# - Which scope? Your account
# - Link to existing project? No
# - Project name? oxyheal-dashboard
# - Directory? ./
# - Override settings? No

# For production deployment
vercel --prod
```

### Step 4: Set Environment Variables in Vercel

Go to your Vercel dashboard:
1. Select your project
2. Go to Settings → Environment Variables
3. Add:
   - `VITE_SUPABASE_URL` = Your Supabase URL
   - `VITE_SUPABASE_ANON_KEY` = Your Supabase anon key
   - `VITE_API_URL` = Your Heroku backend URL (e.g., https://oxyheal-api.herokuapp.com)

### Step 5: Redeploy

```bash
vercel --prod
```

Your frontend will be available at: `https://oxyheal-dashboard.vercel.app`

---

## 🚂 Railway

Alternative to Heroku with better free tier.

### Backend Deployment on Railway

1. Go to [Railway.app](https://railway.app/)
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Choose your repository
5. Add environment variables:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `JWT_SECRET`
   - `ALGORITHM`
   - `ACCESS_TOKEN_EXPIRE_MINUTES`
6. Set root directory to `backend`
7. Set start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
8. Deploy!

---

## 🌐 Full Stack Deployment Architecture

```
┌─────────────────────────────────────────────┐
│                                             │
│         Users / Browsers                    │
│                                             │
└──────────────┬──────────────────────────────┘
               │
               │ HTTPS
               │
┌──────────────▼──────────────────────────────┐
│                                             │
│    Frontend (Vercel / Netlify)             │
│    - React + TypeScript + Vite             │
│    - Static assets                         │
│                                             │
└──────────────┬──────────────────────────────┘
               │
               │ API Calls
               │
┌──────────────▼──────────────────────────────┐
│                                             │
│    Backend API (Heroku / Railway)          │
│    - FastAPI + Python                      │
│    - JWT Authentication                    │
│    - Business Logic                        │
│                                             │
└──────────────┬──────────────────────────────┘
               │
               │ Database Queries
               │
┌──────────────▼──────────────────────────────┐
│                                             │
│    Database (Supabase PostgreSQL)          │
│    - User data                             │
│    - Health records                        │
│    - Assessments                           │
│                                             │
└─────────────────────────────────────────────┘
```

---

## 🔐 Environment Variables Reference

### Backend (Required)

```env
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
JWT_SECRET=your_very_long_random_secret_key_min_32_chars
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
UPLOAD_DIR=/tmp/uploads
```

### Frontend (Required)

```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_API_URL=https://your-backend-api.herokuapp.com
```

---

## 🧪 Testing Deployment

### Test Backend API

```bash
# Health check
curl https://oxyheal-api.herokuapp.com/

# Should return: {"status":"ok","message":"OxyHeal Backend API"}

# Test signup
curl -X POST https://oxyheal-api.herokuapp.com/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "testpass123",
    "name": "Test User"
  }'
```

### Test Frontend

1. Visit your Vercel URL
2. Try to sign up / login
3. Check browser console for errors
4. Verify API calls in Network tab

---

## 📊 Monitoring & Logs

### Heroku Logs

```bash
# View recent logs
heroku logs -n 200 -a oxyheal-api

# Tail logs in real-time
heroku logs --tail -a oxyheal-api

# Filter by source
heroku logs --source app -a oxyheal-api
```

### Vercel Logs

- Go to Vercel Dashboard
- Select your project
- Click on "Deployments"
- Click on any deployment to see logs

---

## 🔄 CI/CD Setup

### Automatic Deployment on Push

Both Vercel and Heroku support automatic deployments:

**Vercel:**
- Automatically deploys on every push to main branch
- Preview deployments for pull requests

**Heroku:**
1. Go to Heroku Dashboard
2. Select your app
3. Go to "Deploy" tab
4. Enable "Automatic deploys" from GitHub

---

## 💰 Cost Estimates

### Free Tier

- **Heroku**: Free dyno (sleeps after 30 min inactivity)
- **Vercel**: Free for personal projects
- **Supabase**: Free tier with 500MB database

### Paid Options

- **Heroku Hobby**: $7/month (no sleeping)
- **Vercel Pro**: $20/month (team features)
- **Supabase Pro**: $25/month (8GB database)

---

## 🐛 Troubleshooting

### Common Issues

**1. Application Error H10**
```bash
# Check if dyno is running
heroku ps -a oxyheal-api

# Scale up if needed
heroku ps:scale web=1 -a oxyheal-api
```

**2. Module Not Found**
```bash
# Ensure requirements.txt is up to date
pip freeze > backend/requirements.txt
git add backend/requirements.txt
git commit -m "Update requirements"
git push heroku main
```

**3. CORS Errors**
- Check that `VITE_API_URL` matches your Heroku URL
- Verify CORS settings in `backend/app/main.py`

**4. Database Connection Issues**
- Verify `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`
- Check Supabase dashboard for connection issues

---

## 📚 Additional Resources

- [Heroku Python Guide](https://devcenter.heroku.com/articles/getting-started-with-python)
- [Vercel Documentation](https://vercel.com/docs)
- [Railway Documentation](https://docs.railway.app/)
- [Supabase Documentation](https://supabase.com/docs)

---

## ✅ Post-Deployment Checklist

- [ ] Backend API is accessible
- [ ] Frontend is deployed and accessible
- [ ] Database connection working
- [ ] Authentication working (signup/login)
- [ ] All features functional
- [ ] Environment variables set correctly
- [ ] SSL/HTTPS enabled
- [ ] Logs are accessible
- [ ] Monitoring setup (optional)
- [ ] Custom domain configured (optional)

---

**Need Help?** Open an issue on GitHub or contact support.
