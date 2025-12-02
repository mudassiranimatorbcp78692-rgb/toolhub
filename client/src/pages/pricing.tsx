import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, CreditCard } from "lucide-react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

export default function Pricing() {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<string | null>(null);
  const [customerEmail, setCustomerEmail] = useState<string>("");
  const [customerName, setCustomerName] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentInstructions, setPaymentInstructions] = useState<{
    html: string;
    invoiceId: string;
    message: string;
    emailSent: boolean;
  } | null>(null);
  const { toast } = useToast();

  const plans = [
    {
      name: "Free",
      price: "$0",
      period: "forever",
      description: "Perfect for individuals and light usage",
      features: [
        "All basic tools access",
        "5MB file size limit",
        "Standard processing speed",
        "Community support",
        "Ad-supported",
      ],
      cta: "Get Started",
      highlighted: false,
    },
    {
      name: "Pro",
      price: "$2",
      period: "per month",
      description: "Best for professionals and businesses",
      features: [
        "All tools with priority access",
        "50MB file size limit",
        "Lightning fast processing",
        "Priority email support",
        "No ads",
        "Save projects & history",
        "Batch processing",
        "Advanced features",
      ],
      cta: "Go Pro",
      highlighted: true,
    },
    {
      name: "Enterprise",
      price: "$5",
      period: "per month",
      description: "For teams and organizations",
      features: [
        "Everything in Pro",
        "Unlimited file size",
        "API access",
        "Team collaboration",
        "Dedicated support",
        "Custom integrations",
        "SLA guarantee",
        "Volume discounts",
      ],
      cta: "Go Enterprise",
      highlighted: false,
    },
  ];

  const paymentMethods = [
    { id: "visa", name: "Visa Card", icon: "💳", category: "2Checkout" },
    { id: "payoneer_direct", name: "Payoneer Transfer", icon: "💰", category: "Direct Payment" },
    { id: "bank_transfer", name: "Bank Transfer", icon: "🏦", category: "Direct Payment" },
    { id: "easypaisa", name: "EasyPaisa", icon: "📱", category: "Pakistan" },
    { id: "jazzcash", name: "JazzCash", icon: "📱", category: "Pakistan" },
  ];

  const handlePlanSelection = (planName: string) => {
    if (planName === "Free") {
      toast({
        title: "Free Plan Activated",
        description: "You can now access all basic tools!",
      });
      return;
    }
    setSelectedPlan(planName);
    setSelectedPayment(null);
  };

  const handlePaymentConfirm = async () => {
    if (!selectedPayment || !selectedPlan || !customerEmail || !customerName) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields before proceeding",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    try {
      // Get plan details
      const plan = plans.find(p => p.name === selectedPlan);
      if (!plan) return;

      const isDirectPayment = ["payoneer_direct", "bank_transfer", "easypaisa", "jazzcash"].includes(selectedPayment);

      if (isDirectPayment) {
        // Handle direct payment (custom payment method)
        const response = await fetch("/api/custom-payment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            planName: selectedPlan,
            price: plan.price.replace("$", ""),
            email: customerEmail,
            name: customerName,
            paymentMethod: selectedPayment,
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const text = await response.text();
        if (!text) {
          throw new Error('Empty response from server');
        }

        let data;
        try {
          data = JSON.parse(text);
        } catch {
          throw new Error(`Invalid JSON response: ${text.substring(0, 100)}`);
        }

        if (data.success) {
          setPaymentInstructions({
            html: data.paymentInstructions || "",
            invoiceId: data.invoiceId,
            message: data.message,
            emailSent: data.emailSent || false,
          });
          setSelectedPlan(null);
          setSelectedPayment(null);
          setCustomerEmail("");
          setCustomerName("");
        } else {
          throw new Error(data.error || "Failed to create payment order");
        }
      } else {
        // Handle 2Checkout payment
        const response = await fetch("/api/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            planName: selectedPlan,
            price: plan.price.replace("$", ""),
            email: customerEmail,
            name: customerName,
            paymentMethod: selectedPayment,
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const text = await response.text();
        if (!text) {
          throw new Error('Empty response from server');
        }

        let data;
        try {
          data = JSON.parse(text);
        } catch {
          throw new Error(`Invalid JSON response: ${text.substring(0, 100)}`);
        }

        if (data.success && data.checkoutUrl) {
          // Redirect to 2Checkout
          window.location.href = data.checkoutUrl;
        } else {
          throw new Error(data.error || "Failed to initiate checkout");
        }
      }
    } catch (error) {
      console.error("Payment error:", error);
      toast({
        title: "❌ Payment Error",
        description: error instanceof Error ? error.message : "Failed to process payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-semibold mb-4" data-testid="text-page-title">
            Choose Your Plan
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Start for free, upgrade when you need more power
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={`p-8 relative ${plan.highlighted ? "border-primary shadow-lg" : ""}`}
              data-testid={`card-plan-${plan.name.toLowerCase()}`}
            >
              {plan.highlighted && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2" data-testid="badge-popular">
                  Most Popular
                </Badge>
              )}

              <div className="text-center mb-6">
                <h3 className="text-2xl font-semibold mb-2" data-testid={`text-plan-name-${plan.name.toLowerCase()}`}>
                  {plan.name}
                </h3>
                <div className="mb-2">
                  <span className="text-4xl font-semibold" data-testid={`text-plan-price-${plan.name.toLowerCase()}`}>
                    {plan.price}
                  </span>
                  {plan.price !== "Custom" && (
                    <span className="text-muted-foreground ml-2">/ {plan.period}</span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{plan.description}</p>
              </div>

              <Button
                variant={plan.highlighted ? "default" : "outline"}
                className="w-full mb-6"
                size="lg"
                onClick={() => handlePlanSelection(plan.name)}
                data-testid={`button-${plan.name.toLowerCase()}-cta`}
              >
                {plan.cta}
              </Button>

              <div className="space-y-3">
                {plan.features.map((feature, index) => (
                  <div key={index} className="flex items-start gap-3" data-testid={`feature-${plan.name.toLowerCase()}-${index}`}>
                    <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>

        {/* Payment Instructions Dialog */}
        <Dialog open={!!paymentInstructions} onOpenChange={(open) => !open && setPaymentInstructions(null)}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Payment Instructions - Invoice #{paymentInstructions?.invoiceId}</DialogTitle>
              <DialogDescription>
                {paymentInstructions?.emailSent 
                  ? "✅ Instructions have been sent to your email. Details below:" 
                  : "📋 Please follow these payment instructions:"}
              </DialogDescription>
            </DialogHeader>
            
            <div className="bg-blue-50 p-4 rounded-lg mb-4 border border-blue-200">
              <p className="text-sm text-blue-900 font-medium">{paymentInstructions?.message}</p>
            </div>

            <div 
              className="prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: paymentInstructions?.html || "" }}
            />

            <div className="flex gap-2 pt-4">
              <Button
                className="flex-1"
                onClick={() => {
                  if (paymentInstructions?.html) {
                    navigator.clipboard.writeText(paymentInstructions.html);
                    toast({
                      title: "Copied",
                      description: "Instructions copied to clipboard",
                    });
                  }
                }}
              >
                Copy Instructions
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setPaymentInstructions(null)}
              >
                Done
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Payment Method Dialog */}
        <Dialog open={!!selectedPlan} onOpenChange={(open) => !open && setSelectedPlan(null)}>
          <DialogContent className="max-w-md" data-testid="dialog-payment-methods">
            <DialogHeader>
              <DialogTitle>Enter Your Details</DialogTitle>
              <DialogDescription>
                Provide your information for the {selectedPlan} subscription
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Full Name *</label>
                <input
                  type="text"
                  placeholder="John Doe"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg mt-1 dark:bg-slate-900 dark:text-white dark:border-slate-700 dark:placeholder-slate-400"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Email Address *</label>
                <input
                  type="email"
                  placeholder="john@example.com"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg mt-1 dark:bg-slate-900 dark:text-white dark:border-slate-700 dark:placeholder-slate-400"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Select Payment Method *</label>
                <div className="space-y-3 mt-2">
                  {["2Checkout", "Direct Payment", "Pakistan"].map((category) => (
                    <div key={category}>
                      <p className="text-xs font-semibold text-muted-foreground mb-2">{category}</p>
                      <div className="space-y-2">
                        {paymentMethods
                          .filter((m) => m.category === category)
                          .map((method) => (
                            <div
                              key={method.id}
                              onClick={() => setSelectedPayment(method.id)}
                              className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                                selectedPayment === method.id
                                  ? "border-primary bg-primary/5"
                                  : "border-border hover-elevate"
                              }`}
                              data-testid={`payment-method-${method.id}`}
                            >
                              <div className="flex items-center gap-3">
                                <div className="text-xl">{method.icon}</div>
                                <p className="font-medium text-sm">{method.name}</p>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-3 pt-4">
              <Button
                className="w-full"
                onClick={handlePaymentConfirm}
                disabled={!selectedPayment || !customerEmail || !customerName || isProcessing}
                data-testid="button-confirm-payment"
              >
                <CreditCard className="w-4 h-4 mr-2" />
                {isProcessing ? "Processing..." : "Proceed to Payment"}
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setSelectedPlan(null);
                  setSelectedPayment(null);
                  setCustomerEmail("");
                  setCustomerName("");
                }}
                data-testid="button-cancel-payment"
              >
                Cancel
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* FAQ Section */}
        <div className="mt-20">
          <h2 className="text-3xl font-semibold text-center mb-12">
            Frequently Asked Questions
          </h2>
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Can I cancel anytime?</h3>
              <p className="text-muted-foreground">
                Yes, you can cancel your subscription at any time. No questions asked, no cancellation fees.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">What payment methods do you accept?</h3>
              <p className="text-muted-foreground">
                We accept Visa cards and Payoneer for secure, fast payments. All transactions are processed securely.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Is there a free trial for Pro?</h3>
              <p className="text-muted-foreground">
                Yes, all Pro features come with a 14-day free trial. No credit card required.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Are my files secure?</h3>
              <p className="text-muted-foreground">
                Absolutely. All processing happens in your browser. We never store your files on our servers.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
