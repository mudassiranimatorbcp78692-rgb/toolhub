import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface ToolWrapperProps {
  toolName: string;
  toolDescription: string;
  category: string;
  children: React.ReactNode;
  relatedTools?: Array<{ name: string; path: string }>;
  howToUse?: string[];
}

export function ToolWrapper({
  toolName,
  toolDescription,
  category,
  children,
  relatedTools = [],
  howToUse = [],
}: ToolWrapperProps) {
  return (
    <div className="min-h-screen py-12">
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        {/* Breadcrumb */}
        <div className="mb-8 flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/tools">
            <span className="hover:text-foreground transition-colors cursor-pointer" data-testid="breadcrumb-tools">
              Tools
            </span>
          </Link>
          <ChevronRight className="w-4 h-4" />
          <Link href={`/tools/${category}`}>
            <span className="hover:text-foreground transition-colors capitalize cursor-pointer" data-testid="breadcrumb-category">
              {category}
            </span>
          </Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-foreground">{toolName}</span>
        </div>

        {/* Tool Header */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-semibold mb-4" data-testid="text-tool-name">
            {toolName}
          </h1>
          <p className="text-lg text-muted-foreground">{toolDescription}</p>
        </div>

        {/* Tool Interface */}
        <Card className="p-8 mb-12">
          {children}
        </Card>

        {/* How to Use */}
        {howToUse.length > 0 && (
          <div className="mb-12">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="how-to-use">
                <AccordionTrigger className="text-xl font-semibold" data-testid="accordion-how-to-use">
                  How to Use
                </AccordionTrigger>
                <AccordionContent>
                  <ol className="list-decimal list-inside space-y-3 text-muted-foreground pl-2">
                    {howToUse.map((step, index) => (
                      <li key={index} className="leading-relaxed">{step}</li>
                    ))}
                  </ol>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        )}

        {/* Related Tools */}
        {relatedTools.length > 0 && (
          <div>
            <h2 className="text-2xl font-semibold mb-6">Related Tools</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {relatedTools.map((tool) => (
                <Link key={tool.path} href={tool.path}>
                  <Card className="p-4 hover-elevate active-elevate-2 transition-transform cursor-pointer group">
                    <div className="flex items-center justify-between">
                      <span className="font-medium group-hover:text-primary transition-colors">
                        {tool.name}
                      </span>
                      <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
