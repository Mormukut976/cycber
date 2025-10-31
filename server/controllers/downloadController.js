import Product from '../models/Product.js';
import Order from '../models/Order.js';
import User from '../models/User.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import AppError from '../utils/AppError.js';
import { streamFile } from '../services/storageService.js';

// @desc    Download purchased product
// @route   GET /api/v1/download/:orderId
// @access  Private
export const downloadProduct = asyncHandler(async (req, res, next) => {
  const { orderId } = req.params;

  // Find order and verify ownership
  const order = await Order.findOne({
    _id: orderId,
    user: req.user.id,
    status: 'completed'
  }).populate('product');

  if (!order) {
    return next(new AppError('Order not found or not completed', 404));
  }

  // Check download limits
  const user = await User.findById(req.user.id);
  const purchase = user.purchases.find(p => 
    p.product.toString() === order.product._id.toString()
  );

  if (purchase.downloadCount >= order.product.downloadLimit) {
    return next(new AppError('Download limit exceeded', 400));
  }

  // Stream file to user
  try {
    const fileStream = await streamFile(order.product.files.main.url);
    
    // Set headers
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', 
      `attachment; filename="${order.product.slug}-v${order.product.metadata.version}.zip"`
    );
    res.setHeader('X-License-Key', order.licenseKey);

    // Update download stats
    purchase.downloadCount += 1;
    purchase.lastDownloaded = new Date();
    await user.save();

    await Product.findByIdAndUpdate(order.product._id, {
      $inc: { 'stats.downloads': 1 }
    });

    // Stream file
    fileStream.pipe(res);
  } catch (error) {
    return next(new AppError('File not found', 404));
  }
});

// @desc    Get download history
// @route   GET /api/v1/downloads/history
// @access  Private
export const getDownloadHistory = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id)
    .populate('purchases.product', 'name slug images metadata');

  const downloadHistory = user.purchases.map(purchase => ({
    product: purchase.product,
    purchaseDate: purchase.purchaseDate,
    downloadCount: purchase.downloadCount,
    lastDownloaded: purchase.lastDownloaded,
    licenseKey: purchase.licenseKey,
    downloadLimit: purchase.product.downloadLimit,
  }));

  res.status(200).json({
    status: 'success',
    data: {
      downloads: downloadHistory,
    },
  });
});
