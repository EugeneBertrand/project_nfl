import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Player } from '@/types';
import { apiService } from '@/services/api';

interface PlayerSelectorProps {
  players?: Player[];
  teams?: string[];
  onPredict: (playerName: string, opponentTeam: string, week: string) => void;
  isLoading?: boolean;
}

const PlayerSelector = ({ onPredict, isLoading }: PlayerSelectorProps) => {
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredPlayers, setFilteredPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [teams, setTeams] = useState<string[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const [loadingTeams, setLoadingTeams] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [teamSearchTerm, setTeamSearchTerm] = useState('');
  const [teamDropdownOpen, setTeamDropdownOpen] = useState(false);
  const [week, setWeek] = useState<string>('');

  useEffect(() => {
    setLoading(true);
    apiService.getPlayers(searchTerm)
      .then(players => setFilteredPlayers(players))
      .finally(() => setLoading(false));
  }, [searchTerm]);

  useEffect(() => {
    setLoadingTeams(true);
    apiService.getTeams()
      .then(teams => setTeams(teams.filter(team => !!team && team.trim() !== '')))
      .finally(() => setLoadingTeams(false));
  }, []);

  // Call /api/simulate when player, opponent, and week are selected
  useEffect(() => {
    if (selectedPlayer && selectedTeam && week) {
      const params = new URLSearchParams({
        player: selectedPlayer.name,
        opponent: selectedTeam,
        week: week,
      });
      fetch(`http://localhost:4000/api/simulate?${params.toString()}`)
        .then(res => res.json())
        .then(data => {
          console.log('Simulate result:', data);
        })
        .catch(err => {
          console.error('Simulate error:', err);
        });
    }
  }, [selectedPlayer, selectedTeam, week]);

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      setDropdownOpen(true);
    }
  };

  const handleTeamInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      setTeamDropdownOpen(true);
    }
  };

  return (
    <Card className="w-full bg-gradient-card border-border shadow-card">
      <CardHeader className="pb-4">
        <CardTitle className="text-2xl font-bold text-foreground flex items-center gap-2">
          Select Player, Opponent, and Week
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <label className="text-sm font-medium text-foreground">Search Players</label>
          <Input
            ref={inputRef}
            placeholder="Type to search players..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            onKeyDown={handleInputKeyDown}
            className="bg-background border-border mb-2"
          />
          <label className="text-sm font-medium text-foreground">Choose Player</label>
          <Select
            open={dropdownOpen}
            onOpenChange={setDropdownOpen}
            value={selectedPlayer?.name}
            onValueChange={(value) => {
              const player = filteredPlayers.find(p => p.name === value);
              setSelectedPlayer(player || null);
              setDropdownOpen(false);
            }}
          >
            <SelectTrigger className="bg-background border-border">
              <SelectValue placeholder={loading ? "Loading..." : "Select a player..."} />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border max-h-60">
              {filteredPlayers
                .filter(player => !!player.name && player.name.trim() !== '')
                .map(player => (
                  <SelectItem key={player.name} value={player.name}>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{player.name}</span>
                      <Badge variant="secondary" className="text-xs">
                        {player.position}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {player.team}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              {filteredPlayers.filter(player => !!player.name && player.name.trim() !== '').length === 0 && !loading && (
                <div className="p-4 text-center text-muted-foreground">No players found.</div>
              )}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-3 mt-6">
          <label className="text-sm font-medium text-foreground">Search Teams</label>
          <Input
            placeholder="Type to search teams..."
            value={teamSearchTerm}
            onChange={e => setTeamSearchTerm(e.target.value)}
            onKeyDown={handleTeamInputKeyDown}
            className="bg-background border-border mb-2"
          />
          <label className="text-sm font-medium text-foreground">Opponent Team</label>
          <Select
            open={teamDropdownOpen}
            onOpenChange={setTeamDropdownOpen}
            value={selectedTeam || ''}
            onValueChange={value => {
              setSelectedTeam(value);
              setTeamDropdownOpen(false);
            }}
          >
            <SelectTrigger className="bg-background border-border">
              <SelectValue placeholder={loadingTeams ? "Loading teams..." : "Select opponent team..."} />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border max-h-60">
              {teams.filter(team => team.toLowerCase().includes(teamSearchTerm.toLowerCase()))
                .map(team => (
                  <SelectItem key={team} value={team}>
                    {team}
                  </SelectItem>
                ))}
              {teams.filter(team => team.toLowerCase().includes(teamSearchTerm.toLowerCase())).length === 0 && !loadingTeams && (
                <div className="p-4 text-center text-muted-foreground">No teams found.</div>
              )}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-3 mt-6">
          <label className="text-sm font-medium text-foreground">Week</label>
          <Select value={week} onValueChange={setWeek}>
            <SelectTrigger className="bg-background border-border">
              <SelectValue placeholder="Select week..." />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border max-h-60">
              {[...Array(18)].map((_, i) => (
                <SelectItem key={i + 1} value={(i + 1).toString()}>
                  Week {i + 1}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {/* Generate Prediction Button */}
        <button
          className="w-full mt-4 py-3 bg-primary text-primary-foreground font-semibold rounded-lg shadow-lg transition-all duration-200 hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed"
          disabled={!selectedPlayer || !selectedTeam || !week || isLoading}
          onClick={() => {
            if (selectedPlayer && selectedTeam && week) {
              onPredict(selectedPlayer.name, selectedTeam, week);
            }
          }}
          type="button"
        >
          {isLoading ? 'Generating Prediction...' : '🚀 Generate Prediction'}
        </button>
        {selectedPlayer && (
          <div className="p-4 bg-gradient-primary rounded-lg border border-border animate-fade-in mt-4">
            <div className="flex items-center gap-3">
              <div>
                <h3 className="font-bold text-primary-foreground">{selectedPlayer.name}</h3>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">
                    {selectedPlayer.position}
                  </Badge>
                  <span className="text-sm text-primary-foreground/80">
                    {selectedPlayer.team}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
        {selectedTeam && (
          <div className="p-4 bg-gradient-secondary rounded-lg border border-border animate-fade-in mt-4">
            <div className="flex items-center gap-3">
              <div>
                <h3 className="font-bold text-secondary-foreground">Opponent: {selectedTeam}</h3>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PlayerSelector;