const performanceConfig = {
  thresholds: {
    slow: 1000,      // 1 second
    verySlow: 3000,  // 3 seconds  
    critical: 5000   // 5 seconds
  },
  logging: {
    enabled: true,
    level: 'warn', // 'error', 'warn', 'info'
    logSlowQueries: true,
    logMemoryUsage: true
  },
  monitoring: {
    trackEndpoints: true,
    trackDatabase: true,
    trackMemory: true,
    sampleRate: 1.0 // 1.0 = 100% of requests
  }
};

export default performanceConfig;
