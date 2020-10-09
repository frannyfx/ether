'''
This serves as a test to see if it is possible to exploit the Bluetooth LE controller
that comes with the LED strips. This connects to the Ether server and sends BLE packets
to the LED strip controller to change colour accordingly.

Unfortunately BLE does not have the throughput to handle enough packets to achieve a smooth
effect using this method, so hardwiring with a Raspberry Pi and MOSFETS will be necessary.
'''
# Imports
import pygatt
import websockets
import asyncio

adapter = pygatt.backends.GATTToolBackend()

def on_open(ws):
    print("Connected")

async def hello():
    adapter.start()
    device = adapter.connect('BE:89:B0:01:7B:50')
    async with websockets.connect("ws://192.168.1.109:1337") as websocket:
        while True:
            data = (await websocket.recv()).split(",")
            r = int(data[0])
            g = int(data[1])
            b = int(data[2])
            value = device.char_write_handle(1, bytearray([0x7e, 0x00, 0x05, 0x03, r, g, b, 0x00, 0xef]), wait_for_response=False)

asyncio.get_event_loop().run_until_complete(hello())

#value = device.char_write_handle(7, bytearray(b"\x7e\x00\x04\x01\x00\x00\x00\x00\xef"))