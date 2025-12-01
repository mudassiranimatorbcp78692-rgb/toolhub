import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, CheckCircle2, AlertCircle } from "lucide-react";

export default function CheckPaymentStatus() {
  const [invoiceId, setInvoiceId] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<null | "pending" | "approved" | "rejected">(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const checkStatus = async () => {
    if (!invoiceId || !email) {
      alert("Please enter invoice ID and email");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/check-payment-status?invoice=${invoiceId}&email=${encodeURIComponent(email)}`);
      const data = await response.json();

      if (data.status === "completed") {
        setStatus("approved");
        setMessage(`✅ Payment approved! Your ${data.planName} plan is now active.`);
      } else if (data.status === "pending_manual") {
        setStatus("pending");
        setMessage("⏳ Payment verification in progress. We'll notify you soon.");
      } else {
        setStatus("rejected");
        setMessage("❌ Payment status not found.");
      }
    } catch (error) {
      setMessage("Error checking status. Try again.");
      setStatus("rejected");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen py-12 px-4 bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="max-w-md mx-auto">
        <Card className="p-8">
          <h2 className="text-2xl font-semibold mb-6">Check Payment Status</h2>

          <div className="space-y-4 mb-6">
            <div>
              <label className="text-sm font-medium">Invoice ID</label>
              <input
                type="text"
                placeholder="INV-1234567890"
                value={invoiceId}
                onChange={(e) => setInvoiceId(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg mt-1 font-mono"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Email Address</label>
              <input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg mt-1"
              />
            </div>
            <Button onClick={checkStatus} disabled={loading} className="w-full">
              {loading ? "Checking..." : "Check Status"}
            </Button>
          </div>

          {status && (
            <div className={`p-4 rounded-lg border-2 text-center ${
              status === "approved" ? "bg-green-50 border-green-200" :
              status === "pending" ? "bg-yellow-50 border-yellow-200" :
              "bg-red-50 border-red-200"
            }`}>
              <div className="flex justify-center mb-3">
                {status === "approved" && <CheckCircle2 className="w-10 h-10 text-green-600" />}
                {status === "pending" && <Clock className="w-10 h-10 text-yellow-600 animate-spin" />}
                {status === "rejected" && <AlertCircle className="w-10 h-10 text-red-600" />}
              </div>
              <p className="font-semibold mb-2">{
                status === "approved" ? "Payment Approved" :
                status === "pending" ? "Pending Verification" :
                "Not Found"
              }</p>
              <p className="text-sm">{message}</p>
            </div>
          )}
        </Card>

        <div className="mt-6 p-4 bg-white rounded-lg border">
          <h3 className="font-semibold mb-2">💡 Tips</h3>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Invoice ID is in your payment instructions email</li>
            <li>• Payments verified within 2 hours</li>
            <li>• You'll receive activation email when approved</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
