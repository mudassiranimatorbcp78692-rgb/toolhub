import { useState } from "react";
import { ToolWrapper } from "@/components/tool-wrapper";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";

export default function WordCounter() {
  const [text, setText] = useState("");

  const words = text.trim() === "" ? 0 : text.trim().split(/\s+/).length;
  const characters = text.length;
  const charactersNoSpaces = text.replace(/\s/g, "").length;
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
  const paragraphs = text.split(/\n\n+/).filter(p => p.trim().length > 0).length;
  const readingTime = Math.ceil(words / 200); // Average reading speed

  return (
    <ToolWrapper
      toolName="Word Counter"
      toolDescription="Count words, characters, sentences, and reading time"
      category="text"
      howToUse={[
        "Type or paste your text in the text area",
        "Statistics update automatically as you type",
        "View word count, character count, sentences, and estimated reading time",
      ]}
      relatedTools={[
        { name: "Case Converter", path: "/tool/case-converter" },
        { name: "Remove Duplicates", path: "/tool/remove-duplicates" },
        { name: "Grammar Checker", path: "/tool/grammar-checker" },
      ]}
    >
      <div className="space-y-6">
        <Textarea
          placeholder="Type or paste your text here..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={12}
          className="resize-none"
          data-testid="input-text"
        />

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card className="p-4 text-center" data-testid="stat-words">
            <p className="text-3xl font-semibold text-primary">{words}</p>
            <p className="text-sm text-muted-foreground mt-1">Words</p>
          </Card>
          <Card className="p-4 text-center" data-testid="stat-characters">
            <p className="text-3xl font-semibold text-primary">{characters}</p>
            <p className="text-sm text-muted-foreground mt-1">Characters</p>
          </Card>
          <Card className="p-4 text-center" data-testid="stat-characters-no-spaces">
            <p className="text-3xl font-semibold text-primary">{charactersNoSpaces}</p>
            <p className="text-sm text-muted-foreground mt-1">No Spaces</p>
          </Card>
          <Card className="p-4 text-center" data-testid="stat-sentences">
            <p className="text-3xl font-semibold text-primary">{sentences}</p>
            <p className="text-sm text-muted-foreground mt-1">Sentences</p>
          </Card>
          <Card className="p-4 text-center" data-testid="stat-paragraphs">
            <p className="text-3xl font-semibold text-primary">{paragraphs}</p>
            <p className="text-sm text-muted-foreground mt-1">Paragraphs</p>
          </Card>
          <Card className="p-4 text-center" data-testid="stat-reading-time">
            <p className="text-3xl font-semibold text-primary">{readingTime}</p>
            <p className="text-sm text-muted-foreground mt-1">Min Read</p>
          </Card>
        </div>
      </div>
    </ToolWrapper>
  );
}
