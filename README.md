# mqtt-hue-bridge
===========

This node.js server listens on MQTT messages for lights and translates it to the philips hue bridge

# Installation
```bash
$ git clone https://github.com/iomax/mqtt-hue-bridge.git
$ cd mqtt-hue-bridge
$ npm install
```
# Using
Start up the server by editing the config.js first to suit your needs
```bash
$ $EDITOR config.js
$ node server.js
```

Or by using environment variables
```bash
$ MQTT_HOSTNAME="192.168.0.1" HUE_HOSTNAME="192.168.0.2" HUE_USERNAME=$(whoami) node server.js
```

Publish some MQTT messages to try it out (I use mosquitto server for this, but whatever MQTT server should work)
```bash
$ mosquitto_pub -m "on" -t "light/all/state"
$ mosquitto_pub -m "off" -t "light/1/state"
$ mosquitto_pub -m "toggle" -t "light/1/state"
$ mosquitto_pub -m "50" -t "light/2/brightness"
```
# Credit

The original mqtt-hue-bridge work was done by [Dennis de Greef](https://github.com/dennisdegreef) in his [mqtt-hue-brdige](https://github.com/dennisdegreef/mqtt-hue-bridge) project.



