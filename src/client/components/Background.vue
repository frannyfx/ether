<template>
	<div class="background" :class="{ off: !$store.state.hardwareState.power }" @click="next">
		<div class="background-image" :style="{backgroundImage: `url('${chosenImage}')`}"></div>
	</div>
</template>
<script lang="ts">
import Vue from 'vue'
export default Vue.extend({
	data() {
		return {
			chosenImage: "",
			imageIndex: 0,
			images: [
				/*"https://media.giphy.com/media/l0O9x56kSTBPXyH1m/source.gif",
				"https://media.giphy.com/media/3oFyCZm9jPjlzsAwXS/source.gif",
				"https://media.giphy.com/media/l44Qqq69E0gTyqLwk/source.gif",
				"https://media.giphy.com/media/l3vRdcQgmyYnUYFna/source.gif",
				"https://media.giphy.com/media/3o6fIYWU6HVdxrqmBO/source.gif"*/
				"https://media.giphy.com/media/1lBjtSx9NE3tzEPJsS/giphy.gif",
				"https://media.giphy.com/media/3o7aD9y2CKtGHRfhOE/source.gif",
				"https://media.giphy.com/media/ijhLl5UuE7yec/source.gif",
				"https://media.giphy.com/media/Wm9XlKG2xIMiVcH4CP/source.gif",
				"https://media.giphy.com/media/Qx6GzMwOdGx9e/source.gif",
				"https://media.giphy.com/media/VIzmAi5KS3RyRhY9Sq/source.gif"
			]
		};
	},
	methods: {
		next() {
			this.imageIndex = (this.imageIndex + 1) % this.images.length;
			this.chosenImage = this.images[this.imageIndex];
		},
		randomise() {
			this.imageIndex = Math.floor(Math.random() * this.images.length);
			this.chosenImage = this.images[this.imageIndex];
		}
	},
	mounted() {
		this.randomise();
	}
})
</script>
<style lang="scss" scoped>
.background {
	width: 100%;
	height: 100%;
	position: absolute;
	top: 0; left: 0; right: 0; bottom: 0;
	background-color: white;
	cursor: pointer;
	transition: transform 0.5s;
	opacity: 0.8;

	.background-image {
		width: 100%;
		height: 100%;
		background-size: cover;
		background-position: center;
		transition: opacity 0.5s;
	}

	&.off {
		transform: scaleY(0);

		.background-image {
			opacity: 0;
		}
	}
}
</style>