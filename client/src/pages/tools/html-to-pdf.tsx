import { useState } from "react";
import { ToolWrapper } from "@/components/tool-wrapper";
import { FileUpload } from "@/components/ui/file-upload";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Download, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export default function HtmlToPdf() {
  const [htmlContent, setHtmlContent] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string>("");
  const { toast } = useToast();

  const handleFileSelect = async (selectedFile: File) => {
    setFile(selectedFile);
    setPdfUrl("");
    
    const reader = new FileReader();
    reader.onload = (e) => {
      setHtmlContent(e.target?.result as string);
    };
    reader.readAsText(selectedFile);
  };

  const handleConvert = async () => {
    if (!htmlContent.trim()) {
      toast({
        title: "No HTML Content",
        description: "Please enter or upload HTML content to convert.",
        variant: "destructive",
      });
      return;
    }

    setProcessing(true);
    try {
      // Create a temporary div to render HTML
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = htmlContent;
      tempDiv.style.width = '800px';
      tempDiv.style.padding = '20px';
      tempDiv.style.backgroundColor = 'white';
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px';
      document.body.appendChild(tempDiv);

      // Convert to canvas
      const canvas = await html2canvas(tempDiv, {
        scale: 2,
        backgroundColor: '#ffffff',
        windowHeight: tempDiv.scrollHeight,
      });

      // Remove temporary div
      document.body.removeChild(tempDiv);

      // Create PDF with proper pagination
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pageWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;

      // Calculate how many pixels of canvas fit in one PDF page
      const pxPerMm = canvasWidth / pageWidth;
      const pageHeightPx = pageHeight * pxPerMm;

      let currentY = 0;
      let pageNumber = 0;

      while (currentY < canvasHeight) {
        if (pageNumber > 0) {
          pdf.addPage();
        }

        // Calculate the slice height for this page
        const sliceHeight = Math.min(pageHeightPx, canvasHeight - currentY);

        // Create a new canvas for this page slice
        const sliceCanvas = document.createElement('canvas');
        sliceCanvas.width = canvasWidth;
        sliceCanvas.height = sliceHeight;

        const sliceCtx = sliceCanvas.getContext('2d')!;
        // Draw the slice from the original canvas
        sliceCtx.drawImage(
          canvas,
          0, currentY, // Source x, y
          canvasWidth, sliceHeight, // Source width, height
          0, 0, // Destination x, y
          canvasWidth, sliceHeight // Destination width, height
        );

        // Convert slice to image and add to PDF
        const sliceData = sliceCanvas.toDataURL('image/png');
        const sliceHeightMm = sliceHeight / pxPerMm;
        pdf.addImage(sliceData, 'PNG', 0, 0, pageWidth, sliceHeightMm);

        currentY += pageHeightPx;
        pageNumber++;
      }

      // Create blob URL
      const pdfBlob = pdf.output('blob');
      const url = URL.createObjectURL(pdfBlob);
      setPdfUrl(url);

      toast({
        title: "Conversion Complete!",
        description: "HTML successfully converted to PDF.",
      });
    } catch (error) {
      toast({
        title: "Conversion Failed",
        description: "There was an error converting HTML to PDF. Please try again.",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = 'document.pdf';
    link.click();
  };

  return (
    <ToolWrapper
      toolName="HTML to PDF"
      toolDescription="Convert HTML content to PDF documents"
      category="converters"
      howToUse={[
        "Enter HTML content or upload an HTML file",
        "Click 'Convert to PDF' to process",
        "Preview and download the PDF",
        "Styling from CSS will be preserved",
      ]}
      relatedTools={[
        { name: "JPG to PDF", path: "/tool/jpg-to-pdf" },
        { name: "PDF to JPG", path: "/tool/pdf-to-jpg" },
        { name: "Image to Text", path: "/tool/image-to-text" },
      ]}
    >
      <div className="space-y-6">
        <Tabs defaultValue="text">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="text" data-testid="tab-text">Enter HTML</TabsTrigger>
            <TabsTrigger value="file" data-testid="tab-file">Upload File</TabsTrigger>
          </TabsList>

          <TabsContent value="text" className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">HTML Content</label>
              <Textarea
                value={htmlContent}
                onChange={(e) => setHtmlContent(e.target.value)}
                placeholder="<html>&#10;  <body>&#10;    <h1>Hello World</h1>&#10;    <p>This will be converted to PDF.</p>&#10;  </body>&#10;</html>"
                className="min-h-[300px] font-mono text-sm"
                data-testid="textarea-html"
              />
            </div>
          </TabsContent>

          <TabsContent value="file" className="space-y-4">
            <FileUpload
              onFileSelect={handleFileSelect}
              acceptedFormats=".html,.htm"
              maxSizeMB={5}
              disabled={processing}
            />
            {file && (
              <p className="text-sm text-muted-foreground">
                Loaded: {file.name}
              </p>
            )}
          </TabsContent>
        </Tabs>

        <Button
          onClick={handleConvert}
          disabled={processing || !htmlContent.trim()}
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
            "Convert to PDF"
          )}
        </Button>

        {pdfUrl && (
          <div className="space-y-4">
            <div className="p-4 border rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground mb-3">Your PDF is ready!</p>
              <Button onClick={handleDownload} className="w-full" data-testid="button-download">
                <Download className="mr-2 h-4 w-4" />
                Download PDF
              </Button>
            </div>
          </div>
        )}
      </div>
    </ToolWrapper>
  );
}
