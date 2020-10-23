// Imports
import { client as WebSocketClient, connection as WebSocketConnection } from "websocket";
import { Colour, pushNotification } from ".";

// Modules
const logger = require("../utils/logger")("reactive");

// Variables
var client = new WebSocketClient();
var connection : WebSocketConnection;
var connected = false;
var host = "";
var port =  -1;

// Colour
var colour : Colour = {red: 0, green: 0, blue: 0}

// Event handlers
function onConnect(conn: WebSocketConnection) {
	// Set connection flag.
	logger.success(`Successfully connected to Ether server ${host}:${port}.`);
	connected = true;
	connection = conn;
	
	// Notify about the connection.
	pushNotification({ colour: { red: 0, green: 255, blue: 106 }, time: 0.4});

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

	// Notify about the disconnection.
	pushNotification({ colour: { red: 255, green: 0, blue: 0 }, time: 0.4});
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

	// Notify about failure to connect.
	pushNotification({ colour: { red: 255, green: 0, blue: 0 }, time: 0.4});
}

export function getHost() : string {
	return host;
}

export function setHost(newHost: string, newPort: number) {
	host = newHost;
	port = newPort;

	// Close pre-existing connection if connected.
	if (connected) {
		connection.close();
		client = new WebSocketClient();
	}

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