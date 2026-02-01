import { logger } from './logger.js';

export interface Metrics {
  archiveCount: number;
  errorCount: number;
  totalCostUSD: number;
  lastArchiveTimestamp: number | null;
}

interface AlertConfig {
  maxDailyArchives: number;
  maxDailyErrors: number;
  maxDailyCostUSD: number;
}

export class Monitor {
  private metrics: Metrics = {
    archiveCount: 0,
    errorCount: 0,
    totalCostUSD: 0,
    lastArchiveTimestamp: null,
  };
  
  private alertConfig: AlertConfig;
  private lastResetDate: string;
  
  constructor(config?: Partial<AlertConfig>) {
    this.alertConfig = {
      maxDailyArchives: config?.maxDailyArchives ?? 50,
      maxDailyErrors: config?.maxDailyErrors ?? 10,
      maxDailyCostUSD: config?.maxDailyCostUSD ?? 5,
    };
    
    this.lastResetDate = this.getCurrentDate();
    
    logger.info('Monitor initialized', { alertConfig: this.alertConfig });
  }
  
  private getCurrentDate(): string {
    return new Date().toISOString().split('T')[0];
  }
  
  private checkDailyReset(): void {
    const currentDate = this.getCurrentDate();
    if (currentDate !== this.lastResetDate) {
      logger.info('Daily metrics reset', { 
        previousDate: this.lastResetDate,
        currentDate,
        previousMetrics: this.metrics 
      });
      
      this.metrics = {
        archiveCount: 0,
        errorCount: 0,
        totalCostUSD: 0,
        lastArchiveTimestamp: null,
      };
      
      this.lastResetDate = currentDate;
    }
  }
  
  recordArchive(costUSD: number = 0): void {
    this.checkDailyReset();
    
    this.metrics.archiveCount++;
    this.metrics.totalCostUSD += costUSD;
    this.metrics.lastArchiveTimestamp = Date.now();
    
    logger.info('Archive recorded', { 
      count: this.metrics.archiveCount,
      cost: costUSD,
      totalCost: this.metrics.totalCostUSD 
    });
    
    this.checkAlerts();
  }
  
  recordError(error: Error | string): void {
    this.checkDailyReset();
    
    this.metrics.errorCount++;
    
    logger.error('Error recorded', { 
      errorCount: this.metrics.errorCount,
      error: error instanceof Error ? error.message : error 
    });
    
    this.checkAlerts();
  }
  
  private checkAlerts(): void {
    const alerts: string[] = [];
    
    if (this.metrics.archiveCount > this.alertConfig.maxDailyArchives) {
      alerts.push(
        `Daily archive limit exceeded: ${this.metrics.archiveCount}/${this.alertConfig.maxDailyArchives}`
      );
    }
    
    if (this.metrics.errorCount > this.alertConfig.maxDailyErrors) {
      alerts.push(
        `Daily error limit exceeded: ${this.metrics.errorCount}/${this.alertConfig.maxDailyErrors}`
      );
    }
    
    if (this.metrics.totalCostUSD > this.alertConfig.maxDailyCostUSD) {
      alerts.push(
        `Daily cost limit exceeded: $${this.metrics.totalCostUSD.toFixed(2)}/$${this.alertConfig.maxDailyCostUSD}`
      );
    }
    
    if (alerts.length > 0) {
      logger.warn('ALERTS TRIGGERED', { alerts, metrics: this.metrics });
    }
  }
  
  getMetrics(): Metrics {
    this.checkDailyReset();
    return { ...this.metrics };
  }
  
  getStatus(): {
    metrics: Metrics;
    alerts: string[];
    healthy: boolean;
  } {
    this.checkDailyReset();
    
    const alerts: string[] = [];
    
    if (this.metrics.archiveCount > this.alertConfig.maxDailyArchives) {
      alerts.push(`Archive limit exceeded`);
    }
    
    if (this.metrics.errorCount > this.alertConfig.maxDailyErrors) {
      alerts.push(`Error limit exceeded`);
    }
    
    if (this.metrics.totalCostUSD > this.alertConfig.maxDailyCostUSD) {
      alerts.push(`Cost limit exceeded`);
    }
    
    return {
      metrics: { ...this.metrics },
      alerts,
      healthy: alerts.length === 0,
    };
  }
}
