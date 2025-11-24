import { useState } from "react";
import { ToolWrapper } from "@/components/tool-wrapper";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface LoanResult {
  monthlyPayment: number;
  totalPayment: number;
  totalInterest: number;
  schedule: Array<{
    month: number;
    payment: number;
    principal: number;
    interest: number;
    balance: number;
  }>;
}

export default function LoanCalculator() {
  const [principal, setPrincipal] = useState<string>("10000");
  const [rate, setRate] = useState<string>("5");
  const [years, setYears] = useState<string>("5");
  const [result, setResult] = useState<LoanResult | null>(null);
  const [processing, setProcessing] = useState(false);
  const { toast } = useToast();

  const calculateLoan = () => {
    const p = parseFloat(principal);
    const r = parseFloat(rate) / 100 / 12; // Monthly interest rate
    const n = parseFloat(years) * 12; // Total months

    if (!p || !r || !n || p <= 0 || r < 0 || n <= 0) {
      toast({
        title: "Invalid Input",
        description: "Please enter valid loan details.",
        variant: "destructive",
      });
      return;
    }

    setProcessing(true);

    // Monthly payment formula: M = P * (r(1+r)^n) / ((1+r)^n - 1)
    const monthlyPayment = (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    const totalPayment = monthlyPayment * n;
    const totalInterest = totalPayment - p;

    // Generate amortization schedule
    const schedule: LoanResult['schedule'] = [];
    let balance = p;

    for (let month = 1; month <= n && month <= 60; month++) { // Limit to 60 months for display
      const interestPayment = balance * r;
      const principalPayment = monthlyPayment - interestPayment;
      balance -= principalPayment;

      schedule.push({
        month,
        payment: monthlyPayment,
        principal: principalPayment,
        interest: interestPayment,
        balance: Math.max(0, balance),
      });
    }

    setResult({
      monthlyPayment,
      totalPayment,
      totalInterest,
      schedule,
    });

    toast({
      title: "Calculation Complete!",
      description: "Loan details calculated successfully.",
    });
    setProcessing(false);
  };

  return (
    <ToolWrapper
      toolName="Loan Calculator"
      toolDescription="Calculate monthly payments and amortization schedule"
      category="calculators"
      howToUse={[
        "Enter the loan amount (principal)",
        "Enter the annual interest rate",
        "Enter the loan term in years",
        "View monthly payment and amortization schedule",
      ]}
      relatedTools={[
        { name: "Percentage Calculator", path: "/tool/percentage-calculator" },
        { name: "GPA Calculator", path: "/tool/gpa-calculator" },
        { name: "Zakat Calculator", path: "/tool/zakat-calculator" },
      ]}
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="principal">Loan Amount ($)</Label>
            <Input
              id="principal"
              type="number"
              value={principal}
              onChange={(e) => setPrincipal(e.target.value)}
              placeholder="10000"
              data-testid="input-principal"
            />
          </div>
          <div>
            <Label htmlFor="rate">Interest Rate (% per year)</Label>
            <Input
              id="rate"
              type="number"
              step="0.1"
              value={rate}
              onChange={(e) => setRate(e.target.value)}
              placeholder="5"
              data-testid="input-rate"
            />
          </div>
          <div>
            <Label htmlFor="years">Loan Term (years)</Label>
            <Input
              id="years"
              type="number"
              value={years}
              onChange={(e) => setYears(e.target.value)}
              placeholder="5"
              data-testid="input-years"
            />
          </div>
        </div>

        <Button
          onClick={calculateLoan}
          disabled={processing}
          className="w-full"
          size="lg"
          data-testid="button-calculate"
        >
          {processing ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Calculating...
            </>
          ) : (
            "Calculate Loan"
          )}
        </Button>

        {result && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground mb-1">Monthly Payment</p>
                <p className="text-2xl font-semibold" data-testid="text-monthly">${result.monthlyPayment.toFixed(2)}</p>
              </div>
              <div className="p-4 border rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground mb-1">Total Payment</p>
                <p className="text-2xl font-semibold" data-testid="text-total">${result.totalPayment.toFixed(2)}</p>
              </div>
              <div className="p-4 border rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground mb-1">Total Interest</p>
                <p className="text-2xl font-semibold" data-testid="text-interest">${result.totalInterest.toFixed(2)}</p>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-3">Amortization Schedule (First 5 years)</h3>
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-muted">
                    <tr>
                      <th className="p-2 text-left">Month</th>
                      <th className="p-2 text-right">Payment</th>
                      <th className="p-2 text-right">Principal</th>
                      <th className="p-2 text-right">Interest</th>
                      <th className="p-2 text-right">Balance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.schedule.slice(0, 12).map((row) => (
                      <tr key={row.month} className="border-t" data-testid={`row-${row.month}`}>
                        <td className="p-2">{row.month}</td>
                        <td className="p-2 text-right">${row.payment.toFixed(2)}</td>
                        <td className="p-2 text-right">${row.principal.toFixed(2)}</td>
                        <td className="p-2 text-right">${row.interest.toFixed(2)}</td>
                        <td className="p-2 text-right">${row.balance.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </ToolWrapper>
  );
}
