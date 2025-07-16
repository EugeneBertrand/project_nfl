import pandas as pd

# Change these values to test different players/opponents/weeks
PLAYER = "J.Jefferson"
OPPONENT = "BUF"
WEEK = "1"  # Use string if your CSV stores week as string

df = pd.read_csv('../gridiron-forecast-sim/backend/data/play_by_play_2024.csv', low_memory=False)

mask = (
    ((df['rusher_player_name'] == PLAYER) |
     (df['receiver_player_name'] == PLAYER) |
     (df['passer_player_name'] == PLAYER)) &
    (df['defteam'] == OPPONENT) &
    (df['week'] == WEEK)
)

matches = df[mask]
print(f"Found {len(matches)} rows for {PLAYER} vs {OPPONENT} in week {WEEK}")
print(matches.head()) 