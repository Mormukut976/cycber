# 🔧 MongoDB Atlas Setup Instructions

## Your Connection String:
```
mongodb+srv://Admin:<db_password>@cluster0.cmpq5xp.mongodb.net/cyberscripts?retryWrites=true&w=majority&appName=Cluster0
```

## ⚠️ IMPORTANT: Replace `<db_password>` with your actual password!

---

## 📝 Step-by-Step Setup:

### 1. Get Your Database Password
- Go to MongoDB Atlas Dashboard
- Click "Database Access"
- Find user "Admin"
- If you forgot the password, click "Edit" → "Edit Password"
- Generate a new password or use your existing one
- **COPY THE PASSWORD** (you'll need it!)

### 2. Update the Connection String
Replace `<db_password>` with your actual password.

**Example:**
If your password is: `MySecurePass123!`

Your connection string becomes:
```
mongodb+srv://Admin:MySecurePass123!@cluster0.cmpq5xp.mongodb.net/cyberscripts?retryWrites=true&w=majority&appName=Cluster0
```

**⚠️ Special Characters**: If your password has special characters like `@`, `#`, `$`, etc., you need to URL encode them:
- `@` → `%40`
- `#` → `%23`
- `$` → `%24`
- `%` → `%25`
- `^` → `%5E`
- `&` → `%26`

### 3. Update Your .env File

Open: `server/.env`

Replace the MONGODB_URI line with your complete connection string:

```env
MONGODB_URI=mongodb+srv://Admin:YOUR_PASSWORD_HERE@cluster0.cmpq5xp.mongodb.net/cyberscripts?retryWrites=true&w=majority&appName=Cluster0
```

### 4. Test the Connection

```bash
cd server
node server.js
```

**You should see:**
```
✅ MongoDB Connected
```

---

## 🧪 Quick Test:

1. **Update .env** with your password
2. **Restart server**:
   ```bash
   cd server
   node server.js
   ```
3. **Check for**: `✅ MongoDB Connected`

---

## ❌ Troubleshooting

### Error: "Authentication failed"
- ✅ Check password is correct
- ✅ Check for special characters (URL encode them)
- ✅ Check username is exactly "Admin"

### Error: "Network timeout"
- ✅ Check MongoDB Atlas → Network Access
- ✅ Add IP: `0.0.0.0/0` (allow from anywhere)

### Error: "Database not found"
- ✅ Database "cyberscripts" will be created automatically
- ✅ No action needed

---

## 📋 Complete .env File Template

```env
# Environment
NODE_ENV=development

# Server Port
PORT=5001

# MongoDB Atlas Connection (UPDATE WITH YOUR PASSWORD!)
MONGODB_URI=mongodb+srv://Admin:YOUR_PASSWORD_HERE@cluster0.cmpq5xp.mongodb.net/cyberscripts?retryWrites=true&w=majority&appName=Cluster0

# JWT Secret
JWT_SECRET=cyberscripts_pro_secret_jwt_key_change_in_production
```

---

## ✅ Final Checklist:

- [ ] Got password from MongoDB Atlas
- [ ] Replaced `<db_password>` with actual password
- [ ] URL encoded special characters (if any)
- [ ] Updated `server/.env` file
- [ ] Saved the file
- [ ] Restarted server
- [ ] Saw "✅ MongoDB Connected"

---

## 🎉 Once Connected:

Your data will be stored in MongoDB Atlas (cloud) instead of local MongoDB!

**Advantages:**
- ✅ Accessible from anywhere
- ✅ Automatic backups
- ✅ Free 512MB storage
- ✅ Ready for production
- ✅ No local MongoDB needed

---

## 🚀 Next Steps:

After MongoDB is connected:
1. Create admin user: `node updateAdmin.js`
2. Test the website locally
3. Deploy to Railway/Netlify
4. Go live!

---

## 💡 Pro Tip:

Never commit `.env` file to Git!
It's already in `.gitignore` for security.

**Your connection string is ready! Just replace the password and restart the server!** 🎊
