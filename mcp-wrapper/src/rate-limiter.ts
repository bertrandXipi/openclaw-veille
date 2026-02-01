import { logger } from './logger.js';

interface RateLimitConfig {
  dailyLimit: number;
  hourlyLimit: number;
  minIntervalSeconds: number;
}

interface RequestRecord {
  timestamp: number;
}

export class RateLimiter {
  private requests: RequestRecord[] = [];
  private config: RateLimitConfig;
  
  constructor(config?: Partial<RateLimitConfig>) {
    this.config = {
      dailyLimit: config?.dailyLimit ?? 30,
      hourlyLimit: config?.hourlyLimit ?? 10,
      minIntervalSeconds: config?.minIntervalSeconds ?? 30,
    };
    
    logger.info('RateLimiter initialized', { config: this.config });
  }
  
  private cleanOldRequests(): void {
    const now = Date.now();
    const oneDayAgo = now - 24 * 60 * 60 * 1000;
    
    this.requests = this.requests.filter(req => req.timestamp > oneDayAgo);
  }
  
  private getRequestsInWindow(windowMs: number): number {
    const now = Date.now();
    const cutoff = now - windowMs;
    
    return this.requests.filter(req => req.timestamp > cutoff).length;
  }
  
  private getLastRequestTime(): number | null {
    if (this.requests.length === 0) return null;
    return Math.max(...this.requests.map(req => req.timestamp));
  }
  
  canMakeRequest(): { allowed: boolean; reason?: string; retryAfter?: number } {
    this.cleanOldRequests();
    
    const now = Date.now();
    
    // Vérifier intervalle minimum
    const lastRequest = this.getLastRequestTime();
    if (lastRequest !== null) {
      const timeSinceLastRequest = (now - lastRequest) / 1000;
      if (timeSinceLastRequest < this.config.minIntervalSeconds) {
        const retryAfter = Math.ceil(this.config.minIntervalSeconds - timeSinceLastRequest);
        logger.warn('Rate limit: minimum interval not met', { 
          timeSinceLastRequest,
          minInterval: this.config.minIntervalSeconds,
          retryAfter 
        });
        return { 
          allowed: false, 
          reason: `Minimum interval of ${this.config.minIntervalSeconds}s not met`,
          retryAfter 
        };
      }
    }
    
    // Vérifier limite horaire
    const hourlyRequests = this.getRequestsInWindow(60 * 60 * 1000);
    if (hourlyRequests >= this.config.hourlyLimit) {
      logger.warn('Rate limit: hourly limit exceeded', { 
        hourlyRequests,
        limit: this.config.hourlyLimit 
      });
      return { 
        allowed: false, 
        reason: `Hourly limit of ${this.config.hourlyLimit} requests exceeded`,
        retryAfter: 3600 
      };
    }
    
    // Vérifier limite quotidienne
    const dailyRequests = this.getRequestsInWindow(24 * 60 * 60 * 1000);
    if (dailyRequests >= this.config.dailyLimit) {
      logger.warn('Rate limit: daily limit exceeded', { 
        dailyRequests,
        limit: this.config.dailyLimit 
      });
      return { 
        allowed: false, 
        reason: `Daily limit of ${this.config.dailyLimit} requests exceeded`,
        retryAfter: 86400 
      };
    }
    
    return { allowed: true };
  }
  
  recordRequest(): void {
    this.requests.push({ timestamp: Date.now() });
    logger.debug('Request recorded', { 
      totalRequests: this.requests.length,
      hourlyRequests: this.getRequestsInWindow(60 * 60 * 1000),
      dailyRequests: this.getRequestsInWindow(24 * 60 * 60 * 1000)
    });
  }
  
  getStats(): {
    hourlyRequests: number;
    dailyRequests: number;
    hourlyRemaining: number;
    dailyRemaining: number;
  } {
    this.cleanOldRequests();
    
    const hourlyRequests = this.getRequestsInWindow(60 * 60 * 1000);
    const dailyRequests = this.getRequestsInWindow(24 * 60 * 60 * 1000);
    
    return {
      hourlyRequests,
      dailyRequests,
      hourlyRemaining: Math.max(0, this.config.hourlyLimit - hourlyRequests),
      dailyRemaining: Math.max(0, this.config.dailyLimit - dailyRequests),
    };
  }
}
