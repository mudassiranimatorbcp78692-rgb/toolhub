import { useState } from "react";
import { ToolWrapper } from "@/components/tool-wrapper";
import { FileUpload } from "@/components/ui/file-upload";
import { Button } from "@/components/ui/button";
import { Download, Loader2, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { PDFDocument } from 'pdf-lib';

export default function PdfMerge() {
  const [files, setFiles] = useState<File[]>([]);
  const [processing, setProcessing] = useState(false);
  const [mergedPdfUrl, setMergedPdfUrl] = useState<string>("");
  const { toast } = useToast();

  const handleFileSelect = (file: File) => {
    setFiles([...files, file]);
    setMergedPdfUrl("");
  };

  const handleRemoveFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
    setMergedPdfUrl("");
  };

  const handleMerge = async () => {
    if (files.length < 2) {
      toast({
        title: "Need More Files",
        description: "Please upload at least 2 PDF files to merge.",
        variant: "destructive",
      });
      return;
    }

    setProcessing(true);
    try {
      const mergedPdf = await PDFDocument.create();

      for (const file of files) {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await PDFDocument.load(arrayBuffer);
        const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        copiedPages.forEach((page) => mergedPdf.addPage(page));
      }

      const pdfBytes = await mergedPdf.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setMergedPdfUrl(url);

      toast({
        title: "Merge Complete!",
        description: `Successfully merged ${files.length} PDF files.`,
      });
    } catch (error) {
      toast({
        title: "Merge Failed",
        description: "There was an error merging the PDFs. Please try again.",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = mergedPdfUrl;
    link.download = 'merged-document.pdf';
    link.click();
  };

  return (
    <ToolWrapper
      toolName="PDF Merge"
      toolDescription="Combine multiple PDF files into one document"
      category="pdf"
      howToUse={[
        "Upload two or more PDF files",
        "Arrange files in the desired order",
        "Click 'Merge PDFs' to combine them",
        "Download the merged PDF file",
      ]}
      relatedTools={[
        { name: "PDF Split", path: "/tool/pdf-split" },
        { name: "PDF Compress", path: "/tool/pdf-compress" },
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

        {files.length > 0 && (
          <div className="space-y-4">
            <h3 className="font-semibold">Selected PDFs ({files.length})</h3>
            <div className="space-y-2">
              {files.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-md" data-testid={`file-${index}`}>
                  <span className="text-sm">{index + 1}. {file.name}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveFile(index)}
                    data-testid={`button-remove-${index}`}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {files.length >= 2 && !mergedPdfUrl && (
          <Button
            onClick={handleMerge}
            disabled={processing}
            className="w-full"
            size="lg"
            data-testid="button-merge"
          >
            {processing ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Merging PDFs...
              </>
            ) : (
              "Merge PDFs"
            )}
          </Button>
        )}

        {mergedPdfUrl && (
          <div className="space-y-4">
            <div className="p-4 border rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground mb-3">Your merged PDF is ready!</p>
              <Button onClick={handleDownload} className="w-full" data-testid="button-download">
                <Download className="mr-2 h-4 w-4" />
                Download Merged PDF
              </Button>
            </div>
          </div>
        )}
      </div>
    </ToolWrapper>
  );
}
