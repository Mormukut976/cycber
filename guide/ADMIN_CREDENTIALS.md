# 🔐 Admin Credentials - Updated

## ✅ New Admin Login Details

```
📧 Email:    ram@admin.com
🔑 Password: Ramram8890@
👤 Name:     Ram
👥 Role:     admin
```

---

## 🎯 How to Login

### Method 1: Direct Login
1. Go to: http://localhost:8080
2. Click **"Login"** button
3. Enter:
   - Email: `ram@admin.com`
   - Password: `Ramram8890@`
4. Click **"Login"**
5. Admin Panel link will appear in navigation

### Method 2: Auto-Login Helper
1. Go to: http://localhost:8080/test-admin.html
2. Click **"Login as Admin & Go to Panel"**
3. Automatically logs in and redirects

---

## 🔧 Admin Panel Access

After logging in with admin credentials:

### Navigation Links:
- **Main Nav**: "Admin Panel" link (top right)
- **User Dropdown**: Click your name → "Admin Panel"
- **Hero Section**: Green "Go to Admin Panel" button

### Direct URL:
```
http://localhost:8080/admin.html
```
(Must be logged in as admin first)

---

## 📋 Admin Capabilities

### User Management
- View all registered users
- Change user roles (User/Moderator/Admin)
- Activate/Deactivate accounts
- Delete users

### Content Upload
- Upload Scripts (.py, .sh, .js, .zip)
- Upload Courses (with thumbnails)
- Create Blog Posts (with images)

### Dashboard
- View statistics
- Monitor orders
- Track revenue

---

## 🔄 Old Credentials (Removed)

The following admin account has been **deleted**:
```
❌ admin@cyberscripts.com / Admin@123456 (NO LONGER WORKS)
```

Only the new credentials work now:
```
✅ ram@admin.com / Ramram8890@
```

---

## 🔒 Security Notes

### Password Requirements Met:
- ✅ Minimum 8 characters
- ✅ Contains uppercase letter (R)
- ✅ Contains lowercase letters
- ✅ Contains numbers (8890)
- ✅ Contains special character (@)

### Account Protection:
- ✅ Admin account cannot be deleted from UI
- ✅ Admin role cannot be changed to non-admin
- ✅ Email verified by default
- ✅ Account active by default

---

## 🧪 Test It Now

### Quick Test:
1. **Visit**: http://localhost:8080
2. **Click**: "Login"
3. **Enter**:
   ```
   Email: ram@admin.com
   Password: Ramram8890@
   ```
4. **Result**: You should see:
   - Welcome message with "Ram"
   - "Admin Panel" link in navigation
   - User menu with admin options

### Verify Admin Access:
1. After login, click **"Admin Panel"**
2. Should see:
   - Dashboard with statistics
   - Sidebar with admin menu
   - User management section
   - Upload forms for scripts/courses/blogs

---

## 📝 Files Updated

1. ✅ `server/updateAdmin.js` - Admin update script
2. ✅ `client/test-admin.html` - Helper page credentials
3. ✅ Database - Admin user record updated

---

## 🔄 To Change Credentials Again

If you need to change credentials in the future:

```bash
cd server
node updateAdmin.js
```

Edit the file first to change:
- `name: 'Ram'` → Your preferred name
- `email: 'ram@admin.com'` → Your preferred email
- `password: 'Ramram8890@'` → Your new password

Then run the script to update the database.

---

## ✅ Summary

**Current Admin Login:**
```
Email:    ram@admin.com
Password: Ramram8890@
```

**Access Admin Panel:**
1. Login at http://localhost:8080
2. Click "Admin Panel" link
3. Or visit http://localhost:8080/admin.html

**Everything is ready to use!** 🚀
