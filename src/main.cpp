#include <Arduino.h>
#include <ArduinoJson.h>
#ifdef ESP8266
#include <ESP8266WiFi.h>
#else
#include <WiFi.h>
#endif
#include <WiFiClient.h>
#include <MQTT.h>
#include <DHT.h>
#include <MQUnifiedsensor.h>
#include <WiFiManager.h> // https://github.com/tzapu/WiFiManager

// WiFiManager credentials
#define NAMA_AP "wildzild"
#define PASS_AP "buburayut"

WiFiManager wm;
bool res = false; // will be set in setup()

WiFiClient net;
MQTTClient client;
#define BROKER_ADDRESS "192.168.1.12"
#define CLIENT_ID "FSIOT_WD1M_001"
#define MQTT_USERNAME "akbartame"
#define MQTT_PASSWORD "1234"

// MQTT topics (no leading slash). Device ID is embedded using preprocessor string concatenation.
#define TOPIC_PREFIX "fsiot/" CLIENT_ID
#define TOPIC_SENSORS_DETAIL TOPIC_PREFIX "/sensors/detail"
#define TOPIC_COMMAND TOPIC_PREFIX "/command"
// Remote WiFi config control topic (C1)
#define TOPIC_WIFI_CONFIG TOPIC_PREFIX "/device/wifi-config"

// Reconnect backoff (ms)
#define MQTT_RECONNECT_INTERVAL 5000

unsigned long lastReconnectAttempt = 0;
// WiFi loss tracking for auto-opening portal (C4)
unsigned long wifiLostSince = 0;
bool portalAutoOpened = false;

#if defined(ESP8266)
// Wemos D1 mini (ESP8266) defaults
#define DHT_PIN D4
#define DHT_TYPE DHT11
#define MQ2_PIN A0
#define MQ2_BOARD "ESP8266"
#define MQ2_VOLTAGE_RESOLUTION 3.3
#define MQ2_ADC_RESOLUTION 10
#else
// ESP32 defaults
#define DHT_PIN 34
#define DHT_TYPE DHT11
#define MQ2_PIN 35
#define MQ2_BOARD "ESP32"
#define MQ2_VOLTAGE_RESOLUTION 3.3
#define MQ2_ADC_RESOLUTION 12
#endif

// MQ2 sensor settings
#define MQ2_RL 5.0
#define MQ2_RATIO_CLEAN_AIR 9.83

#define SENSOR_PUBLISH_INTERVAL 5000

DHT dht(DHT_PIN, DHT_TYPE);
MQUnifiedsensor mq2(MQ2_BOARD, MQ2_VOLTAGE_RESOLUTION, MQ2_ADC_RESOLUTION, MQ2_PIN, "MQ-2");

unsigned long lastMillis = 0;

// Attempt to connect to MQTT broker once and return immediately.
// No blocking delays or loops inside this function (A1).
void connect() {
  if (WiFi.status() != WL_CONNECTED) {
    // WiFi not ready; caller should guard this (A2).
    return;
  }

  Serial.print("MQTT single-attempt connect...");
  if (client.connect(CLIENT_ID, MQTT_USERNAME, MQTT_PASSWORD)) {
    Serial.println(" connected to " BROKER_ADDRESS "!");
    client.subscribe(TOPIC_COMMAND); // subscribe to command topic (B4)
    Serial.println("Subscribed to topic: " TOPIC_COMMAND);
    // Subscribe to remote WiFi config control topic (C1)
    client.subscribe(TOPIC_WIFI_CONFIG);
    Serial.println("Subscribed to topic: " TOPIC_WIFI_CONFIG);
  } else {
    Serial.println(" failed");
  }
}

void messageReceived(String &topic, String &payload) {
  Serial.println("incoming: " + topic + " - " + payload);

  // Handle remote WiFi config control commands (C2)
  if (topic == TOPIC_WIFI_CONFIG) {
    // Exact, case-sensitive payload checks per requirements.
    if (payload == "open") {
      Serial.println("Received wifi-config: open -> starting web portal");
      // Ensure AP+STA mode and start soft AP so portal is reachable (C5)
      WiFi.mode(WIFI_AP_STA);
      WiFi.softAP(NAMA_AP, PASS_AP);
      Serial.print("SoftAP started: ");
      Serial.println(NAMA_AP);
      Serial.println("Portal IP: 192.168.4.1");
      wm.startWebPortal();
      portalAutoOpened = true; // mark as opened by remote command
    } else if (payload == "close") {
      Serial.println("Received wifi-config: close -> stopping web portal");
      wm.stopWebPortal();
      // Teardown AP and return to STA-only mode (C5)
      WiFi.softAPdisconnect(true);
      WiFi.mode(WIFI_STA);
      portalAutoOpened = false;
      Serial.println("SoftAP stopped");
    } else {
      // Silently ignore other payloads on this topic.
    }
    return;
  }
}

void publishSensorDetail(float temperature, float humidity, float gasPPM, float mq2Voltage, float mq2Rs, float mq2Ratio) {
  static StaticJsonDocument<384> detail;
  detail.clear();
  JsonObject root = detail.to<JsonObject>();
  root["device"] = CLIENT_ID;
  root["timestamp_ms"] = millis();

  JsonObject dhtSensor = root.createNestedObject("dht11");
  dhtSensor["type"] = "DHT11";
  dhtSensor["pin"] = DHT_PIN;
  dhtSensor["temperature_c"] = isnan(temperature) ? -999.0 : temperature;
  dhtSensor["humidity"] = isnan(humidity) ? -999.0 : humidity;

  JsonObject mq2Sensor = root.createNestedObject("mq2");
  mq2Sensor["type"] = "MQ-2";
  mq2Sensor["pin"] = MQ2_PIN;
  mq2Sensor["voltage_v"] = mq2Voltage;
  mq2Sensor["rl_kohm"] = MQ2_RL;
  mq2Sensor["r0_kohm"] = mq2.getR0();
  mq2Sensor["rs_kohm"] = mq2Rs;
  mq2Sensor["ratio_rs_r0"] = mq2Ratio;
  mq2Sensor["gas_ppm"] = gasPPM;

  static char buf[384];
  size_t n = serializeJson(detail, buf, sizeof(buf));
  if (n > 0) {
    client.publish(TOPIC_SENSORS_DETAIL, String(buf));
    Serial.println("Published sensor detail on topic " TOPIC_SENSORS_DETAIL);
  }
}
// publishSensorSummary removed per ECO (B5) — only JSON detail topic is used

void setup() {
  WiFi.mode(WIFI_STA);
  Serial.begin(115200);
  delay(1000); // wait for serial to start
  
  //wm.resetSettings();
  wm.setConfigPortalBlocking(false);
  wm.setConfigPortalTimeout(600);

  // Run WiFiManager autoConnect here (not at global init) to avoid
  // running network code before setup and to prevent boot issues.
  res = wm.autoConnect(NAMA_AP, PASS_AP);

  dht.begin();

  mq2.setRegressionMethod(1); //_PPM = a*ratio^b
  mq2.setA(574.25);
  mq2.setB(-2.222); // LPG curve for MQ-2
  mq2.setRL(MQ2_RL);
  mq2.init();

  Serial.print("Calibrating MQ-2 on pin ");
  Serial.print(MQ2_PIN);
  Serial.print(" with clean-air ratio ");
  Serial.println(MQ2_RATIO_CLEAN_AIR);

  float calcR0 = 0;
  for (int i = 0; i < 10; i++) {
    mq2.update();
    calcR0 += mq2.calibrate(MQ2_RATIO_CLEAN_AIR);
    Serial.print(".");
    delay(200);
  }
  calcR0 /= 10.0;
  mq2.setR0(calcR0);
  Serial.println(" done.");

  if (isinf(calcR0)) {
    Serial.println("Warning: R0 is infinite. Check wiring or sensor load.");
  }
  if (calcR0 == 0) {
    Serial.println("Warning: R0 is zero. Check analog pin and sensor wiring.");
  }

  if(res){
    Serial.print("connected...IP :)");
    Serial.println(WiFi.localIP());
  }
  else {
    Serial.println("Configportal running");
  }


  client.begin(BROKER_ADDRESS, net);
  client.onMessage(messageReceived);

  connect();
}

void loop() {
  wm.process();
  client.loop();

  // WiFi loss detection and auto-open portal after threshold (C4)
  if (WiFi.status() != WL_CONNECTED) {
    if (wifiLostSince == 0) {
      // mark the start of the disconnection window
      wifiLostSince = millis();
      Serial.println("WiFi lost; starting timer for auto-portal open");
    } else {
      // check threshold
      if (!portalAutoOpened && (millis() - wifiLostSince >= 120000UL)) {
        Serial.println("WiFi lost >2min; auto-opening web portal for recovery");
        // Ensure AP+STA mode and start soft AP so portal is reachable (C5)
        WiFi.mode(WIFI_AP_STA);
        WiFi.softAP(NAMA_AP, PASS_AP);
        Serial.print("SoftAP started: ");
        Serial.println(NAMA_AP);
        Serial.println("Portal IP: 192.168.4.1");
        wm.startWebPortal();
        portalAutoOpened = true;
      }
    }
  } else {
    // WiFi is connected again
    if (wifiLostSince != 0) {
      if (portalAutoOpened) {
        Serial.println("WiFi reconnected; stopping auto-opened web portal");
        wm.stopWebPortal();
        // Teardown AP and return to STA-only mode (C5)
        WiFi.softAPdisconnect(true);
        WiFi.mode(WIFI_STA);
        portalAutoOpened = false;
        Serial.println("SoftAP stopped");
      }
      wifiLostSince = 0;
      Serial.println("WiFi reconnected; wifiLostSince reset");
    }
  }

  // MQTT reconnect logic: only attempt when WiFi is connected (A2), and
  // only attempt once every MQTT_RECONNECT_INTERVAL milliseconds (A3).
  if (WiFi.status() == WL_CONNECTED) {
    if (!client.connected()) {
      unsigned long now = millis();
      if (now - lastReconnectAttempt >= MQTT_RECONNECT_INTERVAL) {
        lastReconnectAttempt = now;
        connect(); // single attempt; no delays inside (A1)
      }
    }
  }

  if (millis() - lastMillis > SENSOR_PUBLISH_INTERVAL) {
    lastMillis = millis();

    float humidity = dht.readHumidity();
    float temperature = dht.readTemperature();

    mq2.update();
    float correctionFactor = 0.0;
    float gasPPM = mq2.readSensor(false, correctionFactor);
    float mq2Rs = mq2.getRS();
    float mq2Ratio = mq2Rs / mq2.getR0();
    float mq2Voltage = mq2.getVoltage(false);

    publishSensorDetail(temperature, humidity, gasPPM, mq2Voltage, mq2Rs, mq2Ratio);

    Serial.print("MQ2 gas (ppm): ");
    Serial.println(gasPPM);
    Serial.print("Temperature (C): ");
    Serial.println(isnan(temperature) ? -999.0 : temperature);
    Serial.print("Humidity (%): ");
    Serial.println(isnan(humidity) ? -999.0 : humidity);
  }
}
