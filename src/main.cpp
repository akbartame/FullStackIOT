#include <Arduino.h>
#include <ArduinoJson.h>
#include <WiFi.h>
#include <WiFiClient.h>
#include <WebServer.h>
#include <ElegantOTA.h>
#include <WiFiManager.h> // https://github.com/tzapu/WiFiManager
#include <MQTT.h>

WiFiManager wm;
#define NAMA_AP "wildzild"
#define PASS_AP "buburayut"
bool res = wm.autoConnect(NAMA_AP, PASS_AP);
WiFiClient net;
MQTTClient client;
#define BROKER_ADDRESS "projectrab.cloud.shiftr.io"
#define CLIENT_ID "FSIOT_ESP332"
#define MQTT_USERNAME "projectrab"
#define MQTT_PASSWORD "29vP2fwDXMWcGbKI"
WebServer server(80);

unsigned long lastMillis = 0;
unsigned long ota_progress_millis = 0;

void connect() {
  Serial.print("checking wifi...");
  while (!res) {
    Serial.print(".");
    delay(1000);
  }

  Serial.print("\nconnecting...");
  while (!client.connect(CLIENT_ID, MQTT_USERNAME, MQTT_PASSWORD)) {
    Serial.print(".");
    delay(1000);
  }

  Serial.println("\nconnected!");

  client.subscribe("/hello");
  // client.unsubscribe("/hello");
}

void messageReceived(String &topic, String &payload) {
  Serial.println("incoming: " + topic + " - " + payload);
}

void onOTAStart() {
  // Log when OTA has started
  Serial.println("OTA update started!");
  // <Add your own code here>
}

void onOTAProgress(size_t current, size_t final) {
  // Log every 1 second
  if (millis() - ota_progress_millis > 1000) {
    ota_progress_millis = millis();
    Serial.printf("OTA Progress Current: %u bytes, Final: %u bytes\n", current, final);
  }
}

void onOTAEnd(bool success) {
  // Log when OTA has finished
  if (success) {
    Serial.println("OTA update finished successfully!");
  } else {
    Serial.println("There was an error during OTA update!");
  }
  // <Add your own code here>
  delay(3000);
  ESP.restart();
}

void setup() {
  WiFi.mode(WIFI_STA);
  Serial.begin(9600);
  delay(1000); // wait for serial to start
  
  //wm.resetSettings();
  wm.setConfigPortalBlocking(false);
  wm.setConfigPortalTimeout(60);


  if(res){
    Serial.print("connected...IP :)");
    Serial.println(WiFi.localIP());
  }
  else {
    Serial.println("Configportal running");
  }

  server.on("/", []() {
    server.send(200, "text/html", "<h1>ESP32 OTA Ready</h1><a href='/update'>Update Firmware</a>");
  });

  ElegantOTA.begin(&server);    // Start ElegantOTA
  // ElegantOTA callbacks
  ElegantOTA.onStart(onOTAStart);
  ElegantOTA.onProgress(onOTAProgress);
  ElegantOTA.onEnd(onOTAEnd);

  server.begin();
  Serial.println("HTTP server started");

  client.begin(BROKER_ADDRESS, net);
  client.onMessage(messageReceived);

  connect();
}

void loop() {
  wm.process();
  server.handleClient();
  ElegantOTA.loop();
  client.loop();
  delay(10);  // <- fixes some issues with WiFi stability

  if (!client.connected()) {
    connect();
  }

  // publish a message roughly every second.
  if (millis() - lastMillis > 1000) {
    lastMillis = millis();
    client.publish("/hello", "world");
  }

}
