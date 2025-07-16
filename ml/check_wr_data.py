import pandas as pd

df = pd.read_csv('../gridiron-forecast-sim/backend/data/play_by_play_2024.csv', low_memory=False)
print("CSV Columns:")
print(df.columns)
print("\nNumber of non-null receiver_player_name rows:")
print(df['receiver_player_name'].notna().sum())
print("\nUnique receiver names:")
print(df['receiver_player_name'].dropna().unique()) 