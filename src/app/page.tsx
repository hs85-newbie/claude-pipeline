import { Hero } from "@/components/landing/hero";
import { PipelineViz } from "@/components/landing/pipeline-viz";
import { Features } from "@/components/landing/features";
import { Pricing } from "@/components/landing/pricing";
import { CTA } from "@/components/landing/cta";
import { Separator } from "@/components/ui/separator";

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <Hero />
      <Separator />
      <PipelineViz />
      <Separator />
      <Features />
      <Separator />
      <Pricing />
      <Separator />
      <CTA />

      {/* 푸터 */}
      <footer className="border-t border-border py-8 text-center text-sm text-muted-foreground">
        <p>&copy; 2026 Claude Pipeline. Built with Claude.</p>
      </footer>
    </div>
  );
}
