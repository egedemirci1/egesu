import { NextRequest } from 'next/server';

// Spam protection for content creation
const contentCreationAttempts = new Map<string, { count: number; lastAttempt: number; blocked: boolean }>();
const MAX_CONTENT_ATTEMPTS = 20; // Max content creations per hour
const CONTENT_LOCKOUT_DURATION = 60 * 60 * 1000; // 1 hour
const MAX_DAILY_CONTENT = 100; // Max content creations per day

export function checkContentRateLimit(ip: string): boolean {
  const now = Date.now();
  const attempt = contentCreationAttempts.get(ip);

  if (!attempt) {
    return true;
  }

  // Check if IP is permanently blocked
  if (attempt.blocked) {
    return false;
  }

  // Check if lockout period has expired
  if (now - attempt.lastAttempt > CONTENT_LOCKOUT_DURATION) {
    contentCreationAttempts.delete(ip);
    return true;
  }

  // Check if daily limit exceeded
  if (attempt.count >= MAX_DAILY_CONTENT) {
    attempt.blocked = true;
    return false;
  }

  return attempt.count < MAX_CONTENT_ATTEMPTS;
}

export function recordContentCreation(ip: string): void {
  const now = Date.now();
  const attempt = contentCreationAttempts.get(ip);

  if (!attempt) {
    contentCreationAttempts.set(ip, { count: 1, lastAttempt: now, blocked: false });
  } else {
    attempt.count++;
    attempt.lastAttempt = now;
    
    // Block IP if too many content creations
    if (attempt.count >= MAX_DAILY_CONTENT) {
      attempt.blocked = true;
    }
  }
}

export function getClientIP(request: NextRequest): string {
  return request.headers.get('x-forwarded-for') || 
         request.headers.get('x-real-ip') || 
         request.headers.get('cf-connecting-ip') || 
         'unknown';
}

// Content validation
export function validateContentLength(content: string, maxLength: number = 5000): boolean {
  return content.length <= maxLength && content.trim().length > 0;
}

export function sanitizeContent(content: string): string {
  return content
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .substring(0, 5000); // Limit length
}

// Check for spam patterns
export function detectSpamPatterns(content: string): boolean {
  const spamPatterns = [
    /https?:\/\/[^\s]+/g, // URLs
    /@\w+/g, // Mentions
    /\b(buy|sell|free|click|here|now)\b/gi, // Common spam words
    /[A-Z]{5,}/g, // Excessive caps
    /(.)\1{4,}/g, // Repeated characters
  ];

  let spamScore = 0;
  spamPatterns.forEach(pattern => {
    const matches = content.match(pattern);
    if (matches) {
      spamScore += matches.length;
    }
  });

  return spamScore > 3; // If spam score > 3, consider it spam
}
