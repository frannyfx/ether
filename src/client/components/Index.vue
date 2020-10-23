<template>
	<div class="container">
		<background/>
		<panel/>
	</div>
</template>
<script lang="ts">
import Vue from "vue"
import Background from "./Background.vue";
import Panel from "./Panel.vue";

// Modules
import { initialise as initialiseNetwork } from "../network";

export default Vue.extend({
	components: { Background, Panel },
	mounted() {
		initialiseNetwork();
	}
})
</script>
<style lang="scss">
body {
	margin: 0; padding: 0;
	top: 0; bottom: 0; left: 0; right: 0;
	font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
	width: 100vw;
	height: 100vh;
	background-image: url('https://media.giphy.com/media/3o7qE2KFaCY1xVIqu4/source.gif');
	background-size: cover;
	background-position: center;

	.container {
		width: 100%;
		height: 100%;
	}
}

h1 {
	font-weight: 400;
}
</style>