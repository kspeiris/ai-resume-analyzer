// Format date
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

// Format file size
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Truncate text
export const truncateText = (text, length = 100) => {
  if (text.length <= length) return text;
  return text.substring(0, length) + '...';
};

// Generate unique ID
export const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Debounce function
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

// Throttle function
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

// Deep clone object
export const deepClone = (obj) => {
  return JSON.parse(JSON.stringify(obj));
};

// Compare objects
export const isEqual = (obj1, obj2) => {
  return JSON.stringify(obj1) === JSON.stringify(obj2);
};

// Get score color
export const getScoreColor = (score) => {
  if (score >= 80) return 'success';
  if (score >= 60) return 'warning';
  if (score >= 40) return 'error';
  return 'error';
};

// Get score status
export const getScoreStatus = (score) => {
  if (score >= 80) return 'Excellent';
  if (score >= 60) return 'Good';
  if (score >= 40) return 'Needs Work';
  return 'Poor';
};

// Extract domain from URL
export const extractDomain = (url) => {
  try {
    const domain = new URL(url).hostname;
    return domain.replace('www.', '');
  } catch {
    return url;
  }
};

// Group array by key
export const groupBy = (array, key) => {
  return array.reduce((result, item) => {
    (result[item[key]] = result[item[key]] || []).push(item);
    return result;
  }, {});
};

// Sort array by key
export const sortByKey = (array, key, order = 'asc') => {
  return array.sort((a, b) => {
    if (order === 'asc') {
      return a[key] > b[key] ? 1 : -1;
    } else {
      return a[key] < b[key] ? 1 : -1;
    }
  });
};

// Calculate percentage
export const calculatePercentage = (value, total) => {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
};

// Average of array
export const average = (array) => {
  if (array.length === 0) return 0;
  return array.reduce((a, b) => a + b, 0) / array.length;
};

// Check if string contains URL
export const containsURL = (text) => {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  return urlRegex.test(text);
};

// Sanitize filename
export const sanitizeFilename = (filename) => {
  return filename.replace(/[^a-z0-9.]/gi, '_').toLowerCase();
};

// Parse resume text into sections
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
