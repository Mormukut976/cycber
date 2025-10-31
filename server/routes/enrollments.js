import express from 'express';
import User from '../models/User.js';
import Product from '../models/Product.js';
import Course from '../models/Course.js';
import Script from '../models/Script.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Get user's purchased items (scripts, courses)
router.get('/my-purchases', protect, asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate('purchases.product');
  
  const purchases = user.purchases.map(purchase => ({
    _id: purchase._id,
    product: purchase.product,
    purchaseDate: purchase.purchaseDate,
    amount: purchase.amount,
    downloadCount: purchase.downloadCount,
    lastDownloaded: purchase.lastDownloaded
  }));

  res.status(200).json({
    status: 'success',
    data: {
      purchases,
      totalSpent: user.stats.totalSpent,
      totalProducts: purchases.length
    }
  });
}));

// Get user's purchased scripts only
router.get('/my-scripts', protect, asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate({
    path: 'purchases.product',
    match: { type: 'script' }
  });
  
  const scripts = user.purchases
    .filter(p => p.product && p.product.type === 'script')
    .map(purchase => ({
      ...purchase.product.toObject(),
      purchaseDate: purchase.purchaseDate,
      downloadCount: purchase.downloadCount
    }));

  res.status(200).json({
    status: 'success',
    data: { scripts }
  });
}));

// Get user's purchased courses only
router.get('/my-courses', protect, asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  
  // Get all purchased course IDs
  const purchasedCourseIds = user.purchases
    .map(p => p.product?.toString())
    .filter(Boolean);
  
  // Find all courses that match
  const courses = await Course.find({ _id: { $in: purchasedCourseIds } });
  
  // Add purchase info to each course
  const coursesWithPurchaseInfo = courses.map(course => {
    const purchase = user.purchases.find(
      p => p.product?.toString() === course._id.toString()
    );
    
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
}));

// Check if user has purchased a specific item
router.get('/check-purchase/:productId', protect, asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  
  const hasPurchased = user.purchases.some(
    p => p.product?.toString() === req.params.productId
  );

  res.status(200).json({
    status: 'success',
    data: { hasPurchased }
  });
}));

export default router;
