import socket
import os
import requests
import subprocess
import asyncio
from time import sleep
import sys

def get_local_ip():
	try:
		s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
		s.connect(("8.8.8.8", 80))
		localhost = s.getsockname()[0]
		s.close()
		return localhost
	except:
		return None

# Constants
LOCALHOST = get_local_ip()
CLIENT = sys.argv[1]
print(CLIENT)

if LOCALHOST == None:
	print("Failed to get local IP address.")
	exit()

os.system("osascript switch-device.scpt")
requests.put(f"http://{CLIENT}/api/mode/3")
p = subprocess.Popen(['python3', 'server.py'])
sleep(1)
requests.put(f"http://{CLIENT}/api/reactive/host/{LOCALHOST}:1337")
try:
	asyncio.get_event_loop().run_forever()
except KeyboardInterrupt:
	p.kill()
