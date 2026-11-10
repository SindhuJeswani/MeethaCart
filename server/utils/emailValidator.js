import dns from 'dns';
import { promisify } from 'util';

const resolveMx = promisify(dns.resolveMx);
const resolve4 = promisify(dns.resolve4);

// Comprehensive list of well-known disposable / burner email domains
const DISPOSABLE_DOMAINS = new Set([
  'mailinator.com',
  'tempmail.com',
  'temp-mail.org',
  '10minutemail.com',
  'guerrillamail.com',
  'guerrillamail.net',
  'guerrillamail.org',
  'sharklasers.com',
  'dispostable.com',
  'yopmail.com',
  'yopmail.net',
  'trashmail.com',
  'getairmail.com',
  'throwawaymail.com',
  'maildrop.cc',
  'fakeinbox.com',
  'mytemp.email',
  'mohmal.com',
  'crazymailing.com',
  'generator.email',
  'armyspy.com',
  'cuvox.de',
  'dayrep.com',
  'einrot.com',
  'fleckens.hu',
  'gustr.com',
  'jourrapide.com',
  'rhyta.com',
  'superrito.com',
  'teleworm.us',
  'emailondeck.com',
  'inboxkitten.com'
]);

/**
 * Validates email syntax using standard RFC 5322 regex
 * @param {string} email
 * @returns {boolean}
 */
export const isValidEmailFormat = (email) => {
  if (!email || typeof email !== 'string') return false;
  const trimmed = email.trim();
  if (trimmed.length > 254) return false;
  // Standard robust email pattern
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  return emailRegex.test(trimmed);
};

/**
 * Checks if the domain is in the disposable domains blocklist
 * @param {string} domain
 * @returns {boolean}
 */
export const isDisposableDomain = (domain) => {
  if (!domain) return false;
  const normalizedDomain = domain.toLowerCase().trim();
  return DISPOSABLE_DOMAINS.has(normalizedDomain);
};

/**
 * Validates domain existence and ability to receive email via DNS MX / A records
 * with a 5-second timeout.
 * - If domain does not exist or has no mail capability: returns { valid: false, reason: 'domain_invalid' }
 * - If network error / timeout occurs (DNS server unreachable): returns { valid: true, isNetworkIssue: true } to avoid blocking users
 * - If valid MX or A records found: returns { valid: true }
 * @param {string} domain
 * @param {number} timeoutMs
 * @returns {Promise<{ valid: boolean, reason?: string }>}
 */
export const verifyDomainCanReceiveMail = async (domain, timeoutMs = 5000) => {
  const normalizedDomain = domain.toLowerCase().trim();

  // Helper with timeout
  const withTimeout = (promise) => {
    return Promise.race([
      promise,
      new Promise((_, reject) => {
        const timer = setTimeout(() => {
          const err = new Error('DNS lookup timeout');
          err.code = 'ETIMEOUT';
          reject(err);
        }, timeoutMs);
        timer.unref?.();
      })
    ]);
  };

  try {
    // 1. Try MX records first
    const mxRecords = await withTimeout(resolveMx(normalizedDomain));
    if (Array.isArray(mxRecords) && mxRecords.length > 0) {
      return { valid: true };
    }
  } catch (err) {
    // If domain explicitly not found or has no MX
    if (err.code === 'ENOTFOUND' || err.code === 'ENODATA') {
      // 2. Fallback to A record check (RFC 5321 allows fallback to A record if no MX)
      try {
        const aRecords = await withTimeout(resolve4(normalizedDomain));
        if (Array.isArray(aRecords) && aRecords.length > 0) {
          return { valid: true };
        }
        return { valid: false, reason: 'domain_invalid' };
      } catch (aErr) {
        if (aErr.code === 'ENOTFOUND' || aErr.code === 'ENODATA' || aErr.code === 'ESERVFAIL') {
          return { valid: false, reason: 'domain_invalid' };
        }
        // Network timeout / SERVFAIL - do not block the user
        return { valid: true, isNetworkIssue: true };
      }
    }

    // Network issue, DNS timeout, or socket failure - continue to avoid blocking
    return { valid: true, isNetworkIssue: true };
  }

  return { valid: false, reason: 'domain_invalid' };
};

