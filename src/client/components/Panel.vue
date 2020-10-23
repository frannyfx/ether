<template>
	<div class="panel-container">
		<div class="panel">
			<div class="title-bar">
				<div class="buttons">
					<div @click="turnOff" class="title-button"></div>
					<div class="title-button"></div>
					<div class="title-button"></div>
				</div>
				<div class="categories">
					<span class="button" @click="() => setMode(Mode.COLOUR)" :class="{'selected': $store.state.hardwareState.mode == Mode.COLOUR}">Colour</span>
					<span class="button" @click="() => setMode(Mode.SWEEP)" :class="{'selected': $store.state.hardwareState.mode == Mode.SWEEP}">Sweep</span>
					<span class="button" @click="() => setMode(Mode.REACTIVE)" :class="{'selected': $store.state.hardwareState.mode == Mode.REACTIVE}">Reactive</span>
				</div>
			</div>
			<transition-group name="slide" tag="div" class="page-container">
				<div class="page" v-show="($store.state.hardwareState.mode == Mode.NONE || !$store.state.hardwareState.power) && $store.state.hardwareState.initialised" :key="Mode.NONE">
					<div v-if="!$store.state.hardwareState.power" @click="turnOn" class="simple-button">Power on</div>
				</div>
				<div class="page colour-page" v-show="$store.state.hardwareState.mode == Mode.COLOUR && $store.state.hardwareState.power && $store.state.hardwareState.initialised" :key="Mode.COLOUR">
					<div class="slider">
						<span>Red</span>
						<input v-model="red" @change="onColourChange" type="range" ontype="range" min="0" max="255" value="255" class="colour-slider">
					</div>
					<div class="slider">
						<span>Green</span>
						<input v-model="green" @change="onColourChange" type="range" min="0" max="255" value="255" class="colour-slider">
					</div>
					<div class="slider">
						<span>Blue</span>
						<input v-model="blue" @change="onColourChange" type="range" min="0" max="255" value="255" class="colour-slider">
					</div>
				</div>
				<div class="page sweep-page" v-show="$store.state.hardwareState.mode == Mode.SWEEP && $store.state.hardwareState.power && $store.state.hardwareState.initialised" :key="Mode.SWEEP">
					<p>No controls available.</p>
				</div>
				<div class="page reactive-page" v-show="$store.state.hardwareState.mode == Mode.REACTIVE && $store.state.hardwareState.power && $store.state.hardwareState.initialised" :key="Mode.REACTIVE">
					<input v-model="reactiveHost" type="text" placeholder="Ether server">
					<div @click="connect" class="simple-button">Connect</div>
				</div>
				<div class="page" v-show="!$store.state.hardwareState.initialised" :key="-1">
					<p>LED initialisation failed.</p>
				</div>
			</transition-group>
		</div>
	</div>
</template>
<script lang="ts">
import Vue from 'vue';
import { Mode, setColour, setMode, setPower, setReactiveHost } from "../network";

export default Vue.extend({
	data() {
		return {
			Mode,
			red: "0",
			green: "0",
			blue: "0",
			reactiveHost: ""
		};
	},
	methods: {
		setMode(mode : Mode) {
			setMode(mode);
		},
		onColourChange() {
			setColour({red: parseInt(this.red), green: parseInt(this.green), blue: parseInt(this.blue)})
		},
		connect() {
			console.log(this.reactiveHost);
			setReactiveHost(this.reactiveHost);
		},
		async turnOn() {
			await setPower(true);
		},
		turnOff() {
			setPower(false);
		}
	},
	mounted() {

	}
});
</script>
<style lang="scss" scoped>
.panel-container {
	position: absolute;
	top: 0; right: 0; left: 0; bottom: 0;
	width: 100%; height: 100%;
	display: flex;
	align-items: center;
	justify-content: center;
	pointer-events: none;
}

.panel {
	pointer-events: all;
	width: 600px;
	height: 200px;
	box-sizing: border-box;
	border-radius: 12px;
	background-color: rgba(black, 0.3);
	color: white;
	backdrop-filter: blur(10px) saturate(150%);
	-webkit-backdrop-filter: blur(10px) saturate(150%);
	box-shadow: inset 0px 1px 0px rgba(white, 0.2), 0px 22px 70px 4px rgba(black, 0.56), 0px 0px 0px 1px rgba(black, 0.1);

	display: flex;
	flex-direction: column;
	align-items: stretch;
	justify-content: flex-start;
	overflow: hidden;
}

.title-bar {
	height: 30px;
	display: flex;
	padding: 16px;
	font-size: 0.9em;

	> .buttons {
		display: flex;
		align-items: center;

		> :not(:last-child) {
			margin-right: 8px;
		}

		> .title-button:nth-child(1) {
			background-color: rgb(255, 95, 87);
		}

		> .title-button:nth-child(2) {
			background-color: rgb(254, 188, 46);
		}

		> .title-button:nth-child(3) {
			background-color: rgb(40, 200, 64);
		}
	}

	> .categories {
		display: flex;
		line-height: 30px;
		justify-content: center;
		align-items: center;
		flex-grow: 1;
		margin: 0 40px;

		

		> * {
			flex-grow: 1;
		}

		> :not(:last-child) {
			margin-right: 8px;
		}
	}
	
}

.button {
	color: rgba(white, 0.8);
	text-align: center;
	transition: background-color 0.3s;
	border-radius: 10px;
	cursor: pointer;
	user-select: none;
	width: 120px;

	&:hover {
		background-color: rgba(white, 0.2);
	}

	&:active, &.selected {
		transition: background-color 0.1s;
		background-color: rgba(black, 0.2);
	}
}

.title-button {
	width: 12px;
	height: 12px;
	border-radius: 8px;
	cursor: pointer;
}

.page-container {
	flex-grow: 1;
	position: relative;
	background-color: rgba(white, 0.8);
	overflow: hidden;
	margin: 5px;
	margin-top: 0px;
	border-radius: 10px;

	.page {
		position: absolute;
		top: 0; bottom: 0; left: 0; right: 0;

		width: 100%;
		height: 100%;
		color: black;
		font-size: 0.8em;
		
		display: flex;
		align-items: center;
		justify-content: center;
		user-select: none;

		&.colour-page {
			.slider {
				display: flex;
				flex-direction: column;
				align-items: center;

				&:not(:last-child) {
					margin-right: 10px;
				}
			}
		}

		&.reactive-page {
			:not(:last-child) {
				margin-right: 10px;
			}
		}
	}
}

.slide-enter-active, .slide-leave-active {
	transition: transform 0.3s, height 0.3s, opacity 0.3s;
}

.slide-enter-active {
	transition-delay: 0.3s;
}

.slide-enter, .slide-leave-to {
	opacity: 0;
	transform: scale(0);
}

.slide-leave, .slide-enter-to {
	opacity: 1;
	transform: scale(1);
}

input[type="text"] {
	background-color: transparent;
	border: 2px solid rgba(black, 0.2);
	border-radius: 20px;
	padding: 10px 20px;
	outline: none;
	font-size: 1em;
	text-align: center;
	transition: border-color 0.3s;

	&:focus {
		border-color: rgba(#0066ff, 0.8);
	}
}

.simple-button {
	width: 80px;
	padding: 10px 20px;
	border-radius: 20px;
	border: 2px solid rgba(black, 0.2);
	text-align: center;
	cursor: pointer;
	transition: border-color 0.3s;

	&:hover, &:focus, &:active {
		border-color: rgba(#0066ff, 0.8);
	}
}
</style>