####################################################
#                                                  #
#              SQL dump ver. 0.4                   #
#        Get latest version here for free          #
#        https://github.com/x88/i18nGeoDB          #
#                                                  #
#   You can reward my work with a cup of coffee ;) #
#   Yandex Money: 41001324403362                   #
#   PayPal: elnair.rnd[at]gmail.com                #
#   Bitcoin: 1HRTCswLAm8438VXod7kqdSSJoqv2g17VT    #
#                                                  #
####################################################


The largest database of counties, regions and cities with translations. 

Consists data: 233 countries, 3 721 country regions, 2 246 813 inhabited localities

Languages:
Russian, Ukrainian, Belorussian, English, Spanish,
Portuguese, German, French, Italian, Polish,
Japanese, Lithuanian, Latvian, Czech

DUMP DESCRIPTION:
Table _cities:

country_id - Country ID, PK
title_XX - country caption, where XX is a country code.

Table _regions:

region_id - Region ID, PK
country_id - Country ID
title_XX - region caption, where XX is a country code.  

	
ATTENTION! The _regions.title_XX field had worse translated, than _city.region_XX field.
And exists only popular languages.  

Table _cities:

city_id - City ID, PK
region_id - Region ID     MAY BE NULL. BECAUSE SOME CITIES NOT EXISTS REGION
country_id - Country ID
important - for big cities will be TRUE.
title_XX - inhabited locality caption, where XX is a country code.
region_XX - region caption, where XX is a country code. May be NULL.
area_XX - area caption, where XX is a country code. May be NULL.

ATTENTION! The _city.region_XX field had better translated, than _regions.title_XX field. 

COUNTRY CODES:
ru - Russian, ua - Ukrainian, be - Belorussian, 
en - English, es - Spanish, pt - Portuguese, 
de - German, fr - French, it - Italian, 
pl - Polish, ja - Japanese, lt - Lithuanian, 
lv - Latvian, cz - Czech
