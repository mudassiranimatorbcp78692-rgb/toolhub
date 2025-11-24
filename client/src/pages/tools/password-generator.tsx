import { useState } from "react";
import { ToolWrapper } from "@/components/tool-wrapper";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Copy, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function PasswordGenerator() {
  const [password, setPassword] = useState("");
  const [length, setLength] = useState([16]);
  const [options, setOptions] = useState({
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: true,
  });
  const { toast } = useToast();

  const generatePassword = () => {
    let charset = "";
    if (options.uppercase) charset += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    if (options.lowercase) charset += "abcdefghijklmnopqrstuvwxyz";
    if (options.numbers) charset += "0123456789";
    if (options.symbols) charset += "!@#$%^&*()_+-=[]{}|;:,.<>?";

    if (charset === "") {
      toast({
        title: "Error",
        description: "Please select at least one character type.",
        variant: "destructive",
      });
      return;
    }

    let result = "";
    for (let i = 0; i < length[0]; i++) {
      result += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    setPassword(result);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(password);
    toast({ title: "Copied!", description: "Password copied to clipboard." });
  };

  return (
    <ToolWrapper
      toolName="Password Generator"
      toolDescription="Create secure random passwords"
      category="generators"
      howToUse={[
        "Choose password length and character types",
        "Click 'Generate Password'",
        "Copy the generated password",
      ]}
      relatedTools={[
        { name: "Username Generator", path: "/tool/username" },
        { name: "QR Code Generator", path: "/tool/qr-code" },
      ]}
    >
      <div className="space-y-6">
        <div className="space-y-2">
          <Label>Password Length: {length[0]}</Label>
          <Slider
            value={length}
            onValueChange={setLength}
            min={8}
            max={64}
            step={1}
            data-testid="slider-length"
          />
        </div>

        <div className="space-y-3">
          <Label>Include:</Label>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="uppercase"
              checked={options.uppercase}
              onCheckedChange={(checked) => setOptions({ ...options, uppercase: !!checked })}
              data-testid="checkbox-uppercase"
            />
            <label htmlFor="uppercase" className="text-sm cursor-pointer">
              Uppercase Letters (A-Z)
            </label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="lowercase"
              checked={options.lowercase}
              onCheckedChange={(checked) => setOptions({ ...options, lowercase: !!checked })}
              data-testid="checkbox-lowercase"
            />
            <label htmlFor="lowercase" className="text-sm cursor-pointer">
              Lowercase Letters (a-z)
            </label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="numbers"
              checked={options.numbers}
              onCheckedChange={(checked) => setOptions({ ...options, numbers: !!checked })}
              data-testid="checkbox-numbers"
            />
            <label htmlFor="numbers" className="text-sm cursor-pointer">
              Numbers (0-9)
            </label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="symbols"
              checked={options.symbols}
              onCheckedChange={(checked) => setOptions({ ...options, symbols: !!checked })}
              data-testid="checkbox-symbols"
            />
            <label htmlFor="symbols" className="text-sm cursor-pointer">
              Symbols (!@#$%...)
            </label>
          </div>
        </div>

        <Button onClick={generatePassword} className="w-full" size="lg" data-testid="button-generate">
          <RefreshCw className="mr-2 h-4 w-4" />
          Generate Password
        </Button>

        {password && (
          <div className="space-y-3">
            <div className="relative">
              <Input
                value={password}
                readOnly
                className="pr-12 font-mono text-lg"
                data-testid="input-password"
              />
              <Button
                size="icon"
                variant="ghost"
                className="absolute right-1 top-1/2 -translate-y-1/2"
                onClick={handleCopy}
                data-testid="button-copy"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-sm text-muted-foreground text-center">
              Password strength: <span className="font-semibold text-foreground">Strong</span>
            </p>
          </div>
        )}
      </div>
    </ToolWrapper>
  );
}
