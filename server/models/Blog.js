import mongoose from 'mongoose';

const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Blog title is required'],
    trim: true
  },
  category: {
    type: String,
    required: [true, 'Blog category is required'],
    enum: ['news', 'tutorial', 'research', 'tips & tricks', 'security alerts'],
    lowercase: true
  },
  author: {
    type: String,
    required: [true, 'Author name is required'],
    default: 'Admin'
  },
  content: {
    type: String,
    required: [true, 'Blog content is required']
  },
  tags: [{
    type: String,
    trim: true
  }],
  featuredImage: {
    type: String
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'published'
  },
  views: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update timestamp before saving
blogSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Blog = mongoose.model('Blog', blogSchema);

export default Blog;
