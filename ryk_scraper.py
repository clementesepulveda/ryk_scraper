from bs4 import BeautifulSoup
from urllib.request import urlopen
import pandas as pd
from datetime import datetime

url = "https://www.ryk.cl/anteojos-opticos?prefn1=ryk_gender&prefv1=Hombre&sz=512&start=0"
page = urlopen(url)
html = page.read().decode("utf-8")
soup = BeautifulSoup(html, "html.parser")


data = []
for product in soup.find_all('div',{'class': 'product'}):
    price = product.find('span', {'class': 'value'}).text.replace('\n', '').strip().replace('  ', '').replace('$', '')
    name = product.find('div', {'class': 'tile-body'}).find('a').text
    discount = product.find('span', {'class': 'promo-value'}).text.strip()

    data.append({
        'name' : name, 
        'price' : price if 'Price' not in price else 0, 
        'discount' : discount}
    )

df = pd.DataFrame.from_dict(data)

now = datetime.now()
current_time = now.strftime("%d_%m_%y %H.%M")
df.to_csv(f'data/{current_time}.csv')