export function Footer() {
  return (
    <footer className="border-t border-border/50 bg-gradient-card mt-12">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center space-y-2">
          <p className="font-semibold text-foreground">Kaya AI - Career Navigator</p>
          <p className="text-sm text-muted-foreground">
            Powered by Multi-AI Technology | Gemini + OpenRouter + Mistral
          </p>
          <p className="text-xs text-muted-foreground">
            Demo version with integrated API keys for testing purposes.
          </p>
        </div>
      </div>
    </footer>
  );
}