import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { CategoryCard } from "@/components/ui/category-card";
import { ToolCard } from "@/components/ui/tool-card";
import { toolCategories, getPopularTools } from "@/lib/tools-data";
import { CheckCircle2, Zap, Shield, ArrowRight } from "lucide-react";

export default function Home() {
  const popularTools = getPopularTools();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Column */}
            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className="text-5xl md:text-6xl font-semibold leading-tight" data-testid="text-hero-title">
                  All Your <span className="text-primary">Office Tools</span> in One Place
                </h1>
                <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
                  Free online tools for PDF, image, text processing, converters, generators, and calculators. 
                  No login required, fast processing, 100% free.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/tools">
                  <Button size="lg" className="text-base" data-testid="button-browse-tools">
                    Browse All Tools
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right Column */}
            <div className="relative">
              <div className="aspect-square max-w-md mx-auto">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 rounded-3xl blur-3xl"></div>
                <div className="relative bg-card border-2 border-border rounded-2xl p-8 backdrop-blur h-full flex items-center justify-center">
                  <div className="text-center space-y-4">
                    <div className="w-32 h-32 bg-primary/10 rounded-full mx-auto flex items-center justify-center">
                      <Zap className="w-16 h-16 text-primary" />
                    </div>
                    <h3 className="text-2xl font-semibold">Lightning Fast</h3>
                    <p className="text-muted-foreground">Process files instantly in your browser</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-semibold mb-4" data-testid="text-categories-title">
              Explore Tool Categories
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Choose from our comprehensive collection of free online tools
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {toolCategories.map((category) => (
              <CategoryCard
                key={category.id}
                name={category.name}
                description={category.description}
                icon={category.icon}
                toolCount={category.toolCount}
                path={category.path}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Popular Tools */}
      <section className="py-20 bg-card">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-semibold mb-4" data-testid="text-popular-tools-title">
                Popular Tools
              </h2>
              <p className="text-lg text-muted-foreground">
                Most frequently used tools by our community
              </p>
            </div>
            <Link href="/tools">
              <Button variant="outline" data-testid="button-view-all-tools">
                View All
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {popularTools.map((tool) => (
              <ToolCard
                key={tool.id}
                name={tool.name}
                description={tool.description}
                icon={tool.icon}
                path={tool.path}
                isPro={tool.isPro}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 bg-card">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-semibold mb-4" data-testid="text-features-title">
              Why Choose Office Tools Hub?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              The fastest and most reliable online tool platform
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            <div className="text-center space-y-4" data-testid="feature-free">
              <div className="w-16 h-16 bg-primary/10 rounded-full mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">100% Free</h3>
              <p className="text-muted-foreground leading-relaxed">
                All tools are completely free to use. No hidden charges, no subscriptions required.
              </p>
            </div>

            <div className="text-center space-y-4" data-testid="feature-no-login">
              <div className="w-16 h-16 bg-primary/10 rounded-full mx-auto flex items-center justify-center">
                <Shield className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">No Login Required</h3>
              <p className="text-muted-foreground leading-relaxed">
                Start using tools instantly. Your files are processed locally and never stored.
              </p>
            </div>

            <div className="text-center space-y-4" data-testid="feature-fast">
              <div className="w-16 h-16 bg-primary/10 rounded-full mx-auto flex items-center justify-center">
                <Zap className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Lightning Fast</h3>
              <p className="text-muted-foreground leading-relaxed">
                Process files instantly in your browser. No uploading to servers, instant results.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-primary/10 via-background to-accent/10">
        <div className="max-w-4xl mx-auto px-4 md:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-semibold mb-6" data-testid="text-cta-title">
            Ready to Get Started?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join millions of users who trust Office Tools Hub for their daily workflow needs.
          </p>
          <Link href="/tools">
            <Button size="lg" className="text-base" data-testid="button-get-started">
              Get Started Free
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
