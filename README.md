# Rotter y Krauss Scraper

I noticed that the discounts for the Rotter y Krauss glasses on their website fluctuated a lot. It sometimes went from 35% to 20% to 30% and so on. So I decided to make a scraper that downloads important data (like prices and discounts) so I can see if there is a pattern (maybe less discount at a certain time) and get the best bang for my buck. 

All the values will be stored inside the folder data inside their own csv files. These files have a date (day,month year with hour, minute) as their names. The data inside these files are the names of the glasses, with their prices (_ints_) and discounts (_strings_). The discounts are _strings_ because they can have discount for frames or frames+glass (and I didn't feel like exploring more, but I think there is work to be done there).

You can explore the data at https://clementesepulveda.github.io/ryk_scraper/, with visualizations for each glasses, showing their price and discounts for every hour (at the moment of writing this, I do now know if they change every hour, but I'm just making sure).