/**
 * Validates email format using regex
 */
export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

/**
 * Validates password complexity requirements
 * @returns {Object} Validation state and error messages
 */
export const validatePassword = (password) => {
  const errors = [];

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  if (!/[!@#$%^&*]/.test(password)) {
    errors.push('Password must contain at least one special character (!@#$%^&*)');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validates name length
 */
export const validateName = (name) => {
  return name.length >= 2 && name.length <= 50;
};

/**
 * Validates resume file type and size
 */
export const validateResumeFile = (file) => {
  const errors = [];
  const validTypes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ];
  const maxSize = 5 * 1024 * 1024; // 5MB

  if (!validTypes.includes(file.type)) {
    errors.push('File must be PDF or DOCX');
  }

  if (file.size > maxSize) {
    errors.push('File size must be less than 5MB');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validates job description length and presence
 */
export const validateJobDescription = (description) => {
  const errors = [];

  if (!description || description.trim().length === 0) {
    errors.push('Job description is required');
  }

  if (description.length < 50) {
    errors.push('Job description must be at least 50 characters');
  }

  if (description.length > 5000) {
    errors.push('Job description must be less than 5000 characters');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validates phone number format
 */
export const validatePhone = (phone) => {
  const re = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/;
  return re.test(phone);
};

/**
 * Validates URL string format
 */
export const validateURL = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Generic field validator based on custom rules
 */
export const validateField = (name, value, rules = {}) => {
  const errors = [];

  if (rules.required && !value) {
    errors.push(`${name} is required`);
  }

  if (rules.minLength && value.length < rules.minLength) {
    errors.push(`${name} must be at least ${rules.minLength} characters`);
  }

  if (rules.maxLength && value.length > rules.maxLength) {
    errors.push(`${name} must be less than ${rules.maxLength} characters`);
  }

  if (rules.pattern && !rules.pattern.test(value)) {
    errors.push(rules.message || `${name} is invalid`);
  }

  if (rules.custom) {
    const customError = rules.custom(value);
    if (customError) {
      errors.push(customError);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};
