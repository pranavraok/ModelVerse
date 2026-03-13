import time
import json
from web3 import Web3

# Connect to Amoy
w3 = Web3(Web3.HTTPProvider('https://rpc-amoy.polygon.technology/'))

# Contract Details
CONTRACT_ADDRESS = "0x818e9Df23c8A2B61b7796b0A081C0bA1014d1d91"
with open('./abis/ModelRegistryABI.json') as f:
    ABI = json.load(f)

contract = w3.eth.contract(address=CONTRACT_ADDRESS, abi=ABI)

def handle_event(event):
    print(f"New Model! ID: {event['args']['modelId']} | IPFS: {event['args']['ipfsCID']}")

def listen():
    event_filter = contract.events.ModelRegistered.create_filter(fromBlock='latest')
    while True:
        for event in event_filter.get_new_entries():
            handle_event(event)
        time.sleep(3)

if __name__ == "__main__":
    listen()