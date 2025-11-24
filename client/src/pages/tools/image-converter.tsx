import { useState } from "react";
import { ToolWrapper } from "@/components/tool-wrapper";
import { FileUpload } from "@/components/ui/file-upload";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export default function ImageConverter() {
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [convertedImageUrl, setConvertedImageUrl] = useState<string>("");
  const [outputFormat, setOutputFormat] = useState<string>("png");
  const { toast } = useToast();

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
    setConvertedImageUrl("");
  };

  const getMimeType = (format: string): string => {
    const mimeTypes: Record<string, string> = {
      png: 'image/png',
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      webp: 'image/webp',
    };
    return mimeTypes[format] || 'image/png';
  };

  const handleConvert = async () => {
    if (!file) return;

    setProcessing(true);
    try {
      const img = new Image();
      const reader = new FileReader();

      reader.onload = (e) => {
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;

          const ctx = canvas.getContext('2d')!;
          
          // For formats without alpha channel (JPG), always fill with white background
          const targetMime = getMimeType(outputFormat);
          if (targetMime === 'image/jpeg') {
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
          }
          
          ctx.drawImage(img, 0, 0);

          canvas.toBlob(
            (blob) => {
              if (blob) {
                const url = URL.createObjectURL(blob);
                setConvertedImageUrl(url);
                toast({
                  title: "Conversion Complete!",
                  description: `Image converted to ${outputFormat.toUpperCase()}.`,
                });
              }
              setProcessing(false);
            },
            targetMime,
            0.95
          );
        };
        img.src = e.target?.result as string;
      };

      reader.readAsDataURL(file);
    } catch (error) {
      toast({
        title: "Conversion Failed",
        description: "There was an error converting the image. Please try again.",
        variant: "destructive",
      });
      setProcessing(false);
    }
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = convertedImageUrl;
    const baseName = file?.name.split('.').slice(0, -1).join('.') || 'image';
    link.download = `${baseName}.${outputFormat}`;
    link.click();
  };

  return (
    <ToolWrapper
      toolName="Image Format Converter"
      toolDescription="Convert images between different formats (PNG, JPG, WebP)"
      category="image"
      howToUse={[
        "Upload your image file",
        "Select the output format",
        "Click 'Convert Image' to process",
        "Download the converted image",
      ]}
      relatedTools={[
        { name: "Image Compressor", path: "/tool/image-compress" },
        { name: "Image Resizer", path: "/tool/image-resize" },
        { name: "JPG to PDF", path: "/tool/jpg-to-pdf" },
      ]}
    >
      <div className="space-y-6">
        <FileUpload
          onFileSelect={handleFileSelect}
          acceptedFormats=".jpg,.jpeg,.png,.webp,.gif,.bmp"
          maxSizeMB={20}
          disabled={processing}
        />

        {file && !convertedImageUrl && (
          <div className="space-y-4">
            <div className="space-y-3">
              <Label>Output Format</Label>
              <RadioGroup value={outputFormat} onValueChange={setOutputFormat}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="png" id="png" data-testid="radio-png" />
                  <Label htmlFor="png" className="cursor-pointer">PNG (Lossless, supports transparency)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="jpg" id="jpg" data-testid="radio-jpg" />
                  <Label htmlFor="jpg" className="cursor-pointer">JPG (Compressed, smaller file size)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="webp" id="webp" data-testid="radio-webp" />
                  <Label htmlFor="webp" className="cursor-pointer">WebP (Modern format, best compression)</Label>
                </div>
              </RadioGroup>
            </div>

            <Button
              onClick={handleConvert}
              disabled={processing}
              className="w-full"
              size="lg"
              data-testid="button-convert"
            >
              {processing ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Converting...
                </>
              ) : (
                `Convert to ${outputFormat.toUpperCase()}`
              )}
            </Button>
          </div>
        )}

        {convertedImageUrl && (
          <div className="space-y-4">
            <div className="space-y-2">
              <h3 className="font-semibold text-sm">Converted Image ({outputFormat.toUpperCase()})</h3>
              <img src={convertedImageUrl} alt="Converted" className="w-full max-w-md mx-auto rounded border" />
            </div>
            <Button onClick={handleDownload} className="w-full" data-testid="button-download">
              <Download className="mr-2 h-4 w-4" />
              Download {outputFormat.toUpperCase()}
            </Button>
          </div>
        )}
      </div>
    </ToolWrapper>
  );
}
