import { useState } from "react";
import { ToolWrapper } from "@/components/tool-wrapper";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function PercentageCalculator() {
  const [value1, setValue1] = useState("");
  const [value2, setValue2] = useState("");

  const percentage = value1 && value2 ? ((parseFloat(value1) / parseFloat(value2)) * 100).toFixed(2) : "0";
  const percentOf = value1 && value2 ? ((parseFloat(value1) * parseFloat(value2)) / 100).toFixed(2) : "0";
  const increase = value1 && value2 ? (parseFloat(value1) + (parseFloat(value1) * parseFloat(value2)) / 100).toFixed(2) : "0";
  const decrease = value1 && value2 ? (parseFloat(value1) - (parseFloat(value1) * parseFloat(value2)) / 100).toFixed(2) : "0";

  return (
    <ToolWrapper
      toolName="Percentage Calculator"
      toolDescription="Calculate percentages and percentage changes easily"
      category="calculators"
      howToUse={[
        "Choose the type of calculation you need",
        "Enter the required values",
        "Results are calculated automatically",
      ]}
      relatedTools={[
        { name: "Loan Calculator", path: "/tool/loan-calculator" },
        { name: "GPA Calculator", path: "/tool/gpa-calculator" },
        { name: "Zakat Calculator", path: "/tool/zakat-calculator" },
      ]}
    >
      <Tabs defaultValue="what-is" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4" data-testid="tabs-calculator-types">
          <TabsTrigger value="what-is">What is</TabsTrigger>
          <TabsTrigger value="percent-of">% of</TabsTrigger>
          <TabsTrigger value="increase">Increase</TabsTrigger>
          <TabsTrigger value="decrease">Decrease</TabsTrigger>
        </TabsList>

        <TabsContent value="what-is" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>What is</Label>
              <Input
                type="number"
                placeholder="Value"
                value={value1}
                onChange={(e) => setValue1(e.target.value)}
                data-testid="input-value-1"
              />
            </div>
            <div className="space-y-2">
              <Label>Out of</Label>
              <Input
                type="number"
                placeholder="Total"
                value={value2}
                onChange={(e) => setValue2(e.target.value)}
                data-testid="input-value-2"
              />
            </div>
          </div>
          <Card className="p-6 text-center bg-primary/5" data-testid="result-what-is">
            <p className="text-sm text-muted-foreground mb-2">Result</p>
            <p className="text-4xl font-semibold text-primary">{percentage}%</p>
          </Card>
        </TabsContent>

        <TabsContent value="percent-of" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>What is</Label>
              <Input
                type="number"
                placeholder="Percentage"
                value={value1}
                onChange={(e) => setValue1(e.target.value)}
                data-testid="input-percent"
              />
            </div>
            <div className="space-y-2">
              <Label>% of</Label>
              <Input
                type="number"
                placeholder="Value"
                value={value2}
                onChange={(e) => setValue2(e.target.value)}
                data-testid="input-total"
              />
            </div>
          </div>
          <Card className="p-6 text-center bg-primary/5" data-testid="result-percent-of">
            <p className="text-sm text-muted-foreground mb-2">Result</p>
            <p className="text-4xl font-semibold text-primary">{percentOf}</p>
          </Card>
        </TabsContent>

        <TabsContent value="increase" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Original Value</Label>
              <Input
                type="number"
                placeholder="Value"
                value={value1}
                onChange={(e) => setValue1(e.target.value)}
                data-testid="input-original"
              />
            </div>
            <div className="space-y-2">
              <Label>Increase by %</Label>
              <Input
                type="number"
                placeholder="Percentage"
                value={value2}
                onChange={(e) => setValue2(e.target.value)}
                data-testid="input-increase"
              />
            </div>
          </div>
          <Card className="p-6 text-center bg-primary/5" data-testid="result-increase">
            <p className="text-sm text-muted-foreground mb-2">Result</p>
            <p className="text-4xl font-semibold text-primary">{increase}</p>
          </Card>
        </TabsContent>

        <TabsContent value="decrease" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Original Value</Label>
              <Input
                type="number"
                placeholder="Value"
                value={value1}
                onChange={(e) => setValue1(e.target.value)}
                data-testid="input-original-dec"
              />
            </div>
            <div className="space-y-2">
              <Label>Decrease by %</Label>
              <Input
                type="number"
                placeholder="Percentage"
                value={value2}
                onChange={(e) => setValue2(e.target.value)}
                data-testid="input-decrease"
              />
            </div>
          </div>
          <Card className="p-6 text-center bg-primary/5" data-testid="result-decrease">
            <p className="text-sm text-muted-foreground mb-2">Result</p>
            <p className="text-4xl font-semibold text-primary">{decrease}</p>
          </Card>
        </TabsContent>
      </Tabs>
    </ToolWrapper>
  );
}
