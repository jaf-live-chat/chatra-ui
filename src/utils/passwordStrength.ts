export type PasswordStrengthCheck = {
  id: string;
  label: string;
  passed: boolean;
};

export type PasswordStrengthLabel = "Very Weak" | "Weak" | "Fair" | "Strong" | "Very Strong";

export type PasswordStrengthResult = {
  score: number;
  label: PasswordStrengthLabel;
  checks: PasswordStrengthCheck[];
};

const COMMON_WEAK_PASSWORDS = new Set([
  "123456",
  "12345678",
  "123456789",
  "1234567890",
  "password",
  "password1",
  "qwerty",
  "abc123",
  "letmein",
  "admin",
  "welcome",
  "iloveyou",
]);

export const evaluatePasswordStrength = (passwordInput: string): PasswordStrengthResult => {
  const password = String(passwordInput || "");
  const normalized = password.toLowerCase();
  const length = password.length;

  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);
  const hasMinLength = length >= 8;

  const repeatPattern = /(.)\1{2,}/.test(password);
  const sequentialPattern =
    /0123|1234|2345|3456|4567|5678|6789|7890|abcd|bcde|cdef|defg|qwer|asdf|zxcv/i.test(password);
  const isCommonWeak = COMMON_WEAK_PASSWORDS.has(normalized);

  const notPredictable = !isCommonWeak && !repeatPattern && !sequentialPattern;

  const checks: PasswordStrengthCheck[] = [
    { id: "min-length", label: "At least 8 characters", passed: hasMinLength },
    { id: "lower", label: "Contains a lowercase letter", passed: hasLower },
    { id: "upper", label: "Contains an uppercase letter", passed: hasUpper },
    { id: "number", label: "Contains a number", passed: hasNumber },
    { id: "special", label: "Contains a special character", passed: hasSpecial },
  ];

  const passedChecks = checks.filter((check) => check.passed).length;
  const lengthBonus = length >= 12 ? 10 : 0;
  const score = Math.max(0, Math.min(100, Math.round((passedChecks / checks.length) * 90 + lengthBonus)));

  let label: PasswordStrengthLabel = "Very Weak";
  if (score >= 85) label = "Very Strong";
  else if (score >= 70) label = "Strong";
  else if (score >= 55) label = "Fair";
  else if (score >= 35) label = "Weak";

  return {
    score,
    label,
    checks,
  };
};

export const isPasswordStrongEnough = (passwordInput: string) => {
  const result = evaluatePasswordStrength(passwordInput);
  return result.score >= 70 && result.checks.every((check) => check.passed);
};
