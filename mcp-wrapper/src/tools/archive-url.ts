import { z } from 'zod';
import { logger } from '../logger.js';
import { validateUrl, sanitizeTags, sanitizeNote } from '../validation.js';
import { sanitizeContent } from '../content-sanitizer.js';
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

/**
 * Archive URL tool implementation
 * Integrates with second-brain code for fetching, NotebookLM, and markdown generation
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
    
    // 3. Fetch content
    logger.info('Fetching content...');
    // @ts-ignore - JavaScript module without types
    const { fetchAndExtract } = await import('../../../../second-brain/batch-processor/src/fetch-content.js');
    const fetchResult = await fetchAndExtract(input.url);
    
    // 4. Sanitize content
    const sanitizedContent = sanitizeContent(fetchResult.content);
    
    // 5. Add to NotebookLM
    logger.info('Adding to NotebookLM...');
    // @ts-ignore - JavaScript module without types
    const { addToNotebookLM, getDetailedAnalysis } = await import('../../../../second-brain/batch-processor/src/notebooklm-http.js');
    
    const notebookResult = await addToNotebookLM(input.url, sanitizedContent, {
      title: fetchResult.title,
      tags: sanitizedTags,
    });
    
    // 6. Get AI analysis
    logger.info('Getting AI analysis...');
    const analysis = await getDetailedAnalysis(
      notebookResult.notebook_id,
      notebookResult.source_id
    );
    
    // 7. Generate markdown
    logger.info('Generating markdown...');
    // @ts-ignore - JavaScript module without types
    const { generateMarkdownV2 } = await import('../../../../second-brain/batch-processor/src/markdown-generator-v2.js');
    
    const item = {
      title: fetchResult.title,
      url: input.url,
      created_at: new Date().toISOString(),
      tags: [...sanitizedTags, 'ingest_source:openclaw'],
      note: sanitizedNote,
      source: 'openclaw',
    };
    
    const markdown = generateMarkdownV2(
      item,
      notebookResult,
      analysis,
      input.url,
      fetchResult
    );
    
    // 8. Save markdown file
    // @ts-ignore - JavaScript module without types
    const { saveMarkdownFile } = await import('../../../../second-brain/batch-processor/src/file-manager.js');
    const markdownPath = await saveMarkdownFile(markdown, fetchResult.title);
    
    // 9. Git commit
    logger.info('Committing to Git...');
    const simpleGit = (await import('simple-git')).default;
    const git = simpleGit('../../../../second-brain/batch-processor/workdir/repo');
    
    await git.add(markdownPath);
    await git.commit(`feat: archive ${fetchResult.title} (OpenClaw)`, [markdownPath]);
    await git.push();
    
    // 10. Record metrics
    rateLimiter.recordRequest();
    monitor.recordArchive(0.05); // Estimate $0.05 per archive
    
    const duration = Date.now() - startTime;
    logger.info('Archive completed', { 
      url: input.url, 
      duration,
      markdownPath,
      notebookUrl: notebookResult.notebook_url 
    });
    
    return {
      success: true,
      message: `Successfully archived: ${fetchResult.title}`,
      markdown_path: markdownPath,
      notebook_url: notebookResult.notebook_url,
      source_id: notebookResult.source_id,
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
export function getMonitoringStatus(): ReturnType<typeof monitor.getStatus> {
  return monitor.getStatus();
}
