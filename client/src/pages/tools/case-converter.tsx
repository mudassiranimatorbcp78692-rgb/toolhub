import { useState } from "react";
import { ToolWrapper } from "@/components/tool-wrapper";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function CaseConverter() {
  const [text, setText] = useState("");
  const { toast } = useToast();

  const convertCase = (type: string) => {
    let result = "";
    switch (type) {
      case "upper":
        result = text.toUpperCase();
        break;
      case "lower":
        result = text.toLowerCase();
        break;
      case "title":
        result = text.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
        break;
      case "sentence":
        result = text.toLowerCase().replace(/(^\w|\.\s+\w)/g, (char) => char.toUpperCase());
        break;
      case "camel":
        result = text.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (_, char) => char.toUpperCase());
        break;
      case "snake":
        result = text.toLowerCase().replace(/\s+/g, '_');
        break;
    }
    setText(result);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied!", description: "Text copied to clipboard." });
  };

  return (
    <ToolWrapper
      toolName="Case Converter"
      toolDescription="Convert text to uppercase, lowercase, title case, and more"
      category="text"
      howToUse={[
        "Type or paste your text",
        "Click one of the conversion buttons",
        "Copy the converted text",
      ]}
      relatedTools={[
        { name: "Word Counter", path: "/tool/word-counter" },
        { name: "Remove Duplicates", path: "/tool/remove-duplicates" },
      ]}
    >
      <div className="space-y-6">
        <Textarea
          placeholder="Type or paste your text here..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={10}
          data-testid="input-text"
        />

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <Button variant="outline" onClick={() => convertCase("upper")} data-testid="button-uppercase">
            UPPERCASE
          </Button>
          <Button variant="outline" onClick={() => convertCase("lower")} data-testid="button-lowercase">
            lowercase
          </Button>
          <Button variant="outline" onClick={() => convertCase("title")} data-testid="button-titlecase">
            Title Case
          </Button>
          <Button variant="outline" onClick={() => convertCase("sentence")} data-testid="button-sentencecase">
            Sentence case
          </Button>
          <Button variant="outline" onClick={() => convertCase("camel")} data-testid="button-camelcase">
            camelCase
          </Button>
          <Button variant="outline" onClick={() => convertCase("snake")} data-testid="button-snakecase">
            snake_case
          </Button>
        </div>

        <Button onClick={handleCopy} className="w-full" data-testid="button-copy">
          <Copy className="mr-2 h-4 w-4" />
          Copy Text
        </Button>
      </div>
    </ToolWrapper>
  );
}
