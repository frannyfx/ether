import Vue from "vue";
import Index from "./components/Index.vue";

let v = new Vue({
	el: "#app",
	render: h => h(Index)
});