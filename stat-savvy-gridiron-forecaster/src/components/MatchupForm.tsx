import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface MatchupFormProps {
  onSimulate: (playerName: string, opponent: string, week?: number, weather?: string, homeAway?: string) => void;
}

const NFL_TEAMS = [
  "Arizona Cardinals", "Atlanta Falcons", "Baltimore Ravens", "Buffalo Bills",
  "Carolina Panthers", "Chicago Bears", "Cincinnati Bengals", "Cleveland Browns",
  "Dallas Cowboys", "Denver Broncos", "Detroit Lions", "Green Bay Packers",
  "Houston Texans", "Indianapolis Colts", "Jacksonville Jaguars", "Kansas City Chiefs",
  "Las Vegas Raiders", "Los Angeles Chargers", "Los Angeles Rams", "Miami Dolphins",
  "Minnesota Vikings", "New England Patriots", "New Orleans Saints", "New York Giants",
  "New York Jets", "Philadelphia Eagles", "Pittsburgh Steelers", "San Francisco 49ers",
  "Seattle Seahawks", "Tampa Bay Buccaneers", "Tennessee Titans", "Washington Commanders"
];

const WEEKS = Array.from({ length: 18 }, (_, i) => i + 1);

const WEATHER_CONDITIONS = [
  "Clear/Sunny",
  "Cloudy", 
  "Light Rain",
  "Heavy Rain",
  "Snow",
  "Wind",
  "Dome/Indoor"
];

const HOME_AWAY_OPTIONS = [
  "Home",
  "Away", 
  "Neutral Site"
];

export default function MatchupForm({ onSimulate }: MatchupFormProps) {
  const [playerName, setPlayerName] = useState("");
  const [opponent, setOpponent] = useState("");
  const [week, setWeek] = useState<number>();
  const [weather, setWeather] = useState<string>();
  const [homeAway, setHomeAway] = useState<string>();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (playerName.trim() && opponent) {
      onSimulate(playerName.trim(), opponent, week, weather, homeAway);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto bg-card/95 backdrop-blur-sm border-2 border-primary/20 shadow-2xl">
      <CardHeader className="text-center pb-4">
        <CardTitle className="text-2xl font-bold text-card-foreground">
          🏈 MatchupSim
        </CardTitle>
        <p className="text-muted-foreground text-sm">
          Simulate player matchups and get predictions
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="player-name" className="text-sm font-medium">
              Player Name
            </Label>
            <Input
              id="player-name"
              placeholder="e.g., Josh Allen, Christian McCaffrey..."
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              className="w-full"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="opponent" className="text-sm font-medium">
              Opponent Team
            </Label>
            <Select value={opponent} onValueChange={setOpponent} required>
              <SelectTrigger id="opponent" className="w-full">
                <SelectValue placeholder="Select opponent team" />
              </SelectTrigger>
              <SelectContent className="max-h-48 bg-popover border border-border">
                {NFL_TEAMS.map((team) => (
                  <SelectItem key={team} value={team}>
                    {team}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="week" className="text-sm font-medium">
              Week (Optional)
            </Label>
            <Select value={week?.toString()} onValueChange={(value) => setWeek(value ? parseInt(value) : undefined)}>
              <SelectTrigger id="week" className="w-full">
                <SelectValue placeholder="Select week (optional)" />
              </SelectTrigger>
              <SelectContent className="max-h-48 bg-popover border border-border">
                {WEEKS.map((weekNum) => (
                  <SelectItem key={weekNum} value={weekNum.toString()}>
                    Week {weekNum}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="weather" className="text-sm font-medium">
              Weather Conditions (Optional)
            </Label>
            <Select value={weather} onValueChange={setWeather}>
              <SelectTrigger id="weather" className="w-full">
                <SelectValue placeholder="Select weather conditions" />
              </SelectTrigger>
              <SelectContent className="max-h-48 bg-popover border border-border">
                {WEATHER_CONDITIONS.map((condition) => (
                  <SelectItem key={condition} value={condition}>
                    {condition}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="home-away" className="text-sm font-medium">
              Home/Away (Optional)
            </Label>
            <Select value={homeAway} onValueChange={setHomeAway}>
              <SelectTrigger id="home-away" className="w-full">
                <SelectValue placeholder="Select game location" />
              </SelectTrigger>
              <SelectContent className="max-h-48 bg-popover border border-border">
                {HOME_AWAY_OPTIONS.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button 
            type="submit" 
            className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground font-semibold py-4 transition-all duration-200 hover:scale-105 shadow-lg"
            disabled={!playerName.trim() || !opponent}
          >
            🚀 Generate Prediction
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}