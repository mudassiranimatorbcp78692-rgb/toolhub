import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, AlertCircle, Clock } from "lucide-react";

export default function VerifyAccess() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const verifyAccess = async () => {
    if (!email) {
      alert("Please enter your email");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/verify-subscription?email=${encodeURIComponent(email)}`);
      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({ hasAccess: false, error: "Failed to verify" });
    }
    setLoading(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      verifyAccess();
    }
  };

  return (
    <div className="min-h-screen py-12 px-4 bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold mb-2">Verify Your Access</h1>
          <p className="text-muted-foreground">
            Check if your Pro/Enterprise subscription is active
          </p>
        </div>

        <Card className="p-8 mb-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Enter your email"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <Button
              onClick={verifyAccess}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              {loading ? "Checking..." : "Check Access"}
            </Button>
          </div>
        </Card>

        {result && (
          <Card
            className={`p-8 ${
              result.hasAccess
                ? "border-green-200 bg-green-50"
                : "border-red-200 bg-red-50"
            }`}
          >
            <div className="flex gap-4">
              {result.hasAccess ? (
                <CheckCircle2 className="w-12 h-12 text-green-600 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-12 h-12 text-red-600 flex-shrink-0" />
              )}
              <div className="flex-1">
                {result.hasAccess ? (
                  <>
                    <h2 className="text-2xl font-bold text-green-900 mb-2">
                      ✅ Pro Access Active!
                    </h2>
                    <div className="space-y-2 text-green-800">
                      <p>
                        <strong>Plan:</strong> {result.planName}
                      </p>
                      <p>
                        <strong>Email:</strong> {result.email}
                      </p>
                      <p>
                        <strong>Activated:</strong>{" "}
                        {new Date(result.activatedAt).toLocaleDateString()}
                      </p>
                      {result.expiresAt && (
                        <p className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          <strong>Expires:</strong>{" "}
                          {new Date(result.expiresAt).toLocaleDateString()}
                          {result.daysRemaining && (
                            <span className="ml-2">
                              ({result.daysRemaining} days left)
                            </span>
                          )}
                        </p>
                      )}
                    </div>
                    <div className="mt-4 p-3 bg-green-100 rounded text-sm text-green-900">
                      🎉 You can now access all Pro features!
                    </div>
                  </>
                ) : (
                  <>
                    <h2 className="text-2xl font-bold text-red-900 mb-2">
                      ❌ No Active Subscription
                    </h2>
                    <p className="text-red-800 mb-4">
                      {result.message || "This email does not have an active subscription."}
                    </p>
                    <div className="space-y-2">
                      <p className="text-sm text-red-700">
                        To get Pro access:
                      </p>
                      <ol className="list-decimal list-inside text-sm text-red-700 space-y-1">
                        <li>Go to /pricing</li>
                        <li>Select Pro or Enterprise plan</li>
                        <li>Make payment with your preferred method</li>
                        <li>Wait for admin verification (usually 2 hours)</li>
                        <li>Check access again here</li>
                      </ol>
                    </div>
                  </>
                )}
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
