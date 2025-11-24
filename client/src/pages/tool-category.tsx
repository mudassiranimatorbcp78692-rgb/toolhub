import { useRoute, Link } from "wouter";
import { ToolCard } from "@/components/ui/tool-card";
import { toolCategories, getToolsByCategory } from "@/lib/tools-data";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import * as Icons from "lucide-react";

export default function ToolCategory() {
  const [, params] = useRoute("/tools/:category");
  const categoryId = params?.category || "";

  const category = toolCategories.find((cat) => cat.id === categoryId);
  const tools = getToolsByCategory(categoryId);

  if (!category) {
    return (
      <div className="min-h-screen py-12">
        <div className="max-w-7xl mx-auto px-4 md:px-8 text-center">
          <h1 className="text-3xl font-semibold mb-4">Category Not Found</h1>
          <Link href="/tools">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to All Tools
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const IconComponent = (Icons as any)[category.icon] || Icons.Folder;

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        {/* Breadcrumb */}
        <div className="mb-8">
          <Link href="/tools">
            <Button variant="ghost" size="sm" data-testid="button-back-to-tools">
              <ArrowLeft className="w-4 h-4 mr-2" />
              All Tools
            </Button>
          </Link>
        </div>

        {/* Category Header */}
        <div className="mb-12 space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 bg-primary/10 rounded-xl flex items-center justify-center">
              <IconComponent className="w-10 h-10 text-primary" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-semibold mb-2" data-testid="text-category-name">
                {category.name}
              </h1>
              <p className="text-lg text-muted-foreground">{category.description}</p>
            </div>
          </div>
        </div>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {tools.map((tool) => (
            <ToolCard
              key={tool.id}
              name={tool.name}
              description={tool.description}
              icon={tool.icon}
              path={tool.path}
              isPro={tool.isPro}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
