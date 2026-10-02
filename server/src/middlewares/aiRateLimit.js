const WINDOW_MS = 60 * 60 * 1000;
const MAX_REQUESTS = 10;

const requestLog = new Map();

const aiRateLimit = (req, res, next) => {
  const now = Date.now();
  const userId = req.user.id;

  const recent = (requestLog.get(userId) || []).filter(
    (timestamp) => now - timestamp < WINDOW_MS,
  );

  if (recent.length >= MAX_REQUESTS) {
    const retryAfterSec = Math.ceil((WINDOW_MS - (now - recent[0])) / 1000);

    res.set("Retry-After", String(retryAfterSec));
    return res.status(429).json({
      error: `You've reached the generation limit. Try again in ${Math.ceil(retryAfterSec / 60)} minutes.`,
    });
  }

  recent.push(now);
  requestLog.set(userId, recent);
  next();
};

module.exports = aiRateLimit;
