import { useState } from "react";
import { ToolWrapper } from "@/components/tool-wrapper";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Issue {
  type: string;
  message: string;
  sentence: string;
  sentenceIndex: number;
  suggestion?: string;
}

export default function GrammarChecker() {
  const [inputText, setInputText] = useState<string>("");
  const [issues, setIssues] = useState<Issue[]>([]);
  const [processing, setProcessing] = useState(false);
  const { toast } = useToast();

  const checkGrammar = () => {
    if (!inputText.trim()) {
      toast({
        title: "No Text",
        description: "Please enter some text to check.",
        variant: "destructive",
      });
      return;
    }

    setProcessing(true);
    const foundIssues: Issue[] = [];

    // Common misspellings dictionary
    const commonMisspellings: Record<string, string> = {
      'recieve': 'receive', 'occured': 'occurred', 'seperate': 'separate',
      'definately': 'definitely', 'wierd': 'weird', 'untill': 'until',
      'tommorrow': 'tomorrow', 'begining': 'beginning', 'accross': 'across',
      'alot': 'a lot', 'aswell': 'as well', 'therefor': 'therefore',
      'wich': 'which', 'reccomend': 'recommend', 'neccessary': 'necessary',
      'occassion': 'occasion', 'beleive': 'believe', 'achive': 'achieve',
      'apparantly': 'apparently', 'arguement': 'argument', 'calender': 'calendar',
      'accomodate': 'accommodate', 'gratefull': 'grateful',
      'harrass': 'harass', 'occassionally': 'occasionally',
    };

    // Check for double spaces
    if (inputText.includes('  ')) {
      foundIssues.push({
        type: "Spacing",
        message: "Multiple consecutive spaces detected",
        sentence: "Multiple spaces found in text",
        sentenceIndex: 0,
      });
    }

    // Check for repeated punctuation
    if (/[.!?]{2,}/.test(inputText)) {
      foundIssues.push({
        type: "Punctuation",
        message: "Repeated punctuation marks detected",
        sentence: "Repeated punctuation found",
        sentenceIndex: 0,
      });
    }

    // Split into sentences for detailed checking
    const sentences = inputText.split(/[.!?]+/).filter(s => s.trim().length > 0);
    
    sentences.forEach((sentence, idx) => {
      const trimmed = sentence.trim();
      if (!trimmed) return;

      // Check for capitalization at sentence start (only if not an abbreviation or single letter)
      if (trimmed.length > 2 && /^[a-z]/.test(trimmed)) {
        foundIssues.push({
          type: "Capitalization",
          message: "Sentence should start with a capital letter",
          sentence: trimmed,
          sentenceIndex: idx,
        });
      }

      // Check for missing punctuation at end
      if (!inputText.substring(inputText.lastIndexOf(trimmed) + trimmed.length).match(/^[.!?\s]/)) {
        if (trimmed.length > 3 && /[a-z]$/.test(trimmed)) {
          foundIssues.push({
            type: "Punctuation",
            message: "Sentence should end with proper punctuation",
            sentence: trimmed,
            sentenceIndex: idx,
          });
        }
      }

      // Common grammar mistake patterns
      const grammarRules = [
        { 
          pattern: /\bits a\b/i, 
          correct: "it's a", 
          message: 'Use "it\'s a" (it is a) instead of "its a"',
        },
        { 
          pattern: /\byour welcome\b/i, 
          correct: "you're welcome", 
          message: 'Use "you\'re welcome" (you are) instead of "your welcome"',
        },
        { 
          pattern: /\btheir is\b|\btheir are\b/i, 
          correct: "there is/are", 
          message: 'Use "there is/are" for location, not "their"',
        },
        { 
          pattern: /\bshould of\b|\bcould of\b|\bwould of\b/i, 
          correct: "should/could/would have", 
          message: 'Use "have" instead of "of" (should have, could have, would have)',
        },
        { 
          pattern: /\bto much\b/i, 
          correct: "too much", 
          message: 'Use "too much" (excess), not "to much"',
        },
        { 
          pattern: /\bto many\b/i, 
          correct: "too many", 
          message: 'Use "too many" (excess), not "to many"',
        },
        { 
          pattern: /\byour\s+(going|coming|running|walking|doing|saying|thinking)/i, 
          correct: "you're", 
          message: 'Use "you\'re" (you are) before verbs, not "your"',
        },
        { 
          pattern: /\bits\s+(going|running|walking|a|very|really)/i, 
          correct: "it's", 
          message: 'Use "it\'s" (it is), not "its"',
        },
        { 
          pattern: /\bthere\s+(going|running)/i, 
          correct: "they're", 
          message: 'Use "they\'re" (they are) before verbs, not "there"',
        },
        { 
          pattern: /\bwho\'s\s+(house|book|car)/i, 
          correct: "whose", 
          message: 'Use "whose" for possession, not "who\'s"',
        },
        { 
          pattern: /\band than\b/i, 
          correct: "and then", 
          message: 'Use "and then" (sequence), not "and than"',
        },
        { 
          pattern: /\bto\s+(much|many)\s+information/i, 
          correct: "too much information", 
          message: 'Use "too much" (excess), not "to much"',
        },
        { 
          pattern: /\bcan not\b/i, 
          correct: "cannot", 
          message: 'Typically written as "cannot" (one word)',
        },
        { 
          pattern: /\bseprate\b/i, 
          correct: "separate", 
          message: 'Misspelled: use "separate"',
        },
      ];

      grammarRules.forEach(({ pattern, correct, message }) => {
        if (pattern.test(trimmed)) {
          foundIssues.push({
            type: "Grammar",
            message,
            sentence: trimmed,
            sentenceIndex: idx,
            suggestion: correct,
          });
        }
      });

      // Token-level spelling check
      const words = trimmed.toLowerCase().split(/\s+/);
      words.forEach((word, wordIdx) => {
        const cleanWord = word.replace(/[^a-z]/g, '');
        if (cleanWord.length > 2 && commonMisspellings[cleanWord]) {
          // Avoid duplicate issues
          const isDuplicate = foundIssues.some(
            issue => issue.type === "Spelling" && issue.sentenceIndex === idx && issue.suggestion === commonMisspellings[cleanWord]
          );
          if (!isDuplicate) {
            foundIssues.push({
              type: "Spelling",
              message: `Misspelled word: "${cleanWord}" → "${commonMisspellings[cleanWord]}"`,
              sentence: trimmed,
              sentenceIndex: idx,
              suggestion: commonMisspellings[cleanWord],
            });
          }
        }
      });

      // Check for repeated consecutive words
      for (let i = 0; i < words.length - 1; i++) {
        const word1 = words[i].replace(/[^a-z]/g, '');
        const word2 = words[i + 1].replace(/[^a-z]/g, '');
        if (word1 === word2 && word1.length > 2) {
          foundIssues.push({
            type: "Repeated Word",
            message: `Repeated word detected: "${word1}"`,
            sentence: trimmed,
            sentenceIndex: idx,
          });
          break; // Only report once per sentence
        }
      }

      // Check for missing spaces after punctuation
      if (/[,;:][a-zA-Z]/.test(trimmed)) {
        foundIssues.push({
          type: "Spacing",
          message: "Missing space after punctuation",
          sentence: trimmed,
          sentenceIndex: idx,
        });
      }

      // Check for common single character errors
      if (/\ba\s+[aeiou]/i.test(trimmed)) {
        foundIssues.push({
          type: "Grammar",
          message: 'Use "an" before words starting with vowel sounds',
          sentence: trimmed,
          sentenceIndex: idx,
          suggestion: "an",
        });
      }

      // Check for subject-verb agreement issues (basic)
      if (/\b(are|is|was|were)\s+\w+\s+(are|is|was|were)\b/i.test(trimmed)) {
        foundIssues.push({
          type: "Grammar",
          message: "Possible subject-verb agreement issue",
          sentence: trimmed,
          sentenceIndex: idx,
        });
      }
    });

    setIssues(foundIssues);
    toast({
      title: "Check Complete!",
      description: `Found ${foundIssues.length} potential issue(s).`,
    });
    setProcessing(false);
  };

  return (
    <ToolWrapper
      toolName="Grammar Checker"
      toolDescription="Check text for grammar, spelling, and punctuation issues"
      category="text"
      howToUse={[
        "Paste your text into the input area",
        "Click 'Check Grammar' to analyze",
        "Review the issues found with sentence context",
        "Make corrections as suggested",
      ]}
      relatedTools={[
        { name: "Word Counter", path: "/tool/word-counter" },
        { name: "Case Converter", path: "/tool/case-converter" },
        { name: "Lorem Ipsum Generator", path: "/tool/lorem-ipsum" },
      ]}
    >
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">Text to Check</label>
          <Textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Enter or paste your text here to check for grammar issues..."
            className="min-h-[200px]"
            data-testid="textarea-input"
          />
        </div>

        <Button
          onClick={checkGrammar}
          disabled={processing}
          className="w-full"
          size="lg"
          data-testid="button-check"
        >
          {processing ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Checking...
            </>
          ) : (
            "Check Grammar"
          )}
        </Button>

        {issues.length === 0 && inputText && !processing && (
          <div className="p-4 border rounded-lg bg-green-50 dark:bg-green-950/20 flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
            <p className="text-sm text-green-800 dark:text-green-200">No issues found! Your text looks good.</p>
          </div>
        )}

        {issues.length > 0 && (
          <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
              Found {issues.length} Issue{issues.length !== 1 ? 's' : ''}
            </h3>
            <div className="space-y-3">
              {issues.map((issue, index) => (
                <div 
                  key={index} 
                  className="p-4 border rounded-lg bg-muted/50"
                  data-testid={`issue-${index}`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-xs font-semibold px-2 py-1 rounded bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200">
                      {issue.type}
                    </span>
                    {issue.suggestion && (
                      <span className="text-xs text-muted-foreground">
                        Suggestion: <span className="font-medium text-foreground">{issue.suggestion}</span>
                      </span>
                    )}
                  </div>
                  <p className="text-sm mb-2">{issue.message}</p>
                  {issue.sentence && (
                    <div className="text-xs text-muted-foreground bg-background p-2 rounded border mt-2">
                      <span className="font-semibold">Context:</span> "{issue.sentence.substring(0, 100)}{issue.sentence.length > 100 ? '...' : ''}"
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </ToolWrapper>
  );
}
