import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { AlertCircle, CheckCircle2, User } from "lucide-react";

export function MyAccountModal() {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    hasAccess: boolean;
    planName?: string;
    expiresAt?: string;
    daysRemaining?: number;
  } | null>(null);

  const handleCheckAccess = async () => {
    if (!email || !email.includes("@")) {
      alert("Please enter a valid email address");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `/api/verify-subscription?email=${encodeURIComponent(email)}`
      );
      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error("Error checking access:", error);
      setResult({ hasAccess: false });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        className="gap-2"
      >
        <User className="h-4 w-4" />
        <span className="hidden sm:inline">My Account</span>
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Check Your Access
            </DialogTitle>
            <DialogDescription>
              Enter your email to verify your subscription status
            </DialogDescription>
          </DialogHeader>

          {!result ? (
            <div className="space-y-4">
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") handleCheckAccess();
                }}
              />
              <Button
                onClick={handleCheckAccess}
                disabled={loading}
                className="w-full"
              >
                {loading ? "Checking..." : "Check Access"}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {result.hasAccess ? (
                <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-green-900 dark:text-green-100">
                        ✅ Pro Access Active!
                      </h3>
                      <div className="mt-2 space-y-1 text-sm text-green-800 dark:text-green-200">
                        <p>
                          <strong>Plan:</strong> {result.planName}
                        </p>
                        {result.expiresAt && (
                          <>
                            <p>
                              <strong>Expires:</strong>{" "}
                              {new Date(result.expiresAt).toLocaleDateString()}
                            </p>
                            {result.daysRemaining !== undefined && (
                              <p>
                                <strong>Time Left:</strong>{" "}
                                {result.daysRemaining} days
                              </p>
                            )}
                          </>
                        )}
                      </div>
                      <p className="text-xs text-green-700 dark:text-green-300 mt-2">
                        🎉 You can now access all premium tools!
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-amber-50 dark:bg-amber-950 p-4 rounded-lg border border-amber-200 dark:border-amber-800">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-amber-900 dark:text-amber-100">
                        ❌ No Active Subscription
                      </h3>
                      <p className="mt-2 text-sm text-amber-800 dark:text-amber-200">
                        This email does not have an active Pro or Enterprise
                        subscription.
                      </p>
                      <p className="text-xs text-amber-700 dark:text-amber-300 mt-2">
                        Click "Go Pro" to upgrade and unlock premium features!
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setResult(null);
                    setEmail("");
                  }}
                  className="flex-1"
                >
                  Check Another Email
                </Button>
                <Button
                  onClick={() => setOpen(false)}
                  className="flex-1"
                  variant={result.hasAccess ? "default" : "outline"}
                >
                  {result.hasAccess ? "Close" : "Go Pro"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
