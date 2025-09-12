import { useState, useEffect } from "react";
import { Brain, CheckCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { AIModelManager, ResumeAnalyzer } from "@/services/aiService";
import { AnalysisData, AnalysisResult } from "@/types";

interface AnalysisPageProps {
  analysisData: AnalysisData;
  onComplete: (result: AnalysisResult) => void;
}

export function AnalysisPage({ analysisData, onComplete }: AnalysisPageProps) {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  
  const steps = [
    { name: "Input Processing", description: "Validating and preparing your resume" },
    { name: "AI Analysis", description: "Multi-AI ensemble analyzing your resume" },
    { name: "Ideal Resume Generation", description: "Creating role-specific benchmark" },
    { name: "Score Calculation", description: "Computing comprehensive match score" },
    { name: "Recommendations", description: "Generating personalized feedback" }
  ];

  useEffect(() => {
    const runAnalysis = async () => {
      try {
        // Step 1: Input Processing
        setCurrentStep(0);
        setProgress(20);
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Step 2: AI Analysis
        setCurrentStep(1);
        setProgress(40);
        const aiManager = new AIModelManager();
        const analyzer = new ResumeAnalyzer(aiManager);

        // Step 3: Generate ideal resume
        setCurrentStep(2);
        setProgress(60);
        const idealResume = await analyzer.generateIdealResume(
          analysisData.company,
          analysisData.jobRole
        );

        // Step 4: Evaluate user resume
        setCurrentStep(3);
        setProgress(80);
        const evaluations = await analyzer.evaluateResume(
          analysisData.resumeText,
          idealResume,
          analysisData.company,
          analysisData.jobRole
        );

        // Step 5: Aggregate scores
        setCurrentStep(4);
        setProgress(100);
        const { finalScore, parsedEvaluations } = analyzer.aggregateScores(evaluations);

        await new Promise(resolve => setTimeout(resolve, 1000));

        const result: AnalysisResult = {
          finalScore,
          displayScore: Math.round(finalScore / 10 * 10) / 10,
          idealResume,
          evaluations: parsedEvaluations
        };

        onComplete(result);
      } catch (error) {
        console.error('Analysis error:', error);
        // Provide fallback result
        const fallbackResult: AnalysisResult = {
          finalScore: 65,
          displayScore: 6.5,
          idealResume: "Sample ideal resume content...",
          evaluations: [{
            model: "Fallback Analysis",
            evaluation: {
              score: 65,
              gaps: "• Add more quantified achievements\n• Include relevant technical skills\n• Strengthen professional summary",
              keywords: "• Programming languages\n• Cloud technologies\n• Industry frameworks",
              recommendations: "• Quantify all achievements\n• Add technical skills\n• Tailor to role requirements"
            }
          }]
        };
        onComplete(fallbackResult);
      }
    };

    runAnalysis();
  }, [analysisData, onComplete]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 py-8">
      <div className="container mx-auto max-w-4xl px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-hero rounded-2xl mb-6">
            <Brain className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-4">AI Analysis in Progress</h1>
          <p className="text-xl text-muted-foreground">
            Our multi-AI ensemble is analyzing your resume for{" "}
            <span className="font-semibold text-primary">{analysisData.jobRole}</span> at{" "}
            <span className="font-semibold text-primary">{analysisData.company}</span>
          </p>
        </div>

        {/* Progress Overview */}
        <Card className="mb-8 bg-gradient-card border border-border/50 shadow-card">
          <CardContent className="p-8">
            <div className="text-center mb-6">
              <div className="text-3xl font-bold text-primary mb-2">{progress}%</div>
              <p className="text-muted-foreground">Analysis Complete</p>
            </div>
            
            <Progress value={progress} className="mb-6" showLabel={false} />
            
            <div className="text-center">
              <p className="font-semibold text-foreground">{steps[currentStep]?.name}</p>
              <p className="text-sm text-muted-foreground">{steps[currentStep]?.description}</p>
            </div>
          </CardContent>
        </Card>

        {/* Steps Progress */}
        <div className="space-y-4">
          {steps.map((step, index) => (
            <Card key={index} className={`transition-all duration-300 ${
              index <= currentStep 
                ? 'bg-success/10 border-success/20' 
                : 'bg-gradient-card border-border/50'
            }`}>
              <CardContent className="flex items-center gap-4 p-4">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                  index < currentStep 
                    ? 'bg-success text-success-foreground' 
                    : index === currentStep
                    ? 'bg-primary text-primary-foreground animate-pulse'
                    : 'bg-muted text-muted-foreground'
                }`}>
                  {index < currentStep ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    <span className="text-sm font-bold">{index + 1}</span>
                  )}
                </div>
                
                <div className="flex-1">
                  <h3 className={`font-semibold ${
                    index <= currentStep ? 'text-foreground' : 'text-muted-foreground'
                  }`}>
                    {step.name}
                  </h3>
                  <p className={`text-sm ${
                    index <= currentStep ? 'text-muted-foreground' : 'text-muted-foreground/70'
                  }`}>
                    {step.description}
                  </p>
                </div>
                
                {index === currentStep && (
                  <div className="w-6 h-6">
                    <div className="animate-spin rounded-full border-2 border-primary border-t-transparent w-6 h-6"></div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* AI Models Info */}
        <Card className="mt-8 bg-gradient-card border border-border/50 shadow-card">
          <CardContent className="p-6">
            <h3 className="font-semibold text-foreground mb-4">AI Models Working on Your Analysis</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {['Gemini Pro', 'OpenRouter GPT', 'Mistral AI'].map((model, index) => (
                <div key={model} className="flex items-center gap-3 p-3 bg-background/50 rounded-lg">
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium">{model}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}