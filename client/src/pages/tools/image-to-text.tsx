import { useState } from "react";
import { ToolWrapper } from "@/components/tool-wrapper";
import { FileUpload } from "@/components/ui/file-upload";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Tesseract from 'tesseract.js';

export default function ImageToText() {
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [extractedText, setExtractedText] = useState("");
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
    setExtractedText("");
  };

  const handleExtract = async () => {
    if (!file) return;

    setProcessing(true);
    setProgress(0);

    try {
      const result = await Tesseract.recognize(file, 'eng', {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            setProgress(Math.round(m.progress * 100));
          }
        },
      });

      setExtractedText(result.data.text);
      toast({
        title: "Text Extracted!",
        description: "Successfully extracted text from the image.",
      });
    } catch (error) {
      toast({
        title: "Extraction Failed",
        description: "Could not extract text from the image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(extractedText);
    toast({
      title: "Copied!",
      description: "Text copied to clipboard.",
    });
  };

  return (
    <ToolWrapper
      toolName="Image to Text (OCR)"
      toolDescription="Extract text from images using optical character recognition"
      category="converters"
      howToUse={[
        "Upload an image containing text",
        "Click 'Extract Text' to start OCR processing",
        "Wait for the text extraction to complete",
        "Copy or download the extracted text",
      ]}
      relatedTools={[
        { name: "PDF to JPG", path: "/tool/pdf-to-jpg" },
        { name: "Image Compressor", path: "/tool/image-compress" },
        { name: "Word Counter", path: "/tool/word-counter" },
      ]}
    >
      <div className="space-y-6">
        <FileUpload
          onFileSelect={handleFileSelect}
          acceptedFormats=".jpg,.jpeg,.png"
          maxSizeMB={10}
          disabled={processing}
        />

        {file && !extractedText && (
          <Button
            onClick={handleExtract}
            disabled={processing}
            className="w-full"
            size="lg"
            data-testid="button-extract"
          >
            {processing ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Extracting Text... {progress}%
              </>
            ) : (
              "Extract Text"
            )}
          </Button>
        )}

        {extractedText && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold">Extracted Text</h3>
              <Button variant="outline" size="sm" onClick={handleCopy} data-testid="button-copy">
                <Copy className="mr-2 h-4 w-4" />
                Copy Text
              </Button>
            </div>
            <Textarea
              value={extractedText}
              readOnly
              rows={12}
              className="resize-none"
              data-testid="textarea-result"
            />
          </div>
        )}
      </div>
    </ToolWrapper>
  );
}
