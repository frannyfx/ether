// Imports
import { Gpio } from "pigpio";

// Modules
const logger = require("../utils/logger")("hardware");
import config from "../config.default.json";
import { clamp, lerp } from "../utils/general";

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
	previousColour: Colour,
	setColour: Colour
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
const slowInterpolationFactor = (1 / config.hardware.framerate);

// LEDs
var loopTimeout: NodeJS.Timeout;
var red: Gpio, green: Gpio, blue: Gpio;
let transitionTime = 0;
let state : HardwareState = {
	initialised: false,
	power: false,
	mode: Mode.NONE,
	colour: defaultColour,
	previousColour: { red: 0, green: 0, blue: 0 },
	setColour: defaultColour
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
	setMode(Mode.COLOUR);
	state.setColour = colour;
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
	// Prevent unnecessary transitions from firing.
	if (state.power == newPower) return;
	
	// Update state.
	transitionTime = config.hardware.transitionLength;
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
	if (mode == state.mode) return;
	if (mode != Mode.NONE) setPower(true);
	state.mode = mode;
	transitionTime = config.hardware.transitionLength;
	logger.info(`Changed mode to ${Mode[mode]}.`);
}

/**
 * 
 * @param colour 
 */
function writeColour(colour: Colour) {
	red.pwmWrite(Math.abs(clamp(colour.red, 0, 255)));
	green.pwmWrite(Math.abs(clamp(colour.green, 0, 255)));
	blue.pwmWrite(Math.abs(clamp(colour.blue, 0, 255)));
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
				state.colour = state.setColour;
				break;
			}
			case Mode.SWEEP: {
				state.colour = getNextSweepColour(false);
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

	// Apply fade-out when turning off and on.
	var renderColour = { red: 0, green: 0, blue: 0 };
	if (state.power) renderColour = state.colour;

	// Calculate delta.
	let delta = transitionTime > 0 ? (config.hardware.transitionLength - transitionTime) / config.hardware.transitionLength : state.mode == Mode.COLOUR ? slowInterpolationFactor : interpolationFactor;
	if (transitionTime > 0) transitionTime -= 1 / config.hardware.framerate;

	// Interpolate colours.
	state.previousColour = {
		red: lerp(state.previousColour.red, renderColour.red, delta),
		green: lerp(state.previousColour.green, renderColour.green, delta),
		blue: lerp(state.previousColour.blue, renderColour.blue, delta)
	};

	// Write rounded colour to LEDs.
	writeColour({
		red: Math.round(state.previousColour.red),
		green: Math.round(state.previousColour.green),
		blue: Math.round(state.previousColour.blue)
	});
	
	// Schedule loop.
	loopTimeout = setTimeout(() => loop(), 1000 / config.hardware.framerate);
}

export function pushNotification(notification: Notification) {
	notifications.push(notification);
}

export default {
	start, stop
}