import { useState } from "react";
import { ToolWrapper } from "@/components/tool-wrapper";
import { FileUpload } from "@/components/ui/file-upload";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { PDFDocument } from 'pdf-lib';

export default function JpgToPdf() {
  const [files, setFiles] = useState<File[]>([]);
  const [processing, setProcessing] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string>("");
  const { toast } = useToast();

  const handleFileSelect = (file: File) => {
    setFiles([...files, file]);
    setPdfUrl("");
  };

  const handleConvert = async () => {
    if (files.length === 0) return;

    setProcessing(true);
    try {
      const pdfDoc = await PDFDocument.create();

      for (const file of files) {
        const arrayBuffer = await file.arrayBuffer();
        const image = await pdfDoc.embedJpg(arrayBuffer);
        const page = pdfDoc.addPage([image.width, image.height]);
        page.drawImage(image, {
          x: 0,
          y: 0,
          width: image.width,
          height: image.height,
        });
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setPdfUrl(url);

      toast({
        title: "Conversion Complete!",
        description: `Successfully created PDF from ${files.length} image(s).`,
      });
    } catch (error) {
      toast({
        title: "Conversion Failed",
        description: "There was an error creating the PDF. Please try again.",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = 'converted.pdf';
    link.click();
  };

  return (
    <ToolWrapper
      toolName="JPG to PDF"
      toolDescription="Convert JPG images to PDF documents"
      category="pdf"
      howToUse={[
        "Upload one or more JPG images",
        "Images will be added in the order uploaded",
        "Click 'Create PDF' to convert",
        "Download your PDF file",
      ]}
      relatedTools={[
        { name: "PDF to JPG", path: "/tool/pdf-to-jpg" },
        { name: "Image Format Converter", path: "/tool/image-converter" },
        { name: "PDF Merge", path: "/tool/pdf-merge" },
      ]}
    >
      <div className="space-y-6">
        <FileUpload
          onFileSelect={handleFileSelect}
          acceptedFormats=".jpg,.jpeg"
          maxSizeMB={10}
          disabled={processing}
        />

        {files.length > 0 && (
          <div className="space-y-4">
            <h3 className="font-semibold">Selected Images: {files.length}</h3>
            <div className="flex flex-wrap gap-2">
              {files.map((file, index) => (
                <div key={index} className="text-sm bg-muted px-3 py-1 rounded" data-testid={`file-${index}`}>
                  {file.name}
                </div>
              ))}
            </div>
          </div>
        )}

        {files.length > 0 && !pdfUrl && (
          <Button
            onClick={handleConvert}
            disabled={processing}
            className="w-full"
            size="lg"
            data-testid="button-convert"
          >
            {processing ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Creating PDF...
              </>
            ) : (
              "Create PDF"
            )}
          </Button>
        )}

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
