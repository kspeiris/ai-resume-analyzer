// Google Analytics integration
export const initAnalytics = () => {
  if (typeof window.gtag !== 'undefined') {
    window.gtag('config', process.env.REACT_APP_GA_MEASUREMENT_ID, {
      send_page_view: false
    });
  }
};

// Track page view
export const trackPageView = (path) => {
  if (typeof window.gtag !== 'undefined') {
    window.gtag('config', process.env.REACT_APP_GA_MEASUREMENT_ID, {
      page_path: path
    });
  }
};

// Track event
export const trackEvent = (action, category, label, value) => {
  if (typeof window.gtag !== 'undefined') {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value
    });
  }
};

// User engagement tracking
export const trackUserEngagement = {
  // Authentication events
  signUp: (method) => {
    trackEvent('sign_up', 'authentication', method);
  },
  
  login: (method) => {
    trackEvent('login', 'authentication', method);
  },
  
  logout: () => {
    trackEvent('logout', 'authentication');
  },
  
  // Resume events
  resumeUpload: (fileSize, fileType) => {
    trackEvent('resume_upload', 'resume', fileType, fileSize);
  },
  
  resumeDelete: () => {
    trackEvent('resume_delete', 'resume');
  },
  
  // Analysis events
  analysisStart: () => {
    trackEvent('analysis_start', 'analysis');
  },
  
  analysisComplete: (score, timeElapsed) => {
    trackEvent('analysis_complete', 'analysis', 'score', score);
    trackEvent('analysis_time', 'analysis', 'time', timeElapsed);
  },
  
  // Feature usage
  exportReport: (format) => {
    trackEvent('export_report', 'feature', format);
  },
  
  shareAnalysis: () => {
    trackEvent('share_analysis', 'feature');
  },
  
  viewHistory: () => {
    trackEvent('view_history', 'feature');
  },
  
  // Subscription events
  upgradeSubscription: (plan) => {
    trackEvent('subscription_upgrade', 'billing', plan);
  },
  
  cancelSubscription: () => {
    trackEvent('subscription_cancel', 'billing');
  },
  
  // Error tracking
  error: (errorType, errorMessage) => {
    trackEvent('error', errorType, errorMessage);
  }
};

// Performance tracking
export const trackPerformance = {
  pageLoad: (loadTime) => {
    trackEvent('page_load', 'performance', 'load_time', loadTime);
  },
  
  apiCall: (endpoint, duration, success) => {
    trackEvent('api_call', 'performance', endpoint, duration);
    if (!success) {
      trackEvent('api_error', 'performance', endpoint);
    }
  },
  
  analysisTime: (duration) => {
    trackEvent('analysis_duration', 'performance', 'time', duration);
  }
};

// User properties
export const setUserProperties = (properties) => {
  if (typeof window.gtag !== 'undefined') {
    window.gtag('set', 'user_properties', properties);
  }
};

// Custom dimensions
export const setCustomDimension = (dimension, value) => {
  if (typeof window.gtag !== 'undefined') {
    window.gtag('set', {
      [dimension]: value
    });
  }
};