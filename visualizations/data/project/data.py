import pandas as pd

data = pd.read_csv("Binance_BTCUSDT_d.csv")

data['symbol'] = data['symbol'].str.replace(r'/USDT', '')
data['Volume BTC'] = data['Volume BTC'].round(decimals=2)
data['Volume USDT'] = data['Volume USDT'].round(decimals=2)

data = data.iloc[::-1]

# data.to_csv("data_treemap.csv", index=False)
data.to_csv("Binance_BTCUSDT_d_reverse.csv", index=False)


# //change
# import pandas as pd
#
# data = pd.read_csv("Binance_BTCUSDT_minute.csv")
#
# # data['symbol'] = data['symbol'].str.replace(r'/USDT', '')
# # data['VolumeAsset'] = data['VolumeAsset'].round(decimals=2)
# # data['VolumeUSDT'] = data['VolumeUSDT'].round(decimals=2)
# # data['change'] = (100 * data['change']).round(decimals=2)
#
# data = data.iloc[::-1]
#
# # data.to_csv("data_treemap.csv", index=False)
# data.to_csv("Binance_BTCUSDT_m_reverse.csv", index=False)
