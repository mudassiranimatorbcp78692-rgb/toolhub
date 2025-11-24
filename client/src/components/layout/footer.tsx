import { Link } from "wouter";
import { Mail, Linkedin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    tools: [
      { name: "PDF Tools", path: "/tools/pdf" },
      { name: "Image Tools", path: "/tools/image" },
      { name: "Text Tools", path: "/tools/text" },
      { name: "Generators", path: "/tools/generators" },
    ],
    company: [
      { name: "About Us", path: "/about" },
      { name: "Pricing", path: "/pricing" },
      { name: "Contact", path: "/contact" },
    ],
    legal: [
      { name: "Terms of Service", path: "/terms" },
      { name: "Privacy Policy", path: "/privacy" },
    ],
  };

  return (
    <footer className="bg-card border-t mt-20">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
          {/* Brand Column */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
                <span className="text-primary-foreground font-semibold text-lg">OT</span>
              </div>
              <span className="font-semibold text-lg">Office Tools Hub</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              All-in-one free online toolbox for PDF, image, text processing, and more. No login required.
            </p>
            <div className="flex gap-2">
              <a 
                href="https://www.linkedin.com/in/mudassir-ahmed-929195276/" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                <Button variant="ghost" size="icon" data-testid="link-social-linkedin">
                  <Linkedin className="h-4 w-4" />
                </Button>
              </a>
            </div>
          </div>

          {/* Tools Links */}
          <div>
            <h3 className="font-semibold text-sm mb-4">Tools</h3>
            <ul className="space-y-3">
              {footerLinks.tools.map((link) => (
                <li key={link.path}>
                  <Link href={link.path}>
                    <span className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer" data-testid={`footer-link-${link.name.toLowerCase().replace(/\s+/g, '-')}`}>
                      {link.name}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="font-semibold text-sm mb-4">Company</h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.path}>
                  <Link href={link.path}>
                    <span className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer" data-testid={`footer-link-${link.name.toLowerCase().replace(/\s+/g, '-')}`}>
                      {link.name}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="font-semibold text-sm mb-4">Stay Updated</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Get the latest tools and updates directly to your inbox.
            </p>
            <div className="flex gap-2">
              <Input
                type="email"
                placeholder="Enter your email"
                className="flex-1"
                data-testid="input-newsletter-email"
              />
              <Button variant="default" size="sm" data-testid="button-newsletter-subscribe">
                <Mail className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © {currentYear} Office Tools Hub. Created by <span className="font-semibold text-foreground">Mudassir Ahmed</span>. All rights reserved.
            </p>
            <div className="flex gap-6">
              {footerLinks.legal.map((link) => (
                <Link key={link.path} href={link.path}>
                  <span className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer" data-testid={`footer-link-${link.name.toLowerCase().replace(/\s+/g, '-')}`}>
                    {link.name}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
