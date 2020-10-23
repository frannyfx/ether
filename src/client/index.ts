// Imports
import Vue from "vue";
import Store from "./store";
import Index from "./components/Index.vue";

let v = new Vue({
	el: "#app",
	store: Store,
	render: h => h(Index)
});