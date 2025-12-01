import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Analytics } from "@vercel/analytics/react";

// Pages
import Home from "@/pages/home";
import AllTools from "@/pages/all-tools";
import ToolCategory from "@/pages/tool-category";
import Pricing from "@/pages/pricing";
import Activate from "@/pages/activate";
import Contact from "@/pages/contact";
import Terms from "@/pages/terms";
import Privacy from "@/pages/privacy";
import NotFound from "@/pages/not-found";

// Tool Pages
import PdfToJpg from "@/pages/tools/pdf-to-jpg";
import JpgToPdf from "@/pages/tools/jpg-to-pdf";
import PdfMerge from "@/pages/tools/pdf-merge";
import PdfSplit from "@/pages/tools/pdf-split";
import PdfCompress from "@/pages/tools/pdf-compress";
import PdfRotate from "@/pages/tools/pdf-rotate";
import ImageCompress from "@/pages/tools/image-compress";
import ImageResize from "@/pages/tools/image-resize";
import ImageCrop from "@/pages/tools/image-crop";
import ImageConverter from "@/pages/tools/image-converter";
import WordCounter from "@/pages/tools/word-counter";
import CaseConverter from "@/pages/tools/case-converter";
import LoremIpsum from "@/pages/tools/lorem-ipsum";
import GrammarChecker from "@/pages/tools/grammar-checker";
import QrCode from "@/pages/tools/qr-code";
import Barcode from "@/pages/tools/barcode";
import PasswordGenerator from "@/pages/tools/password-generator";
import UsernameGenerator from "@/pages/tools/username";
import ImageToText from "@/pages/tools/image-to-text";
import HtmlToPdf from "@/pages/tools/html-to-pdf";
import PercentageCalculator from "@/pages/tools/percentage-calculator";
import LoanCalculator from "@/pages/tools/loan-calculator";
import GpaCalculator from "@/pages/tools/gpa-calculator";
import ZakatCalculator from "@/pages/tools/zakat-calculator";
import GenericTool from "@/pages/tools/generic-tool";

function Router() {
  return (
    <Switch>
      {/* Main Pages */}
      <Route path="/" component={Home} />
      <Route path="/tools" component={AllTools} />
      <Route path="/tools/:category" component={ToolCategory} />
      <Route path="/pricing" component={Pricing} />
      <Route path="/activate" component={Activate} />
      <Route path="/contact" component={Contact} />
      <Route path="/terms" component={Terms} />
      <Route path="/privacy" component={Privacy} />

      {/* Specific Tool Pages */}
      <Route path="/tool/pdf-to-jpg" component={PdfToJpg} />
      <Route path="/tool/jpg-to-pdf" component={JpgToPdf} />
      <Route path="/tool/pdf-merge" component={PdfMerge} />
      <Route path="/tool/pdf-split" component={PdfSplit} />
      <Route path="/tool/pdf-compress" component={PdfCompress} />
      <Route path="/tool/pdf-rotate" component={PdfRotate} />
      <Route path="/tool/image-compress" component={ImageCompress} />
      <Route path="/tool/image-resize" component={ImageResize} />
      <Route path="/tool/image-crop" component={ImageCrop} />
      <Route path="/tool/image-converter" component={ImageConverter} />
      <Route path="/tool/word-counter" component={WordCounter} />
      <Route path="/tool/case-converter" component={CaseConverter} />
      <Route path="/tool/lorem-ipsum" component={LoremIpsum} />
      <Route path="/tool/grammar-checker" component={GrammarChecker} />
      <Route path="/tool/qr-code" component={QrCode} />
      <Route path="/tool/barcode" component={Barcode} />
      <Route path="/tool/password" component={PasswordGenerator} />
      <Route path="/tool/username" component={UsernameGenerator} />
      <Route path="/tool/image-to-text" component={ImageToText} />
      <Route path="/tool/html-to-pdf" component={HtmlToPdf} />
      <Route path="/tool/percentage-calculator" component={PercentageCalculator} />
      <Route path="/tool/loan-calculator" component={LoanCalculator} />
      <Route path="/tool/gpa-calculator" component={GpaCalculator} />
      <Route path="/tool/zakat-calculator" component={ZakatCalculator} />

      {/* Generic Tool Page for remaining tools */}
      <Route path="/tool/:toolId" component={GenericTool} />

      {/* 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-1">
              <Router />
            </main>
            <Footer />
          </div>
          <Toaster />
          <Analytics />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
