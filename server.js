/**
 *
 * This application transforms MQTT messages to Philips Hue API calls
 *
 * @author  Dennis de Greef <github@link0.net>
 * @license MIT
 *
 * Examples:
 *   /light/1/toggle
 *   /light/all/state        on
 *   /light/1/state          off
 *   /light/3/brightness     100
 *   /light/all/brightness   50
 *
 */
var mqtt     = require('mqtt');
var hue      = require('node-hue-api');
var config   = require('./config');

var        client_Id  = 'mqttjs_' + Math.random().toString(16).substr(2, 8);
var        mqttOptions = {
                keepalive: 10,
                clientId: client_Id,
                protocolId: 'MQTT',
                protocolVersion: 4,
                clean: true,
                reconnectPeriod: 1000,
                connectTimeout: 30 * 1000,
                will: {
                        topic: '/lwt',
                        payload: 'mqtt-hue-bridge Connection Closed abnormally..!',
                        qos: 0,
                        retain: false
                },
                username: config.mqtt.username,
                password: config.mqtt.password,
                rejectUnauthorized: false
        };


var mqttUri     = 'mqtt://' + config.mqtt.hostname + ':' + config.mqtt.port;
//var mqttOptions = {username: config.mqtt.username, password: config.mqtt.password};
var client      = mqtt.connect(mqttUri, mqttOptions);
var api         = new hue.HueApi(config.hue.hostname, config.hue.username);
var state       = hue.lightState.create();

// topic is /light/<id>/<property>
var topicRegex = config.mqtt.namespace + "/(.*)/(.*)";

var lights = [];
api.lights().then(function(result) {
    lights = result.lights;

    client.on('message', function (topic, message) {
        var topicParts = topic.match(topicRegex);
        if(topicParts == null) {
            // These are not the topics you are looking for
            return;
        }
        var identifier = topicParts[1];
        var property   = topicParts[2];
        var value      = message.toString();

        var regexInteger = new RegExp('^\\d+$');

        // Determine state change from MQTT topic
        var newState = undefined;
        if(property == 'state') {
            if( identifier != "all" ) {
              if(regexInteger.test(identifier)) {
                api.getLightStatus(identifier)
                   .then(function(result){
		     if(value === '' ) client.publish(topic, JSON.stringify(result), { qos: 0 });
		     else if(value == 'toggle') {
	   	       if( result.state.on ) {                                          
                         newState = state.off();               
        	       } else newState = state.on();
		     }
                   })
		   .then(function(){
		     if(value == 'toggle') {
                       api.setLightState(identifier, newState).done();
		     }
                   })
                   .done();
              } else return;
            } 
            if(value == 'on' || value == '1') {
                newState = state.on();
            }
            if(value == 'off' || value == '0') {
                newState = state.off();
            }
        } else if(property == 'brightness') {
            newState = state.brightness(value);
        }

	if (newState !== undefined ) {
           if(identifier == "all") {
               // Group 0 is always all lights
            	api.setGroupLightState(0, newState).done();
           } else if(regexInteger.test(identifier)) {
            	api.setLightState(identifier, newState).done();
	   }
	   newState = undefined;
	}
    });
}).done();

client.on('connect', function () {
    // Subscribe on everything in the MQTT namespace
    client.subscribe(config.mqtt.namespace + '/#');
});
