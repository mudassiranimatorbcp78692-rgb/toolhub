import { useState } from "react";
import { ToolWrapper } from "@/components/tool-wrapper";
import { FileUpload } from "@/components/ui/file-upload";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { PDFDocument } from 'pdf-lib';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface SplitPage {
  url: string;
  pageNum: number;
  endPage?: number; // For range extracts
}

export default function PdfSplit() {
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [pageCount, setPageCount] = useState<number>(0);
  const [splitPages, setSplitPages] = useState<SplitPage[]>([]);
  const [rangeStart, setRangeStart] = useState<string>("");
  const [rangeEnd, setRangeEnd] = useState<string>("");
  const { toast} = useToast();

  const handleFileSelect = async (selectedFile: File) => {
    setFile(selectedFile);
    setSplitPages([]);
    setRangeStart("");
    setRangeEnd("");

    // Get page count
    try {
      const arrayBuffer = await selectedFile.arrayBuffer();
      const pdf = await PDFDocument.load(arrayBuffer);
      setPageCount(pdf.getPageCount());
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not load PDF file.",
        variant: "destructive",
      });
    }
  };

  const handleSplitAll = async () => {
    if (!file) return;

    // Revoke old URLs to prevent memory leak
    splitPages.forEach(page => URL.revokeObjectURL(page.url));

    setProcessing(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const originalPdf = await PDFDocument.load(arrayBuffer);
      const pages: { url: string; pageNum: number }[] = [];

      for (let i = 0; i < originalPdf.getPageCount(); i++) {
        const newPdf = await PDFDocument.create();
        const [copiedPage] = await newPdf.copyPages(originalPdf, [i]);
        newPdf.addPage(copiedPage);

        const pdfBytes = await newPdf.save();
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        pages.push({ url, pageNum: i + 1 });
      }

      setSplitPages(pages);
      toast({
        title: "Split Complete!",
        description: `Successfully split PDF into ${pages.length} separate files.`,
      });
    } catch (error) {
      toast({
        title: "Split Failed",
        description: "There was an error splitting the PDF. Please try again.",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleSplitRange = async () => {
    if (!file || !rangeStart || !rangeEnd) {
      toast({
        title: "Missing Input",
        description: "Please enter both start and end page numbers.",
        variant: "destructive",
      });
      return;
    }

    const start = parseInt(rangeStart, 10);
    const end = parseInt(rangeEnd, 10);

    if (isNaN(start) || isNaN(end) || start < 1 || end > pageCount || start > end) {
      toast({
        title: "Invalid Range",
        description: `Please enter valid page numbers (1-${pageCount}).`,
        variant: "destructive",
      });
      return;
    }

    // Revoke old URLs to prevent memory leak
    splitPages.forEach(page => URL.revokeObjectURL(page.url));

    setProcessing(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const originalPdf = await PDFDocument.load(arrayBuffer);
      const newPdf = await PDFDocument.create();

      for (let i = start - 1; i < end; i++) {
        const [copiedPage] = await newPdf.copyPages(originalPdf, [i]);
        newPdf.addPage(copiedPage);
      }

      const pdfBytes = await newPdf.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);

      setSplitPages([{ url, pageNum: start, endPage: end }]);
      toast({
        title: "Extract Complete!",
        description: `Successfully extracted pages ${start}-${end}.`,
      });
    } catch (error) {
      toast({
        title: "Extract Failed",
        description: "There was an error extracting pages. Please try again.",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleDownload = (page: SplitPage) => {
    const link = document.createElement('a');
    link.href = page.url;
    // Use range filename if endPage exists, otherwise single page
    link.download = page.endPage 
      ? `pages-${page.pageNum}-${page.endPage}.pdf`
      : `page-${page.pageNum}.pdf`;
    link.click();
  };

  return (
    <ToolWrapper
      toolName="PDF Split"
      toolDescription="Split PDF into separate pages or extract page ranges"
      category="pdf"
      howToUse={[
        "Upload a PDF file",
        "Choose to split all pages or extract a specific range",
        "Click the appropriate split button",
        "Download individual pages or the extracted range",
      ]}
      relatedTools={[
        { name: "PDF Merge", path: "/tool/pdf-merge" },
        { name: "PDF to JPG", path: "/tool/pdf-to-jpg" },
        { name: "PDF Rotate", path: "/tool/pdf-rotate" },
      ]}
    >
      <div className="space-y-6">
        <FileUpload
          onFileSelect={handleFileSelect}
          acceptedFormats=".pdf"
          maxSizeMB={20}
          disabled={processing}
        />

        {file && pageCount > 0 && !splitPages.length && (
          <div className="space-y-6">
            <div className="p-4 bg-muted rounded-md">
              <p className="text-sm"><span className="font-semibold">Total Pages:</span> {pageCount}</p>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-3">Split All Pages</h3>
                <Button
                  onClick={handleSplitAll}
                  disabled={processing}
                  className="w-full"
                  data-testid="button-split-all"
                >
                  {processing ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Splitting...
                    </>
                  ) : (
                    `Split into ${pageCount} Separate Files`
                  )}
                </Button>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-semibold mb-3">Extract Page Range</h3>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <Label htmlFor="range-start">From Page</Label>
                    <Input
                      id="range-start"
                      type="number"
                      min="1"
                      max={pageCount}
                      value={rangeStart}
                      onChange={(e) => setRangeStart(e.target.value)}
                      placeholder="1"
                      data-testid="input-range-start"
                    />
                  </div>
                  <div>
                    <Label htmlFor="range-end">To Page</Label>
                    <Input
                      id="range-end"
                      type="number"
                      min="1"
                      max={pageCount}
                      value={rangeEnd}
                      onChange={(e) => setRangeEnd(e.target.value)}
                      placeholder={pageCount.toString()}
                      data-testid="input-range-end"
                    />
                  </div>
                </div>
                <Button
                  onClick={handleSplitRange}
                  disabled={processing || !rangeStart || !rangeEnd}
                  variant="outline"
                  className="w-full"
                  data-testid="button-split-range"
                >
                  {processing ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Extracting...
                    </>
                  ) : (
                    "Extract Page Range"
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}

        {splitPages.length > 0 && (
          <div className="space-y-4">
            <h3 className="font-semibold">
              {splitPages.length === 1 ? "Extracted PDF" : `Split PDFs (${splitPages.length})`}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {splitPages.map((page, index) => (
                <div key={index} className="p-4 border rounded-lg" data-testid={`page-${index}`}>
                  <p className="text-sm mb-3">
                    {page.endPage ? `Pages ${page.pageNum}-${page.endPage}` : `Page ${page.pageNum}`}
                  </p>
                  <Button
                    onClick={() => handleDownload(page)}
                    variant="outline"
                    size="sm"
                    className="w-full"
                    data-testid={`button-download-${index}`}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </ToolWrapper>
  );
}
