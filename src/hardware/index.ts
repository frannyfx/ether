// Imports
import { Gpio } from "pigpio";

// Modules
const logger = require("../utils/logger")("hardware");
import config from "../config.default.json";
import { lerp } from "../utils/general";

// Modes
import { getNextColour as getNextFadeColour } from "./fade";
import { isConnected, getNextColour as getNextReactiveColour } from "./reactive";
import { getNextColour as getNextSweepColour} from "./sweep";

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
	colour: Colour,
	previousColour: Colour
};

export interface Colour {
	red: number,
	blue: number,
	green: number
};

// Constants
const defaultColour: Colour = { red: 255, green: 0, blue: 255 };
const interpolationFactor = (1000 / config.hardware.framerate) * config.hardware.interpolation;

// LEDs
var loopTimeout: NodeJS.Timeout;
var red: Gpio, green: Gpio, blue: Gpio;
let state : HardwareState = {
	initialised: false,
	power: false,
	mode: Mode.NONE,
	colour: defaultColour,
	previousColour: { red: 0, green: 0, blue: 0 }
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
 */
export function getColour() : Colour {
	return state.colour ? state.colour : defaultColour;
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
 */
export function getPower() : Boolean {
	return state.power;
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

/**
 * 
 */
export function getMode() : Mode {
	return state.mode;
}

export function setMode(mode: Mode) {
	// Prevent setting invalid state if the LEDs are not initialised.
	if (!state.initialised) {
		logger.warn("Could not set mode as GPIO is not initialised.");
		return;
	}

	// Set mode.
	state.mode = mode;
	logger.info(`Changed mode to ${Mode[mode]}.`);
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
function stop() {
	clearTimeout(loopTimeout);
	logger.info("Stopped LEDs.")
}

/**
 * 
 */
function loop() {
	// Check power.
	if (!state.power) {
		writeColour({red: 0, green: 0, blue: 0});
		loopTimeout = setTimeout(() => loop(), 1000 / config.hardware.framerate);
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
			state.colour = getNextSweepColour();
			break;
		}
		case Mode.REACTIVE: {
			// Flash until we're connected to the server in reactive mode.
			if (!isConnected()) {
				state.colour = getNextFadeColour();
				break;
			} else {
				state.colour = getNextReactiveColour();
			}
			break;
		}
	}

	// Interpolate colours.
	state.previousColour = {
		red: lerp(state.previousColour.red, state.colour.red, interpolationFactor),
		green: lerp(state.previousColour.green, state.colour.green, interpolationFactor),
		blue: lerp(state.previousColour.blue, state.colour.blue, interpolationFactor)
	};

	writeColour(state.previousColour);
	
	// Schedule loop.
	loopTimeout = setTimeout(() => loop(), 1000 / config.hardware.framerate);
}

export default {
	start, stop
}