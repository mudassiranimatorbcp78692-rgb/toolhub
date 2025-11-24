import { useRoute } from "wouter";
import { ToolWrapper } from "@/components/tool-wrapper";
import { FileUpload } from "@/components/ui/file-upload";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { allTools } from "@/lib/tools-data";
import { Wrench } from "lucide-react";

export default function GenericTool() {
  const [, params] = useRoute("/tool/:toolId");
  const toolId = params?.toolId || "";
  const tool = allTools.find(t => t.id === toolId);
  const [file, setFile] = useState<File | null>(null);

  if (!tool) {
    return (
      <div className="min-h-screen py-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-3xl font-semibold mb-4">Tool Not Found</h1>
        </div>
      </div>
    );
  }

  return (
    <ToolWrapper
      toolName={tool.name}
      toolDescription={tool.description}
      category={tool.category}
      howToUse={[
        "Upload your file using the upload area",
        "Configure any necessary settings",
        "Click the process button",
        "Download your processed file",
      ]}
    >
      <div className="space-y-6">
        <div className="text-center py-12">
          <div className="w-20 h-20 bg-primary/10 rounded-full mx-auto flex items-center justify-center mb-6">
            <Wrench className="w-10 h-10 text-primary" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Tool Interface</h3>
          <p className="text-muted-foreground mb-6">
            This tool is available and ready to use.
          </p>
          <FileUpload
            onFileSelect={setFile}
            acceptedFormats="*"
            maxSizeMB={20}
          />
          {file && (
            <Button className="w-full mt-6" size="lg" data-testid="button-process">
              Process File
            </Button>
          )}
        </div>
      </div>
    </ToolWrapper>
  );
}
