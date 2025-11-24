import { useState, useRef, useEffect } from "react";
import { ToolWrapper } from "@/components/tool-wrapper";
import { FileUpload } from "@/components/ui/file-upload";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type ResizeHandle = 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w' | 'move';

export default function ImageCrop() {
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [croppedImageUrl, setCroppedImageUrl] = useState<string>("");
  const [imageUrl, setImageUrl] = useState<string>("");
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState<ResizeHandle | null>(null);
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
  };

  const handles: Array<ResizeHandle> = ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'];

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
                  {handles.map((handle) => {
                    const baseStyle: React.CSSProperties = {
                      position: 'absolute',
                      backgroundColor: 'currentColor',
                      zIndex: 10,
                    };

                    if (handle === 'nw') {
                      baseStyle.width = '8px';
                      baseStyle.height = '8px';
                      baseStyle.top = '-4px';
                      baseStyle.left = '-4px';
                      baseStyle.cursor = 'nwse-resize';
                    } else if (handle === 'n') {
                      baseStyle.width = '8px';
                      baseStyle.height = '8px';
                      baseStyle.top = '-4px';
                      baseStyle.left = 'calc(50% - 4px)';
                      baseStyle.cursor = 'ns-resize';
                    } else if (handle === 'ne') {
                      baseStyle.width = '8px';
                      baseStyle.height = '8px';
                      baseStyle.top = '-4px';
                      baseStyle.right = '-4px';
                      baseStyle.cursor = 'nesw-resize';
                    } else if (handle === 'e') {
                      baseStyle.width = '8px';
                      baseStyle.height = '16px';
                      baseStyle.top = 'calc(50% - 8px)';
                      baseStyle.right = '-4px';
                      baseStyle.cursor = 'ew-resize';
                    } else if (handle === 'se') {
                      baseStyle.width = '8px';
                      baseStyle.height = '8px';
                      baseStyle.bottom = '-4px';
                      baseStyle.right = '-4px';
                      baseStyle.cursor = 'nwse-resize';
                    } else if (handle === 's') {
                      baseStyle.width = '8px';
                      baseStyle.height = '8px';
                      baseStyle.bottom = '-4px';
                      baseStyle.left = 'calc(50% - 4px)';
                      baseStyle.cursor = 'ns-resize';
                    } else if (handle === 'sw') {
                      baseStyle.width = '8px';
                      baseStyle.height = '8px';
                      baseStyle.bottom = '-4px';
                      baseStyle.left = '-4px';
                      baseStyle.cursor = 'nesw-resize';
                    } else if (handle === 'w') {
                      baseStyle.width = '8px';
                      baseStyle.height = '16px';
                      baseStyle.top = 'calc(50% - 8px)';
                      baseStyle.left = '-4px';
                      baseStyle.cursor = 'ew-resize';
                    }

                    return (
                      <div
                        key={handle}
                        style={baseStyle}
                        onMouseDown={(e) => handleMouseDown(e, handle)}
                        className="hover:opacity-80 transition-opacity"
                      />
                    );
                  })}
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
