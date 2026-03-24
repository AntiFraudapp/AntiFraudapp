const COOLDOWN_KEY = "antifraud_report_cooldown";
const COOLDOWN_DURATION = 60000; // 1 minute in milliseconds

export interface RateLimitResult {
  allowed: boolean;
  remainingTime: number;
}

export function checkRateLimit(): RateLimitResult {
  const lastSubmission = localStorage.getItem(COOLDOWN_KEY);

  if (!lastSubmission) {
    return { allowed: true, remainingTime: 0 };
  }

  const lastTime = Number.parseInt(lastSubmission, 10);
  const now = Date.now();
  const elapsed = now - lastTime;

  if (elapsed >= COOLDOWN_DURATION) {
    return { allowed: true, remainingTime: 0 };
  }

  const remainingTime = Math.ceil((COOLDOWN_DURATION - elapsed) / 1000);
  return { allowed: false, remainingTime };
}

export function recordSubmission(): void {
  localStorage.setItem(COOLDOWN_KEY, Date.now().toString());
}

export function clearRateLimit(): void {
  localStorage.removeItem(COOLDOWN_KEY);
}
