import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface ScoreDisplayProps {
  score: number;
  maxScore?: number;
  title?: string;
  subtitle?: string;
}

export function ScoreDisplay({ 
  score, 
  maxScore = 10, 
  title = "Overall Resume Score",
  subtitle 
}: ScoreDisplayProps) {
  const percentage = (score / maxScore) * 100;
  
  const getScoreVariant = () => {
    if (percentage >= 80) return "success";
    if (percentage >= 60) return "warning";
    return "danger";
  };

  const getScoreColor = () => {
    if (percentage >= 80) return "text-success";
    if (percentage >= 60) return "text-warning";
    return "text-destructive";
  };

  return (
    <Card className="bg-gradient-hero text-primary-foreground border-0 shadow-glow">
      <CardContent className="p-8 text-center">
        <h2 className="text-xl font-semibold mb-6 opacity-95">{title}</h2>
        
        <div className="mb-6">
          <div className={`text-6xl font-bold mb-2 ${getScoreColor()}`}>
            {score.toFixed(1)}
          </div>
          <div className="text-lg opacity-90">out of {maxScore}</div>
        </div>

        <Progress 
          value={percentage} 
          variant={getScoreVariant()}
          className="mb-4"
          showLabel={false}
        />
        
        {subtitle && (
          <p className="text-sm opacity-80 mt-4">{subtitle}</p>
        )}
      </CardContent>
    </Card>
  );
}