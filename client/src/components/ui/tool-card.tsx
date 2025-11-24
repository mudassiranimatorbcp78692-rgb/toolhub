import { Link } from "wouter";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import * as Icons from "lucide-react";

interface ToolCardProps {
  name: string;
  description: string;
  icon: string;
  path: string;
  isPro?: boolean;
}

export function ToolCard({ name, description, icon, path, isPro = false }: ToolCardProps) {
  const IconComponent = (Icons as any)[icon] || Icons.FileText;

  return (
    <Link href={path}>
      <Card className="p-6 hover-elevate active-elevate-2 transition-transform h-full cursor-pointer group" data-testid={`card-tool-${name.toLowerCase().replace(/\s+/g, '-')}`}>
        <div className="flex flex-col h-full">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <IconComponent className="w-6 h-6 text-primary" />
            </div>
            {isPro && (
              <Badge variant="secondary" className="text-xs">
                PRO
              </Badge>
            )}
          </div>
          
          <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors" data-testid={`text-tool-name-${name.toLowerCase().replace(/\s+/g, '-')}`}>
            {name}
          </h3>
          
          <p className="text-sm text-muted-foreground mb-4 flex-grow leading-relaxed">
            {description}
          </p>
          
          <Button variant="ghost" size="sm" className="w-full group-hover:bg-primary/5" data-testid={`button-use-tool-${name.toLowerCase().replace(/\s+/g, '-')}`}>
            Use Tool
            <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </Card>
    </Link>
  );
}
