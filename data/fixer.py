import pandas as pd

df = pd.read_csv('2024_02.csv')
df['price'] = df['price'].apply(lambda x: str(x)[:-2] if str(x)[-2:] == '.0' else x)
df['price'] = df['price'].apply(lambda x: int(str(x).replace('.', '')))

# print(df.head())
# print(df.tail())

# polaroids = df[df['name'] == 'Polaroid PLD D485']
# dates1 = polaroids[polaroids['price'] == 909]['date'].unique()
# print(dates1)
# def coolFn(df):
#     if df['date'] in dates1:
#         df['price'] = df['price']*1000
    
#     return df

# df = df.apply(lambda x: coolFn(x), axis=1)

# print(df)
df.to_csv('2024_02.csv', index=False)
