# CyberScripts Pro - Deployment Guide

Your website has MongoDB Atlas already configured. Here's how to deploy both parts:

---

## 🚀 BACKEND DEPLOYMENT (Railway - Recommended)

### Option 1: Deploy via Railway Website (Easiest)

1. **Go to Railway**: https://railway.app/
2. **Sign in** with GitHub
3. **Click "New Project"** → **"Deploy from GitHub repo"**
4. **Select your repository** (you'll need to push your code to GitHub first if you haven't)
5. **Railway will auto-detect** your `railway.json` and `package.json`
6. **Add Environment Variables** in Railway Dashboard:
   ```
   NODE_ENV=production
   PORT=5001
   MONGODB_URI=your_mongodb_atlas_connection_string
   JWT_SECRET=your_secure_jwt_secret_key_here
   CLIENT_URL=https://your-frontend-url.netlify.app
   ```
   
   **Note:** Get your MongoDB URI from MongoDB Atlas dashboard and generate a strong JWT secret.
7. **Deploy!** - Railway will give you a URL like `https://your-app.railway.app`

### Option 2: Alternative - Render.com

1. Go to https://render.com/
2. Sign up/Login
3. Click "New +" → "Web Service"
4. Connect your GitHub repo (server folder)
5. Configure:
   - **Build Command**: `npm install`
   - **Start Command**: `npm run prod`
   - **Environment Variables**: Add the same as above
6. Deploy!

---

## 🌐 FRONTEND DEPLOYMENT (Netlify)

### Option 1: Deploy via Netlify Website (Easiest)

1. **Go to Netlify**: https://app.netlify.com/
2. **Sign in** with GitHub
3. **Drag & Drop** your `/client` folder to Netlify (or connect GitHub repo)
4. **Build Settings**:
   - Base directory: `client` (if deploying from root)
   - Build command: `npm run build`
   - Publish directory: `.` (current directory)
5. **Add Environment Variable** in Netlify:
   ```
   REACT_APP_API_URL=https://your-backend-url.railway.app/api/v1
   ```
6. **Deploy!** - Netlify gives you a URL like `https://cyberscripts-pro.netlify.app`

### Option 2: Netlify CLI Deployment

Run these commands in the `/client` folder:

```bash
# Login to Netlify
netlify login

# Initialize and deploy
netlify init

# Follow the prompts:
# - Create & configure a new site
# - Choose your team
# - Site name: cyberscripts-pro
# - Build command: npm run build
# - Publish directory: .

# Deploy to production
netlify deploy --prod
```

---

## 🔗 AFTER DEPLOYMENT - IMPORTANT!

### 1. Update Frontend API URL

Edit `/client/main.js` line 2 to use your Railway backend URL:

```javascript
const API_BASE = 'https://your-app.railway.app/api/v1';
```

Then redeploy the frontend.

### 2. Update Backend CORS (CRITICAL!)

After deploying your frontend, you MUST add the Netlify URL to backend environment variables:

**In Railway/Render Dashboard:**
- Add/Update: `CLIENT_URL=https://your-actual-site.netlify.app`
- The backend will automatically whitelist this URL for CORS
- Redeploy if needed (Railway auto-deploys on env var change)

### 3. Update Environment Variables

**Railway (Backend):**
- Update `CLIENT_URL` to your Netlify URL
- Make sure `NODE_ENV=production`

**Netlify (Frontend):**
- Update `REACT_APP_API_URL` to your Railway URL

---

## 📋 PRE-DEPLOYMENT CHECKLIST

- ✅ MongoDB Atlas is set up and accessible
- ✅ `.env` file configured (for local testing)
- ✅ `.gitignore` created to exclude sensitive files
- ✅ `package.json` has all dependencies
- ⚠️ Push code to GitHub (needed for Railway/Netlify GitHub integration)

---

## 🐛 TROUBLESHOOTING

### Backend Issues:
- **500 Error**: Check Railway logs for MongoDB connection issues
- **CORS Error**: Update CORS settings in `server.js` to include your Netlify URL
- **Environment Variables**: Verify all env vars are set in Railway dashboard

### Frontend Issues:
- **API Not Working**: Check if API_BASE URL in `main.js` is correct
- **404 on Refresh**: Netlify redirects should handle this (check `netlify.toml`)
- **Assets Not Loading**: Check publish directory is set correctly

---

## 🎯 QUICK START (If you have GitHub repo)

1. Push code to GitHub
2. Deploy backend on Railway (connect GitHub repo)
3. Copy Railway URL
4. Update `main.js` with Railway URL
5. Deploy frontend on Netlify (connect GitHub repo)
6. Done! 🎉

---

## 💡 ALTERNATIVE: All-in-One Platform

You can also use **Vercel** for both frontend and backend:
- Frontend: Automatic static deployment
- Backend: Vercel Serverless Functions

Need help with any specific step? Let me know!
