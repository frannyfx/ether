'''
Sweep colours RGB.
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

# HSL
hue = 0
saturation = 1
lightness = 0.5

hue_step = 0.001
framerate = 60

def setup_pin(num):
	GPIO.setup(num, GPIO.OUT)
	pwm = GPIO.PWM(num, 360)
	pwm.start(0)
	return pwm

def hue_to_rgb(p, q, t):
	if t < 0: t += 1
	if t > 1: t -= 1
	if t < 1/6: return p + (q - p) * 6 * t
	if t < 1/2: return q
	if t < 2/3: return p + (q - p) * (2/3 - t) * 6
	return p

def hsl_to_rgb(h, s, l):
	r = g = b = 0
	if s == 0:
		r = g = b = l
	else:
		q = l * (1 + s) if l < 0.5 else l + s - l * s
		p = 2 * l - q
		r = hue_to_rgb(p, q, h + 1/3)
		g = hue_to_rgb(p, q, h)
		b = hue_to_rgb(p, q, h - 1/3)

	return [int(r * 255), int(g * 255), int(b * 255)]


red_pin = setup_pin(RED)
green_pin = setup_pin(GREEN)
blue_pin = setup_pin(BLUE)

async def loop():
	global hue
	while True:
		await asyncio.sleep(float(1.0 / framerate))

		rgb_array = hsl_to_rgb(hue, saturation, lightness)

		hue += hue_step
		if hue > 1: hue = 0

		red_pin.ChangeDutyCycle(float(int(rgb_array[0]) / 255.0) * 100)
		green_pin.ChangeDutyCycle(float(int(rgb_array[1]) / 255.0) * 100)
		blue_pin.ChangeDutyCycle(float(int(rgb_array[2]) / 255.0) * 100)

try:
	asyncio.get_event_loop().run_until_complete(loop())
except KeyboardInterrupt:
	print("\nCtrl + C received, quitting.")

GPIO.cleanup()