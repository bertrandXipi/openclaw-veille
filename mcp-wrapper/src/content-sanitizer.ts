import { logger } from './logger.js';

const MAX_CONTENT_SIZE = 50000; // 50k caractères

// Patterns d'injection à détecter
const INJECTION_PATTERNS = [
  /ignore\s+previous\s+instructions/i,
  /disregard\s+all\s+previous/i,
  /forget\s+everything/i,
  /new\s+instructions:/i,
  /system\s+prompt:/i,
  /you\s+are\s+now/i,
  /act\s+as\s+if/i,
  /pretend\s+to\s+be/i,
];

export function sanitizeContent(content: string): string {
  // Vérifier taille
  if (content.length > MAX_CONTENT_SIZE) {
    logger.warn('Content too large, truncating', { 
      originalSize: content.length,
      maxSize: MAX_CONTENT_SIZE 
    });
    content = content.slice(0, MAX_CONTENT_SIZE);
  }
  
  // Détecter patterns d'injection
  for (const pattern of INJECTION_PATTERNS) {
    if (pattern.test(content)) {
      logger.error('Injection pattern detected in content', { 
        pattern: pattern.source 
      });
      throw new Error(`Content contains suspicious pattern: ${pattern.source}`);
    }
  }
  
  logger.debug('Content sanitized', { size: content.length });
  return content;
}

export function detectInjectionAttempt(text: string): boolean {
  return INJECTION_PATTERNS.some(pattern => pattern.test(text));
}
