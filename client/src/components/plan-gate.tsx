import { ReactNode } from 'react';
import { AlertCircle, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import { usePlanCheck } from '@/hooks/use-plan-check';

interface PlanGateProps {
  children: ReactNode;
  toolId: string;
  toolName: string;
  requiredPlan?: 'Pro' | 'Enterprise';
}

export function PlanGate({ children, toolId, toolName, requiredPlan = 'Pro' }: PlanGateProps) {
  const { userPlan, isToolAllowed } = usePlanCheck(toolId);

  if (!isToolAllowed()) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="max-w-md mx-auto">
          <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg p-6">
            <div className="flex items-start gap-3">
              <Lock className="h-6 w-6 text-amber-600 dark:text-amber-400 mt-1 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="font-semibold text-amber-900 dark:text-amber-100">
                  🔒 Premium Tool
                </h3>
                <p className="text-sm text-amber-800 dark:text-amber-200 mt-2">
                  <strong>{toolName}</strong> is available for {requiredPlan} and Enterprise subscribers only.
                </p>
                <p className="text-xs text-amber-700 dark:text-amber-300 mt-3">
                  {userPlan.hasAccess
                    ? `Your current plan (${userPlan.plan}) doesn't have access to this tool.`
                    : "You don't have an active subscription. Subscribe to access premium tools!"}
                </p>

                <div className="flex gap-2 mt-4">
                  <Link href="/pricing">
                    <Button className="w-full" variant="default" size="sm">
                      View Plans
                    </Button>
                  </Link>
                  {userPlan.hasAccess && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        localStorage.removeItem('userEmail');
                        window.location.reload();
                      }}
                    >
                      Switch Account
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
