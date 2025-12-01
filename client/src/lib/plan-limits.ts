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

// Tool availability by plan
export const TOOL_AVAILABILITY: Record<string, PlanType[]> = {
  // Free tools (available to all)
  'word-counter': ['Free', 'Pro', 'Enterprise'],
  'case-converter': ['Free', 'Pro', 'Enterprise'],
  'lorem-ipsum': ['Free', 'Pro', 'Enterprise'],
  'password-generator': ['Free', 'Pro', 'Enterprise'],
  'username-generator': ['Free', 'Pro', 'Enterprise'],
  'percentage-calculator': ['Free', 'Pro', 'Enterprise'],
  
  // Premium tools
  'pdf-to-jpg': ['Pro', 'Enterprise'],
  'jpg-to-pdf': ['Pro', 'Enterprise'],
  'pdf-merge': ['Pro', 'Enterprise'],
  'pdf-split': ['Pro', 'Enterprise'],
  'pdf-compress': ['Pro', 'Enterprise'],
  'pdf-rotate': ['Pro', 'Enterprise'],
  'image-compress': ['Pro', 'Enterprise'],
  'image-resize': ['Pro', 'Enterprise'],
  'image-crop': ['Pro', 'Enterprise'],
  'image-converter': ['Pro', 'Enterprise'],
  'image-to-text': ['Pro', 'Enterprise'],
  'html-to-pdf': ['Pro', 'Enterprise'],
  'qr-code': ['Pro', 'Enterprise'],
  'barcode': ['Pro', 'Enterprise'],
  'grammar-checker': ['Pro', 'Enterprise'],
  'loan-calculator': ['Free', 'Pro', 'Enterprise'],
  'gpa-calculator': ['Free', 'Pro', 'Enterprise'],
  'zakat-calculator': ['Free', 'Pro', 'Enterprise'],
};

export function isToolAvailable(toolId: string, plan: PlanType): boolean {
  const allowedPlans = TOOL_AVAILABILITY[toolId];
  return allowedPlans?.includes(plan) ?? true; // Default to available if not configured
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}
