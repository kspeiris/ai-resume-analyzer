/**
 * Formats a date string into a user-friendly format
 * @param {string|Date} date
 * @param {string} format - The desired output pattern
 */
export const formatDate = (date, format = 'MMM DD, YYYY') => {
  const d = new Date(date);
  const options = {
    'MMM DD, YYYY': { month: 'short', day: 'numeric', year: 'numeric' },
    'MMMM DD, YYYY': { month: 'long', day: 'numeric', year: 'numeric' },
    'DD/MM/YYYY': { day: 'numeric', month: 'numeric', year: 'numeric' },
    'YYYY-MM-DD': { year: 'numeric', month: 'numeric', day: 'numeric' },
  };

  return d.toLocaleDateString('en-US', options[format] || options['MMM DD, YYYY']);
};

/**
 * Converts bytes into a readable file size string (KB, MB, etc.)
 * @param {number} bytes
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Truncates string to a fixed length and adds ellipsis
 */
export const truncateText = (text, length = 100) => {
  if (text.length <= length) return text;
  return text.substring(0, length) + '...';
};

/**
 * Generates a random alphanumeric ID
 */
export const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

/**
 * Basic debounce implementation to limit function execution frequency
 */
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Basic throttle implementation to limit function execution rate
 */
export const throttle = (func, limit) => {
  let inThrottle;
  return function (...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

/**
 * Creates a shallow deep-clone of an object via JSON serialization
 */
export const deepClone = (obj) => {
  return JSON.parse(JSON.stringify(obj));
};

/**
 * Performs a shallow equality check using string conversion
 */
export const isEqual = (obj1, obj2) => {
  return JSON.stringify(obj1) === JSON.stringify(obj2);
};

/**
 * Returns a Material UI color key based on numerical score tier
 */
export const getScoreColor = (score) => {
  if (score >= 80) return 'success';
  if (score >= 60) return 'warning';
  if (score >= 40) return 'error';
  return 'error';
};

/**
 * Returns a human-readable status label for a score
 */
export const getScoreStatus = (score) => {
  if (score >= 80) return 'Excellent';
  if (score >= 60) return 'Good';
  if (score >= 40) return 'Needs Work';
  return 'Poor';
};

/**
 * Parses a domain name from a URL string
 */
export const extractDomain = (url) => {
  try {
    const domain = new URL(url).hostname;
    return domain.replace('www.', '');
  } catch {
    return url;
  }
};

/**
 * Groups a collection of objects by a specific property key
 */
export const groupBy = (array, key) => {
  return array.reduce((result, item) => {
    (result[item[key]] = result[item[key]] || []).push(item);
    return result;
  }, {});
};

/**
 * Simple array sort utility
 */
export const sortByKey = (array, key, order = 'asc') => {
  return array.sort((a, b) => {
    if (order === 'asc') {
      return a[key] > b[key] ? 1 : -1;
    } else {
      return a[key] < b[key] ? 1 : -1;
    }
  });
};

/**
 * Calculates percentage integer
 */
export const calculatePercentage = (value, total) => {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
};

/**
 * Calculates average of a numerical array
 */
export const average = (array) => {
  if (array.length === 0) return 0;
  return array.reduce((a, b) => a + b, 0) / array.length;
};

/**
 * Checks if a string contains at least one URL
 */
export const containsURL = (text) => {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  return urlRegex.test(text);
};

/**
 * Removes non-alphanumeric characters from a string for file usage
 */
export const sanitizeFilename = (filename) => {
  return filename.replace(/[^a-z0-9.]/gi, '_').toLowerCase();
};

/**
 * Heuristically parses raw text into logical resume sections
 */
export const parseResumeSections = (text) => {
  const sections = {
    summary: '',
    experience: '',
    education: '',
    skills: '',
    projects: '',
    certifications: '',
    languages: '',
    other: '',
  };

  const lines = text.split('\n');
  let currentSection = 'other';

  lines.forEach((line) => {
    const lowerLine = line.toLowerCase();

    if (
      lowerLine.includes('summary') ||
      lowerLine.includes('profile') ||
      lowerLine.includes('objective')
    ) {
      currentSection = 'summary';
    } else if (
      lowerLine.includes('experience') ||
      lowerLine.includes('work history') ||
      lowerLine.includes('employment')
    ) {
      currentSection = 'experience';
    } else if (
      lowerLine.includes('education') ||
      lowerLine.includes('degree') ||
      lowerLine.includes('university')
    ) {
      currentSection = 'education';
    } else if (
      lowerLine.includes('skill') ||
      lowerLine.includes('technolog') ||
      lowerLine.includes('competenc')
    ) {
      currentSection = 'skills';
    } else if (lowerLine.includes('project')) {
      currentSection = 'projects';
    } else if (lowerLine.includes('certification') || lowerLine.includes('license')) {
      currentSection = 'certifications';
    } else if (lowerLine.includes('language')) {
      currentSection = 'languages';
    }

    sections[currentSection] += line + '\n';
  });

  return sections;
};
