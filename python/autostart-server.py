import socket
import os
import requests
import subprocess
import asyncio
from time import sleep

# Constants
LOCALHOST = socket.gethostbyname(socket.gethostname())
CLIENT = "ethanol.local:8080"

os.system("osascript switch-device.scpt")
requests.put(f"http://{CLIENT}/api/mode/3")
p = subprocess.Popen(['python3', 'server.py'])
sleep(1)
requests.put(f"http://{CLIENT}/api/reactive/host/{LOCALHOST}:1337")
try:
	asyncio.get_event_loop().run_forever()
except KeyboardInterrupt:
	p.kill()
