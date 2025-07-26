// Clerk password configuration
export const passwordConfig = {
  // Minimal password length (6 characters)
  minLength: 6,

  // Disable breach validation
  validateBreachedPasswords: false,

  // Allow common passwords
  allowCommonPasswords: true,

  // Simple password requirements
  requireUppercase: false,
  requireLowercase: false,
  requireNumbers: false,
  requireSpecialCharacters: false,
};

// Password validation function that bypasses breach checking
export const validatePassword = (password) => {
  if (password.length < passwordConfig.minLength) {
    return {
      valid: false,
      message: `Kata sandi minimal ${passwordConfig.minLength} karakter`,
    };
  }

  return {
    valid: true,
    message: "Kata sandi valid",
  };
};

// Indonesian messages for password validation
export const passwordMessages = {
  tooShort: "Kata sandi terlalu pendek",
  valid: "Kata sandi valid",
  hint: "Minimal 6 karakter",
};
