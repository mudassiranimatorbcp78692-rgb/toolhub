import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, AlertCircle, Loader } from "lucide-react";

export default function Activate() {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");
  const [plan, setPlan] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const invoice = params.get("invoice");
    const email = params.get("email");

    if (!invoice || !email) {
      setStatus("error");
      setMessage("Missing invoice or email parameter");
      return;
    }

    // Call activation endpoint
    fetch(`/api/activate-subscription?invoice=${invoice}&email=${encodeURIComponent(email)}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setStatus("success");
          setMessage(data.message);
          setPlan(data.plan);
        } else {
          setStatus("error");
          setMessage(data.error || "Activation failed");
        }
      })
      .catch(err => {
        setStatus("error");
        setMessage(err.message || "Network error");
      });
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4">
      <Card className="w-full max-w-md p-8">
        {status === "loading" && (
          <div className="text-center">
            <Loader className="w-12 h-12 animate-spin mx-auto mb-4 text-primary" />
            <h2 className="text-xl font-semibold mb-2">Activating Subscription...</h2>
            <p className="text-muted-foreground">Please wait while we activate your {plan} plan.</p>
          </div>
        )}

        {status === "success" && (
          <div className="text-center">
            <div className="mb-4 flex justify-center">
              <CheckCircle2 className="w-16 h-16 text-green-500" />
            </div>
            <h2 className="text-2xl font-semibold mb-2">🎉 Subscription Activated!</h2>
            <p className="text-muted-foreground mb-6">{message}</p>
            <p className="text-sm mb-6">
              Your <strong>{plan}</strong> plan is now active. You can use all premium features immediately!
            </p>
            <Button
              onClick={() => window.location.href = "/tools"}
              className="w-full"
            >
              Go to Tools
            </Button>
          </div>
        )}

        {status === "error" && (
          <div className="text-center">
            <div className="mb-4 flex justify-center">
              <AlertCircle className="w-16 h-16 text-red-500" />
            </div>
            <h2 className="text-2xl font-semibold mb-2">❌ Activation Failed</h2>
            <p className="text-muted-foreground mb-6">{message}</p>
            <p className="text-sm text-muted-foreground mb-6">
              Please contact support if this issue persists.
            </p>
            <Button
              variant="outline"
              onClick={() => window.location.href = "/pricing"}
              className="w-full"
            >
              Back to Pricing
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
