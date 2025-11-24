import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, FileText } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface TemplateCardProps {
  name: string;
  category: string;
  description: string;
  thumbnailUrl: string;
  downloadUrl: string;
}

export function TemplateCard({
  name,
  category,
  description,
  thumbnailUrl,
  downloadUrl,
}: TemplateCardProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const { toast } = useToast();

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      // Fetch the template file from the download endpoint
      const response = await fetch(downloadUrl);
      if (!response.ok) {
        throw new Error('Failed to download template');
      }

      // Get the file blob and determine filename
      const blob = await response.blob();
      const filename = name.toLowerCase().replace(/\s+/g, '-') + '.pdf';

      // Create a temporary download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "Download Started",
        description: `${name} template is downloading...`,
      });
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: "Download Failed",
        description: "Unable to download the template. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Card className="overflow-hidden hover-elevate active-elevate-2 transition-transform group" data-testid={`card-template-${name.toLowerCase().replace(/\s+/g, '-')}`}>
      {/* Thumbnail Section */}
      <div className="aspect-[3/4] bg-muted flex items-center justify-center relative overflow-hidden">
        {thumbnailUrl ? (
          <img 
            src={thumbnailUrl} 
            alt={name}
            className="w-full h-full object-cover"
            onError={(e) => {
              // Fallback to placeholder if image fails to load
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-primary/20 flex items-center justify-center">
          <FileText className="w-20 h-20 text-muted-foreground/30" />
        </div>
      </div>
      
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-base group-hover:text-primary transition-colors" data-testid={`text-template-name-${name.toLowerCase().replace(/\s+/g, '-')}`}>
            {name}
          </h3>
          <Badge variant="secondary" className="text-xs ml-2">
            {category}
          </Badge>
        </div>
        
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
          {description}
        </p>
        
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={handleDownload}
          disabled={isDownloading}
          data-testid={`button-download-template-${name.toLowerCase().replace(/\s+/g, '-')}`}
        >
          <Download className="w-4 h-4 mr-2" />
          {isDownloading ? 'Downloading...' : 'Download'}
        </Button>
      </div>
    </Card>
  );
}
