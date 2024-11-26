from bs4 import BeautifulSoup
from urllib.request import urlopen
import urllib.request
import pandas as pd
import pytz
from datetime import datetime
import os

url = "https://www.ryk.cl/anteojos-opticos?prefn1=ryk_gender&prefv1=Hombre&sz=512&start=0"
url = "https://www.ryk.cl/anteojos-opticos?prefn1=ryk_gender&prefv1=Hombre&sz=512&start=0"
page = urllib.request.Request(url,headers={'User-Agent': 'Chrome/76.0.3809.132'})
infile = urllib.request.urlopen(page).read()
html = infile.decode("utf-8")
soup = BeautifulSoup(html, "html.parser")

data = []
for product in soup.find_all('div',{'class': 'product'}):
    if product == None:
        continue


    name = product.find('div', {'class': 'tile-body'}).find('a').text

    discount = product.find('span', {'class': 'promo-value'})
    discount = discount.text.strip() if discount else '0'

    price = product.find('span', {'class': 'value'}).text.replace('\n', '').strip().replace('  ', '').replace('$', '')
    if 'Price reduced from' in price:
        price = product.find('div', {'class': 'price'}).find('span', {'class': 'sales reduced-price'})
        price = price.find('span', {'class': 'value'}).text.strip().replace('$', '').replace('.', '')
        
    data.append({
        'name' : name, 
        'price' : price if 'Price' not in price else 0, 
        'discount' : discount}
    )

df = pd.DataFrame.from_dict(data)

timezone = pytz.timezone('Chile/Continental')
now = datetime.now(tz = timezone)
current_time = now.strftime("%Y-%m-%d %H:%M:00")

df['date'] = current_time

def applyPrice(x):
    if x == 'null':
        return None
    return int(str(x).replace('.', ''))
df['price'] = df['price'].apply(applyPrice)

file_name = 'data/' + now.strftime("%Y_%m") + '.csv'
if not os.path.isfile(file_name):
    df.to_csv(file_name, index=False)
else:  # else it exists so append without writing the header
    df.to_csv(file_name, mode='a', header=False, index=False)