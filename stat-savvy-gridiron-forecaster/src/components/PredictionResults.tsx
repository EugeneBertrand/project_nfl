import { TrendingUp, Target, BarChart3, Trophy } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { PredictionResponse } from '@/types';

interface PredictionResultsProps {
  prediction: PredictionResponse;
}

const StatCard = ({ 
  title, 
  predicted, 
  icon: Icon, 
  color,
  unit = ''
}: {
  title: string;
  predicted: number;
  icon: any;
  color: string;
  unit?: string;
}) => {
  return (
    <Card className="bg-gradient-card border-border shadow-card animate-slide-up">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          <Icon className={`h-4 w-4 ${color}`} />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-end gap-2">
          <span className="text-3xl font-bold text-foreground">
            {predicted.toFixed(predicted < 10 ? 1 : 0)}
          </span>
          <span className="text-sm text-muted-foreground mb-1">{unit}</span>
        </div>
      </CardContent>
    </Card>
  );
};

const PredictionResults = ({ prediction }: PredictionResultsProps) => {
  const { player, opponent, predictions } = prediction;

  const stats = [
    {
      title: 'Rushing Yards',
      predicted: predictions.rushingYards,
      icon: TrendingUp,
      color: 'text-stat-rushing',
      unit: '',
    },
    {
      title: 'Receiving Yards', 
      predicted: predictions.receivingYards,
      icon: Target,
      color: 'text-stat-receiving',
      unit: '',
    },
    {
      title: 'Passing Yards',
      predicted: predictions.passingYards,
      icon: BarChart3,
      color: 'text-stat-passing',
      unit: '',
    },
    {
      title: 'Rush TDs',
      predicted: predictions.rushingTouchdowns ?? 0,
      icon: Trophy,
      color: 'text-stat-touchdowns',
      unit: '',
    },
    {
      title: 'Rec TDs',
      predicted: predictions.receivingTouchdowns ?? 0,
      icon: Trophy,
      color: 'text-stat-touchdowns',
      unit: '',
    },
    {
      title: 'Pass TDs',
      predicted: predictions.passingTouchdowns ?? 0,
      icon: Trophy,
      color: 'text-stat-touchdowns',
      unit: '',
    },
  ];

  const totalPredictedTDs =
    (predictions.rushingTouchdowns ?? 0) +
    (predictions.receivingTouchdowns ?? 0) +
    (predictions.passingTouchdowns ?? 0);
  const totalYards = predictions.rushingYards + predictions.receivingYards + predictions.passingYards;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <Card className="bg-gradient-primary border-border shadow-primary">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-primary-foreground">
                {player.name}
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-primary-foreground/80">{player.team}</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-primary-foreground">vs {opponent}</div>
              <div className="text-sm text-primary-foreground/80">Game Prediction</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* PlayPredict Summary Paragraph */}
      <p className="text-base text-muted-foreground text-center my-4">
        {player.name} is projected for <b>{totalYards.toFixed(0)} total yards</b> and <b>{totalPredictedTDs.toFixed(1)} total TDs</b> against {opponent}.
      </p>

      {/* Quick Stats Overview */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="bg-gradient-secondary border-border shadow-secondary">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-secondary-foreground">
              {totalYards.toFixed(0)}
            </div>
            <div className="text-sm text-secondary-foreground/80">Total Yards</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-secondary border-border shadow-secondary">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-secondary-foreground">
              {totalPredictedTDs.toFixed(1)}
            </div>
            <div className="text-sm text-secondary-foreground/80">Total TDs</div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((stat, index) => (
          <div key={stat.title} style={{ animationDelay: `${index * 0.1}s` }}>
            <StatCard {...stat} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default PredictionResults;