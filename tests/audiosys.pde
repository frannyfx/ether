/**
  * @file A P3 script which tests the functionality of the server.
  * @version 2020.10.09
  * @author Francesco Compagnoni
  */

import websockets.*;
WebsocketClient ws;

// Connection
String serverURL = "ws://localhost:1337";

// Interpolation
int DELTA = 400;

// Previous values
int redA = 0;
int greenA = 0;
int blueA = 0;

// New Values
int redB = 0;
int greenB = 0;
int blueB = 0;

void setup() {
  ws = new WebsocketClient(this, serverURL);
  size(400, 400);
  fill(0, 0, 0);
  noStroke();
  smooth();
}

void webSocketEvent(String msg) {
  String[] rgbArray = msg.split(",");
  redA = Integer.parseInt(rgbArray[0]);
  greenA = Integer.parseInt(rgbArray[1]);
  blueA = Integer.parseInt(rgbArray[2]);
}

void draw() {
  redB = (int)(lerp(redB, redA, (float)DELTA / 1000.0f));
  greenB = (int)(lerp(greenB, greenA, (float)DELTA / 1000.0f));
  blueB = (int)(lerp(blueB, blueA, (float)DELTA / 1000.0f));
  background(redB, greenB, blueB);
}
