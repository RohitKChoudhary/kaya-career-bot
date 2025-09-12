import { Target, Sparkles } from "lucide-react";

export function Header() {
  return (
    <header className="bg-gradient-card border-b border-border/50 shadow-card">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-10 h-10 bg-gradient-hero rounded-xl">
              <Target className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Kaya AI</h1>
              <p className="text-sm text-muted-foreground">Career Navigator</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Sparkles className="w-4 h-4" />
            <span>Powered by Multi-AI Technology</span>
          </div>
        </div>
      </div>
    </header>
  );
}