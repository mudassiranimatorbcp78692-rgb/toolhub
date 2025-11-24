import { useState } from "react";
import { ToolWrapper } from "@/components/tool-wrapper";
import { FileUpload } from "@/components/ui/file-upload";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export default function ImageResize() {
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [resizedImageUrl, setResizedImageUrl] = useState<string>("");
  const [originalDimensions, setOriginalDimensions] = useState({ width: 0, height: 0 });
  const [mode, setMode] = useState<"dimensions" | "percentage">("dimensions");
  const [width, setWidth] = useState<string>("");
  const [height, setHeight] = useState<string>("");
  const [percentage, setPercentage] = useState<string>("50");
  const [maintainAspect, setMaintainAspect] = useState(true);
  const { toast } = useToast();

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
    setResizedImageUrl("");

    // Get original dimensions
    const img = new Image();
    const reader = new FileReader();
    reader.onload = (e) => {
      img.onload = () => {
        setOriginalDimensions({ width: img.width, height: img.height });
        setWidth(img.width.toString());
        setHeight(img.height.toString());
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleWidthChange = (value: string) => {
    setWidth(value);
    if (maintainAspect && originalDimensions.width > 0) {
      const ratio = originalDimensions.height / originalDimensions.width;
      setHeight(Math.round(parseInt(value || "0") * ratio).toString());
    }
  };

  const handleHeightChange = (value: string) => {
    setHeight(value);
    if (maintainAspect && originalDimensions.height > 0) {
      const ratio = originalDimensions.width / originalDimensions.height;
      setWidth(Math.round(parseInt(value || "0") * ratio).toString());
    }
  };

  const handleResize = async () => {
    if (!file) return;

    let targetWidth: number;
    let targetHeight: number;

    if (mode === "percentage") {
      const scale = parseInt(percentage) / 100;
      targetWidth = Math.round(originalDimensions.width * scale);
      targetHeight = Math.round(originalDimensions.height * scale);
    } else {
      targetWidth = parseInt(width);
      targetHeight = parseInt(height);
    }

    if (!targetWidth || !targetHeight) {
      toast({
        title: "Invalid Dimensions",
        description: "Please enter valid width and height values.",
        variant: "destructive",
      });
      return;
    }

    setProcessing(true);
    try {
      const img = new Image();
      const reader = new FileReader();

      reader.onload = (e) => {
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = targetWidth;
          canvas.height = targetHeight;

          const ctx = canvas.getContext('2d')!;
          ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

          canvas.toBlob((blob) => {
            if (blob) {
              const url = URL.createObjectURL(blob);
              setResizedImageUrl(url);
              toast({
                title: "Resize Complete!",
                description: `Image resized to ${targetWidth}x${targetHeight}px.`,
              });
            }
            setProcessing(false);
          }, file.type);
        };
        img.src = e.target?.result as string;
      };

      reader.readAsDataURL(file);
    } catch (error) {
      toast({
        title: "Resize Failed",
        description: "There was an error resizing the image. Please try again.",
        variant: "destructive",
      });
      setProcessing(false);
    }
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = resizedImageUrl;
    link.download = `resized-${file?.name || 'image.jpg'}`;
    link.click();
  };

  return (
    <ToolWrapper
      toolName="Image Resizer"
      toolDescription="Resize images to custom dimensions or percentage"
      category="image"
      howToUse={[
        "Upload your image file",
        "Choose resize method (dimensions or percentage)",
        "Enter desired size",
        "Download the resized image",
      ]}
      relatedTools={[
        { name: "Image Compressor", path: "/tool/image-compress" },
        { name: "Image Cropper", path: "/tool/image-crop" },
        { name: "Image Format Converter", path: "/tool/image-converter" },
      ]}
    >
      <div className="space-y-6">
        <FileUpload
          onFileSelect={handleFileSelect}
          acceptedFormats=".jpg,.jpeg,.png,.webp"
          maxSizeMB={20}
          disabled={processing}
        />

        {file && originalDimensions.width > 0 && !resizedImageUrl && (
          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-md">
              <p className="text-sm"><span className="font-semibold">Original Size:</span> {originalDimensions.width} x {originalDimensions.height} px</p>
            </div>

            <RadioGroup value={mode} onValueChange={(v) => setMode(v as "dimensions" | "percentage")}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="dimensions" id="dimensions" data-testid="radio-dimensions" />
                <Label htmlFor="dimensions" className="cursor-pointer">Resize by Dimensions</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="percentage" id="percentage" data-testid="radio-percentage" />
                <Label htmlFor="percentage" className="cursor-pointer">Resize by Percentage</Label>
              </div>
            </RadioGroup>

            {mode === "dimensions" && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="width">Width (px)</Label>
                    <Input
                      id="width"
                      type="number"
                      value={width}
                      onChange={(e) => handleWidthChange(e.target.value)}
                      placeholder="Width"
                      data-testid="input-width"
                    />
                  </div>
                  <div>
                    <Label htmlFor="height">Height (px)</Label>
                    <Input
                      id="height"
                      type="number"
                      value={height}
                      onChange={(e) => handleHeightChange(e.target.value)}
                      placeholder="Height"
                      data-testid="input-height"
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="aspect"
                    checked={maintainAspect}
                    onChange={(e) => setMaintainAspect(e.target.checked)}
                    className="rounded"
                    data-testid="checkbox-aspect"
                  />
                  <Label htmlFor="aspect" className="cursor-pointer text-sm">Maintain aspect ratio</Label>
                </div>
              </div>
            )}

            {mode === "percentage" && (
              <div>
                <Label htmlFor="percentage">Scale (%)</Label>
                <Input
                  id="percentage"
                  type="number"
                  value={percentage}
                  onChange={(e) => setPercentage(e.target.value)}
                  placeholder="50"
                  min="1"
                  max="200"
                  data-testid="input-percentage"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  New size will be: {Math.round(originalDimensions.width * parseInt(percentage || "100") / 100)} x {Math.round(originalDimensions.height * parseInt(percentage || "100") / 100)} px
                </p>
              </div>
            )}

            <Button
              onClick={handleResize}
              disabled={processing}
              className="w-full"
              size="lg"
              data-testid="button-resize"
            >
              {processing ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Resizing...
                </>
              ) : (
                "Resize Image"
              )}
            </Button>
          </div>
        )}

        {resizedImageUrl && (
          <div className="space-y-4">
            <div className="space-y-2">
              <h3 className="font-semibold text-sm">Resized Image</h3>
              <img src={resizedImageUrl} alt="Resized" className="w-full max-w-md mx-auto rounded border" />
            </div>
            <Button onClick={handleDownload} className="w-full" data-testid="button-download">
              <Download className="mr-2 h-4 w-4" />
              Download Resized Image
            </Button>
          </div>
        )}
      </div>
    </ToolWrapper>
  );
}
