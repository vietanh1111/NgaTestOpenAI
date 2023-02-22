import requests
import sys

data = {}
data["text"] = 'OpenAI Chat: Do you repeat my name'
data["user_name"] = "anh.nguyenviet6"
myobj = data

url = 'http://127.0.0.1:3000/doChatOpenAI'

x = requests.post(url, json = myobj)

print(x.text)