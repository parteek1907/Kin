import parsePhoneNumberFromString, { CountryCode } from 'libphonenumber-js';

export interface PhoneValidationResult {
  isValid: boolean;
  e164: string;
  digitsOnly: string; // Used directly by Meta Cloud API (e.g. 919811022678)
  formattedNational: string;
  country?: CountryCode;
  error?: string;
}

/**
 * Normalizes phone numbers to standard E.164 and Meta API digits-only formats.
 */
export function normalizePhone(rawPhone: string, defaultCountry: CountryCode = 'IN'): PhoneValidationResult {
  if (!rawPhone || typeof rawPhone !== 'string') {
    return {
      isValid: false,
      e164: '',
      digitsOnly: '',
      formattedNational: '',
      error: 'Phone number cannot be empty',
    };
  }

  const cleaned = rawPhone.trim();
  const phoneNumber = parsePhoneNumberFromString(cleaned, defaultCountry);

  if (!phoneNumber || !phoneNumber.isValid()) {
    return {
      isValid: false,
      e164: '',
      digitsOnly: '',
      formattedNational: '',
      error: 'Invalid phone number format or country code',
    };
  }

  const e164 = phoneNumber.format('E.164'); // e.g. +919811022678
  const digitsOnly = e164.replace(/\D/g, ''); // e.g. 919811022678

  return {
    isValid: true,
    e164,
    digitsOnly,
    formattedNational: phoneNumber.formatNational(),
    country: phoneNumber.country,
  };
}

/**
 * Masks phone numbers for secure and compliant observability logs.
 * Example: +919811022678 -> +91••••••2678
 */
export function maskPhone(phoneE164: string): string {
  if (!phoneE164) return '[EMPTY_PHONE]';
  const clean = phoneE164.trim();
  if (clean.length < 8) return clean.replace(/./g, '•');

  const start = clean.slice(0, 3);
  const end = clean.slice(-4);
  const middleLength = Math.max(clean.length - 7, 4);
  return `${start}${'•'.repeat(middleLength)}${end}`;
}
