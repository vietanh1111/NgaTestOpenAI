import requests
import sys

data = {}
data["text"] = 'OpenAI Chat: Hi Im Vietanh'
data["user_name"] = "anh.nguyenviet6"
myobj = data

url = 'http://127.0.0.1:3000/doChatOpenAI_ow'

x = requests.post(url, json = myobj)

print(x.text)