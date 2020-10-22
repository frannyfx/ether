// Modules
const logger = require("./utils/logger")("main");
import server from "./server";
import hardware from "./hardware";

// Start modules.
hardware.start();
server.start();

// Catch uncaught exceptions
process.on("uncaughtException", err => {
	logger.error(`Uncaught exception: ${err.stack}`);
	process.exit(-1);
});

process.on("unhandledRejection", err => {
	logger.error(`Unhandled promise rejection: ${err}`);
	process.exit(-1);
});

// Handle stopping.
process.on("SIGINT", async () => {
	await server.stop();
	hardware.stop();
	process.exit();
});