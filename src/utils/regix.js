const REGEX = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^\d{10}$/,
  PHONE_TEST: /^[1-5]/,
  NUMBER: /\d/,
  PHONE_LENGTH: /^[1-5]\d{9}$/,
};

export default REGEX;
