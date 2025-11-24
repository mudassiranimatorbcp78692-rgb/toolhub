import { useState, useRef } from "react";
import { ToolWrapper } from "@/components/tool-wrapper";
import { FileUpload } from "@/components/ui/file-upload";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function ImageCrop() {
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [croppedImageUrl, setCroppedImageUrl] = useState<string>("");
  const [imageUrl, setImageUrl] = useState<string>("");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [cropArea, setCropArea] = useState({ x: 50, y: 50, width: 200, height: 200 });
  const { toast } = useToast();

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
    setCroppedImageUrl("");
    
    const reader = new FileReader();
    reader.onload = (e) => {
      setImageUrl(e.target?.result as string);
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleCrop = async () => {
    if (!file || !imageUrl) return;

    setProcessing(true);
    try {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = cropArea.width;
        canvas.height = cropArea.height;

        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(
          img,
          cropArea.x, cropArea.y, cropArea.width, cropArea.height,
          0, 0, cropArea.width, cropArea.height
        );

        canvas.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            setCroppedImageUrl(url);
            toast({
              title: "Crop Complete!",
              description: "Image has been cropped successfully.",
            });
          }
          setProcessing(false);
        }, file.type);
      };
      img.src = imageUrl;
    } catch (error) {
      toast({
        title: "Crop Failed",
        description: "There was an error cropping the image. Please try again.",
        variant: "destructive",
      });
      setProcessing(false);
    }
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = croppedImageUrl;
    link.download = `cropped-${file?.name || 'image.jpg'}`;
    link.click();
  };

  return (
    <ToolWrapper
      toolName="Image Cropper"
      toolDescription="Crop images to your desired area"
      category="image"
      howToUse={[
        "Upload your image file",
        "Adjust the crop area by dragging the selection box",
        "Click 'Crop Image' to process",
        "Download the cropped image",
      ]}
      relatedTools={[
        { name: "Image Resizer", path: "/tool/image-resize" },
        { name: "Image Format Converter", path: "/tool/image-converter" },
        { name: "Image Compressor", path: "/tool/image-compress" },
      ]}
    >
      <div className="space-y-6">
        <FileUpload
          onFileSelect={handleFileSelect}
          acceptedFormats=".jpg,.jpeg,.png,.webp"
          maxSizeMB={20}
          disabled={processing}
        />

        {imageUrl && !croppedImageUrl && (
          <div className="space-y-4">
            <div className="border rounded-lg p-4 bg-muted/30">
              <div className="relative inline-block max-w-full">
                <img src={imageUrl} alt="Original" className="max-w-full h-auto" />
                <div
                  className="absolute border-2 border-primary bg-primary/10 cursor-move"
                  style={{
                    left: `${cropArea.x}px`,
                    top: `${cropArea.y}px`,
                    width: `${cropArea.width}px`,
                    height: `${cropArea.height}px`,
                  }}
                  onMouseDown={() => setIsDragging(true)}
                  data-testid="crop-area"
                >
                  <div className="absolute top-0 right-0 w-4 h-4 bg-primary cursor-nwse-resize" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-4">
                Crop area: {cropArea.width}x{cropArea.height}px (Drag to adjust - simplified for demo)
              </p>
            </div>

            <Button
              onClick={handleCrop}
              disabled={processing}
              className="w-full"
              size="lg"
              data-testid="button-crop"
            >
              {processing ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Cropping...
                </>
              ) : (
                "Crop Image"
              )}
            </Button>
          </div>
        )}

        {croppedImageUrl && (
          <div className="space-y-4">
            <div className="space-y-2">
              <h3 className="font-semibold text-sm">Cropped Image</h3>
              <img src={croppedImageUrl} alt="Cropped" className="w-full max-w-md mx-auto rounded border" />
            </div>
            <Button onClick={handleDownload} className="w-full" data-testid="button-download">
              <Download className="mr-2 h-4 w-4" />
              Download Cropped Image
            </Button>
          </div>
        )}
      </div>
    </ToolWrapper>
  );
}
