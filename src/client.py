'''
Client which runs on a Raspberry Pi connected to the LED strips and modulates
the RGB lanes of the strip according to the values received from the server.
'''

# Imports
import RPi.GPIO as GPIO
import websockets
import asyncio
import time

# Constants
## Light GPIO pins
RED = 11
GREEN = 15
BLUE = 18

## Connection settings
HOST = "192.168.1.130"
PORT = 1337

# Set-up GPIO
GPIO.setwarnings(False)
GPIO.setmode(GPIO.BOARD)

def setup_pin(num):
	GPIO.setup(num, GPIO.OUT)
	pwm = GPIO.PWM(num, 360)
	pwm.start(0)
	return pwm

def on_open(ws):
    print("Connected")

async def hello():
	global red_pin, green_pin, blue_pin
	async with websockets.connect(f"ws://{HOST}:{PORT}") as websocket:
		print(f"Successfully connected to {HOST}:{PORT}.")
		while True:
			try:
				data = (await websocket.recv()).split(",")

				r = int(data[0])
				g = int(data[1])
				b = int(data[2])

				red_pin.ChangeDutyCycle((r / 255.0) * 100)
				green_pin.ChangeDutyCycle((g / 255.0) * 100)
				blue_pin.ChangeDutyCycle((b / 255.0) * 100)
			except:
				print("Failed to receive valid data from server. Exiting.")
				break

red_pin = setup_pin(RED)
green_pin = setup_pin(GREEN)
blue_pin = setup_pin(BLUE)

try:
	asyncio.get_event_loop().run_until_complete(hello())
except KeyboardInterrupt:
	print("\nCtrl + C received, quitting.")

# Cleanup
red_pin.ChangeDutyCycle(0)
green_pin.ChangeDutyCycle(0)
blue_pin.ChangeDutyCycle(0)
GPIO.cleanup()