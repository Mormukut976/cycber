# CyberScripts Pro - Setup Guide

## Fixed Issues

### Frontend Fixes
✅ Port mismatch resolved (standardized to port 5000)
✅ Missing form styles added for login/register modals
✅ Shopping cart functionality implemented
✅ Payment modal functions added
✅ Function scope issues resolved between main.js and auth.js
✅ Loading spinner and notifications working

### Backend Fixes
✅ Server configuration updated
✅ Environment variable validation made more lenient
✅ Port standardized to 5000

## Quick Start

### 1. Backend Setup

```bash
cd server
npm install
```

Create a `.env` file in the `server` directory:

```env
# Required
MONGODB_URI=mongodb://localhost:27017/cyberscripts
JWT_SECRET=your_jwt_secret_here_change_in_production

# Optional (for full features)
PORT=5000
NODE_ENV=development
STRIPE_SECRET_KEY=sk_test_your_key
SENDGRID_API_KEY=your_sendgrid_key
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
```

Start the server:
```bash
npm start
# or for development with auto-reload
npm run dev
```

### 2. Frontend Setup

```bash
cd client
# Open index.html in a browser or use a local server
python3 -m http.server 8080
# or
npx serve .
```

Access the application at:
- Frontend: http://localhost:8080
- Backend API: http://localhost:5000/api/v1

## Testing

1. **Test Backend Health**:
   ```bash
   curl http://localhost:5000/api/v1/health
   ```

2. **Test Registration**:
   - Open the frontend
   - Click "Sign Up"
   - Fill in the form and submit
   - Check for success notification

3. **Test Login**:
   - Click "Login"
   - Use registered credentials
   - Verify user menu appears

4. **Test Products**:
   - View products on homepage
   - Click "Add to Cart"
   - Open cart icon to view items

## Common Issues

### MongoDB Connection Error
- Ensure MongoDB is running: `mongod`
- Check MONGODB_URI in .env

### CORS Errors
- Backend CORS is configured to allow all origins
- Check that backend is running on port 5000

### Port Already in Use
- Change PORT in .env file
- Update API_BASE_URL in client/index.html

## Features Working

✅ User registration and login
✅ JWT authentication
✅ Product browsing
✅ Shopping cart
✅ Modal forms with validation
✅ Responsive design
✅ Loading states
✅ Notifications

## Next Steps

- Set up MongoDB database
- Configure environment variables
- Start backend server
- Open frontend in browser
- Test authentication and cart features
