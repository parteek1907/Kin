/**
 * Legal Configuration & Environment Validation for KIN Public Legal Pages
 * (/privacy, /terms, /data-deletion)
 *
 * Emits build warnings if any of the required public environment variables are missing.
 */

export interface LegalConfig {
  companyName: string;
  contactEmail: string;
  siteUrl: string;
  policyUpdated: string;
  companyAddress: string;
  grievanceOfficer: {
    name: string;
    email: string;
    address: string;
  };
}

const REQUIRED_ENV_VARS = [
  'NEXT_PUBLIC_COMPANY_NAME',
  'NEXT_PUBLIC_CONTACT_EMAIL',
  'NEXT_PUBLIC_SITE_URL',
  'NEXT_PUBLIC_POLICY_UPDATED',
] as const;

function loadLegalConfig(): LegalConfig {
  const missing: string[] = [];

  for (const key of REQUIRED_ENV_VARS) {
    if (!process.env[key]) {
      missing.push(key);
    }
  }

  // Show build/server-side warning if any environment placeholders are missing
  if (missing.length > 0 && typeof window === 'undefined') {
    console.warn(
      `\x1b[33m⚠️  [KIN Build Warning] Missing legal environment variables: ${missing.join(
        ', '
      )}. Using default placeholders.\x1b[0m`
    );
  }

  return {
    companyName: process.env.NEXT_PUBLIC_COMPANY_NAME || 'KIN Living Network',
    contactEmail: process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'privacy@kin-path.vercel.app',
    siteUrl: (process.env.NEXT_PUBLIC_SITE_URL || 'https://kin-path.vercel.app').replace(/\/$/, ''),
    policyUpdated: process.env.NEXT_PUBLIC_POLICY_UPDATED || 'October 17, 2026',
    companyAddress: '[PLACEHOLDER: Registered Company Address, New Delhi, India]',
    grievanceOfficer: {
      name: '[PLACEHOLDER: Grievance Officer Name]',
      email: '[PLACEHOLDER: grievance-officer@kin-path.vercel.app]',
      address: '[PLACEHOLDER: Office of the Data Protection & Grievance Officer, New Delhi, India]',
    },
  };
}

export const legalConfig = loadLegalConfig();
