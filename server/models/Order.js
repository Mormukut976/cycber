import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    },
    productType: {
      type: String,
      enum: ['script', 'course', 'blog'],
      required: true
    },
    productName: {
      type: String,
      required: true
    },
    price: {
      type: Number,
      required: true
    },
    quantity: {
      type: Number,
      default: 1
    }
  }],
  totalAmount: {
    type: Number,
    required: true
  },
  paymentMethod: {
    type: String,
    enum: ['upi', 'card', 'netbanking'],
    default: 'upi'
  },
  upiTransactionId: {
    type: String,
    required: true
  },
  paymentScreenshot: {
    type: String
  },
  status: {
    type: String,
    enum: ['pending_verification', 'verified', 'rejected', 'completed'],
    default: 'pending_verification'
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  verifiedAt: Date,
  rejectionReason: String,
  customerEmail: String,
  customerPhone: String,
  customerName: String
}, {
  timestamps: true
});

// Indexes
orderSchema.index({ user: 1, status: 1 });
orderSchema.index({ upiTransactionId: 1 });
orderSchema.index({ createdAt: -1 });

export default mongoose.model('Order', orderSchema);
