// Imports
import store from "./store";

// Enums
export enum Method {
	GET = 0,
	POST = 1,
	DELETE = 2,
	PUT = 3
}

export enum Mode {
	NONE = 0,
	COLOUR = 1,
	SWEEP = 2,
	REACTIVE = 3
};

export interface Colour {
	red: number,
	blue: number,
	green: number
};

export interface HardwareState {
	initialised: boolean,
	power: boolean,
	mode: Mode,
	colour: Colour,
};

// Variables
var refreshCallback : Function;

export async function initialise() {
	// Refresh state data.
	refresh();
}

export function setRefreshCallback(cb : Function) {
	refreshCallback = cb;
}

export async function refresh() {
	// Get state.
	let stateResponse = await request(Method.GET, "/state");

	// Too lazy to do this properly.
	if (stateResponse.ok) {
		delete stateResponse.result.state.previousColour;
		store.commit("setHardwareState", stateResponse.result.state);
		console.log(stateResponse.result.state.mode);
		refreshCallback();
	}
}

async function request(method : Method, url : string) : Promise<any> {
	let response = await window.fetch(`/api${url}`, {
		method: Method[method]
	});

	return await response.json();
}

export async function setPower(power : boolean) {
	// Prevent unnecessary requests.
	if (store.state.hardwareState.power == power) return;

	// Change power.
	let powerResponse = await request(power ? Method.PUT : Method.DELETE, `/power`);
	if (powerResponse.ok) store.commit("setPower", power);
	return powerResponse.ok;
}

export async function setMode(mode : Mode) {
	// Prevent unnecessary requests.
	if (store.state.hardwareState.mode == mode) return;

	// Change mode.
	let modeResponse = await request(Method.PUT, `/mode/${mode}`);
	if (modeResponse.ok) store.commit("setMode", mode);
	return modeResponse.ok;
}

export async function setColour(colour : Colour) {
	// Change colour.
	let colourResponse = await request(Method.PUT, `/colour/${colour.red}/${colour.green}/${colour.blue}`);
	if (colourResponse.ok) store.commit("setColour", colour);
	return colourResponse.ok;
}

export async function setReactiveHost(host : string) {
	// Change colour.
	let hostResponse = await request(Method.PUT, `/reactive/host/${host}`);
	return hostResponse.ok;
}