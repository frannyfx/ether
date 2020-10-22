'''
Server which runs on a computer and captures the audio the LEDs will react to.
'''

# Imports
import sys, pyaudio, numpy as np
import asyncio
import websockets
import time

# Config
## Audio
FORMAT = pyaudio.paInt16
CHANNELS = 1
RATE = 44100
CHUNK_SIZE = 1024
ANALYSIS_AUDIO_INTERFACE = "iShowU Audio Capture"

## Analysis
FRAMERATE = 60
FREQUENCY_BUCKET_SIZE = (RATE / 2) / (CHUNK_SIZE / 2)

## Colours
INTERPOLATION_SPEED = 25.0
INTERPOLATION_FACTOR = (1.0 / FRAMERATE) * INTERPOLATION_SPEED

## Streaming
INTERFACE = "0.0.0.0"
PORT = 1337

# Variables
## Audio
audio = pyaudio.PyAudio()

## Analysis
red = green = blue = 0
previous_red = previous_green = previous_blue = 0

## Streaming
server = None
last_frame = time.time_ns()
clients = set()

def get_audio_device_index():
	for i in range(audio.get_device_count()):
		if audio.get_device_info_by_index(i)["name"] == ANALYSIS_AUDIO_INTERFACE:
			return i
	return -1

def get_intensity(buckets, max_value):
	return np.sqrt(np.mean(buckets**2)) / max_value

def get_buckets(fft_data, low, high):
	return fft_data[int(low // FREQUENCY_BUCKET_SIZE):int(high // FREQUENCY_BUCKET_SIZE)]

def analyse(input_data, frame_count, time_info, status):
	global red, green, blue

	# Get audio data and run Fourier Transform
	audio_data = np.frombuffer(input_data, dtype=np.int16)
	fft_data = np.abs(np.fft.rfft(audio_data))

	# Get intensity of bass and treble
	bass = get_intensity(get_buckets(fft_data, 0, 250), 2000000)
	treble = get_intensity(get_buckets(fft_data, 10000, 20000), 30000)

	# Calculate colours and clamp them between 0 <= n <= 255
	red = int(min(255 if bass > 0.9 else bass * 255, 255))
	green = int(min(255 if treble > 0.9 else 0, 255))
	blue = int(min(255 if treble > 0.9 else treble * 255, 255))
	return (None, pyaudio.paContinue)

async def handle_client(websocket, path):
	print(f"New client {websocket.remote_address[0]} connected!")
	clients.add(websocket)
	try:
		async for msg in websocket:
			pass
	except:
		print(f"Client {websocket.remote_address[0]} disconnected.")
		clients.remove(websocket)
		pass

def lerp(a, b, t):
	return a * (1 - t) + b * t

async def loop():
	global last_frame, previous_red, previous_green, previous_blue
	while True:
		# Interpolate colours
		previous_red = int(lerp(previous_red, red, INTERPOLATION_FACTOR))
		previous_green = int(lerp(previous_green, green, INTERPOLATION_FACTOR))
		previous_blue = int(lerp(previous_blue, blue, INTERPOLATION_FACTOR))

		await asyncio.sleep(1 / FRAMERATE)
		if (time.time_ns() - last_frame) / (10**6) > 1000 / FRAMERATE:
			for websocket in clients:
				try:
					await websocket.send(f"{previous_red},{previous_green},{previous_blue}")
				except Exception as e:
					pass

			last_frame = time.time_ns()


def start():
	global server

	# Find audio interface
	audio_interface_index = get_audio_device_index()
	if audio_interface_index == -1:
		print(f"\"{ANALYSIS_AUDIO_INTERFACE}\" not found.\nExiting.")
		return
	
	print(f"Starting audio stream on \"{ANALYSIS_AUDIO_INTERFACE}\".")

	# Open audio stream
	stream = audio.open(
		format = FORMAT,
		channels = CHANNELS,
		rate = RATE,
		frames_per_buffer = CHUNK_SIZE,
		input = True,
		input_device_index = audio_interface_index,
		stream_callback = analyse
	)

	stream.start_stream()

	# Initialise server
	start_server = websockets.serve(handle_client, INTERFACE, PORT)
	asyncio.get_event_loop().run_until_complete(start_server)
	try:
		asyncio.get_event_loop().run_until_complete(loop())
	except KeyboardInterrupt:
		print("\nCtrl + C received, quitting.")

	# Cleanup
	print("Exiting...")
	stream.stop_stream()
	stream.close()
	audio.terminate()

start()