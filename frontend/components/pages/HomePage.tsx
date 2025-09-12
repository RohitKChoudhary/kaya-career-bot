import { Target, Brain, TrendingUp, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FeatureCard } from "@/components/features/FeatureCard";

interface HomePageProps {
  onGetStarted: () => void;
}

export function HomePage({ onGetStarted }: HomePageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="bg-gradient-hero rounded-3xl p-12 text-center text-primary-foreground shadow-glow">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-2xl mb-6">
              <Target className="w-8 h-8" />
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              Kaya AI
            </h1>
            <h2 className="text-2xl md:text-3xl font-semibold mb-6 opacity-95">
              Intelligent Career Navigator
            </h2>
            <p className="text-xl opacity-90 max-w-3xl mx-auto leading-relaxed">
              Transform your resume with AI-powered analysis. Get personalized recommendations, 
              see how you match against dream jobs, and receive a sample "near-perfect" resume 
              tailored to your target companies.
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard
              icon={Brain}
              title="Multi-AI Analysis"
              description="Advanced AI ensemble using Gemini, OpenRouter, and Mistral for comprehensive resume evaluation with multiple perspectives."
            />
            <FeatureCard
              icon={Target}
              title="Role-Specific Optimization"
              description="Tailored analysis for specific job roles and companies to maximize your application success rate and relevance."
            />
            <FeatureCard
              icon={TrendingUp}
              title="Intelligent Scoring"
              description="Sophisticated scoring system with multi-model analysis and personalized recommendations for improvement."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-2xl text-center">
          <div className="bg-gradient-card rounded-2xl p-8 shadow-card border border-border/50">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-hero rounded-xl mb-6">
              <Zap className="w-6 h-6 text-primary-foreground" />
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-4">
              Ready to Transform Your Career?
            </h3>
            <p className="text-muted-foreground mb-8 text-lg">
              Join thousands of professionals who've improved their resumes with our AI-powered platform.
            </p>
            <Button 
              variant="hero" 
              size="xl" 
              onClick={onGetStarted}
              className="min-w-[200px]"
            >
              🚀 Let's Get Started
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}