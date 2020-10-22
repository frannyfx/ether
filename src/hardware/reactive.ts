// Imports
import { client as WebSocketClient } from "websocket";

// Modules


// Variables
var client = new WebSocketClient();
var connected = false;
var host = "";
var port =  -1;

export function getHost() : string {
	return host;
}

export function setHost(newHost: string, newPort: number) {
	host = newHost;
	port = newPort;
}

export function isConnected() : Boolean {
	return connected;
}

export function getNextColour() {

}