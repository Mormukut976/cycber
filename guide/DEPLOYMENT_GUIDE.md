# 🚀 CyberScripts Pro - Complete Deployment Guide

## 📋 Pre-Deployment Checklist

Before deploying, ensure:
- ✅ All features tested locally
- ✅ Admin login works
- ✅ Payment system functional
- ✅ Content management working
- ✅ Database connected

---

## 🎯 Deployment Options

### Option 1: Full Stack Deployment (Recommended)
- **Backend**: Railway / Render / Heroku
- **Frontend**: Netlify / Vercel / GitHub Pages
- **Database**: MongoDB Atlas (Free tier available)

### Option 2: Single Server Deployment
- **Platform**: DigitalOcean / AWS / Linode
- **Setup**: Node.js + Nginx reverse proxy
- **Database**: MongoDB on same server or MongoDB Atlas

---

## 📦 Step-by-Step Deployment

### PART 1: Setup MongoDB Atlas (Database)

1. **Create Account**
   - Go to: https://www.mongodb.com/cloud/atlas
   - Sign up for free account

2. **Create Cluster**
   - Click "Build a Database"
   - Choose FREE tier (M0)
   - Select region closest to you
   - Name: `cyberscripts-pro`

3. **Create Database User**
   - Username: `cyberscripts_admin`
   - Password: (Generate strong password - save it!)
   - Click "Create User"

4. **Whitelist IP Address**
   - Click "Network Access"
   - Add IP: `0.0.0.0/0` (Allow from anywhere)
   - Or add your server's specific IP

5. **Get Connection String**
   - Click "Connect"
   - Choose "Connect your application"
   - Copy connection string:
   ```
   mongodb+srv://cyberscripts_admin:<password>@cluster.xxxxx.mongodb.net/cyberscripts?retryWrites=true&w=majority
   ```
   - Replace `<password>` with your actual password

---

### PART 2: Deploy Backend (Railway - Easiest)

1. **Prepare Backend**
   ```bash
   cd server
   ```

2. **Create .env file** (if not exists):
   ```env
   NODE_ENV=production
   PORT=5001
   MONGODB_URI=your_mongodb_atlas_connection_string
   JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_random
   ```

3. **Create package.json scripts** (add if missing):
   ```json
   {
     "scripts": {
       "start": "node server.js",
       "dev": "nodemon server.js"
     }
   }
   ```

4. **Deploy to Railway**:
   - Go to: https://railway.app
   - Sign up with GitHub
   - Click "New Project" → "Deploy from GitHub repo"
   - Select your repository (or upload server folder)
   - Railway will auto-detect Node.js
   - Add environment variables:
     - `MONGODB_URI`: Your MongoDB Atlas connection string
     - `JWT_SECRET`: Random string (min 32 characters)
     - `PORT`: 5001
   - Click "Deploy"
   - Copy your backend URL: `https://your-app.railway.app`

---

### PART 3: Deploy Frontend (Netlify - Easiest)

1. **Update API URLs in Frontend**
   
   Edit `client/index.html`:
   ```html
   <script>
       window.API_BASE_URL = 'https://your-backend-url.railway.app/api/v1';
   </script>
   ```

   Edit `client/main.js` (line 2):
   ```javascript
   const API_BASE = 'https://your-backend-url.railway.app/api/v1';
   ```

   Edit `client/js/auth.js` (line 2):
   ```javascript
   const API_BASE = 'https://your-backend-url.railway.app/api/v1';
   ```

   Edit `client/admin.html` (line 569):
   ```javascript
   const API_BASE_URL = 'https://your-backend-url.railway.app/api/v1';
   ```

   Edit `client/payment.html` (line 329):
   ```javascript
   const API_BASE_URL = 'https://your-backend-url.railway.app/api/v1';
   ```

2. **Deploy to Netlify**:
   - Go to: https://www.netlify.com
   - Sign up with GitHub
   - Click "Add new site" → "Deploy manually"
   - Drag and drop the `client` folder
   - Your site will be live at: `https://random-name.netlify.app`
   - Optional: Change site name in settings

3. **Custom Domain** (Optional):
   - Go to Site settings → Domain management
   - Add your custom domain
   - Update DNS records as instructed

---

## 🔧 Alternative: Deploy to Vercel (Frontend)

1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Deploy**:
   ```bash
   cd client
   vercel
   ```

3. **Follow prompts**:
   - Login with GitHub/Email
   - Choose project name
   - Deploy!

---

## 🔧 Alternative: Deploy to Render (Backend)

1. **Go to**: https://render.com
2. **Sign up** with GitHub
3. **New Web Service**
4. **Connect** your repository
5. **Settings**:
   - Environment: Node
   - Build Command: `npm install`
   - Start Command: `node server.js`
   - Add environment variables
6. **Deploy**

---

## 🔐 Important: Update CORS Settings

In `server/server.js`, update CORS for production:

```javascript
app.use(cors({
  origin: [
    'https://your-frontend.netlify.app',
    'https://your-custom-domain.com'
  ],
  credentials: true
}));
```

---

## 📝 Post-Deployment Steps

### 1. Create Admin User on Production
```bash
# SSH into your server or use Railway/Render console
cd server
node updateAdmin.js
```

### 2. Test Everything
- ✅ Visit your frontend URL
- ✅ Register a test user
- ✅ Login works
- ✅ Add items to cart
- ✅ Test payment flow
- ✅ Login as admin
- ✅ Upload content
- ✅ Test edit/delete

### 3. Update Payment UPI Details
- Verify QR code displays correctly
- Test UPI payment flow
- Ensure transaction IDs are captured

### 4. SSL Certificate
- Both Netlify and Railway provide free SSL
- Your site will be `https://` automatically

---

## 🌐 Quick Deployment (Single Command)

If you want to deploy quickly:

### Backend (Railway):
```bash
cd server
npx railway-cli login
npx railway-cli init
npx railway-cli up
```

### Frontend (Netlify):
```bash
cd client
npx netlify-cli deploy --prod
```

---

## 📊 Environment Variables Summary

### Backend (.env):
```
NODE_ENV=production
PORT=5001
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/cyberscripts
JWT_SECRET=your_super_secret_random_string_min_32_chars
```

### Frontend (in HTML files):
```javascript
window.API_BASE_URL = 'https://your-backend.railway.app/api/v1';
```

---

## 🔍 Monitoring & Maintenance

### 1. Monitor Backend Logs
- Railway: Dashboard → Logs
- Render: Dashboard → Logs
- Set up alerts for errors

### 2. Database Backups
- MongoDB Atlas: Enable automatic backups
- Schedule: Daily recommended

### 3. Update Dependencies
```bash
npm audit fix
npm update
```

---

## 🚨 Troubleshooting

### Issue: CORS Error
**Solution**: Add your frontend domain to CORS whitelist in `server.js`

### Issue: Database Connection Failed
**Solution**: Check MongoDB Atlas IP whitelist and connection string

### Issue: 404 on API Calls
**Solution**: Verify API_BASE_URL in all frontend files

### Issue: Admin Can't Login
**Solution**: Run `node updateAdmin.js` on production server

---

## ✅ Deployment Checklist

- [ ] MongoDB Atlas cluster created
- [ ] Database user created
- [ ] Connection string copied
- [ ] Backend deployed to Railway/Render
- [ ] Backend URL copied
- [ ] Frontend updated with backend URL
- [ ] Frontend deployed to Netlify/Vercel
- [ ] CORS settings updated
- [ ] Admin user created on production
- [ ] All features tested on production
- [ ] Custom domain configured (optional)
- [ ] SSL certificate active
- [ ] Monitoring set up

---

## 🎉 Your URLs After Deployment

**Live Website**: `https://your-site.netlify.app`  
**Admin Panel**: `https://your-site.netlify.app/admin.html`  
**Backend API**: `https://your-backend.railway.app`  

---

## 💰 Cost Breakdown

### Free Tier (Good for starting):
- **MongoDB Atlas**: Free (512MB storage)
- **Railway**: Free ($5 credit/month)
- **Netlify**: Free (100GB bandwidth)
- **Total**: $0/month

### Paid Tier (For growth):
- **MongoDB Atlas**: $9/month (2GB)
- **Railway**: $5-20/month
- **Netlify**: $19/month (1TB bandwidth)
- **Total**: ~$33-48/month

---

## 🚀 Ready to Deploy?

Follow the steps above and your CyberScripts Pro platform will be live!

**Need help?** Check the troubleshooting section or review the logs.

**Good luck with your deployment!** 🎉
