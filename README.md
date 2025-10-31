# 🚀 CyberScripts Pro - Full Stack Platform

A professional cybersecurity scripts marketplace with MongoDB Atlas integration.

## ✅ Setup Status

- ✅ MongoDB Atlas configured
- ✅ Backend (Node.js/Express) ready
- ✅ Frontend (HTML/CSS/JS) ready
- ✅ Git repository initialized
- ✅ Ready for deployment!

## 📦 What's Included

### Backend (`/server`)
- RESTful API with Express.js
- MongoDB Atlas integration
- JWT authentication
- Admin panel APIs
- Payment integration ready
- File upload support

### Frontend (`/client`)
- Modern responsive UI
- Admin dashboard
- Shopping cart
- Payment integration
- Product management

## 🚀 Quick Deployment (3 Steps)

### Step 1: Push to GitHub

```bash
# Create a new repository on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git branch -M main
git push -u origin main
```

### Step 2: Deploy Backend to Railway

1. Go to https://railway.app/
2. Sign in with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your repository
5. Choose `/server` folder
6. Add these environment variables:
   ```
   NODE_ENV=production
   MONGODB_URI=your_mongodb_atlas_connection_string
   JWT_SECRET=your_secure_jwt_secret_key_here
   ```
7. Deploy and copy your Railway URL (e.g., `https://your-app.railway.app`)

### Step 3: Deploy Frontend to Netlify

1. Go to https://app.netlify.com/
2. Sign in with GitHub
3. Click "Add new site" → "Import an existing project"
4. Select your GitHub repository
5. Configure:
   - Base directory: `client`
   - Build command: `npm run build`
   - Publish directory: `client`
6. Deploy!

### Step 4: Connect Frontend to Backend

After deployment, update the API URL in your frontend:

1. Edit `/client/main.js` line 2:
   ```javascript
   const API_BASE = 'https://your-railway-app.railway.app/api/v1';
   ```
2. Commit and push:
   ```bash
   git add client/main.js
   git commit -m "Update API URL"
   git push
   ```
3. Netlify will auto-deploy the update!

## 📚 Documentation

- [Full Deployment Guide](./DEPLOYMENT_GUIDE.md)
- [API Documentation](./docs/API.md)
- [Admin Guide](./guide/ADMIN_CREDENTIALS.md)
- [Payment Setup](./guide/PAYMENT_SYSTEM_GUIDE.md)

## 🔐 Admin Access

See `/guide/ADMIN_CREDENTIALS.md` for admin login details.

## 🐛 Troubleshooting

### Backend not responding?
- Check Railway logs for errors
- Verify MongoDB connection string
- Ensure all environment variables are set

### Frontend can't connect to API?
- Check API URL in `main.js`
- Verify Railway backend is running
- Check browser console for CORS errors

### CORS errors?
- Add your Netlify URL to CORS whitelist in `server/server.js`

## 📞 Support

Need help? Check:
1. [Deployment Guide](./DEPLOYMENT_GUIDE.md) for detailed steps
2. Railway logs for backend issues
3. Browser console for frontend issues

---

**Ready to deploy!** 🎉 Follow the 3 steps above to get your site live.
