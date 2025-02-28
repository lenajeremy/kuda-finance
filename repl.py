import os
import json

file = open("jan-2025.json")
transactions = json.loads(file.read())

while True:
    line = input("> ")
    if line == "":
        break
    try:
        exec(line)
    except Exception as e:
        print(e, "exception")

file.close()
print("DONE")
#  list(map(lambda x: x["amount"], list(filter(lambda x: x["Category"] == "Feeding" or x["Category"] == "Food", transactions))))