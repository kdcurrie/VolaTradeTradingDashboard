import pandas as pd

data = pd.read_csv("data_treemap_change_family_symbol.csv")

data['symbol'] = data['symbol'].str.replace(r'/USDT', '')
data['VolumeAsset'] = data['VolumeAsset'].round(decimals=2)
data['VolumeUSDT'] = data['VolumeUSDT'].round(decimals=2)
data['change'] = (100 * data['change']).round(decimals=2)


data.to_csv("data_treemap.csv", index=False)