import { useState } from "react";
import { ToolWrapper } from "@/components/tool-wrapper";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const loremWords = [
  "lorem", "ipsum", "dolor", "sit", "amet", "consectetur", "adipiscing", "elit",
  "sed", "do", "eiusmod", "tempor", "incididunt", "ut", "labore", "et", "dolore",
  "magna", "aliqua", "enim", "ad", "minim", "veniam", "quis", "nostrud",
  "exercitation", "ullamco", "laboris", "nisi", "aliquip", "ex", "ea", "commodo",
  "consequat", "duis", "aute", "irure", "in", "reprehenderit", "voluptate",
  "velit", "esse", "cillum", "fugiat", "nulla", "pariatur", "excepteur", "sint",
  "occaecat", "cupidatat", "non", "proident", "sunt", "culpa", "qui", "officia",
  "deserunt", "mollit", "anim", "id", "est", "laborum",
];

export default function LoremIpsum() {
  const [outputText, setOutputText] = useState<string>("");
  const [mode, setMode] = useState<"paragraphs" | "words" | "sentences">("paragraphs");
  const [count, setCount] = useState<string>("3");
  const { toast } = useToast();

  const generateSentence = (wordCount: number = 10): string => {
    const words: string[] = [];
    for (let i = 0; i < wordCount; i++) {
      words.push(loremWords[Math.floor(Math.random() * loremWords.length)]);
    }
    return words[0].charAt(0).toUpperCase() + words[0].slice(1) + " " + words.slice(1).join(" ") + ".";
  };

  const generateParagraph = (): string => {
    const sentenceCount = 4 + Math.floor(Math.random() * 3);
    const sentences: string[] = [];
    for (let i = 0; i < sentenceCount; i++) {
      sentences.push(generateSentence(8 + Math.floor(Math.random() * 7)));
    }
    return sentences.join(" ");
  };

  const handleGenerate = () => {
    const num = parseInt(count) || 1;
    let result = "";

    if (mode === "paragraphs") {
      const paragraphs: string[] = [];
      for (let i = 0; i < num; i++) {
        paragraphs.push(generateParagraph());
      }
      result = paragraphs.join("\n\n");
    } else if (mode === "words") {
      const words: string[] = [];
      for (let i = 0; i < num; i++) {
        words.push(loremWords[Math.floor(Math.random() * loremWords.length)]);
      }
      result = words.join(" ");
    } else if (mode === "sentences") {
      const sentences: string[] = [];
      for (let i = 0; i < num; i++) {
        sentences.push(generateSentence());
      }
      result = sentences.join(" ");
    }

    setOutputText(result);
    toast({
      title: "Generated!",
      description: `Generated ${num} ${mode}.`,
    });
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(outputText);
    toast({
      title: "Copied!",
      description: "Text copied to clipboard.",
    });
  };

  return (
    <ToolWrapper
      toolName="Lorem Ipsum Generator"
      toolDescription="Generate placeholder text for your designs"
      category="generators"
      howToUse={[
        "Choose generation mode (paragraphs, words, or sentences)",
        "Enter the number to generate",
        "Click 'Generate' to create placeholder text",
        "Copy the generated text",
      ]}
      relatedTools={[
        { name: "Word Counter", path: "/tool/word-counter" },
        { name: "Password Generator", path: "/tool/password" },
        { name: "Username Generator", path: "/tool/username" },
      ]}
    >
      <div className="space-y-6">
        <div className="space-y-4">
          <div>
            <Label>Mode</Label>
            <RadioGroup value={mode} onValueChange={(v) => setMode(v as typeof mode)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="paragraphs" id="paragraphs" data-testid="radio-paragraphs" />
                <Label htmlFor="paragraphs" className="cursor-pointer">Paragraphs</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="sentences" id="sentences" data-testid="radio-sentences" />
                <Label htmlFor="sentences" className="cursor-pointer">Sentences</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="words" id="words" data-testid="radio-words" />
                <Label htmlFor="words" className="cursor-pointer">Words</Label>
              </div>
            </RadioGroup>
          </div>

          <div>
            <Label htmlFor="count">Count</Label>
            <Input
              id="count"
              type="number"
              value={count}
              onChange={(e) => setCount(e.target.value)}
              placeholder="3"
              min="1"
              max="100"
              data-testid="input-count"
            />
          </div>
        </div>

        <Button
          onClick={handleGenerate}
          className="w-full"
          size="lg"
          data-testid="button-generate"
        >
          Generate Lorem Ipsum
        </Button>

        {outputText && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium">Generated Text</label>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopy}
                data-testid="button-copy"
              >
                <Copy className="mr-2 h-4 w-4" />
                Copy
              </Button>
            </div>
            <Textarea
              value={outputText}
              readOnly
              className="min-h-[300px]"
              data-testid="textarea-output"
            />
          </div>
        )}
      </div>
    </ToolWrapper>
  );
}
