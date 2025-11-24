import { useState } from "react";
import { ToolWrapper } from "@/components/tool-wrapper";
import { FileUpload } from "@/components/ui/file-upload";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import * as pdfjsLib from 'pdfjs-dist';
import jsPDF from 'jspdf';
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

// Set up PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export default function PdfCompress() {
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [compressedPdfUrl, setCompressedPdfUrl] = useState<string>("");
  const [originalSize, setOriginalSize] = useState<number>(0);
  const [compressedSize, setCompressedSize] = useState<number>(0);
  const [quality, setQuality] = useState<number>(70);
  const { toast } = useToast();

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
    setOriginalSize(selectedFile.size);
    setCompressedPdfUrl("");
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
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = pdfjsLib.getDocument(arrayBuffer);
      const pdf = await pdfDoc.promise;
      const pageCount = pdf.numPages;

      // Create new PDF with compressed images
      const jsPdfDoc = new jsPDF();
      const scaleFactor = quality / 100;
      
      for (let pageNum = 1; pageNum <= pageCount; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const viewport = page.getViewport({ scale: scaleFactor });
        
        // Render page to canvas with reduced resolution
        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        
        const ctx = canvas.getContext('2d')!;
        await page.render({ canvasContext: ctx, viewport, canvas }).promise;
        
        // Convert canvas to compressed image
        const imgData = canvas.toDataURL('image/jpeg', quality / 100);
        
        // Add to new PDF
        const imgWidth = 210; // A4 width in mm
        const imgHeight = (viewport.height / viewport.width) * imgWidth;
        
        if (pageNum > 1) {
          jsPdfDoc.addPage();
        }
        jsPdfDoc.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight);
      }

      // Get compressed PDF bytes
      const pdfBytes = jsPdfDoc.output('arraybuffer');
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      
      setCompressedPdfUrl(url);
      setCompressedSize(pdfBytes.byteLength);

      const reduction = ((originalSize - pdfBytes.byteLength) / originalSize * 100).toFixed(1);
      
      toast({
        title: "Compression Complete!",
        description: `File size reduced by ${reduction}%.`,
      });
    } catch (error: any) {
      console.error('Compression error:', error);
      toast({
        title: "Compression Failed",
        description: error.message || "There was an error compressing the PDF. Please try again.",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = compressedPdfUrl;
    link.download = 'compressed-document.pdf';
    link.click();
  };

  return (
    <ToolWrapper
      toolName="PDF Compress"
      toolDescription="Reduce PDF file size while maintaining quality"
      category="pdf"
      howToUse={[
        "Upload your PDF file",
        "Adjust compression quality if needed",
        "Click 'Compress PDF' to process",
        "Download the compressed file",
      ]}
      relatedTools={[
        { name: "PDF Merge", path: "/tool/pdf-merge" },
        { name: "PDF Split", path: "/tool/pdf-split" },
        { name: "Image Compressor", path: "/tool/image-compress" },
      ]}
    >
      <div className="space-y-6">
        <FileUpload
          onFileSelect={handleFileSelect}
          acceptedFormats=".pdf"
          maxSizeMB={50}
          disabled={processing}
        />

        {file && !compressedPdfUrl && (
          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-md">
              <p className="text-sm"><span className="font-semibold">Original Size:</span> {formatFileSize(originalSize)}</p>
            </div>

            <div className="space-y-3">
              <Label>Output Quality: {quality}%</Label>
              <Slider
                value={[quality]}
                onValueChange={(value) => setQuality(value[0])}
                min={30}
                max={100}
                step={5}
                className="w-full"
                data-testid="slider-quality"
              />
              <p className="text-xs text-muted-foreground">
                Lower quality produces smaller files. 30-50% for maximum compression, 80-100% for better clarity.
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
                "Compress PDF"
              )}
            </Button>
          </div>
        )}

        {compressedPdfUrl && (
          <div className="space-y-4">
            <div className="p-4 border rounded-lg bg-muted/50 space-y-2">
              <p className="text-sm"><span className="font-semibold">Original:</span> {formatFileSize(originalSize)}</p>
              <p className="text-sm"><span className="font-semibold">Compressed:</span> {formatFileSize(compressedSize)}</p>
              <p className="text-sm text-primary"><span className="font-semibold">Saved:</span> {formatFileSize(originalSize - compressedSize)} ({((originalSize - compressedSize) / originalSize * 100).toFixed(1)}%)</p>
            </div>
            <Button onClick={handleDownload} className="w-full" data-testid="button-download">
              <Download className="mr-2 h-4 w-4" />
              Download Compressed PDF
            </Button>
          </div>
        )}
      </div>
    </ToolWrapper>
  );
}
