import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { HomePage } from "@/components/pages/HomePage";
import { InputPage } from "@/components/pages/InputPage";
import { AnalysisPage } from "@/components/pages/AnalysisPage";
import { ResultsPage } from "@/components/pages/ResultsPage";
import { AnalysisData, AnalysisResult } from "@/types";

type PageType = "home" | "input" | "analysis" | "results";

export function KayaAI() {
  const [currentPage, setCurrentPage] = useState<PageType>("home");
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);

  const handleGetStarted = () => {
    setCurrentPage("input");
  };

  const handleAnalyze = (data: AnalysisData) => {
    setAnalysisData(data);
    setCurrentPage("analysis");
  };

  const handleAnalysisComplete = (result: AnalysisResult) => {
    setAnalysisResult(result);
    setCurrentPage("results");
  };

  const handleAnalyzeAnother = () => {
    setAnalysisData(null);
    setAnalysisResult(null);
    setCurrentPage("input");
  };

  const handleBackToHome = () => {
    setCurrentPage("home");
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      case "home":
        return <HomePage onGetStarted={handleGetStarted} />;
      
      case "input":
        return (
          <InputPage 
            onAnalyze={handleAnalyze} 
            onBack={handleBackToHome}
          />
        );
      
      case "analysis":
        return analysisData ? (
          <AnalysisPage 
            analysisData={analysisData}
            onComplete={handleAnalysisComplete}
          />
        ) : null;
      
      case "results":
        return analysisData && analysisResult ? (
          <ResultsPage
            analysisData={analysisData}
            result={analysisResult}
            onAnalyzeAnother={handleAnalyzeAnother}
          />
        ) : null;
      
      default:
        return <HomePage onGetStarted={handleGetStarted} />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="flex-1">
        {renderCurrentPage()}
      </main>
      <Footer />
    </div>
  );
}