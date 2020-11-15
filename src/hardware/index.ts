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

export interface Notification {
	colour: Colour,
	time: number
};

// Constants
const defaultColour: Colour = { red: 255, green: 0, blue: 255 };
const interpolationFactor = (1 / config.hardware.framerate) * config.hardware.interpolation;

// LEDs
var loopTimeout: NodeJS.Timeout;
var red: Gpio, green: Gpio, blue: Gpio;
let transitionTime = 0;
let state : HardwareState = {
	initialised: false,
	power: false,
	mode: Mode.NONE,
	colour: defaultColour,
	previousColour: { red: 0, green: 0, blue: 0 }
};

// Flash notifcations
let notifications : Array<Notification> = [];

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
		logger.warn(`GPIO did not initialise correctly: ${e}`);
	}
}

/**
 * 
 */
export function getState() : HardwareState {
	return state;
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
	// Update state.
	state.power = true;
	state.mode = Mode.COLOUR;
	state.colour = colour;
	logger.info(`Changed colour to {${colour.red}, ${colour.green}, ${colour.blue}}.`);
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
	// Update state.
	state.power = newPower;
	logger.info(`Changed power state to ${newPower ? "on" : "off"}.`)
}

/**
 * 
 */
export function getMode() : Mode {
	return state.mode;
}

export function setMode(mode: Mode) {
	// Set mode.
	state.mode = mode;
	transitionTime = config.hardware.transitionLength;
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

	// Notifications take priority on the current colour.
	if (notifications.length > 0) {
		state.colour = notifications[0].colour;
		notifications[0].time -= 1 / config.hardware.framerate

		// Remove notification when expired.
		if (notifications[0].time <= 0)
			notifications.splice(0, 1);
	} else {
		// Change behaviour depending on mode.
		switch (state.mode) {
			case Mode.NONE: {
				// Turn off lights.
				state.colour = {red: 0, green: 0, blue: 0};
				break;
			}
			case Mode.COLOUR: {
				// Set default colour if colour is not set.
				if (!state.colour) state.colour = defaultColour;
				state.colour = state.colour;
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
	}

	// Calculate delta.
	let delta = transitionTime > 0 ? (config.hardware.transitionLength - transitionTime) / config.hardware.transitionLength : interpolationFactor;
	transitionTime -= 1 / config.hardware.framerate;

	// Interpolate colours.
	state.previousColour = {
		red: Math.floor(lerp(state.previousColour.red, state.colour.red, delta)),
		green: Math.floor(lerp(state.previousColour.green, state.colour.green, delta)),
		blue: Math.floor(lerp(state.previousColour.blue, state.colour.blue, delta))
	};

	writeColour(state.previousColour);
	
	// Schedule loop.
	loopTimeout = setTimeout(() => loop(), 1000 / config.hardware.framerate);
}

export function pushNotification(notification: Notification) {
	notifications.push(notification);
}

export default {
	start, stop
}