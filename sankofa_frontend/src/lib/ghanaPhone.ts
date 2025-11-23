/**
 * Ghana phone utilities
 * Mirrors the Flutter GhanaPhoneNumberFormatter helpers
 */

const LOCAL_NUMBER_LENGTH = 9;
const GHANA_COUNTRY_CODE = '+233';
const LOCAL_VALID_PREFIX = /^[235]/;

export const digitsOnly = (input: string): string => input.replace(/\D+/g, '');

export const isValidGhanaMobile = (input: string): boolean => {
  const digits = digitsOnly(input);
  return digits.length === LOCAL_NUMBER_LENGTH && LOCAL_VALID_PREFIX.test(digits[0] ?? '');
};

export const formatForDisplay = (input: string): string => {
  const digits = digitsOnly(input).slice(0, LOCAL_NUMBER_LENGTH);
  if (!digits) {
    return '';
  }

  const buffer: string[] = [];
  for (let i = 0; i < digits.length; i++) {
    buffer.push(digits[i]);
    if (i === 1 || i === 4) {
      buffer.push(' ');
    }
  }
  return buffer.join('').trimEnd();
};

export const normalizeGhanaPhone = (input: string): string => {
  const trimmed = input.trim();
  const digits = digitsOnly(trimmed);
  if (!digits) {
    return trimmed;
  }

  if (digits.startsWith('233') && digits.length === 12) {
    return `+${digits}`;
  }

  if (digits.startsWith('0') && digits.length === 10) {
    return `${GHANA_COUNTRY_CODE}${digits.substring(1)}`;
  }

  if (digits.length === LOCAL_NUMBER_LENGTH) {
    return `${GHANA_COUNTRY_CODE}${digits}`;
  }

  if (trimmed.startsWith('+')) {
    return trimmed;
  }

  return `+${digits}`;
};

export const maskForDisplay = (normalized: string): string =>
  normalized.replace(GHANA_COUNTRY_CODE, `${GHANA_COUNTRY_CODE} `);

