import os 

for dir_ in os.listdir():
    if not ".csv" in dir_:
        continue 

    day, month, year = dir_.split(' ')[0].split('_')
    new_name = f"{year}_{month}_{day}.csv"
    os.rename(dir_, new_name)