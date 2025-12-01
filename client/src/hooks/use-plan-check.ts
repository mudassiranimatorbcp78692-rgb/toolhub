import { useState, useEffect } from 'react';
import { PLAN_LIMITS, PlanType, isToolAvailable } from '@/lib/plan-limits';

export interface UserPlan {
  plan: PlanType;
  email?: string;
  hasAccess: boolean;
}

const DEFAULT_PLAN: UserPlan = {
  plan: 'Free',
  hasAccess: false,
};

export function usePlanCheck(toolId?: string) {
  const [userPlan, setUserPlan] = useState<UserPlan>(DEFAULT_PLAN);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkUserPlan();
  }, []);

  const checkUserPlan = async () => {
    try {
      setLoading(true);
      // Get email from localStorage or prompt user
      const storedEmail = localStorage.getItem('userEmail');
      
      if (!storedEmail) {
        setUserPlan(DEFAULT_PLAN);
        setLoading(false);
        return;
      }

      // Verify subscription status
      const response = await fetch(
        `/api/verify-subscription?email=${encodeURIComponent(storedEmail)}`
      );
      const data = await response.json();

      if (data.hasAccess && data.planName) {
        setUserPlan({
          plan: data.planName as PlanType,
          email: storedEmail,
          hasAccess: true,
        });
      } else {
        setUserPlan(DEFAULT_PLAN);
      }
    } catch (err) {
      console.error('Error checking plan:', err);
      setError('Failed to verify subscription');
      setUserPlan(DEFAULT_PLAN);
    } finally {
      setLoading(false);
    }
  };

  const checkFileSize = (fileSizeInBytes: number): { allowed: boolean; maxSize: number } => {
    const maxSizeMB = PLAN_LIMITS[userPlan.plan].maxFileSize;
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    return {
      allowed: fileSizeInBytes <= maxSizeBytes,
      maxSize: maxSizeMB,
    };
  };

  const isToolAllowed = (): boolean => {
    if (!toolId) return userPlan.plan !== 'Free';
    return isToolAvailable(toolId, userPlan.plan);
  };

  const canBatchProcess = (): boolean => {
    return PLAN_LIMITS[userPlan.plan].batchProcessing;
  };

  const canUseAdvancedFeatures = (): boolean => {
    return PLAN_LIMITS[userPlan.plan].advancedFeatures;
  };

  return {
    userPlan,
    loading,
    error,
    planLimits: PLAN_LIMITS[userPlan.plan],
    checkFileSize,
    isToolAllowed,
    canBatchProcess,
    canUseAdvancedFeatures,
    refetch: checkUserPlan,
  };
}
