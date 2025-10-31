import User from '../models/User.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import Blog from '../models/Blog.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import AppError from '../utils/AppError.js';

// @desc    Get admin dashboard stats
// @route   GET /api/v1/admin/dashboard
// @access  Private/Admin
export const getDashboardStats = asyncHandler(async (req, res, next) => {
  const [
    totalUsers,
    totalProducts,
    totalOrders,
    totalRevenue,
    recentOrders,
    topProducts,
    userGrowth,
    revenueStats
  ] = await Promise.all([
    User.countDocuments(),
    Product.countDocuments(),
    Order.countDocuments({ status: 'completed' }),
    Order.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]),
    Order.find({ status: 'completed' })
      .populate('user', 'name email')
      .populate('product', 'name price')
      .sort({ completedAt: -1 })
      .limit(10),
    Product.aggregate([
      { $match: { status: 'published' } },
      { $sort: { 'stats.sales': -1 } },
      { $limit: 5 },
      { $project: { name: 1, 'stats.sales': 1, 'stats.revenue': 1, 'stats.ratings': 1 } }
    ]),
    User.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 12 }
    ]),
    Order.aggregate([
      { $match: { status: 'completed' } },
      {
        $group: {
          _id: {
            year: { $year: '$completedAt' },
            month: { $month: '$completedAt' }
          },
          revenue: { $sum: '$amount' },
          orders: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 12 }
    ])
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      stats: {
        totalUsers,
        totalProducts,
        totalOrders,
        totalRevenue: totalRevenue[0]?.total || 0,
      },
      recentOrders,
      topProducts,
      userGrowth,
      revenueStats,
    },
  });
});

// @desc    Bulk product operations
// @route   POST /api/v1/admin/products/bulk
// @access  Private/Admin
export const bulkProductOperations = asyncHandler(async (req, res, next) => {
  const { operation, productIds, data } = req.body;

  let result;
  switch (operation) {
    case 'publish':
      result = await Product.updateMany(
        { _id: { $in: productIds } },
        { $set: { status: 'published' } }
      );
      break;
    case 'unpublish':
      result = await Product.updateMany(
        { _id: { $in: productIds } },
        { $set: { status: 'draft' } }
      );
      break;
    case 'feature':
      result = await Product.updateMany(
        { _id: { $in: productIds } },
        { $set: { isFeatured: true } }
      );
      break;
    case 'unfeature':
      result = await Product.updateMany(
        { _id: { $in: productIds } },
        { $set: { isFeatured: false } }
      );
      break;
    case 'update-pricing':
      result = await Product.updateMany(
        { _id: { $in: productIds } },
        { $set: { 
          price: data.price,
          originalPrice: data.originalPrice,
          isOnSale: data.isOnSale 
        } }
      );
      break;
    default:
      return next(new AppError('Invalid operation', 400));
  }

  res.status(200).json({
    status: 'success',
    data: {
      modifiedCount: result.modifiedCount,
    },
  });
});

// @desc    Generate sales reports
// @route   GET /api/v1/admin/reports/sales
// @access  Private/Admin
export const generateSalesReport = asyncHandler(async (req, res, next) => {
  const { startDate, endDate, groupBy = 'day' } = req.query;

  const matchStage = {
    status: 'completed',
    completedAt: {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    }
  };

  let groupStage;
  switch (groupBy) {
    case 'day':
      groupStage = {
        _id: {
          year: { $year: '$completedAt' },
          month: { $month: '$completedAt' },
          day: { $dayOfMonth: '$completedAt' }
        }
      };
      break;
    case 'week':
      groupStage = {
        _id: {
          year: { $year: '$completedAt' },
          week: { $week: '$completedAt' }
        }
      };
      break;
    case 'month':
      groupStage = {
        _id: {
          year: { $year: '$completedAt' },
          month: { $month: '$completedAt' }
        }
      };
      break;
    default:
      groupStage = { _id: null };
  }

  const report = await Order.aggregate([
    { $match: matchStage },
    {
      $group: {
        ...groupStage,
        totalRevenue: { $sum: '$amount' },
        totalOrders: { $sum: 1 },
        averageOrderValue: { $avg: '$amount' }
      }
    },
    { $sort: { '_id': 1 } }
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      report,
      parameters: {
        startDate,
        endDate,
        groupBy
      }
    },
  });
});
