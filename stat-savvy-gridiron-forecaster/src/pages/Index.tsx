import { useState, useEffect } from 'react';
import { Zap, Activity, Target } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import PlayerSelector from '@/components/PlayerSelector';
import PredictionResults from '@/components/PredictionResults';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorDisplay from '@/components/ErrorDisplay';
import { apiService } from '@/services/api';
import { Player, PredictionResponse } from '@/types';
import { useRef } from 'react';

const Index = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [teams, setTeams] = useState<string[]>([]);
  const [prediction, setPrediction] = useState<PredictionResponse | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isLoadingPrediction, setIsLoadingPrediction] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const [scrollY, setScrollY] = useState(0);
  const mainRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const loadInitialData = async () => {
    try {
      setIsLoadingData(true);
      setError(null);
      
      const [playersData, teamsData] = await Promise.all([
        apiService.getPlayers(),
        apiService.getTeams()
      ]);
      
      setPlayers(playersData);
      console.log('Loaded players:', playersData);
      setTeams(teamsData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load data';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoadingData(false);
    }
  };

  const handlePredict = async (playerName: string, opponentTeam: string, week: string) => {
    try {
      setIsLoadingPrediction(true);
      setError(null);
      // Find the full player object
      const playerObj = players.find(p => p.name === playerName);
      const result = await apiService.predictStats({ playerId: playerName, opponentTeam, week });
      // Attach the real player object if found
      if (playerObj) {
        result.player = playerObj;
      }
      setPrediction(result);
      toast({
        title: 'Prediction Generated!',
        description: `Stats predicted for ${playerName} vs ${opponentTeam} (Week ${week})`,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate prediction';
      setError(errorMessage);
      toast({
        title: 'Prediction Failed',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoadingPrediction(false);
    }
  };

  if (isLoadingData) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
        <LoadingSpinner message="Loading NFL data..." />
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-gradient-hero transition-all duration-500"
      ref={mainRef}
      style={{
        background: `linear-gradient(135deg, hsl(215, 25%, 8%) 0%, hsl(215, 25%, 12%) ${80 - scrollY / 20}%, hsl(142, 76%, 36%) ${90 - scrollY / 40}%)`,
      }}
    >
      {/* Header */}
      <header className="bg-card/50 backdrop-blur-sm border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
                <Zap className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
                  PlayPredict
                </h1>
                <p className="text-xs text-muted-foreground">NFL Performance Predictions</p>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-6">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Activity className="h-4 w-4" />
                <span>Real-time Stats</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Target className="h-4 w-4" />
                <span>AI Predictions</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto space-y-10">
          {/* Hero Section */}
          <div className="text-center space-y-6 mb-12 bg-card/80 rounded-2xl shadow-2xl p-10 border border-accent/30">
            <h2
              className="text-4xl md:text-5xl font-bold mb-2 drop-shadow-sm bg-gradient-to-r from-green-500 via-black to-green-700 bg-[length:200%_200%] bg-clip-text text-transparent animate-gradient-x"
              style={{
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                color: 'transparent',
              }}
            >
              PlayPredict
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Choose any NFL player and opponent to instantly see AI-powered stat predictions for that matchup. PlayPredict leverages advanced machine learning models trained on years of historical player stats, team performance, and play-by-play data. Our algorithms analyze defensive strengths, recent trends, and weekly matchups to generate projections tailored to each unique scenario. We incorporate factors like player usage, injuries, and opponent tendencies to provide the most accurate, context-aware forecasts possible. Whether you're a fantasy football enthusiast, a data-driven fan, or just curious about the numbers behind the game, our platform delivers transparent, data-driven insights. Enjoy a seamless, interactive experience designed to help you explore, compare, and understand NFL player performance like never before.
            </p>
          </div>

          {error && (
            <ErrorDisplay 
              message={error} 
              onRetry={prediction ? () => setError(null) : loadInitialData}
            />
          )}

          {!error && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              {/* Player Selection */}
              <div>
                <PlayerSelector
                  players={players}
                  teams={teams}
                  onPredict={handlePredict}
                  isLoading={isLoadingPrediction}
                />
              </div>

              {/* Results */}
              <div>
                {isLoadingPrediction ? (
                  <div className="bg-card rounded-2xl border border-accent/30 p-10 shadow-xl">
                    <LoadingSpinner message="Analyzing matchup and generating predictions..." />
                  </div>
                ) : prediction ? (
                  <div className="rounded-2xl shadow-xl border border-accent/30 bg-card/90 p-8">
                    <PredictionResults prediction={prediction} />
                  </div>
                ) : (
                  <div className="bg-card/60 rounded-2xl border border-accent/30 p-10 text-center shadow-md">
                    <Target className="h-16 w-16 text-accent mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      Ready to Predict
                    </h3>
                    <p className="text-muted-foreground">
                      Select a player and opponent team to see AI-powered performance predictions
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Floating Footer with Credits */}
      <footer className="bg-card/90 border-t border-accent/40 px-6 py-3 flex items-center justify-between text-sm text-muted-foreground backdrop-blur-md mt-12">
        <span className="font-semibold text-primary">NFL Analytics</span>
        <a
          href="mailto:eugenebertrand65@gmail.com"
          className="inline-block px-6 py-2 bg-primary text-primary-foreground font-semibold rounded-lg shadow transition hover:bg-primary/90"
        >
          Contact
        </a>
      </footer>
    </div>
  );
};

export default Index;
