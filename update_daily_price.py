import os 
import pytz
import datetime
import pandas as pd

timezone = pytz.timezone('Chile/Continental')
now = datetime.datetime.now(tz = timezone)
current_date = now.strftime("%y_%m_%d")

# print(now)
df = pd.DataFrame()
for dir in os.listdir('data'):
    if current_date != dir.split(' ')[0]:
        continue 
    
    df = pd.concat([df, pd.read_csv(f'data/{dir}')])

data = df.groupby('name').agg(pd.Series.mode)[['price', 'discount']]
data.to_csv(f'daily/{current_date}.csv')