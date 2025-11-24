import { useCallback, useState } from "react";
import { Upload, X, File } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  acceptedFormats?: string;
  maxSizeMB?: number;
  multiple?: boolean;
  disabled?: boolean;
}

export function FileUpload({
  onFileSelect,
  acceptedFormats = "*",
  maxSizeMB = 10,
  multiple = false,
  disabled = false,
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string>("");

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragging(true);
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const validateFile = (file: File): boolean => {
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxSizeMB) {
      setError(`File size must be less than ${maxSizeMB}MB`);
      return false;
    }
    setError("");
    return true;
  };

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      if (disabled) return;

      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) {
        const file = files[0];
        if (validateFile(file)) {
          setSelectedFile(file);
          onFileSelect(file);
        }
      }
    },
    [disabled, onFileSelect, maxSizeMB]
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (validateFile(file)) {
        setSelectedFile(file);
        onFileSelect(file);
      }
    }
  };

  const handleRemove = () => {
    setSelectedFile(null);
    setError("");
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
  };

  return (
    <div className="w-full">
      {!selectedFile ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            "relative border-2 border-dashed rounded-xl min-h-[300px] flex flex-col items-center justify-center p-8 transition-colors cursor-pointer",
            isDragging && !disabled ? "border-primary bg-primary/5" : "border-border",
            disabled && "opacity-50 cursor-not-allowed"
          )}
          data-testid="dropzone-file-upload"
        >
          <input
            type="file"
            onChange={handleFileChange}
            accept={acceptedFormats}
            multiple={multiple}
            disabled={disabled}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            data-testid="input-file-upload"
          />
          
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
            <Upload className="w-10 h-10 text-primary" />
          </div>
          
          <h3 className="text-xl font-semibold mb-2">
            Drag & drop your file here
          </h3>
          
          <p className="text-sm text-muted-foreground mb-6">
            or click to browse from your device
          </p>
          
          <div className="text-xs text-muted-foreground space-y-1 text-center">
            {acceptedFormats !== "*" && (
              <p>Accepted formats: {acceptedFormats}</p>
            )}
            <p>Maximum file size: {maxSizeMB}MB</p>
          </div>
        </div>
      ) : (
        <div className="border-2 border-border rounded-xl p-6" data-testid="file-preview">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <File className="w-6 h-6 text-primary" />
            </div>
            
            <div className="flex-grow min-w-0">
              <p className="font-medium truncate" data-testid="text-file-name">
                {selectedFile.name}
              </p>
              <p className="text-sm text-muted-foreground" data-testid="text-file-size">
                {formatFileSize(selectedFile.size)}
              </p>
            </div>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={handleRemove}
              disabled={disabled}
              data-testid="button-remove-file"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>
      )}
      
      {error && (
        <p className="text-sm text-destructive mt-2" data-testid="text-file-error">
          {error}
        </p>
      )}
    </div>
  );
}
