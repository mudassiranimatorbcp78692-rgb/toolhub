import { useState, useRef, useEffect } from "react";
import { ToolWrapper } from "@/components/tool-wrapper";
import { FileUpload } from "@/components/ui/file-upload";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type ResizeHandle = 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w' | 'move' | null;

export default function ImageCrop() {
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [croppedImageUrl, setCroppedImageUrl] = useState<string>("");
  const [imageUrl, setImageUrl] = useState<string>("");
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState<ResizeHandle>(null);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [cropArea, setCropArea] = useState({ x: 50, y: 50, width: 200, height: 200 });
  const { toast } = useToast();

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
    setCroppedImageUrl("");
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const url = e.target?.result as string;
      setImageUrl(url);
      
      const img = new Image();
      img.onload = () => {
        setImageSize({ width: img.width, height: img.height });
        setCropArea({
          x: Math.floor(img.width * 0.1),
          y: Math.floor(img.height * 0.1),
          width: Math.floor(img.width * 0.6),
          height: Math.floor(img.height * 0.6),
        });
      };
      img.src = url;
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

  const handleMouseDown = (e: React.MouseEvent, handle: ResizeHandle) => {
    e.preventDefault();
    setIsDragging(handle);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;

    const deltaX = e.clientX - dragStart.x;
    const deltaY = e.clientY - dragStart.y;

    setCropArea(prev => {
      let newArea = { ...prev };

      if (isDragging === 'move') {
        newArea.x = Math.max(0, Math.min(prev.x + deltaX, imageSize.width - prev.width));
        newArea.y = Math.max(0, Math.min(prev.y + deltaY, imageSize.height - prev.height));
      } else {
        // Handle corner and edge resizing
        if (isDragging.includes('n')) {
          const newY = prev.y + deltaY;
          const newHeight = prev.height - deltaY;
          if (newHeight >= 50 && newY >= 0) {
            newArea.y = newY;
            newArea.height = newHeight;
          }
        }
        if (isDragging.includes('s')) {
          const newHeight = prev.height + deltaY;
          if (newHeight >= 50 && prev.y + newHeight <= imageSize.height) {
            newArea.height = newHeight;
          }
        }
        if (isDragging.includes('w')) {
          const newX = prev.x + deltaX;
          const newWidth = prev.width - deltaX;
          if (newWidth >= 50 && newX >= 0) {
            newArea.x = newX;
            newArea.width = newWidth;
          }
        }
        if (isDragging.includes('e')) {
          const newWidth = prev.width + deltaX;
          if (newWidth >= 50 && prev.x + newWidth <= imageSize.width) {
            newArea.width = newWidth;
          }
        }
      }

      return newArea;
    });

    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    setIsDragging(null);
  };

  const cursorMap: Record<ResizeHandle, string> = {
    nw: 'nwse-resize',
    n: 'ns-resize',
    ne: 'nesw-resize',
    e: 'ew-resize',
    se: 'nwse-resize',
    s: 'ns-resize',
    sw: 'nesw-resize',
    w: 'ew-resize',
    move: 'move',
    null: 'default',
  };

  const handles: Array<ResizeHandle> = ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'];
  const handlePositions: Record<ResizeHandle, string> = {
    nw: '-4px -4px',
    n: 'calc(50% - 4px) -4px',
    ne: '-4px -4px',
    e: '-4px calc(50% - 4px)',
    se: '-4px -4px',
    s: 'calc(50% - 4px) -4px',
    sw: '-4px -4px',
    w: '-4px calc(50% - 4px)',
    move: '0',
    null: '0',
  };

  const handleSize: Record<ResizeHandle, string> = {
    nw: '8px 8px',
    n: '8px 8px',
    ne: '8px 8px',
    e: '8px 16px',
    se: '8px 8px',
    s: '8px 8px',
    sw: '8px 8px',
    w: '8px 16px',
    move: '0',
    null: '0',
  };

  return (
    <ToolWrapper
      toolName="Image Cropper"
      toolDescription="Crop images to your desired area"
      category="image"
      howToUse={[
        "Upload your image file",
        "Drag the crop box to move it or use the handles on edges and corners to resize",
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
              <div 
                ref={containerRef}
                className="relative inline-block max-w-full"
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              >
                <img 
                  src={imageUrl} 
                  alt="Original" 
                  className="max-w-full h-auto block"
                  style={{ cursor: isDragging ? `${cursorMap[isDragging]}-resize` : 'default' }}
                />
                
                {/* Crop Box */}
                <div
                  className="absolute border-2 border-primary bg-primary/5"
                  style={{
                    left: `${cropArea.x}px`,
                    top: `${cropArea.y}px`,
                    width: `${cropArea.width}px`,
                    height: `${cropArea.height}px`,
                    cursor: isDragging === 'move' ? 'grabbing' : 'grab',
                  }}
                  onMouseDown={(e) => handleMouseDown(e, 'move')}
                  data-testid="crop-area"
                >
                  {/* Resize Handles */}
                  {handles.map((handle) => (
                    <div
                      key={handle}
                      className="absolute bg-primary hover:bg-primary/80 transition-colors"
                      style={{
                        ...(handle === 'n' || handle === 's' ? { left: 'calc(50% - 4px)', width: '8px' } : {}),
                        ...(handle === 'w' || handle === 'e' ? { top: 'calc(50% - 8px)', height: '16px' } : {}),
                        ...(handle === 'nw' || handle === 'ne' || handle === 'sw' || handle === 'se' ? { width: '8px', height: '8px' } : {}),
                        ...(handle === 'nw' && { top: '-4px', left: '-4px' }),
                        ...(handle === 'n' && { top: '-4px' }),
                        ...(handle === 'ne' && { top: '-4px', right: '-4px' }),
                        ...(handle === 'e' && { right: '-4px' }),
                        ...(handle === 'se' && { bottom: '-4px', right: '-4px' }),
                        ...(handle === 's' && { bottom: '-4px' }),
                        ...(handle === 'sw' && { bottom: '-4px', left: '-4px' }),
                        ...(handle === 'w' && { left: '-4px' }),
                      }}
                      onMouseDown={(e) => handleMouseDown(e, handle)}
                      style={{
                        cursor: `${handle}-resize`,
                      }}
                    />
                  ))}
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-4">
                Crop area: {Math.round(cropArea.x)}, {Math.round(cropArea.y)} | Size: {Math.round(cropArea.width)}x{Math.round(cropArea.height)}px
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
