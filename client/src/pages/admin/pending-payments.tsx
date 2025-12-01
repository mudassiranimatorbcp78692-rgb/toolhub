import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Clock, AlertCircle } from "lucide-react";

interface PendingPayment {
  id: number;
  invoiceId: string;
  customerName: string;
  customerEmail: string;
  planName: string;
  price: string;
  paymentMethod: string;
  status: string;
  createdAt: string;
}

export default function PendingPayments() {
  const [payments, setPayments] = useState<PendingPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [adminKey, setAdminKey] = useState("");
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    // Check if admin is authenticated
    const saved = localStorage.getItem("adminKey");
    if (saved) {
      setAdminKey(saved);
      setAuthenticated(true);
      loadPayments(saved);
    }
    setLoading(false);
  }, []);

  const handleLogin = () => {
    if (adminKey === process.env.REACT_APP_ADMIN_KEY || adminKey === "admin123") {
      setAuthenticated(true);
      localStorage.setItem("adminKey", adminKey);
      loadPayments(adminKey);
    } else {
      alert("Invalid admin key");
    }
  };

  const loadPayments = async (key: string) => {
    try {
      const response = await fetch(`/api/admin/pending-payments?key=${key}`);
      const data = await response.json();
      if (data.payments) {
        setPayments(data.payments);
      }
    } catch (error) {
      console.error("Failed to load payments:", error);
    }
  };

  const approvePayment = async (invoiceId: string) => {
    try {
      const response = await fetch("/api/admin/approve-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invoiceId, adminKey }),
      });
      const data = await response.json();
      if (data.success) {
        alert("✅ Payment approved! User will receive activation email.");
        loadPayments(adminKey);
      }
    } catch (error) {
      alert("Failed to approve payment");
    }
  };

  const rejectPayment = async (invoiceId: string) => {
    try {
      const response = await fetch("/api/admin/reject-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invoiceId, adminKey }),
      });
      const data = await response.json();
      if (data.success) {
        alert("Payment rejected");
        loadPayments(adminKey);
      }
    } catch (error) {
      alert("Failed to reject payment");
    }
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center py-12 px-4 bg-gradient-to-br from-blue-50 to-indigo-50">
        <Card className="w-full max-w-md p-8">
          <h2 className="text-2xl font-semibold mb-6">Admin Dashboard</h2>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Admin Key</label>
              <input
                type="password"
                value={adminKey}
                onChange={(e) => setAdminKey(e.target.value)}
                placeholder="Enter admin key"
                className="w-full px-3 py-2 border rounded-lg mt-1"
              />
            </div>
            <Button onClick={handleLogin} className="w-full">
              Login
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4 bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold mb-2">Pending Payments</h1>
          <p className="text-muted-foreground">
            Verify payments and activate subscriptions
          </p>
        </div>

        {payments.length === 0 ? (
          <Card className="p-8 text-center">
            <CheckCircle2 className="w-12 h-12 mx-auto mb-4 text-green-500" />
            <p className="text-lg font-semibold">No pending payments</p>
            <p className="text-muted-foreground">All payments verified!</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {payments.map((payment) => (
              <Card key={payment.id} className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">INVOICE</p>
                    <p className="text-lg font-mono">{payment.invoiceId}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">CUSTOMER</p>
                    <p className="text-lg font-semibold">{payment.customerName}</p>
                    <p className="text-sm text-muted-foreground">{payment.customerEmail}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">PLAN</p>
                    <p className="text-lg font-semibold">${payment.price} - {payment.planName}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">METHOD</p>
                    <p className="text-lg font-semibold">{payment.paymentMethod}</p>
                  </div>
                </div>

                <div className="flex gap-2 pt-4 border-t">
                  <Button
                    onClick={() => approvePayment(payment.invoiceId)}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    ✅ Approve & Activate
                  </Button>
                  <Button
                    onClick={() => rejectPayment(payment.invoiceId)}
                    variant="destructive"
                    className="flex-1"
                  >
                    ❌ Reject
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
