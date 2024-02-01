from bs4 import BeautifulSoup
from urllib.request import urlopen
import pandas as pd
import pytz
from datetime import datetime

url = "https://www.ryk.cl/anteojos-opticos?prefn1=ryk_gender&prefv1=Hombre&sz=512&start=0"
page = urlopen(url)
html = page.read().decode("utf-8")
soup = BeautifulSoup(html, "html.parser")


data = []
for product in soup.find_all('div',{'class': 'product'}):
    if product == None:
        continue

    price = product.find('span', {'class': 'value'}).text.replace('\n', '').strip().replace('  ', '').replace('$', '')
    name = product.find('div', {'class': 'tile-body'}).find('a').text

    discount = product.find('span', {'class': 'promo-value'})
    discount = discount.text.strip() if discount else '0'

    data.append({
        'name' : name, 
        'price' : price if 'Price' not in price else 0, 
        'discount' : discount}
    )

df = pd.DataFrame.from_dict(data)

timezone = pytz.timezone('Chile/Continental')
now = datetime.now(tz = timezone)
current_time = now.strftime("%y_%m_%d %H.%M")
df.to_csv(f'data/{current_time}.csv')