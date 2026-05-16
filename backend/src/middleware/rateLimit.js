const buckets = new Map();

export function rateLimit({ windowMs = 60_000, max = 60, keyPrefix = 'global' } = {}) {
  return (req, res, next) => {
    const key = `${keyPrefix}:${getClientKey(req)}`;
    const now = Date.now();
    const bucket = buckets.get(key);

    if (!bucket || bucket.resetAt <= now) {
      buckets.set(key, { count: 1, resetAt: now + windowMs });
      setRateHeaders(res, max, max - 1, now + windowMs);
      return next();
    }

    bucket.count += 1;
    const remaining = Math.max(0, max - bucket.count);
    setRateHeaders(res, max, remaining, bucket.resetAt);

    if (bucket.count > max) {
      return res.status(429).json({
        message: 'Too many requests. Please slow down.',
        retryAfter: Math.ceil((bucket.resetAt - now) / 1000)
      });
    }

    next();
  };
}

function getClientKey(req) {
  return req.user?.id || req.ip || req.headers['x-forwarded-for'] || 'unknown';
}

function setRateHeaders(res, limit, remaining, resetAt) {
  res.setHeader('RateLimit-Limit', limit);
  res.setHeader('RateLimit-Remaining', remaining);
  res.setHeader('RateLimit-Reset', Math.ceil(resetAt / 1000));
}

setInterval(() => {
  const now = Date.now();
  for (const [key, bucket] of buckets.entries()) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}, 60_000).unref();
