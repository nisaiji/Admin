const REGEX = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^\d{10}$/,
  PHONE_TEST: /^[6-9]/,
  NUMBER: /\d/,
  PHONE_LENGTH: /^[6-9]\d{9}$/,
  PINCODE: /^\d{6}$/,
};

export default REGEX;
