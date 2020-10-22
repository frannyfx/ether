// Imports
import path from "path";
import fastify, { FastifyInstance } from "fastify";

// Modules
const logger = require("../utils/logger")("server");
import config from "../config.default.json";
import router from "./router";
import root from "../utils/root"

// Server
var webServer : FastifyInstance;

async function start() {
	// Create web-server.
	webServer = fastify({
		trustProxy: true,
		ignoreTrailingSlash: true
	});

	// Load routes.
	await webServer.register(require("fastify-static"), {
		root: path.join(root(), config.server.dirs.public)
	});

	await webServer.register(router, {
		directory: path.join(root(), config.server.dirs.routes)
	});

	let address = await webServer.listen(config.server.port, config.server.address);
	logger.success(`Successfully started web server at ${address}.`)
}

async function stop() {
	await webServer.close();
	logger.info("Stopped web server.");
}

export default {
	start, stop
}