// Imports
import { client as WebSocketClient, connection as WebSocketConnection } from "websocket";
import { Colour } from ".";

// Modules
const logger = require("../utils/logger")("reactive");

// Variables
var client = new WebSocketClient();
var connected = false;
var host = "";
var port =  -1;

// Colour
var colour : Colour = {red: 0, green: 0, blue: 0}

// Event handlers
function onConnect(connection: WebSocketConnection) {
	logger.success(`Successfully connected to Ether server ${host}:${port}.`);
	connected = true;

	// Add event handlers.
	connection.on("error", (error: any) => onError(error));
	connection.on("close", () => onClose());
	connection.on("message", (message: any) => onMessage(message));
}

function onError(error: any) {
	logger.error(`Connection error to Ether server ${host}:${port} - ${error}`);
	
}

function onClose() {
	logger.info(`Connection to Ether server ${host}:${port} closed.`);
	client = new WebSocketClient();
	connected = false;
}

function onMessage(message: any) {
	try {
		let payload = message.utf8Data.split(",");
		colour = {
			red: parseInt(payload[0]),
			green: parseInt(payload[1]),
			blue: parseInt(payload[2])
		}
	} catch (e) {
		logger.warn(`Unable to parse payload. ${e}`);
	}
}

function onConnectFailed(error : any) {
	logger.error(`Failed to connect to Ether server ${host}:${port} - ${error}`);
	client = new WebSocketClient();
}

export function getHost() : string {
	return host;
}

export function setHost(newHost: string, newPort: number) {
	host = newHost;
	port = newPort;

	// Attempt to connect.
	connect();
}

export function connect() {
	client.connect(`ws://${host}:${port}`);

	// Add event handlers.
	client.on("connect", connection => onConnect(connection));
	client.on("connectFailed", error => onConnectFailed(error));
}

export function isConnected() : Boolean {
	return connected;
}

export function getNextColour() : Colour {
	return colour;
}