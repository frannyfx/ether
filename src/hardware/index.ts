// Imports
import { Gpio } from "pigpio";

// Modules
const logger = require("../utils/logger")("hw");
import config from "../config.default.json";
import { getNextColour } from "./sweep";

// Enums
export enum Mode {
	NONE = 0,
	COLOUR = 1,
	SWEEP = 2,
	REACTIVE = 3
};

export interface HardwareState {
	initialised: Boolean,
	power: Boolean,
	mode: Mode,
	colour?: Colour
};

export interface Colour {
	red: number,
	blue: number,
	green: number
};

// Constants
const defaultColour: Colour = { red: 255, green: 0, blue: 255 };

// LEDs
var red: Gpio, green: Gpio, blue: Gpio;
let state : HardwareState = {
	initialised: false,
	power: false,
	mode: Mode.NONE
};

/**
 * 
 */
async function start() {
	try {
		// Initialise pins.
		red = new Gpio(config.hardware.pins.red, { mode: Gpio.OUTPUT });
		green = new Gpio(config.hardware.pins.green, { mode: Gpio.OUTPUT });
		blue = new Gpio(config.hardware.pins.blue, { mode: Gpio.OUTPUT });
		state.initialised = true;

		// Load default state.
		setColour(defaultColour);

		// Start loop.
		loop();
	} catch (e) {
		logger.warn("GPIO did not initialise correctly.");
	}
}

/**
 * 
 * @param colour 
 */
export function setColour(colour: Colour) {
	// Prevent setting invalid state if the LEDs are not initialised.
	if (!state.initialised) {
		logger.warn("Could not set colour as GPIO is not initialised.");
		return;
	}

	// Update state.
	state.power = true;
	state.mode = Mode.COLOUR;
	state.colour = colour;
}

/**
 * 
 * @param newPower 
 */
export function setPower(newPower: Boolean) {
	// Prevent setting invalid state if the LEDs are not initialised.
	if (!state.initialised) {
		logger.warn("Could not change power state as GPIO is not initialised.");
		return;
	}

	// Update state.
	state.power = newPower;
	if (state.power) {
		// ...
	}
}

export function setMode(mode: Mode) {
	// Prevent setting invalid state if the LEDs are not initialised.
	if (!state.initialised) {
		logger.warn("Could not set mode as GPIO is not initialised.");
		return;
	}

	// Set mode.
	state.mode = mode;
}

/**
 * 
 * @param colour 
 */
function writeColour(colour: Colour) {
	red.pwmWrite(colour.red);
	green.pwmWrite(colour.green);
	blue.pwmWrite(colour.blue);
}

/**
 * 
 */
async function stop() {
	
}

/**
 * 
 */
function loop() {
	// Check power.
	if (!state.power) {
		setTimeout(() => loop(), 1000 / config.hardware.framerate);
		return;
	}

	// Change behaviour depending on mode.
	switch (state.mode) {
		case Mode.NONE: {
			// Turn off lights.
			writeColour({red: 0, green: 0, blue: 0});
			break;
		}
		case Mode.COLOUR: {
			// Set default colour if colour is not set.
			if (!state.colour) state.colour = defaultColour;
			writeColour(state.colour);
			break;
		}
		case Mode.SWEEP: {
			writeColour(getNextColour());
			break;
		}
		case Mode.REACTIVE: {
			// ...
			break;
		}
	}
	
	setTimeout(() => loop(), 1000 / config.hardware.framerate);
}

export default {
	start, stop
}