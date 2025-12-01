import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Moon, Sun, Menu, X, Star } from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { useState } from "react";
import { MyAccountModal } from "@/components/my-account-modal";

export function Navbar() {
  const { theme, setTheme } = useTheme();
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Tools", path: "/tools" },
    { name: "Pricing", path: "/pricing" },
    { name: "Contact", path: "/contact" },
  ];

  const isActive = (path: string) => location === path;

  return (
    <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/">
            <div className="flex items-center gap-2 hover-elevate active-elevate-2 px-3 py-2 rounded-md transition-transform cursor-pointer" data-testid="link-home">
              <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
                <span className="text-primary-foreground font-semibold text-lg">OT</span>
              </div>
              <span className="font-semibold text-xl hidden sm:block">Office Tools Hub</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link key={link.path} href={link.path}>
                <div
                  data-testid={`link-${link.name.toLowerCase()}`}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors hover-elevate active-elevate-2 cursor-pointer ${
                    isActive(link.path)
                      ? "bg-accent text-accent-foreground"
                      : "text-foreground"
                  }`}
                >
                  {link.name}
                </div>
              </Link>
            ))}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              data-testid="button-theme-toggle"
            >
              {theme === "dark" ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>

            <MyAccountModal />

            <Link href="/pricing">
              <div className="hidden md:inline-flex">
                <Button variant="default" size="sm" data-testid="button-go-pro">
                  Go Pro
                </Button>
              </div>
            </Link>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              data-testid="button-mobile-menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <div className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link key={link.path} href={link.path}>
                  <div
                    onClick={() => setMobileMenuOpen(false)}
                    data-testid={`mobile-link-${link.name.toLowerCase()}`}
                    className={`px-4 py-3 rounded-md text-sm font-medium transition-colors hover-elevate active-elevate-2 cursor-pointer ${
                      isActive(link.path)
                        ? "bg-accent text-accent-foreground"
                        : "text-foreground"
                    }`}
                  >
                    {link.name}
                  </div>
                </Link>
              ))}
              <Link href="/pricing">
                <div onClick={() => setMobileMenuOpen(false)}>
                  <Button
                    variant="default"
                    className="w-full mt-2"
                    data-testid="mobile-button-go-pro"
                  >
                    Go Pro
                  </Button>
                </div>
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
