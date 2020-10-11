/**
  * @file A P3 script which tests the functionality of the server.
  * @version 2020.10.09
  * @author Francesco Compagnoni
  */

import websockets.*;
WebsocketClient ws;

// Connection
String serverURL = "ws://localhost:1337";


// Previous values
int red = 0;
int green = 0;
int blue = 0;

void setup() {
  ws = new WebsocketClient(this, serverURL);
  fill(0, 0, 0);
  noStroke();
  smooth();
  fullScreen();
}

void webSocketEvent(String msg) {
  String[] rgbArray = msg.split(",");
  red = Integer.parseInt(rgbArray[0]);
  green = Integer.parseInt(rgbArray[1]);
  blue = Integer.parseInt(rgbArray[2]);
}

void draw() {
  background(red, green, blue);
}