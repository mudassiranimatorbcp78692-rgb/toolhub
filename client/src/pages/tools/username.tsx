import { useState } from "react";
import { ToolWrapper } from "@/components/tool-wrapper";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";

const adjectives = [
  "Swift", "Brave", "Clever", "Mighty", "Silent", "Golden", "Silver", "Electric",
  "Cosmic", "Shadow", "Bright", "Dark", "Wild", "Free", "Noble", "Royal",
  "Ancient", "Modern", "Digital", "Cyber", "Quantum", "Stellar", "Lunar", "Solar"
];

const nouns = [
  "Tiger", "Eagle", "Phoenix", "Dragon", "Wolf", "Lion", "Falcon", "Panda",
  "Warrior", "Ninja", "Samurai", "Knight", "Wizard", "Sage", "Coder", "Hacker",
  "Gamer", "Player", "Hunter", "Seeker", "Dreamer", "Thinker", "Builder", "Creator"
];

export default function UsernameGenerator() {
  const [baseName, setBaseName] = useState<string>("");
  const [generatedUsernames, setGeneratedUsernames] = useState<string[]>([]);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeUnderscore, setIncludeUnderscore] = useState(false);
  const [copiedUsername, setCopiedUsername] = useState<string>("");
  const { toast } = useToast();

  const generateUsername = (base: string = ""): string => {
    const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    const num = includeNumbers ? Math.floor(Math.random() * 999) : "";
    const separator = includeUnderscore ? "_" : "";
    
    if (base) {
      const patterns = [
        `${base}${separator}${noun}${num}`,
        `${adj}${separator}${base}${num}`,
        `${base}${separator}${adj}${num}`,
        `${base}${num}${separator}${noun}`,
      ];
      return patterns[Math.floor(Math.random() * patterns.length)];
    } else {
      return `${adj}${separator}${noun}${num}`;
    }
  };

  const handleGenerate = () => {
    const usernames: string[] = [];
    for (let i = 0; i < 10; i++) {
      usernames.push(generateUsername(baseName));
    }
    setGeneratedUsernames(usernames);
    toast({
      title: "Usernames Generated!",
      description: "Created 10 unique username suggestions.",
    });
  };

  const handleCopy = (username: string) => {
    navigator.clipboard.writeText(username);
    setCopiedUsername(username);
    toast({
      title: "Copied!",
      description: `${username} copied to clipboard.`,
    });
    setTimeout(() => setCopiedUsername(""), 2000);
  };

  return (
    <ToolWrapper
      toolName="Username Generator"
      toolDescription="Generate creative and unique usernames"
      category="generators"
      howToUse={[
        "Optionally enter a base name to include",
        "Configure generation options",
        "Click 'Generate Usernames' to create suggestions",
        "Click any username to copy it",
      ]}
      relatedTools={[
        { name: "Password Generator", path: "/tool/password" },
        { name: "QR Code Generator", path: "/tool/qr-code" },
        { name: "Lorem Ipsum Generator", path: "/tool/lorem-ipsum" },
      ]}
    >
      <div className="space-y-6">
        <div>
          <Label htmlFor="baseName">Base Name (Optional)</Label>
          <Input
            id="baseName"
            value={baseName}
            onChange={(e) => setBaseName(e.target.value)}
            placeholder="e.g., John, Gamer, Pro"
            data-testid="input-basename"
          />
          <p className="text-xs text-muted-foreground mt-2">
            Leave empty for random usernames, or enter a name to include in suggestions
          </p>
        </div>

        <div className="space-y-3">
          <Label>Options</Label>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="numbers"
              checked={includeNumbers}
              onCheckedChange={(checked) => setIncludeNumbers(checked as boolean)}
              data-testid="checkbox-numbers"
            />
            <Label htmlFor="numbers" className="cursor-pointer text-sm">
              Include numbers
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="underscore"
              checked={includeUnderscore}
              onCheckedChange={(checked) => setIncludeUnderscore(checked as boolean)}
              data-testid="checkbox-underscore"
            />
            <Label htmlFor="underscore" className="cursor-pointer text-sm">
              Use underscores as separator
            </Label>
          </div>
        </div>

        <Button
          onClick={handleGenerate}
          className="w-full"
          size="lg"
          data-testid="button-generate"
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Generate Usernames
        </Button>

        {generatedUsernames.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-semibold">Generated Usernames</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {generatedUsernames.map((username, index) => (
                <button
                  key={index}
                  onClick={() => handleCopy(username)}
                  className="flex items-center justify-between p-3 border rounded-md hover-elevate active-elevate-2 text-left group"
                  data-testid={`username-${index}`}
                >
                  <span className="font-mono text-sm">{username}</span>
                  <Copy className={`h-4 w-4 transition-colors ${copiedUsername === username ? 'text-green-500' : 'text-muted-foreground group-hover:text-foreground'}`} />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </ToolWrapper>
  );
}
