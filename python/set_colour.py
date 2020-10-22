'''
Sets the LED colours to a specific value.
'''

# Imports
import RPi.GPIO as GPIO
import time
import sys
import asyncio

# Constants
## Light GPIO pins
RED = 11
GREEN = 15
BLUE = 18

# Set-up GPIO
GPIO.setwarnings(False)
GPIO.setmode(GPIO.BOARD)

def setup_pin(num):
	GPIO.setup(num, GPIO.OUT)
	pwm = GPIO.PWM(num, 360)
	pwm.start(0)
	return pwm

red_pin = setup_pin(RED)
green_pin = setup_pin(GREEN)
blue_pin = setup_pin(BLUE)

red_pin.ChangeDutyCycle(float(int(sys.argv[1]) / 255.0) * 100)
green_pin.ChangeDutyCycle(float(int(sys.argv[2]) / 255.0) * 100)
blue_pin.ChangeDutyCycle(float(int(sys.argv[3]) / 255.0) * 100)

try:
	asyncio.get_event_loop().run_forever()
except KeyboardInterrupt:
	print("\nCtrl + C received, quitting.")

GPIO.cleanup()