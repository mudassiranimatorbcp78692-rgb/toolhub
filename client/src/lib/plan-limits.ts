// Plan features and limits configuration
export type PlanType = 'Free' | 'Pro' | 'Enterprise';

export interface PlanLimits {
  maxFileSize: number; // in MB
  maxBatchSize: number; // number of files
  batchProcessing: boolean;
  advancedFeatures: boolean;
  processingSpeed: 'standard' | 'priority' | 'lightning';
  adsEnabled: boolean;
  apiAccess: boolean;
}

export const PLAN_LIMITS: Record<PlanType, PlanLimits> = {
  Free: {
    maxFileSize: 5,
    maxBatchSize: 1,
    batchProcessing: false,
    advancedFeatures: false,
    processingSpeed: 'standard',
    adsEnabled: true,
    apiAccess: false,
  },
  Pro: {
    maxFileSize: 50,
    maxBatchSize: 10,
    batchProcessing: true,
    advancedFeatures: true,
    processingSpeed: 'priority',
    adsEnabled: false,
    apiAccess: false,
  },
  Enterprise: {
    maxFileSize: 1000, // 1GB
    maxBatchSize: 100,
    batchProcessing: true,
    advancedFeatures: true,
    processingSpeed: 'lightning',
    adsEnabled: false,
    apiAccess: true,
  },
};

// All tools available to all users - limits only differ by plan
export function isToolAvailable(_toolId: string, _plan: PlanType): boolean {
  return true; // All tools available to all users
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}
