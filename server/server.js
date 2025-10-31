import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from './models/User.js';
import Product from './models/Product.js';
import Blog from './models/Blog.js';
import Order from './models/Order.js';

// Try to import optional security packages
let mongoSanitize, xss, hpp, compression;

try {
  mongoSanitize = (await import('express-mongo-sanitize')).default;
} catch (e) {
  console.log('⚠️  express-mongo-sanitize not available');
}

try {
  xss = (await import('xss-clean')).default;
} catch (e) {
  console.log('⚠️  xss-clean not available');
}

try {
  hpp = (await import('hpp')).default;
} catch (e) {
  console.log('⚠️  hpp not available');
}

try {
  compression = (await import('compression')).default;
} catch (e) {
  console.log('⚠️  compression not available');
}

dotenv.config();

const app = express();

// Basic middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS Configuration - Restrict to specific domains in production
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:8080',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:8080',
  process.env.CLIENT_URL, // Frontend URL from env
  'https://cycber-1.onrender.com' // Current deployed backend
].filter(Boolean); // Remove undefined values

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    // In development, allow all origins
    if (process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }
    
    // In production, check against whitelist
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('⚠️  Blocked by CORS:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Optional security middleware
if (mongoSanitize) app.use(mongoSanitize());
if (xss) app.use(xss());
if (hpp) app.use(hpp());
if (compression) app.use(compression());

// Routes
app.get('/api/v1/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Server is running with enhanced security',
    timestamp: new Date().toISOString(),
    features: {
      mongoSanitize: !!mongoSanitize,
      xss: !!xss,
      hpp: !!hpp,
      compression: !!compression
    }
  });
});

// Auth routes
const JWT_SECRET = process.env.JWT_SECRET || 'dev_jwt_secret_change_me';

app.post('/api/v1/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    console.log('📝 Register attempt:', { name, email });
    
    if (!name || !email || !password) {
      return res.status(400).json({ status: 'fail', message: 'name, email, and password are required' });
    }
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ status: 'fail', message: 'User already exists' });
    }
    const user = new User({ name, email, password });
    await user.save();
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' });
    console.log('✅ User registered:', user.email);
    res.status(201).json({
      status: 'success',
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (err) {
    console.error('❌ Register error:', err);
    res.status(500).json({ status: 'error', message: err.message || 'Server error' });
  }
});

app.post('/api/v1/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('🔐 Login attempt:', email);
    
    if (!email || !password) {
      return res.status(400).json({ status: 'fail', message: 'email and password are required' });
    }
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      console.log('❌ User not found:', email);
      return res.status(400).json({ status: 'fail', message: 'Invalid credentials' });
    }
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      console.log('❌ Invalid password for:', email);
      return res.status(400).json({ status: 'fail', message: 'Invalid credentials' });
    }
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' });
    console.log('✅ Login successful:', email, 'Role:', user.role);
    res.json({
      status: 'success',
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (err) {
    console.error('❌ Login error:', err);
    res.status(500).json({ status: 'error', message: err.message || 'Server error' });
  }
});

// Products route
app.get('/api/v1/products', (req, res) => {
  res.status(200).json({
    status: 'success',
    data: {
      products: [
        {
          id: 1,
          name: 'Network Vulnerability Scanner',
          price: 49.99,
          category: 'script',
          description: 'Advanced Python script for network security'
        },
        {
          id: 2, 
          name: 'Penetration Testing Toolkit',
          price: 79.99,
          category: 'script',
          description: 'Comprehensive ethical hacking tools'
        },
        {
          id: 3,
          name: 'Cloud Security Auditor',
          price: 64.99,
          category: 'script', 
          description: 'AWS & Azure security assessment'
        }
      ]
    }
  });
});

// Admin: Get all users
app.get('/api/v1/admin/users', async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json({
      status: 'success',
      results: users.length,
      data: { users }
    });
  } catch (err) {
    console.error('❌ Get users error:', err);
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// Admin: Update user role
app.patch('/api/v1/admin/users/:id', async (req, res) => {
  try {
    const { role, isActive } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role, isActive },
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ status: 'fail', message: 'User not found' });
    }
    
    console.log('✅ User updated:', user.email, 'Role:', role);
    res.json({ status: 'success', data: { user } });
  } catch (err) {
    console.error('❌ Update user error:', err);
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// Admin: Delete user
app.delete('/api/v1/admin/users/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ status: 'fail', message: 'User not found' });
    }
    console.log('✅ User deleted:', user.email);
    res.status(204).json({ status: 'success', data: null });
  } catch (err) {
    console.error('❌ Delete user error:', err);
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// Create order (with authentication)
app.post('/api/v1/orders', async (req, res) => {
  try {
    // Get user from token
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ status: 'fail', message: 'Please login to create order' });
    }
    
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(404).json({ status: 'fail', message: 'User not found' });
    }

    const { items, totalAmount, paymentMethod, upiTransactionId, paymentScreenshot, customerPhone } = req.body;
    
    // Validate items
    if (!items || items.length === 0) {
      return res.status(400).json({ status: 'fail', message: 'No items in order' });
    }
    
    // Create order in database
    const order = await Order.create({
      user: user._id,
      items: items.map(item => ({
        product: item.productId || item.id,
        productType: item.category || 'script',
        productName: item.name || item.title,
        price: item.price,
        quantity: item.quantity || 1
      })),
      totalAmount,
      paymentMethod: paymentMethod || 'upi',
      upiTransactionId,
      paymentScreenshot,
      customerEmail: user.email,
      customerPhone,
      customerName: user.name,
      status: 'pending_verification'
    });
    
    console.log('📦 Order created:', order._id, 'for user:', user.email);
    res.status(201).json({ 
      status: 'success', 
      message: 'Order created successfully. Admin will verify payment soon.',
      data: { order } 
    });
  } catch (err) {
    console.error('❌ Create order error:', err);
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// Get user orders (with authentication)
app.get('/api/v1/orders', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ status: 'fail', message: 'Please login to view orders' });
    }
    
    const decoded = jwt.verify(token, JWT_SECRET);
    const orders = await Order.find({ user: decoded.userId })
      .populate('user', 'name email')
      .sort({ createdAt: -1 });
    
    res.json({ 
      status: 'success', 
      results: orders.length, 
      data: { orders } 
    });
  } catch (err) {
    console.error('❌ Get orders error:', err);
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// Admin: Get all orders
app.get('/api/v1/admin/orders', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ status: 'fail', message: 'Not authenticated' });
    }
    
    const decoded = jwt.verify(token, JWT_SECRET);
    const adminUser = await User.findById(decoded.userId);
    
    if (!adminUser || adminUser.role !== 'admin') {
      return res.status(403).json({ status: 'fail', message: 'Access denied. Admin only.' });
    }

    // Get filter from query
    const { status } = req.query;
    const filter = status ? { status } : {};
    
    const orders = await Order.find(filter)
      .populate('user', 'name email')
      .sort({ createdAt: -1 });
    
    res.json({ 
      status: 'success', 
      results: orders.length, 
      data: { orders } 
    });
  } catch (err) {
    console.error('❌ Get admin orders error:', err);
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// Admin: Verify/Approve Order
app.patch('/api/v1/admin/orders/:orderId/verify', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ status: 'fail', message: 'Not authenticated' });
    }
    
    const decoded = jwt.verify(token, JWT_SECRET);
    const adminUser = await User.findById(decoded.userId);
    
    if (!adminUser || adminUser.role !== 'admin') {
      return res.status(403).json({ status: 'fail', message: 'Access denied. Admin only.' });
    }

    const order = await Order.findById(req.params.orderId).populate('user');
    
    if (!order) {
      return res.status(404).json({ status: 'fail', message: 'Order not found' });
    }

    if (order.status !== 'pending_verification') {
      return res.status(400).json({ 
        status: 'fail', 
        message: `Order is already ${order.status}` 
      });
    }

    // Update order status
    order.status = 'verified';
    order.verifiedBy = adminUser._id;
    order.verifiedAt = new Date();
    await order.save();

    // Add products to user's purchases
    const user = await User.findById(order.user._id);
    
    for (const item of order.items) {
      // Check if user already has this product
      const alreadyPurchased = user.purchases.some(
        p => p.product?.toString() === item.product?.toString()
      );
      
      if (!alreadyPurchased) {
        user.purchases.push({
          product: item.product,
          purchaseDate: new Date(),
          amount: item.price * (item.quantity || 1)
        });
        
        user.stats.totalSpent += item.price * (item.quantity || 1);
        user.stats.totalProducts = user.purchases.length;
      }
    }
    
    await user.save();

    console.log(`✅ Order ${order._id} verified by ${adminUser.email}`);
    console.log(`✅ Products added to user ${user.email}'s purchases`);

    res.json({ 
      status: 'success', 
      message: 'Order verified and products added to user account',
      data: { order } 
    });
  } catch (err) {
    console.error('❌ Verify order error:', err);
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// Admin: Reject Order
app.patch('/api/v1/admin/orders/:orderId/reject', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ status: 'fail', message: 'Not authenticated' });
    }
    
    const decoded = jwt.verify(token, JWT_SECRET);
    const adminUser = await User.findById(decoded.userId);
    
    if (!adminUser || adminUser.role !== 'admin') {
      return res.status(403).json({ status: 'fail', message: 'Access denied. Admin only.' });
    }

    const { reason } = req.body;
    const order = await Order.findById(req.params.orderId);
    
    if (!order) {
      return res.status(404).json({ status: 'fail', message: 'Order not found' });
    }

    if (order.status !== 'pending_verification') {
      return res.status(400).json({ 
        status: 'fail', 
        message: `Order is already ${order.status}` 
      });
    }

    order.status = 'rejected';
    order.verifiedBy = adminUser._id;
    order.verifiedAt = new Date();
    order.rejectionReason = reason || 'Payment verification failed';
    await order.save();

    console.log(`❌ Order ${order._id} rejected by ${adminUser.email}`);

    res.json({ 
      status: 'success', 
      message: 'Order rejected',
      data: { order } 
    });
  } catch (err) {
    console.error('❌ Reject order error:', err);
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// ============================================
// CONTENT MANAGEMENT (Scripts, Courses, Blogs)
// ============================================

// Get all scripts
app.get('/api/v1/admin/scripts', async (req, res) => {
  try {
    const scripts = await Product.find({ category: 'script' }).sort({ createdAt: -1 });
    res.json({ status: 'success', results: scripts.length, data: { scripts } });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// Add new script
app.post('/api/v1/admin/scripts', async (req, res) => {
  try {
    const { title, category, price, description, features } = req.body;
    
    const script = await Product.create({
      name: title,
      category: 'script',
      subcategory: category,
      price: parseFloat(price),
      description: description || '',
      shortDescription: description ? description.substring(0, 200) : '',
      features: features ? features.split('\n').filter(f => f.trim()) : [],
      status: 'published',
      level: 'beginner'
    });
    
    console.log('✅ Script created:', script.name);
    res.status(201).json({ status: 'success', data: { script } });
  } catch (err) {
    console.error('❌ Script creation error:', err);
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// Delete script
app.delete('/api/v1/admin/scripts/:id', async (req, res) => {
  try {
    const script = await Product.findByIdAndDelete(req.params.id);
    if (!script) {
      return res.status(404).json({ status: 'fail', message: 'Script not found' });
    }
    console.log('✅ Script deleted:', script.name);
    res.status(204).json({ status: 'success', data: null });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// Get all courses
app.get('/api/v1/admin/courses', async (req, res) => {
  try {
    const courses = await Product.find({ category: 'course' }).sort({ createdAt: -1 });
    res.json({ status: 'success', results: courses.length, data: { courses } });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// Add new course
app.post('/api/v1/admin/courses', async (req, res) => {
  try {
    const { title, level, duration, price, instructor, description, modules } = req.body;
    
    const course = await Product.create({
      name: title,
      category: 'course',
      subcategory: level,
      level: level || 'beginner',
      price: parseFloat(price),
      description: description || '',
      shortDescription: description ? description.substring(0, 200) : '',
      instructor,
      'metadata.duration': duration ? { hours: parseInt(duration), minutes: 0 } : null,
      features: modules ? modules.split('\n').filter(m => m.trim()) : [],
      status: 'published'
    });
    
    console.log('✅ Course created:', course.name);
    res.status(201).json({ status: 'success', data: { course } });
  } catch (err) {
    console.error('❌ Course creation error:', err);
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// Delete course
app.delete('/api/v1/admin/courses/:id', async (req, res) => {
  try {
    const course = await Product.findByIdAndDelete(req.params.id);
    if (!course) {
      return res.status(404).json({ status: 'fail', message: 'Course not found' });
    }
    console.log('✅ Course deleted:', course.name);
    res.status(204).json({ status: 'success', data: null });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// Get all blogs
app.get('/api/v1/admin/blogs', async (req, res) => {
  try {
    const blogs = await Blog.find().sort({ createdAt: -1 });
    res.json({ status: 'success', results: blogs.length, data: { blogs } });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// Add new blog
app.post('/api/v1/admin/blogs', async (req, res) => {
  try {
    const { title, category, author, content, tags } = req.body;
    
    const blog = await Blog.create({
      title,
      category,
      author: author || 'Admin',
      content,
      tags: tags ? tags.split(',').map(t => t.trim()).filter(t => t) : [],
      status: 'published'
    });
    
    console.log('✅ Blog created:', blog.title);
    res.status(201).json({ status: 'success', data: { blog } });
  } catch (err) {
    console.error('❌ Blog creation error:', err);
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// Delete blog
app.delete('/api/v1/admin/blogs/:id', async (req, res) => {
  try {
    const blog = await Blog.findByIdAndDelete(req.params.id);
    if (!blog) {
      return res.status(404).json({ status: 'fail', message: 'Blog not found' });
    }
    console.log('✅ Blog deleted:', blog.title);
    res.status(204).json({ status: 'success', data: null });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// ========== USER PURCHASES / ENROLLMENTS ROUTES ==========

// Get user's all purchases
app.get('/api/v1/enrollments/my-purchases', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ status: 'fail', message: 'Not authenticated' });
    }
    
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.userId).populate('purchases.product');
    
    if (!user) {
      return res.status(404).json({ status: 'fail', message: 'User not found' });
    }

    res.status(200).json({
      status: 'success',
      data: {
        purchases: user.purchases,
        totalSpent: user.stats.totalSpent,
        totalProducts: user.purchases.length
      }
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// Get user's purchased courses only
app.get('/api/v1/enrollments/my-courses', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ status: 'fail', message: 'Not authenticated' });
    }
    
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(404).json({ status: 'fail', message: 'User not found' });
    }

    // Get purchased course IDs
    const purchasedCourseIds = user.purchases.map(p => p.product?.toString()).filter(Boolean);
    
    // Find courses (products with category 'course')
    const courses = await Product.find({ 
      _id: { $in: purchasedCourseIds },
      category: 'course'
    });
    
    // Add purchase info
    const coursesWithPurchaseInfo = courses.map(course => {
      const purchase = user.purchases.find(p => p.product?.toString() === course._id.toString());
      return {
        ...course.toObject(),
        purchaseDate: purchase?.purchaseDate,
        amount: purchase?.amount
      };
    });

    res.status(200).json({
      status: 'success',
      data: { courses: coursesWithPurchaseInfo }
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// Get user's purchased scripts only
app.get('/api/v1/enrollments/my-scripts', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ status: 'fail', message: 'Not authenticated' });
    }
    
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(404).json({ status: 'fail', message: 'User not found' });
    }

    // Get purchased script IDs
    const purchasedScriptIds = user.purchases.map(p => p.product?.toString()).filter(Boolean);
    
    // Find scripts (products with category 'script')
    const scripts = await Product.find({ 
      _id: { $in: purchasedScriptIds },
      category: 'script'
    });
    
    // Add purchase info
    const scriptsWithPurchaseInfo = scripts.map(script => {
      const purchase = user.purchases.find(p => p.product?.toString() === script._id.toString());
      return {
        ...script.toObject(),
        purchaseDate: purchase?.purchaseDate,
        amount: purchase?.amount,
        downloadCount: purchase?.downloadCount
      };
    });

    res.status(200).json({
      status: 'success',
      data: { scripts: scriptsWithPurchaseInfo }
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// ========== ADMIN ENROLLMENT MANAGEMENT ROUTES ==========

// Get all users with enrollments (Admin only)
app.get('/api/v1/admin/users-enrollments', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ status: 'fail', message: 'Not authenticated' });
    }
    
    const decoded = jwt.verify(token, JWT_SECRET);
    const adminUser = await User.findById(decoded.userId);
    
    if (!adminUser || adminUser.role !== 'admin') {
      return res.status(403).json({ status: 'fail', message: 'Access denied' });
    }

    const users = await User.find({ role: { $ne: 'admin' } })
      .select('name email purchases stats createdAt')
      .populate('purchases.product', 'name type price')
      .sort('-createdAt');

    const usersData = users.map(user => ({
      _id: user._id,
      name: user.name,
      email: user.email,
      totalProducts: user.purchases.length,
      totalSpent: user.stats.totalSpent,
      joinedDate: user.createdAt,
      purchases: user.purchases.map(p => ({
        _id: p._id,
        productId: p.product?._id,
        productName: p.product?.name,
        productType: p.product?.type,
        purchaseDate: p.purchaseDate,
        amount: p.amount
      }))
    }));

    res.status(200).json({
      status: 'success',
      data: { users: usersData }
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// Assign product to user (Admin only)
app.post('/api/v1/admin/assign-product', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ status: 'fail', message: 'Not authenticated' });
    }
    
    const decoded = jwt.verify(token, JWT_SECRET);
    const adminUser = await User.findById(decoded.userId);
    
    if (!adminUser || adminUser.role !== 'admin') {
      return res.status(403).json({ status: 'fail', message: 'Access denied' });
    }

    const { userId, productId, productType, amount } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ status: 'fail', message: 'User not found' });
    }

    // Check if already purchased
    const alreadyPurchased = user.purchases.some(p => p.product?.toString() === productId);
    if (alreadyPurchased) {
      return res.status(400).json({ status: 'fail', message: 'User already has this product' });
    }

    // Get product
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ status: 'fail', message: 'Product not found' });
    }

    // Validate product type matches
    if (product.category !== productType) {
      return res.status(400).json({ 
        status: 'fail', 
        message: `Product is a ${product.category}, not a ${productType}` 
      });
    }

    // Add to purchases
    user.purchases.push({
      product: productId,
      purchaseDate: new Date(),
      amount: amount || product.price || 0
    });

    user.stats.totalProducts = user.purchases.length;
    user.stats.totalSpent += (amount || product.price || 0);
    await user.save();

    console.log(`✅ Assigned ${productType} "${product.name}" to user ${user.email}`);

    res.status(200).json({
      status: 'success',
      message: `${productType} assigned successfully`,
      data: { user }
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// Remove product from user (Admin only)
app.delete('/api/v1/admin/remove-product', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ status: 'fail', message: 'Not authenticated' });
    }
    
    const decoded = jwt.verify(token, JWT_SECRET);
    const adminUser = await User.findById(decoded.userId);
    
    if (!adminUser || adminUser.role !== 'admin') {
      return res.status(403).json({ status: 'fail', message: 'Access denied' });
    }

    const { userId, productId } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ status: 'fail', message: 'User not found' });
    }

    const purchaseIndex = user.purchases.findIndex(p => p.product?.toString() === productId);
    if (purchaseIndex === -1) {
      return res.status(404).json({ status: 'fail', message: 'User does not have this product' });
    }

    const removedAmount = user.purchases[purchaseIndex].amount || 0;
    user.purchases.splice(purchaseIndex, 1);
    
    user.stats.totalProducts = user.purchases.length;
    user.stats.totalSpent = Math.max(0, user.stats.totalSpent - removedAmount);
    await user.save();

    console.log(`✅ Removed product from user ${user.email}`);

    res.status(200).json({
      status: 'success',
      message: 'Product removed successfully',
      data: { user }
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// Database connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/cyberscripts';

mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => {
    console.log('❌ MongoDB Connection Error:', err.message);
  });

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`
🚀 CyberScripts Pro Server Started!
📍 Port: ${PORT}
📍 Environment: ${process.env.NODE_ENV || 'development'}
📍 Security Features: ${[mongoSanitize, xss, hpp, compression].filter(Boolean).length}/4
📍 Time: ${new Date().toLocaleString()}
  `);
});
