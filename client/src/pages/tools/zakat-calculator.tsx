import { useState } from "react";
import { ToolWrapper } from "@/components/tool-wrapper";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CurrencyConfig {
  symbol: string;
  name: string;
  nisabMultiplier: number; // Relative to USD
}

const CURRENCIES: Record<string, CurrencyConfig> = {
  USD: { symbol: "$", name: "US Dollar", nisabMultiplier: 1 },
  EUR: { symbol: "€", name: "Euro", nisabMultiplier: 0.92 },
  GBP: { symbol: "£", name: "British Pound", nisabMultiplier: 0.79 },
  AUD: { symbol: "A$", name: "Australian Dollar", nisabMultiplier: 1.53 },
  CAD: { symbol: "C$", name: "Canadian Dollar", nisabMultiplier: 1.36 },
  INR: { symbol: "₹", name: "Indian Rupee", nisabMultiplier: 83.12 },
  PKR: { symbol: "Rs", name: "Pakistani Rupee", nisabMultiplier: 278 },
  AED: { symbol: "د.إ", name: "UAE Dirham", nisabMultiplier: 3.67 },
  SAR: { symbol: "﷼", name: "Saudi Riyal", nisabMultiplier: 3.75 },
  SGD: { symbol: "S$", name: "Singapore Dollar", nisabMultiplier: 1.35 },
};

export default function ZakatCalculator() {
  const [currency, setCurrency] = useState<string>("USD");
  const [nisabThreshold, setNisabThreshold] = useState<string>("");
  const [cash, setCash] = useState<string>("");
  const [goldPrice, setGoldPrice] = useState<string>("");
  const [goldGrams, setGoldGrams] = useState<string>("");
  const [silverPrice, setSilverPrice] = useState<string>("");
  const [silverGrams, setSilverGrams] = useState<string>("");
  const [investments, setInvestments] = useState<string>("");
  const [businessAssets, setBusinessAssets] = useState<string>("");
  const [debts, setDebts] = useState<string>("");
  const [zakatAmount, setZakatAmount] = useState<number | null>(null);
  const [processing, setProcessing] = useState(false);
  const { toast } = useToast();

  const BASE_NISAB = 4455; // Approximate nisab in USD (based on silver)
  const ZAKAT_RATE = 0.025; // 2.5%

  const currencyConfig = CURRENCIES[currency];
  const suggestedNisab = BASE_NISAB * currencyConfig.nisabMultiplier;
  const userNisab = parseFloat(nisabThreshold) || 0;

  // Auto-calculate gold value
  const goldValue = (parseFloat(goldPrice) || 0) * (parseFloat(goldGrams) || 0);
  
  // Auto-calculate silver value
  const silverValue = (parseFloat(silverPrice) || 0) * (parseFloat(silverGrams) || 0);

  const calculateZakat = () => {
    if (!nisabThreshold.trim()) {
      toast({
        title: "Nisab Threshold Required",
        description: "Please enter the nisab threshold value.",
        variant: "destructive",
      });
      return;
    }

    setProcessing(true);

    const totalAssets = 
      (parseFloat(cash) || 0) +
      goldValue +
      silverValue +
      (parseFloat(investments) || 0) +
      (parseFloat(businessAssets) || 0);

    const totalDebts = parseFloat(debts) || 0;
    const zakatable = totalAssets - totalDebts;

    if (zakatable < userNisab) {
      setZakatAmount(0);
      toast({
        title: "Below Nisab Threshold",
        description: `Your zakatable wealth (${currencyConfig.symbol}${zakatable.toFixed(2)}) is below the nisab threshold (${currencyConfig.symbol}${userNisab.toFixed(2)}). No zakat is due.`,
      });
    } else {
      const zakat = zakatable * ZAKAT_RATE;
      setZakatAmount(zakat);
      toast({
        title: "Zakat Calculated!",
        description: `Your zakat amount is ${currencyConfig.symbol}${zakat.toFixed(2)}.`,
      });
    }

    setProcessing(false);
  };

  return (
    <ToolWrapper
      toolName="Zakat Calculator"
      toolDescription="Calculate Islamic charity (Zakat) on your wealth with auto-calculated precious metals"
      category="calculators"
      howToUse={[
        "Select your currency (USD, EUR, GBP, AUD, CAD, INR, PKR, AED, SAR, SGD)",
        "Enter gold/silver prices and amounts for auto-calculation of values",
        "Or manually enter gold and silver values",
        "Enter other assets (cash, investments, business assets)",
        "Enter outstanding debts",
        "Click 'Calculate Zakat' to get the amount",
        "Zakat is 2.5% of wealth above nisab threshold",
      ]}
      relatedTools={[
        { name: "Percentage Calculator", path: "/tool/percentage-calculator" },
        { name: "Loan Calculator", path: "/tool/loan-calculator" },
        { name: "GPA Calculator", path: "/tool/gpa-calculator" },
      ]}
    >
      <div className="space-y-6">
        {/* Currency Selector */}
        <div className="space-y-2">
          <Label htmlFor="currency">Select Currency</Label>
          <Select value={currency} onValueChange={setCurrency}>
            <SelectTrigger id="currency" data-testid="select-currency">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(CURRENCIES).map(([code, config]) => (
                <SelectItem key={code} value={code} data-testid={`option-${code}`}>
                  {config.symbol} {config.name} ({code})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Nisab Threshold Input */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="nisab">Nisab Threshold ({currencyConfig.symbol})</Label>
            <span className="text-xs text-muted-foreground">
              Suggested: {currencyConfig.symbol}{suggestedNisab.toFixed(2)}
            </span>
          </div>
          <Input
            id="nisab"
            type="number"
            value={nisabThreshold}
            onChange={(e) => setNisabThreshold(e.target.value)}
            placeholder={suggestedNisab.toFixed(2)}
            step="0.01"
            data-testid="input-nisab"
          />
          <p className="text-xs text-muted-foreground">
            Enter the nisab threshold value for your region. The suggested value is approximately based on silver rates.
          </p>
        </div>

        <div className="space-y-4">
          {/* Cash & Savings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="cash">Cash & Savings ({currencyConfig.symbol})</Label>
              <Input
                id="cash"
                type="number"
                value={cash}
                onChange={(e) => setCash(e.target.value)}
                placeholder="0"
                data-testid="input-cash"
              />
            </div>
            <div className="md:col-span-1" />
          </div>

          {/* Gold Section */}
          <div className="border rounded-lg p-4 bg-muted/30 space-y-3">
            <h3 className="font-semibold text-sm">Gold ({currencyConfig.symbol})</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="goldPrice">Gold Price per Gram ({currencyConfig.symbol})</Label>
                <Input
                  id="goldPrice"
                  type="number"
                  value={goldPrice}
                  onChange={(e) => setGoldPrice(e.target.value)}
                  placeholder="0"
                  step="0.01"
                  data-testid="input-gold-price"
                />
              </div>
              <div>
                <Label htmlFor="goldGrams">Gold Amount (grams)</Label>
                <Input
                  id="goldGrams"
                  type="number"
                  value={goldGrams}
                  onChange={(e) => setGoldGrams(e.target.value)}
                  placeholder="0"
                  step="0.01"
                  data-testid="input-gold-grams"
                />
              </div>
              <div>
                <Label htmlFor="goldValue">Gold Value ({currencyConfig.symbol})</Label>
                <Input
                  id="goldValue"
                  type="number"
                  value={goldValue > 0 ? goldValue.toFixed(2) : "0"}
                  readOnly
                  placeholder="Auto-calculated"
                  className="bg-muted"
                  data-testid="input-gold-value"
                />
              </div>
            </div>
          </div>

          {/* Silver Section */}
          <div className="border rounded-lg p-4 bg-muted/30 space-y-3">
            <h3 className="font-semibold text-sm">Silver ({currencyConfig.symbol})</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="silverPrice">Silver Price per Gram ({currencyConfig.symbol})</Label>
                <Input
                  id="silverPrice"
                  type="number"
                  value={silverPrice}
                  onChange={(e) => setSilverPrice(e.target.value)}
                  placeholder="0"
                  step="0.01"
                  data-testid="input-silver-price"
                />
              </div>
              <div>
                <Label htmlFor="silverGrams">Silver Amount (grams)</Label>
                <Input
                  id="silverGrams"
                  type="number"
                  value={silverGrams}
                  onChange={(e) => setSilverGrams(e.target.value)}
                  placeholder="0"
                  step="0.01"
                  data-testid="input-silver-grams"
                />
              </div>
              <div>
                <Label htmlFor="silverValue">Silver Value ({currencyConfig.symbol})</Label>
                <Input
                  id="silverValue"
                  type="number"
                  value={silverValue > 0 ? silverValue.toFixed(2) : "0"}
                  readOnly
                  placeholder="Auto-calculated"
                  className="bg-muted"
                  data-testid="input-silver-value"
                />
              </div>
            </div>
          </div>

          {/* Other Assets */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="investments">Investments ({currencyConfig.symbol})</Label>
              <Input
                id="investments"
                type="number"
                value={investments}
                onChange={(e) => setInvestments(e.target.value)}
                placeholder="0"
                data-testid="input-investments"
              />
            </div>
            <div>
              <Label htmlFor="business">Business Assets ({currencyConfig.symbol})</Label>
              <Input
                id="business"
                type="number"
                value={businessAssets}
                onChange={(e) => setBusinessAssets(e.target.value)}
                placeholder="0"
                data-testid="input-business"
              />
            </div>
            <div>
              <Label htmlFor="debts">Outstanding Debts ({currencyConfig.symbol})</Label>
              <Input
                id="debts"
                type="number"
                value={debts}
                onChange={(e) => setDebts(e.target.value)}
                placeholder="0"
                data-testid="input-debts"
              />
            </div>
          </div>

          <div className="p-4 bg-muted/50 rounded-lg text-sm space-y-2">
            <p className="text-muted-foreground">
              <span className="font-semibold">Nisab Threshold (Your Entry):</span> {currencyConfig.symbol}{userNisab.toFixed(2)}
            </p>
            <p className="text-muted-foreground">
              <span className="font-semibold">Zakat Rate:</span> {ZAKAT_RATE * 100}% of wealth above nisab
            </p>
            <p className="text-muted-foreground">
              <span className="font-semibold">Selected Currency:</span> {currencyConfig.name}
            </p>
          </div>
        </div>

        <Button
          onClick={calculateZakat}
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
            "Calculate Zakat"
          )}
        </Button>

        {zakatAmount !== null && (
          <div className="space-y-4">
            <div className="p-6 border rounded-lg bg-primary/5 text-center">
              <p className="text-sm text-muted-foreground mb-2">Zakat Due</p>
              <p className="text-4xl font-bold text-primary" data-testid="text-zakat">
                {currencyConfig.symbol}{zakatAmount.toFixed(2)}
              </p>
            </div>

            {zakatAmount === 0 && (
              <div className="p-4 border rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground">
                  Your zakatable wealth is below the nisab threshold. No zakat is due at this time.
                </p>
              </div>
            )}

            {zakatAmount > 0 && (
              <div className="p-4 border rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground">
                  This is a simplified calculation. For precise zakat calculation, please consult with a qualified Islamic scholar.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </ToolWrapper>
  );
}
