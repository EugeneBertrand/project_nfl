import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface MatchupResultsProps {
  playerName: string;
  opponent: string;
  week?: number;
  weather?: string;
  homeAway?: string;
}

interface PredictionData {
  playerName: string;
  opponent: string;
  predictedRushingYards: number;
  predictedReceivingYards: number;
  predictedPassingYards: number;
  predictedRushingTDs: number;
  predictedReceivingTDs: number;
  predictedPassingTDs: number;
  confidence: string;
}

interface StatPrediction {
  label: string;
  value: number;
  unit: string;
  confidence: number;
}

export default function MatchupResults({ playerName, opponent, week, weather, homeAway }: MatchupResultsProps) {
  const [prediction, setPrediction] = useState<PredictionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Generate prediction from backend
  const generatePrediction = async () => {
    setIsGenerating(true);
    setError(null);
    
    try {
      // Build the API URL with parameters
      const params = new URLSearchParams({
        player: playerName,
        opponent: opponent
      });
      
      if (week) {
        params.append('week', week.toString());
      }

      const response = await fetch(`http://localhost:4000/api/predict/player?${params}`);
      
      if (!response.ok) {
        throw new Error(`Failed to get prediction: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Transform the backend response into our expected format
      const predictionData: PredictionData = {
        playerName: data.playerName || playerName,
        opponent: data.opponent || opponent,
        predictedRushingYards: data.predictedRushingYards || 0,
        predictedReceivingYards: data.predictedReceivingYards || 0,
        predictedPassingYards: data.predictedPassingYards || 0,
        predictedRushingTDs: data.predictedRushingTDs || 0,
        predictedReceivingTDs: data.predictedReceivingTDs || 0,
        predictedPassingTDs: data.predictedPassingTDs || 0,
        confidence: data.confidence || "Medium"
      };

      setPrediction(predictionData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate prediction');
      console.error('Prediction error:', err);
    } finally {
      setIsGenerating(false);
      setLoading(false);
    }
  };

  // Generate initial prediction on mount
  useEffect(() => {
    generatePrediction();
  }, [playerName, opponent, week]);

  // Convert prediction data to display format
  const getStats = (): StatPrediction[] => {
    if (!prediction) return [];

    const stats = [];
    
    // Convert confidence string to number for display
    const confidenceNumber = prediction.confidence === "High" ? 90 : 
                           prediction.confidence === "Medium" ? 75 : 60;
    
    if (prediction.predictedRushingYards > 0) {
      stats.push({
        label: "Rushing Yards",
        value: prediction.predictedRushingYards,
        unit: "yards",
        confidence: confidenceNumber
      });
    }
    
    if (prediction.predictedReceivingYards > 0) {
      stats.push({
        label: "Receiving Yards",
        value: prediction.predictedReceivingYards,
        unit: "yards",
        confidence: confidenceNumber
      });
    }
    
    if (prediction.predictedPassingYards > 0) {
      stats.push({
        label: "Passing Yards",
        value: prediction.predictedPassingYards,
        unit: "yards",
        confidence: confidenceNumber
      });
    }
    
    if (prediction.predictedRushingTDs > 0) {
      stats.push({
        label: "Rushing TDs",
        value: prediction.predictedRushingTDs,
        unit: "TDs",
        confidence: confidenceNumber
      });
    }
    
    if (prediction.predictedReceivingTDs > 0) {
      stats.push({
        label: "Receiving TDs",
        value: prediction.predictedReceivingTDs,
        unit: "TDs",
        confidence: confidenceNumber
      });
    }
    
    if (prediction.predictedPassingTDs > 0) {
      stats.push({
        label: "Passing TDs",
        value: prediction.predictedPassingTDs,
        unit: "TDs",
        confidence: confidenceNumber
      });
    }

    // Calculate fantasy points (basic calculation)
    const fantasyPoints = (prediction.predictedRushingYards * 0.1) + 
                         (prediction.predictedReceivingYards * 0.1) + 
                         (prediction.predictedPassingYards * 0.04) +
                         (prediction.predictedRushingTDs * 6) +
                         (prediction.predictedReceivingTDs * 6) +
                         (prediction.predictedPassingTDs * 4);
    
    if (fantasyPoints > 0) {
      stats.push({
        label: "Fantasy Points",
        value: fantasyPoints,
        unit: "pts",
        confidence: confidenceNumber
      });
    }

    return stats;
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return "bg-green-500/20 text-green-300 border-green-500/30";
    if (confidence >= 80) return "bg-yellow-500/20 text-yellow-300 border-yellow-500/30";
    return "bg-orange-500/20 text-orange-300 border-orange-500/30";
  };

  const getProjectionLevel = (points: number) => {
    if (points >= 20) return { level: "Elite", color: "text-green-400" };
    if (points >= 15) return { level: "Strong", color: "text-blue-400" };
    if (points >= 10) return { level: "Decent", color: "text-yellow-400" };
    return { level: "Risky", color: "text-orange-400" };
  };

  if (loading) {
    return (
      <Card className="w-full max-w-2xl mx-auto bg-card/95 backdrop-blur-sm border-2 border-accent/30 shadow-2xl">
        <CardContent className="flex items-center justify-center py-12">
          <div className="flex items-center gap-3">
            <Loader2 className="h-6 w-6 animate-spin text-accent" />
            <span className="text-muted-foreground">Generating prediction...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full max-w-2xl mx-auto bg-card/95 backdrop-blur-sm border-2 border-destructive/30 shadow-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-xl font-bold text-destructive">
            Prediction Error
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-muted-foreground">{error}</p>
          <Button 
            onClick={generatePrediction}
            disabled={isGenerating}
            className="bg-primary hover:bg-primary/90"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Retrying...
              </>
            ) : (
              "Try Again"
            )}
          </Button>
        </CardContent>
      </Card>
    );
  }

  const stats = getStats();
  const projectedPoints = stats.find(s => s.label === "Fantasy Points")?.value || 0;
  const projection = getProjectionLevel(projectedPoints);

  return (
    <Card className="w-full max-w-2xl mx-auto bg-card/95 backdrop-blur-sm border-2 border-accent/30 shadow-2xl animate-slide-up">
      <CardHeader className="text-center pb-4">
        <CardTitle className="text-2xl font-bold text-card-foreground">
          Matchup Projection
        </CardTitle>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 text-muted-foreground">
          <span className="font-semibold text-accent">{playerName}</span>
          <span className="hidden sm:inline">vs</span>
          <span className="font-medium">{opponent}</span>
          {week && (
            <>
              <span className="hidden sm:inline">•</span>
              <span className="text-sm">Week {week}</span>
            </>
          )}
        </div>
        <div className="flex flex-wrap items-center justify-center gap-2 mt-2 text-sm text-muted-foreground">
          {weather && (
            <span className="flex items-center gap-1">
              🌤️ {weather}
            </span>
          )}
          {homeAway && (
            <span className="flex items-center gap-1">
              🏠 {homeAway}
            </span>
          )}
        </div>
        <div className="flex items-center justify-center gap-3 mt-3">
          <Badge className={`${projection.color} bg-transparent border font-semibold`}>
            {projection.level} Matchup
          </Badge>
          <Badge variant="outline" className="border-accent/50 text-accent">
            {projectedPoints.toFixed(1)} Fantasy Points
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {stats.map((stat, index) => (
            <div 
              key={stat.label}
              className="bg-muted/10 rounded-lg p-4 border border-muted/20 hover:border-accent/30 transition-all duration-200"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-medium text-card-foreground text-sm">
                  {stat.label}
                </h4>
                <Badge 
                  className={`text-xs px-2 py-1 ${getConfidenceColor(stat.confidence)}`}
                >
                  {stat.confidence}%
                </Badge>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-accent">
                  {stat.value.toFixed(1)}
                </span>
                <span className="text-sm text-muted-foreground">
                  {stat.unit}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-primary/5 rounded-lg border border-primary/20">
          <h4 className="font-semibold text-card-foreground mb-2 flex items-center gap-2">
            📊 Analysis Summary
          </h4>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Based on recent performance trends, {opponent} defensive rankings{weather && `, ${weather.toLowerCase()} conditions`}{homeAway && `, and ${homeAway.toLowerCase()} field advantage`}, <span className="text-accent font-medium">{playerName}</span> projects as a <span className="font-semibold ${projection.color}">{projection.level.toLowerCase()}</span> play{week ? ` for Week ${week}` : " for this matchup"}. Confidence level: <span className="font-semibold text-accent">{prediction?.confidence || "Medium"}</span>.
          </p>
        </div>

        <div className="mt-4 text-center">
          <Button 
            onClick={generatePrediction}
            disabled={isGenerating}
            variant="outline"
            className="border-accent/50 text-accent hover:bg-accent/10"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Regenerating...
              </>
            ) : (
              "🔄 Regenerate Prediction"
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}