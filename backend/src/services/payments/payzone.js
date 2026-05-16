const PAYZONE_PAYMENT_BASE_URL = process.env.PAYZONE_PAYMENT_BASE_URL || 'https://paiement.payzone.ma';
const PAYZONE_API_VERSION = process.env.PAYZONE_API_VERSION || '002.70';

export function isPayzoneConfigured() {
  return Boolean(process.env.PAYZONE_ORIGINATOR_ID && process.env.PAYZONE_PASSWORD);
}

export async function preparePayzonePayment({ deposit, match, user, returnUrl, cancelUrl }) {
  ensurePayzoneConfigured();

  const merchantToken = deposit.id;
  const payload = {
    apiVersion: PAYZONE_API_VERSION,
    merchantToken,
    order: {
      orderID: deposit.id,
      amount: Math.round(Number(deposit.amount) * 100),
      currency: 'MAD',
      description: `HKick deposit - ${match.title}`
    },
    shopper: {
      email: user.email,
      firstName: user.profile?.name || 'HKick',
      lastName: 'Player'
    },
    returnUrl,
    cancelUrl
  };

  const response = await fetch(`${PAYZONE_PAYMENT_BASE_URL}/payment/prepare`, {
    method: 'POST',
    headers: {
      Authorization: getBasicAuthHeader(),
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.errorMessage || data.message || 'Payzone payment preparation failed');
    error.statusCode = 502;
    throw error;
  }

  return {
    providerPaymentId: String(data.paymentID || data.transactionID || data.paymentId || merchantToken),
    providerToken: String(data.merchantToken || merchantToken),
    checkoutUrl: data.paymentUrl || data.redirectUrl || data.url,
    raw: data
  };
}

export async function getPayzonePaymentStatus(providerToken) {
  ensurePayzoneConfigured();

  const response = await fetch(`${PAYZONE_PAYMENT_BASE_URL}/payment/${providerToken}/status?apiVersion=${PAYZONE_API_VERSION}`, {
    headers: { Authorization: getBasicAuthHeader() }
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.errorMessage || data.message || 'Payzone status lookup failed');
    error.statusCode = 502;
    throw error;
  }

  return {
    status: data.status,
    raw: data
  };
}

export function mapPayzoneStatus(status) {
  const normalized = String(status || '').toLowerCase();
  if (['authorized', 'captured', 'paid', 'success', 'successful'].includes(normalized)) return 'RESERVED';
  if (['refunded', 'credited'].includes(normalized)) return 'REFUNDED';
  if (['expired', 'cancelled', 'canceled', 'not authorized', 'failed'].includes(normalized)) return 'PENDING';
  return 'PENDING';
}

function ensurePayzoneConfigured() {
  if (!isPayzoneConfigured()) {
    const error = new Error('Payzone is not configured. Set PAYZONE_ORIGINATOR_ID and PAYZONE_PASSWORD.');
    error.statusCode = 503;
    throw error;
  }
}

function getBasicAuthHeader() {
  const credentials = Buffer.from(`${process.env.PAYZONE_ORIGINATOR_ID}:${process.env.PAYZONE_PASSWORD}`).toString('base64');
  return `Basic ${credentials}`;
}
