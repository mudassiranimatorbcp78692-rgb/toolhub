import { ToolCard } from "@/components/ui/tool-card";
import { CategoryCard } from "@/components/ui/category-card";
import { toolCategories, allTools } from "@/lib/tools-data";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useState } from "react";

export default function AllTools() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTools = allTools.filter((tool) =>
    tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tool.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-semibold mb-4" data-testid="text-page-title">
            All Tools
          </h1>
          <p className="text-lg text-muted-foreground mb-8">
            Browse our complete collection of free online tools
          </p>

          {/* Search */}
          <div className="max-w-md relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search tools..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              data-testid="input-search-tools"
            />
          </div>
        </div>

        {/* Categories */}
        {!searchQuery && (
          <div className="mb-16">
            <h2 className="text-2xl font-semibold mb-6">Categories</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {toolCategories.map((category) => (
                <CategoryCard
                  key={category.id}
                  name={category.name}
                  description={category.description}
                  icon={category.icon}
                  toolCount={category.toolCount}
                  path={category.path}
                />
              ))}
            </div>
          </div>
        )}

        {/* All Tools */}
        <div>
          <h2 className="text-2xl font-semibold mb-6">
            {searchQuery ? `Search Results (${filteredTools.length})` : "All Tools"}
          </h2>
          {filteredTools.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredTools.map((tool) => (
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
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No tools found matching your search.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
