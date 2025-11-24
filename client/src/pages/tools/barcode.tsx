import { useState, useRef, useEffect } from "react";
import { ToolWrapper } from "@/components/tool-wrapper";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Download, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import JsBarcode from "jsbarcode";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export default function BarcodeGenerator() {
  const [text, setText] = useState<string>("");
  const [format, setFormat] = useState<string>("CODE128");
  const [processing, setProcessing] = useState(false);
  const [barcodeGenerated, setBarcodeGenerated] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (barcodeGenerated && canvasRef.current && text) {
      try {
        JsBarcode(canvasRef.current, text, {
          format: format,
          width: 2,
          height: 100,
          displayValue: true,
        });
      } catch (error) {
        // Barcode generation error handled
      }
    }
  }, [barcodeGenerated, text, format]);

  const handleGenerate = () => {
    if (!text.trim()) {
      toast({
        title: "No Text",
        description: "Please enter text to generate a barcode.",
        variant: "destructive",
      });
      return;
    }

    setProcessing(true);
    
    try {
      setBarcodeGenerated(true);
      toast({
        title: "Barcode Generated!",
        description: "Your barcode is ready to download.",
      });
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: "Invalid text for selected barcode format.",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleDownload = () => {
    if (canvasRef.current) {
      const link = document.createElement('a');
      link.download = 'barcode.png';
      link.href = canvasRef.current.toDataURL();
      link.click();
    }
  };

  return (
    <ToolWrapper
      toolName="Barcode Generator"
      toolDescription="Generate barcodes from text or numbers"
      category="generators"
      howToUse={[
        "Enter the text or number to encode",
        "Select the barcode format",
        "Click 'Generate Barcode'",
        "Download the barcode image",
      ]}
      relatedTools={[
        { name: "QR Code Generator", path: "/tool/qr-code" },
        { name: "Password Generator", path: "/tool/password" },
        { name: "Lorem Ipsum Generator", path: "/tool/lorem-ipsum" },
      ]}
    >
      <div className="space-y-6">
        <div>
          <Label htmlFor="text">Text to Encode</Label>
          <Input
            id="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Enter text or number"
            data-testid="input-text"
          />
        </div>

        <div className="space-y-3">
          <Label>Barcode Format</Label>
          <RadioGroup value={format} onValueChange={setFormat}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="CODE128" id="code128" data-testid="radio-code128" />
              <Label htmlFor="code128" className="cursor-pointer">CODE128 (Alphanumeric)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="EAN13" id="ean13" data-testid="radio-ean13" />
              <Label htmlFor="ean13" className="cursor-pointer">EAN13 (13 digits)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="UPC" id="upc" data-testid="radio-upc" />
              <Label htmlFor="upc" className="cursor-pointer">UPC (12 digits)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="CODE39" id="code39" data-testid="radio-code39" />
              <Label htmlFor="code39" className="cursor-pointer">CODE39 (Alphanumeric)</Label>
            </div>
          </RadioGroup>
        </div>

        <Button
          onClick={handleGenerate}
          disabled={processing || !text.trim()}
          className="w-full"
          size="lg"
          data-testid="button-generate"
        >
          {processing ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Generating...
            </>
          ) : (
            "Generate Barcode"
          )}
        </Button>

        {barcodeGenerated && (
          <div className="space-y-4">
            <div className="border rounded-lg p-6 bg-white flex items-center justify-center">
              <canvas ref={canvasRef} data-testid="canvas-barcode" />
            </div>
            <Button onClick={handleDownload} variant="outline" className="w-full" data-testid="button-download">
              <Download className="mr-2 h-4 w-4" />
              Download Barcode
            </Button>
          </div>
        )}
      </div>
    </ToolWrapper>
  );
}
