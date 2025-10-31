# ⚡ Quick 15-Minute Deployment Guide

## 🎯 Deploy CyberScripts Pro in 15 Minutes!

### Step 1: MongoDB Atlas (5 min)

1. Go to https://www.mongodb.com/cloud/atlas
2. Sign up → Create FREE cluster
3. Create database user → Save password
4. Network Access → Add `0.0.0.0/0`
5. Connect → Get connection string
6. Replace `<password>` with your password

**Save this**: `mongodb+srv://user:pass@cluster.mongodb.net/cyberscripts`

---

### Step 2: Deploy Backend to Railway (5 min)

1. Go to https://railway.app
2. Sign up with GitHub
3. "New Project" → "Empty Project"
4. "Deploy from GitHub repo" → Select `server` folder
5. Add Variables:
   - `MONGODB_URI`: (paste from Step 1)
   - `JWT_SECRET`: `cyber_scripts_pro_secret_key_12345678`
   - `PORT`: `5001`
6. Deploy → Copy URL: `https://xxxxxx.railway.app`

---

### Step 3: Update Frontend URLs (2 min)

Replace `http://localhost:5001` with your Railway URL in these files:

1. `client/index.html` (line 562)
2. `client/main.js` (line 2)
3. `client/js/auth.js` (line 2)
4. `client/admin.html` (line 569)
5. `client/payment.html` (line 329)

Example:
```javascript
const API_BASE_URL = 'https://your-app.railway.app/api/v1';
```

---

### Step 4: Deploy Frontend to Netlify (3 min)

1. Go to https://www.netlify.com
2. Sign up with email
3. "Add new site" → "Deploy manually"
4. Drag and drop `client` folder
5. Done! → Copy URL: `https://xxxxx.netlify.app`

---

### Step 5: Create Admin on Production (1 min)

1. Go to Railway dashboard → Your project
2. Click "Shell" or "Console"
3. Run:
   ```bash
   node updateAdmin.js
   ```

---

## ✅ Done! Your URLs:

**Website**: https://your-site.netlify.app  
**Admin**: https://your-site.netlify.app/admin.html  
**Login**: ram@admin.com / Ramram8890@

---

## 🧪 Test Your Deployment

1. Visit your Netlify URL
2. Click "Sign Up" → Register
3. Add product to cart
4. Test checkout
5. Login as admin
6. Upload content

---

## 🎉 You're Live!

**Total Time**: ~15 minutes  
**Total Cost**: $0 (Free tier)  
**Features**: Fully functional e-commerce platform!

Need help? Check DEPLOYMENT_GUIDE.md for detailed instructions.
