#!/usr/bin/env python3
import requests
import json

url = "http://localhost:8000/auth/signup"
data = {
    "email": "newuser@test.com",
    "password": "test123",
    "name": "New User"
}

try:
    response = requests.post(url, json=data)
    print(f"Status Code: {response.status_code}")
    print(f"Response Headers: {dict(response.headers)}")
    print(f"Response Body: {response.text}")
    
    if response.status_code == 200:
        print("\n✅ SUCCESS!")
        print(json.dumps(response.json(), indent=2))
    else:
        print(f"\n❌ ERROR {response.status_code}")
        try:
            print(json.dumps(response.json(), indent=2))
        except:
            print(response.text)
except Exception as e:
    print(f"Exception occurred: {e}")
