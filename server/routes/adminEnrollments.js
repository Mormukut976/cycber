import express from 'express';
import User from '../models/User.js';
import Course from '../models/Course.js';
import Script from '../models/Script.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Get all users with their enrollments
router.get('/users-enrollments', protect, authorize('admin'), asyncHandler(async (req, res) => {
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
}));

// Get specific user's enrollments
router.get('/user-enrollments/:userId', protect, authorize('admin'), asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.userId)
    .populate('purchases.product');

  if (!user) {
    return res.status(404).json({
      status: 'error',
      message: 'User not found'
    });
  }

  res.status(200).json({
    status: 'success',
    data: {
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        purchases: user.purchases
      }
    }
  });
}));

// Assign course/script to user
router.post('/assign-product', protect, authorize('admin'), asyncHandler(async (req, res) => {
  const { userId, productId, productType, amount } = req.body;

  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({
      status: 'error',
      message: 'User not found'
    });
  }

  // Check if already purchased
  const alreadyPurchased = user.purchases.some(
    p => p.product?.toString() === productId
  );

  if (alreadyPurchased) {
    return res.status(400).json({
      status: 'error',
      message: 'User already has this product'
    });
  }

  // Get product details
  let product;
  if (productType === 'course') {
    product = await Course.findById(productId);
  } else if (productType === 'script') {
    product = await Script.findById(productId);
  }

  if (!product) {
    return res.status(404).json({
      status: 'error',
      message: 'Product not found'
    });
  }

  // Add to user's purchases
  user.purchases.push({
    product: productId,
    purchaseDate: new Date(),
    amount: amount || product.price || 0
  });

  // Update stats
  user.stats.totalProducts = user.purchases.length;
  user.stats.totalSpent += (amount || product.price || 0);

  await user.save();

  res.status(200).json({
    status: 'success',
    message: `${productType} assigned to user successfully`,
    data: { user }
  });
}));

// Remove course/script from user
router.delete('/remove-product', protect, authorize('admin'), asyncHandler(async (req, res) => {
  const { userId, productId } = req.body;

  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({
      status: 'error',
      message: 'User not found'
    });
  }

  // Find purchase
  const purchaseIndex = user.purchases.findIndex(
    p => p.product?.toString() === productId
  );

  if (purchaseIndex === -1) {
    return res.status(404).json({
      status: 'error',
      message: 'User does not have this product'
    });
  }

  // Get amount before removing
  const removedAmount = user.purchases[purchaseIndex].amount || 0;

  // Remove from purchases
  user.purchases.splice(purchaseIndex, 1);

  // Update stats
  user.stats.totalProducts = user.purchases.length;
  user.stats.totalSpent = Math.max(0, user.stats.totalSpent - removedAmount);

  await user.save();

  res.status(200).json({
    status: 'success',
    message: 'Product removed from user successfully',
    data: { user }
  });
}));

export default router;
