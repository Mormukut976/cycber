import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [100, 'Product name cannot exceed 100 characters'],
    index: true
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true
  },
  description: {
    type: String,
    required: [true, 'Product description is required'],
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  shortDescription: {
    type: String,
    maxlength: [200, 'Short description cannot exceed 200 characters']
  },
  price: {
    type: Number,
    required: [true, 'Product price is required'],
    min: [0, 'Price cannot be negative'],
    set: val => Math.round(val * 100) / 100 // Store as decimal
  },
  originalPrice: {
    type: Number,
    min: 0
  },
  category: {
    type: String,
    required: true,
    enum: {
      values: ['script', 'course', 'bundle'],
      message: 'Category must be script, course, or bundle'
    }
  },
  subcategory: {
    type: String
  },
  level: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced', 'expert'],
    default: 'beginner'
  },
  features: [String],
  requirements: [String],
  tags: [{
    type: String,
    lowercase: true,
    index: true
  }],
  images: {
    cover: {
      type: String,
      default: 'https://via.placeholder.com/400x300?text=Product+Image'
    },
    gallery: [String]
  },
  files: {
    main: {
      url: String,
      size: Number,
      version: {
        type: String,
        default: '1.0.0'
      },
      uploadedAt: Date
    },
    documentation: {
      url: String,
      size: Number
    },
    resources: [{
      name: String,
      url: String,
      type: String,
      size: Number
    }]
  },
  metadata: {
    version: {
      type: String,
      default: '1.0.0'
    },
    lastUpdated: Date,
    compatibility: [String],
    testedOn: [String],
    language: {
      type: String,
      default: 'English'
    },
    duration: { // For courses
      hours: Number,
      minutes: Number
    },
    lessons: Number, // For courses
    projects: Number // For courses
  },
  stats: {
    sales: {
      type: Number,
      default: 0
    },
    revenue: {
      type: Number,
      default: 0
    },
    downloads: {
      type: Number,
      default: 0
    },
    ratings: {
      average: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
      },
      count: {
        type: Number,
        default: 0
      },
      distribution: {
        1: { type: Number, default: 0 },
        2: { type: Number, default: 0 },
        3: { type: Number, default: 0 },
        4: { type: Number, default: 0 },
        5: { type: Number, default: 0 }
      }
    },
    views: {
      type: Number,
      default: 0
    }
  },
  seo: {
    metaTitle: String,
    metaDescription: String,
    keywords: [String]
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  isOnSale: {
    type: Boolean,
    default: false
  },
  saleExpires: Date,
  downloadLimit: {
    type: Number,
    default: 10
  },
  license: {
    type: String,
    enum: ['single', 'team', 'enterprise'],
    default: 'single'
  },
  support: {
    included: {
      type: Boolean,
      default: false
    },
    duration: Number, // in days
    type: String // email, chat, priority
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
productSchema.index({ category: 1, level: 1 });
productSchema.index({ 'stats.sales': -1 });
productSchema.index({ 'stats.ratings.average': -1 });
productSchema.index({ tags: 1 });
productSchema.index({ isFeatured: 1, status: 1 });
productSchema.index({ slug: 1 });

// Virtual for discount percentage
productSchema.virtual('discountPercentage').get(function() {
  if (!this.originalPrice || this.originalPrice <= this.price) return 0;
  return Math.round(((this.originalPrice - this.price) / this.originalPrice) * 100);
});

// Virtual for reviews
productSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'product',
  localField: '_id'
});

// Pre-save middleware for slug
productSchema.pre('save', function(next) {
  if (this.isModified('name') || !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  }
  next();
});

// Static methods
productSchema.statics.getFeaturedProducts = function() {
  return this.find({ 
    isFeatured: true, 
    status: 'published' 
  }).sort({ 'stats.sales': -1 }).limit(10);
};

productSchema.statics.getTopRated = function(limit = 10) {
  return this.find({ 
    status: 'published',
    'stats.ratings.count': { $gte: 5 }
  })
  .sort({ 'stats.ratings.average': -1 })
  .limit(limit);
};

// Instance methods
productSchema.methods.incrementViews = function() {
  this.stats.views += 1;
  return this.save();
};

productSchema.methods.updateRating = async function(newRating) {
  const Review = mongoose.model('Review');
  const reviews = await Review.find({ product: this._id });
  
  this.stats.ratings.count = reviews.length;
  this.stats.ratings.average = reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length;
  
  // Update distribution
  const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  reviews.forEach(review => {
    distribution[review.rating] += 1;
  });
  this.stats.ratings.distribution = distribution;
  
  return this.save();
};

export default mongoose.model('Product', productSchema);

import { queryPerformanceMonitor } from '../middleware/performanceMonitor.js';

// Add query performance monitoring to product schema
queryPerformanceMonitor(productSchema);

