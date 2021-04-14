// Imports
import { Accessory, Categories, Characteristic, CharacteristicEventTypes, Service, uuid } from "hap-nodejs";

// Modules
import hardware, { getState, setPower, setColour, setBrightness } from "../hardware";
import { hslToRgb, rgbToHsl } from "../utils/Colour";
import config from "../config.default.json";

// Set-up
const accessoryUuid = uuid.generate("codes.fran.ether");
const accessory = new Accessory("Ether", accessoryUuid);
const etherService = new Service.Lightbulb("Ether");

// Characteristics
const powerCharacteristic = etherService.getCharacteristic(Characteristic.On);
const hueCharacteristic = etherService.getCharacteristic(Characteristic.Hue);
const saturationCharacteristic = etherService.getCharacteristic(Characteristic.Saturation);
const brightnessCharacteristic = etherService.getCharacteristic(Characteristic.Brightness);

// Set-up characteristics.
// - Power
powerCharacteristic.on(CharacteristicEventTypes.GET, callback => {
	callback(undefined, getState().power);
});

powerCharacteristic.on(CharacteristicEventTypes.SET, (value, callback) => {
	setPower(<boolean>value);
	callback();
});

// - Hue
hueCharacteristic.on(CharacteristicEventTypes.GET, callback => {
	let colour = getState().setColour;
	let hsl = rgbToHsl(colour.red, colour.green, colour.blue);
	callback(undefined, hsl.hue);
});

hueCharacteristic.on(CharacteristicEventTypes.SET, (value, callback) => {
	console.log(value);
	// Get current colour.
	let colour = getState().setColour;
	let hsl = rgbToHsl(colour.red, colour.green, colour.blue);

	// Change colour.
	hsl.hue = <number>value / 360;
	let rgb = hslToRgb(hsl.hue, hsl.saturation, hsl.lightness);
	
	// Set colour.
	setColour(rgb);
	callback();
});

// - Saturation
saturationCharacteristic.on(CharacteristicEventTypes.GET, callback => {
	let colour = getState().setColour;
	let hsl = rgbToHsl(colour.red, colour.green, colour.blue);
	callback(undefined, Math.round(hsl.saturation * 100));
});

saturationCharacteristic.on(CharacteristicEventTypes.SET, (value, callback) => {
	// Get current colour.
	let colour = getState().setColour;
	let hsl = rgbToHsl(colour.red, colour.green, colour.blue);

	// Change colour.
	hsl.saturation = <number>value / 100;
	let rgb = hslToRgb(hsl.hue, hsl.saturation, hsl.lightness);
	
	// Set colour.
	setColour(rgb);
	callback();
});

// - Brightness
brightnessCharacteristic.on(CharacteristicEventTypes.GET, callback => {
	callback(undefined, Math.round(getState().brightness * 100));
});

brightnessCharacteristic.on(CharacteristicEventTypes.SET, (value, callback) => {
	// Set brightness.
	setBrightness(<number>value / 100);
	callback();
});


function start() {
	accessory.addService(etherService);
	accessory.publish({
		username: config.homekit.username,
		pincode: config.homekit.pincode,
		port: config.homekit.port,
		category: Categories.LIGHTBULB
	});
}

export default {
	start
};