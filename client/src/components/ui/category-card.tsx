import { Link } from "wouter";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight } from "lucide-react";
import * as Icons from "lucide-react";

interface CategoryCardProps {
  name: string;
  description: string;
  icon: string;
  toolCount: number;
  path: string;
}

export function CategoryCard({ name, description, icon, toolCount, path }: CategoryCardProps) {
  const IconComponent = (Icons as any)[icon] || Icons.Folder;

  return (
    <Link href={path}>
      <Card className="p-8 hover-elevate active-elevate-2 transition-transform cursor-pointer group h-full" data-testid={`card-category-${name.toLowerCase().replace(/\s+/g, '-')}`}>
        <div className="flex flex-col h-full">
          <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
            <IconComponent className="w-8 h-8 text-primary" />
          </div>
          
          <div className="flex items-start justify-between mb-3">
            <h3 className="font-semibold text-xl group-hover:text-primary transition-colors" data-testid={`text-category-name-${name.toLowerCase().replace(/\s+/g, '-')}`}>
              {name}
            </h3>
            <Badge variant="secondary" className="ml-2" data-testid={`badge-tool-count-${name.toLowerCase().replace(/\s+/g, '-')}`}>
              {toolCount} tools
            </Badge>
          </div>
          
          <p className="text-sm text-muted-foreground mb-6 flex-grow leading-relaxed">
            {description}
          </p>
          
          <div className="flex items-center text-sm font-medium text-primary group-hover:gap-2 transition-all">
            Explore Tools
            <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </Card>
    </Link>
  );
}
