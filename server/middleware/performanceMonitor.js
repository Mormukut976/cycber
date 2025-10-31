import responseTime from 'response-time';
import logger from '../utils/logger.js';

// Performance thresholds (in milliseconds)
const PERFORMANCE_THRESHOLDS = {
  SLOW: 1000,    // 1 second
  VERY_SLOW: 3000, // 3 seconds
  CRITICAL: 5000   // 5 seconds
};

// Custom performance metrics class
class PerformanceMetrics {
  constructor() {
    this.metrics = new Map();
  }

  recordMetric(route, method, duration, statusCode) {
    const key = `${method}:${route}`;
    
    if (!this.metrics.has(key)) {
      this.metrics.set(key, {
        route,
        method,
        count: 0,
        totalDuration: 0,
        minDuration: Infinity,
        maxDuration: 0,
        errors: 0,
        slowRequests: 0,
        statusCodes: {}
      });
    }

    const metric = this.metrics.get(key);
    metric.count++;
    metric.totalDuration += duration;
    metric.minDuration = Math.min(metric.minDuration, duration);
    metric.maxDuration = Math.max(metric.maxDuration, duration);

    // Track status codes
    metric.statusCodes[statusCode] = (metric.statusCodes[statusCode] || 0) + 1;

    // Track slow requests
    if (duration >= PERFORMANCE_THRESHOLDS.SLOW) {
      metric.slowRequests++;
    }

    // Track errors
    if (statusCode >= 400) {
      metric.errors++;
    }
  }

  getMetrics() {
    return Array.from(this.metrics.values()).map(metric => ({
      ...metric,
      averageDuration: metric.totalDuration / metric.count,
      errorRate: (metric.errors / metric.count) * 100,
      slowRequestRate: (metric.slowRequests / metric.count) * 100
    }));
  }

  clear() {
    this.metrics.clear();
  }
}

// Global performance metrics instance
const performanceMetrics = new PerformanceMetrics();

// Performance monitoring middleware
export const performanceMonitor = responseTime((req, res, time) => {
  const duration = Math.round(time);
  const statusCode = res.statusCode;
  const route = req.route ? req.route.path : req.url;
  const method = req.method;

  // Record metric for analytics
  performanceMetrics.recordMetric(route, method, duration, statusCode);

  // Log slow requests with different levels based on severity
  if (duration >= PERFORMANCE_THRESHOLDS.CRITICAL) {
    logger.error('CRITICAL PERFORMANCE ISSUE', {
      type: 'performance',
      level: 'critical',
      url: req.url,
      method: req.method,
      duration: `${duration}ms`,
      user: req.user?.id || 'anonymous',
      userAgent: req.get('User-Agent'),
      ip: req.ip,
      timestamp: new Date().toISOString()
    });
  } else if (duration >= PERFORMANCE_THRESHOLDS.VERY_SLOW) {
    logger.warn('Very slow request detected', {
      type: 'performance', 
      level: 'warning',
      url: req.url,
      method: req.method,
      duration: `${duration}ms`,
      user: req.user?.id || 'anonymous',
      timestamp: new Date().toISOString()
    });
  } else if (duration >= PERFORMANCE_THRESHOLDS.SLOW) {
    logger.info('Slow request detected', {
      type: 'performance',
      level: 'info',
      url: req.url,
      method: req.method,
      duration: `${duration}ms`,
      user: req.user?.id || 'anonymous',
      timestamp: new Date().toISOString()
    });
  }

  // Add performance headers for client-side monitoring
  res.setHeader('X-Response-Time', `${duration}ms`);
  res.setHeader('X-Performance-Monitor', 'active');
});

// Advanced performance analytics middleware
export const advancedPerformanceMonitor = (req, res, next) => {
  const start = process.hrtime();
  const startMemory = process.memoryUsage();

  // Add performance tracking to response
  res.on('finish', () => {
    const [seconds, nanoseconds] = process.hrtime(start);
    const duration = (seconds * 1000) + (nanoseconds / 1e6); // Convert to milliseconds
    
    const endMemory = process.memoryUsage();
    const memoryUsed = endMemory.heapUsed - startMemory.heapUsed;

    // Comprehensive performance data
    const performanceData = {
      timestamp: new Date().toISOString(),
      method: req.method,
      url: req.url,
      route: req.route?.path || req.url,
      duration: Math.round(duration),
      statusCode: res.statusCode,
      memory: {
        used: Math.round(memoryUsed / 1024 / 1024), // MB
        heapTotal: Math.round(endMemory.heapTotal / 1024 / 1024),
        heapUsed: Math.round(endMemory.heapUsed / 1024 / 1024),
        external: Math.round(endMemory.external / 1024 / 1024)
      },
      user: req.user?.id || 'anonymous',
      userAgent: req.get('User-Agent'),
      ip: req.ip,
      contentLength: res.get('Content-Length') || 0
    };

    // Log based on performance thresholds
    if (duration >= PERFORMANCE_THRESHOLDS.SLOW) {
      logger.warn('Advanced performance issue detected', {
        type: 'advanced_performance',
        data: performanceData
      });
    }

    // Store for analytics (you can send this to external monitoring service)
    storePerformanceData(performanceData);
  });

  next();
};

// Database query performance monitoring
export const queryPerformanceMonitor = (schema) => {
  schema.pre(/^find/, function(next) {
    this._startTime = Date.now();
    next();
  });

  schema.post(/^find/, function(docs, next) {
    if (this._startTime) {
      const duration = Date.now() - this._startTime;
      
      if (duration > 100) { // Log slow queries > 100ms
        logger.warn('Slow database query detected', {
          type: 'database_performance',
          collection: this.model.modelName,
          operation: this.op,
          duration: `${duration}ms`,
          query: this.getQuery(),
          options: this.getOptions(),
          timestamp: new Date().toISOString()
        });
      }
    }
    next();
  });
};

// Memory usage monitoring
export const memoryMonitor = (req, res, next) => {
  const memoryUsage = process.memoryUsage();
  
  // Log high memory usage
  if (memoryUsage.heapUsed > 500 * 1024 * 1024) { // 500MB threshold
    logger.warn('High memory usage detected', {
      type: 'memory_usage',
      heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024) + 'MB',
      heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024) + 'MB',
      rss: Math.round(memoryUsage.rss / 1024 / 1024) + 'MB',
      timestamp: new Date().toISOString()
    });
  }

  // Add memory info to response headers (for debugging)
  res.setHeader('X-Memory-Usage', Math.round(memoryUsage.heapUsed / 1024 / 1024) + 'MB');
  
  next();
};

// API endpoints for performance metrics
export const getPerformanceMetrics = (req, res) => {
  const metrics = performanceMetrics.getMetrics();
  
  res.status(200).json({
    status: 'success',
    data: {
      metrics,
      thresholds: PERFORMANCE_THRESHOLDS,
      summary: {
        totalRequests: metrics.reduce((sum, m) => sum + m.count, 0),
        averageResponseTime: metrics.reduce((sum, m) => sum + m.averageDuration, 0) / metrics.length,
        errorRate: metrics.reduce((sum, m) => sum + m.errorRate, 0) / metrics.length,
        timestamp: new Date().toISOString()
      }
    }
  });
};

// Reset performance metrics
export const resetPerformanceMetrics = (req, res) => {
  performanceMetrics.clear();
  
  res.status(200).json({
    status: 'success',
    message: 'Performance metrics reset successfully'
  });
};

// Utility function to store performance data (can be extended to send to external services)
const storePerformanceData = (data) => {
  // Here you can:
  // 1. Store in database
  // 2. Send to external monitoring (DataDog, New Relic, etc.)
  // 3. Cache for real-time dashboard
  
  // For now, we'll just log it for demonstration
  if (data.duration > PERFORMANCE_THRESHOLDS.SLOW) {
    logger.info('Performance data stored', {
      type: 'performance_storage',
      data: data
    });
  }
};

// Export the performance metrics instance for use in other parts of the app
export { performanceMetrics };

export default {
  performanceMonitor,
  advancedPerformanceMonitor,
  queryPerformanceMonitor,
  memoryMonitor,
  getPerformanceMetrics,
  resetPerformanceMetrics,
  performanceMetrics
};
