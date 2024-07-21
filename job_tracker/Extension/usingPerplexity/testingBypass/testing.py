import requests
import json

url = 'http://127.0.0.1:5000/perplexity'
payload = {
    'url': 'https://www.deshaw.com/careers/software-developer-intern-new-york-summer-2025-5137'
}
headers = {
    'Content-Type': 'application/json'
}

response = requests.post(url, data=json.dumps(payload), headers=headers)

print("Status Code:", response.status_code)
print("Response Body:", response.json())