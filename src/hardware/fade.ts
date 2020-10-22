// Modules
import config from "../config.default.json";
import { Colour } from "./index";

// Variables
var brightness = 0;
var step = config.hardware.modes.fade.step;

export function getNextColour() : Colour {
	brightness = Math.floor(Math.max(Math.min(brightness + step, 255), 0));
	if (brightness >= 255 || brightness <= 0)
		step *= -1;

	return { red: brightness, green: brightness, blue: brightness };
}