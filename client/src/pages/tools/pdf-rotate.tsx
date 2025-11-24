import { useState } from "react";
import { ToolWrapper } from "@/components/tool-wrapper";
import { FileUpload } from "@/components/ui/file-upload";
import { Button } from "@/components/ui/button";
import { Download, Loader2, RotateCw, RotateCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { PDFDocument, degrees } from 'pdf-lib';
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export default function PdfRotate() {
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [rotatedPdfUrl, setRotatedPdfUrl] = useState<string>("");
  const [rotation, setRotation] = useState<string>("90");
  const [applyTo, setApplyTo] = useState<string>("all");
  const { toast } = useToast();

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
    setRotatedPdfUrl("");
  };

  const handleRotate = async () => {
    if (!file) return;

    setProcessing(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const rotationDegrees = parseInt(rotation);

      const pages = pdfDoc.getPages();
      
      if (applyTo === "all") {
        pages.forEach(page => {
          const currentRotation = page.getRotation().angle;
          page.setRotation(degrees((currentRotation + rotationDegrees) % 360));
        });
      } else if (applyTo === "odd") {
        pages.forEach((page, index) => {
          if (index % 2 === 0) {
            const currentRotation = page.getRotation().angle;
            page.setRotation(degrees((currentRotation + rotationDegrees) % 360));
          }
        });
      } else if (applyTo === "even") {
        pages.forEach((page, index) => {
          if (index % 2 === 1) {
            const currentRotation = page.getRotation().angle;
            page.setRotation(degrees((currentRotation + rotationDegrees) % 360));
          }
        });
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setRotatedPdfUrl(url);

      toast({
        title: "Rotation Complete!",
        description: `Successfully rotated PDF ${rotation}°.`,
      });
    } catch (error) {
      toast({
        title: "Rotation Failed",
        description: "There was an error rotating the PDF. Please try again.",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = rotatedPdfUrl;
    link.download = 'rotated-document.pdf';
    link.click();
  };

  return (
    <ToolWrapper
      toolName="PDF Rotate"
      toolDescription="Rotate PDF pages to any angle"
      category="pdf"
      howToUse={[
        "Upload your PDF file",
        "Select rotation angle (90°, 180°, or 270°)",
        "Choose which pages to rotate",
        "Download the rotated PDF",
      ]}
      relatedTools={[
        { name: "PDF Split", path: "/tool/pdf-split" },
        { name: "PDF Merge", path: "/tool/pdf-merge" },
        { name: "PDF to JPG", path: "/tool/pdf-to-jpg" },
      ]}
    >
      <div className="space-y-6">
        <FileUpload
          onFileSelect={handleFileSelect}
          acceptedFormats=".pdf"
          maxSizeMB={20}
          disabled={processing}
        />

        {file && !rotatedPdfUrl && (
          <div className="space-y-6">
            <div className="space-y-3">
              <Label>Rotation Angle</Label>
              <RadioGroup value={rotation} onValueChange={setRotation}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="90" id="r90" data-testid="radio-90" />
                  <Label htmlFor="r90" className="cursor-pointer flex items-center gap-2">
                    <RotateCw className="h-4 w-4" />
                    90° Clockwise
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="180" id="r180" data-testid="radio-180" />
                  <Label htmlFor="r180" className="cursor-pointer">180° (Upside Down)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="270" id="r270" data-testid="radio-270" />
                  <Label htmlFor="r270" className="cursor-pointer flex items-center gap-2">
                    <RotateCcw className="h-4 w-4" />
                    270° Counter-Clockwise
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-3">
              <Label>Apply To</Label>
              <RadioGroup value={applyTo} onValueChange={setApplyTo}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="all" id="all" data-testid="radio-all" />
                  <Label htmlFor="all" className="cursor-pointer">All Pages</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="odd" id="odd" data-testid="radio-odd" />
                  <Label htmlFor="odd" className="cursor-pointer">Odd Pages Only</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="even" id="even" data-testid="radio-even" />
                  <Label htmlFor="even" className="cursor-pointer">Even Pages Only</Label>
                </div>
              </RadioGroup>
            </div>

            <Button
              onClick={handleRotate}
              disabled={processing}
              className="w-full"
              size="lg"
              data-testid="button-rotate"
            >
              {processing ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Rotating...
                </>
              ) : (
                "Rotate PDF"
              )}
            </Button>
          </div>
        )}

        {rotatedPdfUrl && (
          <div className="space-y-4">
            <div className="p-4 border rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground mb-3">Your rotated PDF is ready!</p>
              <Button onClick={handleDownload} className="w-full" data-testid="button-download">
                <Download className="mr-2 h-4 w-4" />
                Download Rotated PDF
              </Button>
            </div>
          </div>
        )}
      </div>
    </ToolWrapper>
  );
}
