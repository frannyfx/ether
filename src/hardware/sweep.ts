// Modules
import config from "../config.default.json";
import { Colour, hslToRgb } from "../utils/Colour";

// HSL components
var hue = 0;

export function getNextColour(freeze : Boolean) : Colour {
	let next = hslToRgb(hue, config.hardware.modes.sweep.saturation, config.hardware.modes.sweep.lightness);
	hue = (hue + (freeze ? 0 : config.hardware.modes.sweep.step)) % 1;
	return next;
}