var httpd = require('connect');
var serveStatic = require('serve-static');
var express = require('express');
var bodyParser = require('body-parser');
var Broker = require('./Broker.js');
// HAP requires ----
var fs = require('fs');
var path = require('path');
var storage = require('node-persist');
var Accessory = require('./lib/Accessory.js').Accessory;
var Bridge = require('./lib/Bridge.js').Bridge;
var Camera = require('./lib/Camera.js').Camera;
var Service = require('./lib/Service.js').Service;
var Characteristic = require('./lib/Characteristic.js').Characteristic;
var uuid = require('./lib/util/uuid');
var AccessoryLoader = require('./lib/AccessoryLoader.js');
var StreamController = require('./lib/StreamController.js').StreamController;
// HAP ----

/* ============== CONFIGURATION ============== */
var config = require('config.json')('./config.json');
var channels = [];

/* ============== Apple HomeKit Bridge ============== */
console.log("[HAP] HomeKit Bridge starting...");

function init(storagePath) {
  // initialize our underlying storage system, passing on the directory if needed
  if (typeof storagePath !== 'undefined')
    storage.initSync({ dir: storagePath });
  else
    storage.initSync(); // use whatever is default
}

// Initialize our storage system
storage.initSync();

// Start by creating our Bridge which will host all loaded Accessories
var bridge = new Bridge(config.homekit.name, uuid.generate(config.homekit.name));

// Listen for bridge identification event
bridge.on('identify', function(paired, callback) {
  console.log("[HAP] Bridge identify");
  callback(); // success
});

// Load up all accessories in the /accessories folder
var dir = path.join(__dirname, config.homekit.accessoryFolder);
var accessories = AccessoryLoader.loadDirectory(dir);

// Add them all to the bridge
accessories.forEach(function(accessory) {
	bridge.addBridgedAccessory(accessory);
	if (config.printDebug) console.log("Channel added: ", accessory.channel);
	channels.push(accessory.channel);
});

// Publish the Bridge on the local network.
bridge.publish({
  username: "CC:22:3D:E3:CE:F6",
  port: 51826,
  pincode: config.homekit.pin,
  category: Accessory.Categories.BRIDGE
});


/* ============== HTTP Server ============== */
// Serve the web UI
httpd().use(serveStatic(config.webserver.htdocsFolder)).listen(config.webserver.httpdPort, function(){
    console.log('[HTTPD] Web server running on: ' + config.webserver.httpdPort);
});

/* ============== Broker (PubNub) ============== */
// Initialize the remote broker
var broker = new Broker(config.broker);
broker.init(channels);
broker.on('stateChange', function(channelName, state) {
    console.log("[BROKER] Channel: " + channelName + ', Message: ' + JSON.stringify(state));
});

/* =============== RESTful API ==============  */
// Expose the RESTful API
rest = express();
rest.use(bodyParser.urlencoded({ extended: true }));
rest.use(bodyParser.json());
rest.listen(config.rest.port, function(){
	console.log('[REST] RESTful API server running on: ' + config.rest.port);
});

// Routes
// Test Example POST: curl -X POST -H "Contentype: application/json" -d '{state:"ON"}' http://localhost:8091/channel/roomlight
// Test Example GET: curl -X GET -H "Contentype: application/json" http://localhost:8091/channel/roomlight
rest.route('/channel/:channel')
	.post(function(req, res){ // ########## PUBLISH
		if (req.params.channel != null && req.params.channel !== ""){
			channel = req.params.channel;
			message = req.body;
			console.log("[REST] Channel: " + channel + ", Message: " + JSON.stringify(message));
			broker.publish(channel, message)
			res.sendStatus(200);
		} else {
			res.sendStatus(400);
		}
	})
	.get(function(req,res){ // ########## GET LAST
		if (req.params.channel != null && req.params.channel !== ""){
			channel = req.params.channel;
			console.log("[REST] Get Last on Channel: " + channel);
			var last = broker.getLast(channel, function(message){
				if(message!=undefined){
					res.json(message);
				}else{
					res.sendStatus(404);
				}
			});
		} else {
			res.sendStatus(400);
		}
	});