// Imports
import Vue from "vue";
import Vuex from "vuex";
import { Colour, HardwareState, Mode } from "../network";

// Use plugin.
Vue.use(Vuex);

// Debug constant
const debug = process.env.NODE_ENV !== "production";
export default new Vuex.Store({
	state: {
		hardwareState: {
			initialised: false,
			power: false,
			mode: Mode.NONE,
			colour: { red: 255, green: 0, blue: 255}
		}
	},
	mutations: {
		setHardwareState (state, hardwareState: HardwareState) {
			state.hardwareState.initialised = hardwareState.initialised;
			state.hardwareState.power = hardwareState.power;
			state.hardwareState.mode = hardwareState.mode;
			state.hardwareState.colour = hardwareState.colour;
		},
		setMode(state, mode: Mode) {
			state.hardwareState.mode = mode;
		},
		setPower(state, power: boolean) {
			state.hardwareState.power = power;
		},
		setColour(state, colour: Colour) {
			state.hardwareState.colour = colour;
		}
	},
	strict: debug
});