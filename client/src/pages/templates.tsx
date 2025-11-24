import { TemplateCard } from "@/components/ui/template-card";
import { templates } from "@/lib/tools-data";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";

export default function Templates() {
  const [activeTab, setActiveTab] = useState("all");

  const categories = [
    { id: "all", name: "All Templates" },
    { id: "resume", name: "Resume" },
    { id: "invoice", name: "Invoice" },
    { id: "salary-slip", name: "Salary Slip" },
    { id: "offer-letter", name: "Offer Letter" },
    { id: "office-forms", name: "Office Forms" },
  ];

  const filteredTemplates = activeTab === "all"
    ? templates
    : templates.filter((t) => t.category === activeTab);

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-semibold mb-4" data-testid="text-page-title">
            Professional Templates
          </h1>
          <p className="text-lg text-muted-foreground">
            Download ready-to-use templates for your business and personal needs
          </p>
        </div>

        {/* Filter Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-12">
          <TabsList className="flex-wrap h-auto" data-testid="tabs-template-categories">
            {categories.map((category) => (
              <TabsTrigger
                key={category.id}
                value={category.id}
                data-testid={`tab-${category.id}`}
              >
                {category.name}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value={activeTab} className="mt-8">
            {filteredTemplates.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {filteredTemplates.map((template) => (
                  <TemplateCard
                    key={template.id}
                    name={template.name}
                    category={template.category}
                    description={template.description}
                    thumbnailUrl={template.thumbnailUrl}
                    downloadUrl={template.downloadUrl}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No templates available in this category.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
