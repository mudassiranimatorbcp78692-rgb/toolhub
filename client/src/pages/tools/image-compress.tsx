import { useState } from "react";
import { ToolWrapper } from "@/components/tool-wrapper";
import { FileUpload } from "@/components/ui/file-upload";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

export default function ImageCompress() {
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [compressedImageUrl, setCompressedImageUrl] = useState<string>("");
  const [originalSize, setOriginalSize] = useState<number>(0);
  const [compressedSize, setCompressedSize] = useState<number>(0);
  const [quality, setQuality] = useState<number>(80);
  const { toast } = useToast();

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
    setOriginalSize(selectedFile.size);
    setCompressedImageUrl("");
    setCompressedSize(0);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const handleCompress = async () => {
    if (!file) return;

    setProcessing(true);
    try {
      const img = new Image();
      const reader = new FileReader();

      reader.onload = (e) => {
        img.onload = () => {
          const canvas = document.createElement('canvas');
          
          // Calculate dimensions based on quality for better compression
          // Lower quality = smaller dimensions
          const scaleFactor = quality < 50 ? 0.7 : quality < 75 ? 0.85 : 1;
          canvas.width = Math.round(img.width * scaleFactor);
          canvas.height = Math.round(img.height * scaleFactor);

          const ctx = canvas.getContext('2d')!;
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

          // Convert to WebP or JPEG for better compression than PNG
          const targetFormat = file.type === 'image/png' ? 'image/webp' : file.type;
          const qualityValue = quality / 100;
          
          canvas.toBlob(
            (blob) => {
              if (blob) {
                const url = URL.createObjectURL(blob);
                setCompressedImageUrl(url);
                setCompressedSize(blob.size);

                const reduction = ((originalSize - blob.size) / originalSize * 100).toFixed(1);
                toast({
                  title: "Compression Complete!",
                  description: `File size reduced by ${reduction}%.`,
                });
              }
              setProcessing(false);
            },
            targetFormat,
            qualityValue
          );
        };
        img.src = e.target?.result as string;
      };

      reader.readAsDataURL(file);
    } catch (error) {
      toast({
        title: "Compression Failed",
        description: "There was an error compressing the image. Please try again.",
        variant: "destructive",
      });
      setProcessing(false);
    }
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = compressedImageUrl;
    link.download = `compressed-${file?.name || 'image.jpg'}`;
    link.click();
  };

  return (
    <ToolWrapper
      toolName="Image Compressor"
      toolDescription="Compress images to reduce file size while maintaining quality"
      category="image"
      howToUse={[
        "Upload your image file",
        "Adjust the quality slider to control compression",
        "Click 'Compress Image' to process",
        "Download the compressed image",
      ]}
      relatedTools={[
        { name: "Image Resizer", path: "/tool/image-resize" },
        { name: "Image Format Converter", path: "/tool/image-converter" },
        { name: "PDF Compress", path: "/tool/pdf-compress" },
      ]}
    >
      <div className="space-y-6">
        <FileUpload
          onFileSelect={handleFileSelect}
          acceptedFormats=".jpg,.jpeg,.png,.webp"
          maxSizeMB={20}
          disabled={processing}
        />

        {file && !compressedImageUrl && (
          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-md">
              <p className="text-sm"><span className="font-semibold">Original Size:</span> {formatFileSize(originalSize)}</p>
            </div>

            <div className="space-y-3">
              <Label>Quality: {quality}%</Label>
              <Slider
                value={[quality]}
                onValueChange={(value) => setQuality(value[0])}
                min={10}
                max={100}
                step={5}
                className="w-full"
                data-testid="slider-quality"
              />
              <p className="text-xs text-muted-foreground">
                Higher quality = larger file size. Lower quality = smaller file size with visible compression.
              </p>
            </div>

            <Button
              onClick={handleCompress}
              disabled={processing}
              className="w-full"
              size="lg"
              data-testid="button-compress"
            >
              {processing ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Compressing...
                </>
              ) : (
                "Compress Image"
              )}
            </Button>
          </div>
        )}

        {compressedImageUrl && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h3 className="font-semibold text-sm">Original</h3>
                <img src={URL.createObjectURL(file!)} alt="Original" className="w-full rounded border" />
                <p className="text-xs text-muted-foreground">{formatFileSize(originalSize)}</p>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-sm">Compressed</h3>
                <img src={compressedImageUrl} alt="Compressed" className="w-full rounded border" />
                <p className="text-xs text-muted-foreground">{formatFileSize(compressedSize)}</p>
              </div>
            </div>

            <div className="p-4 border rounded-lg bg-muted/50">
              <p className="text-sm text-primary mb-3">
                <span className="font-semibold">Saved:</span> {formatFileSize(originalSize - compressedSize)} ({((originalSize - compressedSize) / originalSize * 100).toFixed(1)}%)
              </p>
              <Button onClick={handleDownload} className="w-full" data-testid="button-download">
                <Download className="mr-2 h-4 w-4" />
                Download Compressed Image
              </Button>
            </div>
          </div>
        )}
      </div>
    </ToolWrapper>
  );
}
