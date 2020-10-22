// Imports
import { Gpio } from "pigpio";

// Modules
const logger = require("../utils/logger")("hw");
import config from "../config.default.json";

// LEDs
var red: Gpio, green: Gpio, blue: Gpio;

async function start() {
	try {
		red = new Gpio(config.hardware.pins.red, { mode: Gpio.OUTPUT });
		green = new Gpio(config.hardware.pins.green, { mode: Gpio.OUTPUT });
		blue = new Gpio(config.hardware.pins.blue, { mode: Gpio.OUTPUT });
	} catch (e) {
		logger.warn("GPIO did not initialise correctly.");
	}
}

export function setColour(r: number, g: number, b: number) {
	if (!red || !green || !blue) {
		logger.warn("Colour could not be set as GPIO is not initialised.");
		return;
	}

	logger.info(`Set LED colour to ${r}, ${g}, ${b}.`);
	red.pwmWrite(r);
	green.pwmWrite(g);
	blue.pwmWrite(b);
}

async function stop() {
	
}

async function loop() {
	setTimeout(() => loop(), 1000 / config.hardware.framerate);
}

export default {
	start, stop
};