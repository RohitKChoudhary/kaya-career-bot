import React from "react";

const Index = () => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-8">
      <div className="max-w-4xl mx-auto text-center space-y-8">
        <div className="hero-gradient text-white rounded-3xl p-12 shadow-2xl">
          <h1 className="text-5xl font-bold mb-4">Kaya AI</h1>
          <h2 className="text-2xl mb-6 opacity-90">Career Navigator</h2>
          <p className="text-lg opacity-80 max-w-2xl mx-auto">
            Transform your resume with AI-powered analysis. Get personalized recommendations, 
            see how you match against dream jobs, and receive a sample "near-perfect" resume 
            tailored to your target companies.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="card-elegant p-6 rounded-xl">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 mx-auto">
              <span className="text-2xl">🎯</span>
            </div>
            <h3 className="text-xl font-semibold mb-3">Multi-AI Analysis</h3>
            <p className="text-muted-foreground">
              Advanced AI ensemble using Gemini, OpenRouter, and Mistral for comprehensive resume evaluation.
            </p>
          </div>

          <div className="card-elegant p-6 rounded-xl">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 mx-auto">
              <span className="text-2xl">🎯</span>
            </div>
            <h3 className="text-xl font-semibold mb-3">Role-Specific Optimization</h3>
            <p className="text-muted-foreground">
              Tailored analysis for specific job roles and companies to maximize your application success.
            </p>
          </div>

          <div className="card-elegant p-6 rounded-xl">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 mx-auto">
              <span className="text-2xl">📊</span>
            </div>
            <h3 className="text-xl font-semibold mb-3">Intelligent Scoring</h3>
            <p className="text-muted-foreground">
              Sophisticated scoring system with multi-model analysis and personalized recommendations.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <p className="text-muted-foreground">
            <strong>Note:</strong> This is the React frontend. For the full AI-powered analysis, 
            please use the Python backend located in the <code className="bg-muted px-2 py-1 rounded">backend/</code> folder.
          </p>
          <div className="bg-muted/50 rounded-lg p-4 text-sm">
            <p className="font-medium mb-2">To run the Python backend:</p>
            <code className="block">cd backend && pip install -r requirements.txt && streamlit run main.py</code>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;