import { useState } from "react";
import { ToolWrapper } from "@/components/tool-wrapper";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Download } from "lucide-react";
import QRCode from 'qrcode';

export default function QrCodeGenerator() {
  const [text, setText] = useState("");
  const [size, setSize] = useState([300]);
  const [qrCodeUrl, setQrCodeUrl] = useState("");

  const generateQRCode = async () => {
    if (!text) return;

    try {
      const url = await QRCode.toDataURL(text, {
        width: size[0],
        margin: 2,
      });
      setQrCodeUrl(url);
    } catch (error) {
      console.error("Error generating QR code:", error);
    }
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = qrCodeUrl;
    link.download = 'qrcode.png';
    link.click();
  };

  return (
    <ToolWrapper
      toolName="QR Code Generator"
      toolDescription="Create QR codes for URLs, text, or contact information"
      category="generators"
      howToUse={[
        "Enter the text or URL you want to encode",
        "Adjust the size using the slider",
        "Click 'Generate QR Code'",
        "Download your QR code image",
      ]}
      relatedTools={[
        { name: "Barcode Generator", path: "/tool/barcode" },
        { name: "Password Generator", path: "/tool/password" },
        { name: "Image to Text OCR", path: "/tool/image-to-text" },
      ]}
    >
      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="qr-text">Text or URL</Label>
          <Input
            id="qr-text"
            placeholder="Enter text, URL, or contact info"
            value={text}
            onChange={(e) => setText(e.target.value)}
            data-testid="input-text"
          />
        </div>

        <div className="space-y-2">
          <Label>Size: {size[0]}px</Label>
          <Slider
            value={size}
            onValueChange={setSize}
            min={200}
            max={600}
            step={50}
            data-testid="slider-size"
          />
        </div>

        <Button
          onClick={generateQRCode}
          disabled={!text}
          className="w-full"
          size="lg"
          data-testid="button-generate"
        >
          Generate QR Code
        </Button>

        {qrCodeUrl && (
          <div className="space-y-4">
            <div className="flex justify-center p-8 bg-muted rounded-lg">
              <img src={qrCodeUrl} alt="Generated QR Code" className="max-w-full" data-testid="image-qrcode" />
            </div>
            <Button onClick={handleDownload} className="w-full" data-testid="button-download">
              <Download className="mr-2 h-4 w-4" />
              Download QR Code
            </Button>
          </div>
        )}
      </div>
    </ToolWrapper>
  );
}
