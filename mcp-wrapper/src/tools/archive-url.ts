import { z } from 'zod';
import { logger } from '../logger.js';
import { validateUrl, sanitizeTags, sanitizeNote } from '../validation.js';
import { RateLimiter } from '../rate-limiter.js';
import { Monitor } from '../monitoring.js';

// Input/Output schemas
export const ArchiveUrlInputSchema = z.object({
  url: z.string().url(),
  tags: z.array(z.string()).optional().default([]),
  note: z.string().optional().default(''),
});

export const ArchiveUrlOutputSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  markdown_path: z.string().optional(),
  notebook_url: z.string().optional(),
  source_id: z.string().optional(),
  error: z.string().optional(),
});

export type ArchiveUrlInput = z.infer<typeof ArchiveUrlInputSchema>;
export type ArchiveUrlOutput = z.infer<typeof ArchiveUrlOutputSchema>;

// Singletons
const rateLimiter = new RateLimiter();
const monitor = new Monitor();

// Second-brain API URL and token (configured via env)
const SECOND_BRAIN_API_URL = process.env.SECOND_BRAIN_API_URL || 'http://localhost:3100';
const SECOND_BRAIN_API_TOKEN = process.env.SECOND_BRAIN_API_TOKEN || '';

// Response type from second-brain API
interface SecondBrainResponse {
  success: boolean;
  title?: string;
  markdown_path?: string;
  notebook_url?: string;
  source_id?: string;
  error?: string;
  duration_ms?: number;
}

/**
 * Archive URL tool implementation
 * Calls second-brain HTTP API for the actual archiving
 */
export async function archiveUrl(input: ArchiveUrlInput): Promise<ArchiveUrlOutput> {
  const startTime = Date.now();
  
  logger.info('Archive URL request', { url: input.url, tags: input.tags });
  
  try {
    // 1. Validation
    if (!validateUrl(input.url)) {
      logger.warn('URL validation failed', { url: input.url });
      return {
        success: false,
        message: 'URL not allowed (domain not in whitelist)',
        error: 'VALIDATION_ERROR',
      };
    }
    
    const sanitizedTags = sanitizeTags(input.tags || []);
    const sanitizedNote = input.note ? sanitizeNote(input.note) : '';
    
    // 2. Rate limiting
    const rateLimitCheck = rateLimiter.canMakeRequest();
    if (!rateLimitCheck.allowed) {
      logger.warn('Rate limit exceeded', { reason: rateLimitCheck.reason });
      return {
        success: false,
        message: `Rate limit exceeded: ${rateLimitCheck.reason}`,
        error: 'RATE_LIMIT_EXCEEDED',
      };
    }
    
    // 3. Call second-brain API
    logger.info('Calling second-brain API...', { apiUrl: SECOND_BRAIN_API_URL });
    
    const response = await fetch(`${SECOND_BRAIN_API_URL}/archive`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SECOND_BRAIN_API_TOKEN}`,
      },
      body: JSON.stringify({
        url: input.url,
        tags: sanitizedTags,
        note: sanitizedNote,
        source: 'openclaw',
      }),
    });
    
    const result = await response.json() as SecondBrainResponse;
    
    if (!response.ok || !result.success) {
      throw new Error(result.error || 'Archive failed');
    }
    
    // 4. Record metrics
    rateLimiter.recordRequest();
    monitor.recordArchive(0.05); // Estimate $0.05 per archive
    
    const duration = Date.now() - startTime;
    logger.info('Archive completed', { 
      url: input.url, 
      duration,
      markdownPath: result.markdown_path,
      notebookUrl: result.notebook_url 
    });
    
    return {
      success: true,
      message: `Successfully archived: ${result.title}`,
      markdown_path: result.markdown_path,
      notebook_url: result.notebook_url,
      source_id: result.source_id,
    };
    
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error('Archive failed', { 
      url: input.url, 
      error: error instanceof Error ? error.message : String(error),
      duration 
    });
    
    monitor.recordError(error instanceof Error ? error : new Error(String(error)));
    
    return {
      success: false,
      message: 'Archive failed',
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Get rate limiter stats
 */
export function getRateLimiterStats() {
  return rateLimiter.getStats();
}

/**
 * Get monitoring status
 */
export function getMonitoringStatus() {
  return monitor.getStatus();
}
