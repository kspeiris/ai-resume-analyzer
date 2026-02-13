// App constants
export const APP_CONFIG = {
  NAME: 'AI Resume Analyzer',
  VERSION: '1.0.0',
  DESCRIPTION: 'Optimize your resume for ATS systems with AI',
  SUPPORT_EMAIL: 'support@airesumeanalyzer.com',
  WEBSITE: 'https://airesumeanalyzer.com'
};

// File upload constants
export const UPLOAD_CONSTANTS = {
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ACCEPTED_FILE_TYPES: {
    'application/pdf': ['.pdf'],
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
  },
  MAX_FILES: 1
};

// Analysis constants
export const ANALYSIS_CONSTANTS = {
  MIN_JD_LENGTH: 50,
  MAX_JD_LENGTH: 5000,
  MIN_RESUME_LENGTH: 100,
  SCORE_WEIGHTS: {
    KEYWORD: 0.4,
    SEMANTIC: 0.3,
    FORMAT: 0.15,
    IMPACT: 0.15
  },
  EXCELLENT_SCORE: 80,
  GOOD_SCORE: 60,
  POOR_SCORE: 40
};

// Subscription plans
export const SUBSCRIPTION_PLANS = {
  FREE: {
    name: 'Free',
    price: 0,
    analyses: 5,
    features: [
      'Basic ATS Analysis',
      '5 Resume Analyses',
      'Keyword Matching',
      'Basic Recommendations'
    ]
  },
  PRO: {
    name: 'Pro',
    price: 19.99,
    analyses: 50,
    features: [
      'Advanced ATS Analysis',
      '50 Resume Analyses',
      'AI Recommendations',
      'Unlimited History',
      'Export Reports',
      'Priority Support'
    ]
  },
  ENTERPRISE: {
    name: 'Enterprise',
    price: 49.99,
    analyses: -1, // Unlimited
    features: [
      'Unlimited Analyses',
      'Bulk Processing',
      'Team Accounts',
      'API Access',
      'Custom Training',
      'Dedicated Support'
    ]
  }
};

// ATS keywords and phrases
export const ATS_KEYWORDS = {
  ACTION_VERBS: [
    'achieved', 'improved', 'increased', 'decreased', 'managed',
    'led', 'developed', 'created', 'implemented', 'designed',
    'coordinated', 'executed', 'delivered', 'launched', 'optimized',
    'streamlined', 'transformed', 'accelerated', 'strengthened', 'pioneered'
  ],
  SECTIONS: [
    'summary', 'experience', 'education', 'skills', 'projects',
    'certifications', 'achievements', 'publications', 'languages',
    'volunteering', 'interests', 'references'
  ],
  FORMAT_INDICATORS: {
    BULLET_POINTS: ['•', '*', '-', '·'],
    NUMBERED_LISTS: ['1.', '2.', '3.', 'i.', 'ii.', 'iii.'],
    TABLES: ['table', 'grid', 'column'],
    GRAPHICS: ['chart', 'graph', 'diagram', 'image']
  }
};

// Error messages
export const ERROR_MESSAGES = {
  NETWORK: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'You must be logged in to perform this action.',
  FORBIDDEN: 'You do not have permission to access this resource.',
  NOT_FOUND: 'The requested resource was not found.',
  VALIDATION: 'Please check your input and try again.',
  UPLOAD_FAILED: 'Failed to upload file. Please try again.',
  ANALYSIS_FAILED: 'Analysis failed. Please try again later.',
  AI_SERVICE_DOWN: 'AI service is currently unavailable. Please try again later.',
  RATE_LIMIT: 'Too many requests. Please wait a moment and try again.',
  SESSION_EXPIRED: 'Your session has expired. Please login again.'
};

// Success messages
export const SUCCESS_MESSAGES = {
  LOGIN: 'Successfully logged in!',
  REGISTER: 'Account created successfully!',
  LOGOUT: 'Successfully logged out!',
  UPLOAD: 'Resume uploaded successfully!',
  ANALYSIS: 'Analysis completed successfully!',
  SAVE: 'Changes saved successfully!',
  DELETE: 'Item deleted successfully!',
  EXPORT: 'Report exported successfully!',
  SHARE: 'Link copied to clipboard!'
};

// Local storage keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER_PREFERENCES: 'user_preferences',
  THEME: 'theme',
  RECENT_ANALYSES: 'recent_analyses',
  DRAFT_RESUMES: 'draft_resumes',
  DRAFT_JD: 'draft_job_description'
};

// API endpoints
export const API_ENDPOINTS = {
  ANALYZE: 'analyzeResume',
  GET_ANALYSES: 'getUserAnalyses',
  GET_USER: 'getUserProfile',
  UPDATE_USER: 'updateUserProfile',
  DELETE_ACCOUNT: 'deleteUserAccount'
};

// Chart colors
export const CHART_COLORS = {
  PRIMARY: '#2563eb',
  SECONDARY: '#7c3aed',
  SUCCESS: '#10b981',
  WARNING: '#f59e0b',
  ERROR: '#ef4444',
  INFO: '#3b82f6',
  GRAY: '#6b7280'
};

// Animation variants
export const ANIMATION_VARIANTS = {
  FADE_IN: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 }
  },
  SLIDE_UP: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  },
  SLIDE_DOWN: {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 20 }
  },
  SCALE: {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.9 }
  }
};