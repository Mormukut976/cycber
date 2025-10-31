const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Order = require('../models/Order');
const Product = require('../models/Product');
const auth = require('../middleware/auth');
const router = express.Router();

// Create payment intent
router.post('/create-payment-intent', auth, async (req, res) => {
  try {
    const { productId } = req.body;
    
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: product.price * 100, // Convert to cents
      currency: 'usd',
      metadata: {
        productId: productId,
        userId: req.userId
      }
    });

    res.json({
      clientSecret: paymentIntent.client_secret
    });
  } catch (error) {
    res.status(500).json({ message: 'Payment error' });
  }
});

// Handle payment success
router.post('/payment-success', auth, async (req, res) => {
  try {
    const { paymentIntentId, productId } = req.body;

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    
    if (paymentIntent.status === 'succeeded') {
      // Create order
      const order = new Order({
        userId: req.userId,
        productId,
        amount: paymentIntent.amount / 100,
        paymentIntentId,
        status: 'completed'
      });
      await order.save();

      // Add to user's purchases
      await User.findByIdAndUpdate(req.userId, {
        $push: {
          purchases: {
            productId,
            purchaseDate: new Date(),
            price: paymentIntent.amount / 100
          }
        }
      });

      res.json({ message: 'Payment successful', orderId: order._id });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error processing payment' });
  }
});

module.exports = router;
