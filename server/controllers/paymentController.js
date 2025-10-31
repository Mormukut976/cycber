import stripe from 'stripe';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import config from '../config/config.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import AppError from '../utils/AppError.js';
import { sendEmail } from '../services/emailService.js';

const stripeClient = stripe(config.stripe.secretKey);

// Generate unique license key
const generateLicenseKey = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const segments = [8, 4, 4, 4, 12];
  return segments.map(seg => 
    Array(seg).fill(0).map(() => 
      chars.charAt(Math.floor(Math.random() * chars.length))
    ).join('')
  ).join('-');
};

// @desc    Create payment intent
// @route   POST /api/v1/payments/create-intent
// @access  Private
export const createPaymentIntent = asyncHandler(async (req, res, next) => {
  const { productId, couponCode } = req.body;

  // Get product
  const product = await Product.findById(productId);
  if (!product || product.status !== 'published') {
    return next(new AppError('Product not found or unavailable', 404));
  }

  // Check if user already purchased this product
  const existingPurchase = await User.findOne({
    _id: req.user.id,
    'purchases.product': productId
  });

  if (existingPurchase) {
    return next(new AppError('You already own this product', 400));
  }

  // Calculate final price (with coupon logic)
  let finalPrice = product.price;
  if (couponCode) {
    // Implement coupon validation logic
    finalPrice = await validateCoupon(couponCode, product.price);
  }

  // Create payment intent
  const paymentIntent = await stripeClient.paymentIntents.create({
    amount: Math.round(finalPrice * 100), // Convert to cents
    currency: 'usd',
    metadata: {
      productId: productId.toString(),
      userId: req.user.id,
      productName: product.name,
      couponCode: couponCode || ''
    },
    automatic_payment_methods: {
      enabled: true,
    },
    description: `Purchase: ${product.name}`,
  });

  // Create pending order
  const order = await Order.create({
    user: req.user.id,
    product: productId,
    amount: finalPrice,
    status: 'pending',
    paymentIntentId: paymentIntent.id,
    couponCode,
  });

  res.status(200).json({
    status: 'success',
    data: {
      clientSecret: paymentIntent.client_secret,
      orderId: order._id,
      amount: finalPrice,
    },
  });
});

// @desc    Confirm payment and deliver product
// @route   POST /api/v1/payments/confirm
// @access  Private
export const confirmPayment = asyncHandler(async (req, res, next) => {
  const { paymentIntentId } = req.body;

  // Verify payment with Stripe
  const paymentIntent = await stripeClient.paymentIntents.retrieve(paymentIntentId);

  if (paymentIntent.status !== 'succeeded') {
    return next(new AppError('Payment not successful', 400));
  }

  // Find and update order
  const order = await Order.findOne({ paymentIntentId })
    .populate('product')
    .populate('user');

  if (!order) {
    return next(new AppError('Order not found', 404));
  }

  if (order.status === 'completed') {
    return next(new AppError('Order already processed', 400));
  }

  // Generate license key
  const licenseKey = generateLicenseKey();

  // Update order
  order.status = 'completed';
  order.completedAt = new Date();
  order.licenseKey = licenseKey;
  await order.save();

  // Add to user's purchases
  await User.findByIdAndUpdate(order.user._id, {
    $push: {
      purchases: {
        product: order.product._id,
        purchaseDate: new Date(),
        amount: order.amount,
        licenseKey: licenseKey,
      },
    },
    $inc: {
      'stats.totalSpent': order.amount,
      'stats.totalProducts': 1,
    },
  });

  // Update product sales stats
  await Product.findByIdAndUpdate(order.product._id, {
    $inc: {
      'stats.sales': 1,
      'stats.revenue': order.amount,
    },
  });

  // Send purchase confirmation email
  await sendEmail({
    email: order.user.email,
    subject: `Purchase Confirmation - ${order.product.name}`,
    template: 'purchaseConfirmation',
    data: {
      name: order.user.name,
      productName: order.product.name,
      amount: order.amount,
      orderId: order._id,
      licenseKey: licenseKey,
      downloadUrl: `${config.clientUrl}/download/${order._id}`,
      supportEmail: 'support@cyberscripts.com',
    },
  });

  res.status(200).json({
    status: 'success',
    data: {
      order,
      downloadUrl: `${config.clientUrl}/download/${order._id}`,
      licenseKey,
    },
  });
});

// @desc    Handle Stripe webhooks
// @route   POST /api/v1/payments/webhook
// @access  Public (Stripe calls this)
export const handleWebhook = asyncHandler(async (req, res, next) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripeClient.webhooks.constructEvent(
      req.body,
      sig,
      config.stripe.webhookSecret
    );
  } catch (err) {
    console.log(`Webhook signature verification failed.`, err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      await handleSuccessfulPayment(paymentIntent);
      break;
    case 'payment_intent.payment_failed':
      const failedPayment = event.data.object;
      await handleFailedPayment(failedPayment);
      break;
    case 'customer.subscription.deleted':
      await handleSubscriptionCancelled(event.data.object);
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
});

// Helper functions
const handleSuccessfulPayment = async (paymentIntent) => {
  // Update order status and deliver product
  const order = await Order.findOne({ 
    paymentIntentId: paymentIntent.id 
  }).populate('user').populate('product');

  if (order && order.status === 'pending') {
    order.status = 'completed';
    order.completedAt = new Date();
    await order.save();

    // Send email notification to admin
    await sendEmail({
      email: 'admin@cyberscripts.com',
      subject: `New Sale - ${order.product.name}`,
      template: 'newSaleNotification',
      data: {
        productName: order.product.name,
        customerEmail: order.user.email,
        amount: order.amount,
        orderId: order._id,
      },
    });
  }
};

const handleFailedPayment = async (paymentIntent) => {
  const order = await Order.findOne({ paymentIntentId: paymentIntent.id });
  if (order) {
    order.status = 'failed';
    await order.save();
  }
};
