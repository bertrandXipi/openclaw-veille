import { logger } from './logger.js';

// Whitelist de domaines autorisés
const ALLOWED_DOMAINS = [
  'reddit.com',
  'news.ycombinator.com',
  'youtube.com',
  'youtu.be',
  'github.com',
  'arxiv.org',
  'medium.com',
  'substack.com',
  'twitter.com',
  'x.com',
  'linkedin.com',
  'dev.to',
  'stackoverflow.com',
  'techcrunch.com',
  'theverge.com',
  'arstechnica.com',
  'wired.com',
];

// Patterns dangereux dans les tags/notes
const DANGEROUS_PATTERNS = [
  /ignore\s+previous\s+instructions/i,
  /disregard\s+all\s+previous/i,
  /forget\s+everything/i,
  /system\s*:/i,
  /assistant\s*:/i,
  /<script/i,
  /javascript:/i,
  /on\w+\s*=/i, // onclick=, onerror=, etc.
];

export function validateUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    
    // Vérifier protocole
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      logger.warn('Invalid protocol', { url, protocol: parsed.protocol });
      return false;
    }
    
    // Vérifier domaine dans whitelist
    const hostname = parsed.hostname.replace(/^www\./, '');
    const isAllowed = ALLOWED_DOMAINS.some(domain => 
      hostname === domain || hostname.endsWith(`.${domain}`)
    );
    
    if (!isAllowed) {
      logger.warn('Domain not in whitelist', { url, hostname });
      return false;
    }
    
    logger.debug('URL validated', { url });
    return true;
  } catch (error) {
    logger.error('URL parsing failed', { url, error: String(error) });
    return false;
  }
}

export function sanitizeTags(tags: string[]): string[] {
  return tags
    .map(tag => tag.trim().toLowerCase())
    .filter(tag => {
      // Vérifier longueur
      if (tag.length === 0 || tag.length > 50) {
        logger.warn('Tag length invalid', { tag });
        return false;
      }
      
      // Vérifier patterns dangereux
      for (const pattern of DANGEROUS_PATTERNS) {
        if (pattern.test(tag)) {
          logger.warn('Dangerous pattern in tag', { tag, pattern: pattern.source });
          return false;
        }
      }
      
      // Vérifier caractères autorisés (alphanumeric, -, _)
      if (!/^[a-z0-9_-]+$/.test(tag)) {
        logger.warn('Invalid characters in tag', { tag });
        return false;
      }
      
      return true;
    })
    .slice(0, 10); // Max 10 tags
}

export function sanitizeNote(note: string): string {
  // Limite de taille
  if (note.length > 1000) {
    logger.warn('Note too long, truncating', { originalLength: note.length });
    note = note.slice(0, 1000);
  }
  
  // Vérifier patterns dangereux
  for (const pattern of DANGEROUS_PATTERNS) {
    if (pattern.test(note)) {
      logger.error('Dangerous pattern detected in note', { pattern: pattern.source });
      throw new Error('Note contains dangerous pattern');
    }
  }
  
  return note.trim();
}
