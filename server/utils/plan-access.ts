// Check if user has access to a tool based on their plan
export function hasToolAccess(userPlan: string | null | undefined, toolRequiresProPlan: boolean): boolean {
  if (!toolRequiresProPlan) {
    return true; // Free tools accessible to all
  }

  // Pro-only tools
  if (userPlan === 'Pro' || userPlan === 'Enterprise') {
    return true;
  }

  return false;
}

// Get available file size limit based on plan
export function getFileSizeLimit(userPlan: string | null | undefined): number {
  switch (userPlan) {
    case 'Enterprise':
      return 512 * 1024 * 1024; // 512MB
    case 'Pro':
      return 50 * 1024 * 1024; // 50MB
    case 'Free':
    default:
      return 5 * 1024 * 1024; // 5MB
  }
}

// Get processing speed multiplier based on plan
export function getProcessingSpeed(userPlan: string | null | undefined): number {
  switch (userPlan) {
    case 'Enterprise':
      return 1; // Fastest (1x)
    case 'Pro':
      return 1.5; // 1.5x slower than Enterprise
    case 'Free':
    default:
      return 3; // 3x slower than Enterprise
  }
}

// Get features available in each plan
export function getPlanFeatures(planName: string) {
  const features: Record<string, { features: string[]; price: number }> = {
    Free: {
      price: 0,
      features: [
        'All basic tools access',
        '5MB file size limit',
        'Standard processing speed',
        'Community support',
        'Ad-supported',
      ],
    },
    Pro: {
      price: 2,
      features: [
        'All tools with priority access',
        '50MB file size limit',
        'Lightning fast processing',
        'Priority email support',
        'No ads',
        'Save projects & history',
        'Batch processing',
        'Advanced features',
      ],
    },
    Enterprise: {
      price: 5,
      features: [
        'Everything in Pro',
        'Unlimited file size',
        'API access',
        'Team collaboration',
        'Dedicated support',
        'Custom integrations',
        'SLA guarantee',
        'Volume discounts',
      ],
    },
  };

  return features[planName] || features.Free;
}

// Format plan name for display
export function formatPlanName(plan: string | null | undefined): string {
  if (!plan) return 'Free';
  return plan.charAt(0).toUpperCase() + plan.slice(1);
}
