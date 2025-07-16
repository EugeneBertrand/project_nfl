import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
import joblib

# Load data
df = pd.read_csv('../gridiron-forecast-sim/backend/data/play_by_play_2024.csv', low_memory=False)

# Helper to get position for each row
def get_position(row):
    if pd.notna(row['passer_player_name']):
        return 'QB'
    elif pd.notna(row['rusher_player_name']):
        return 'RB'
    elif pd.notna(row['receiver_player_name']):
        return 'WR'
    else:
        return 'TE'

df['position'] = df.apply(get_position, axis=1)
df['week'] = pd.to_numeric(df['week'], errors='coerce')
df['opponent'] = df['defteam']

# Fill missing stat columns with 0
for col in ['rushing_yards', 'receiving_yards', 'passing_yards', 'rushing_tds', 'receiving_tds', 'passing_tds']:
    if col not in df.columns:
        df[col] = 0
    df[col] = pd.to_numeric(df[col], errors='coerce').fillna(0)

# Features for all
base_features = ['player', 'opponent', 'week']

# Train and save a model for each position
positions = {
    'QB': (['player', 'opponent', 'week'], ['passing_yards', 'passing_tds', 'rushing_yards', 'rushing_tds']),
    'RB': (['player', 'opponent', 'week'], ['rushing_yards', 'rushing_tds', 'receiving_yards', 'receiving_tds']),
    'WR': (['player', 'opponent', 'week'], ['receiving_yards', 'receiving_tds']),
    'TE': (['player', 'opponent', 'week'], ['receiving_yards', 'receiving_tds'])
}

for pos, (features, targets) in positions.items():
    pos_df = df[df['position'] == pos].copy()
    pos_df['player'] = (
        pos_df['rusher_player_name'].fillna('') +
        pos_df['receiver_player_name'].fillna('') +
        pos_df['passer_player_name'].fillna('')
    )
    pos_df = pos_df.dropna(subset=features)
    X = pd.get_dummies(pos_df[features])
    y = pos_df[targets]
    if len(X) == 0 or len(y) == 0:
        print(f"Skipping {pos}: no data")
        continue
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    model = RandomForestRegressor(n_estimators=100, random_state=42)
    model.fit(X_train, y_train)
    joblib.dump({'model': model, 'columns': X.columns.tolist(), 'targets': targets}, f'{pos.lower()}_model.pkl')
    print(f"{pos} model trained and saved as {pos.lower()}_model.pkl")

# WR model
wr_df = df[df['receiver_player_name'].notna()].copy()
wr_df['player'] = wr_df['receiver_player_name']
features = ['player', 'opponent', 'week']
targets = ['receiving_yards', 'receiving_tds']
wr_df = wr_df.dropna(subset=features)
X = pd.get_dummies(wr_df[features])
y = wr_df[targets]
if len(X) == 0 or len(y) == 0:
    print("Skipping WR: no data")
else:
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    model = RandomForestRegressor(n_estimators=100, random_state=42)
    model.fit(X_train, y_train)
    joblib.dump({'model': model, 'columns': X.columns.tolist(), 'targets': targets}, 'wr_model.pkl')
    print("WR model trained and saved as wr_model.pkl")

import pandas as pd
df = pd.read_csv('../gridiron-forecast-sim/backend/data/play_by_play_2024.csv', low_memory=False)
print(df['receiver_player_name'].dropna().unique())
print("Number of WR rows:", df['receiver_player_name'].notna().sum()) 