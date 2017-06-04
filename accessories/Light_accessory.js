var Accessory = require('../').Accessory;
var Service = require('../').Service;
var Characteristic = require('../').Characteristic;
var uuid = require('../').uuid;
var http = require('http');
var ParsecRESTClient = require('../ParsecRESTClient');

var LightController = {
  name: "Room Light", //name of accessory
  pincode: "031-41-592",
  username: "FA:3C:ED:5A:1A:1A", // MAC like address used by HomeKit to differentiate accessories. 
  manufacturer: "Parsec", //manufacturer (optional)
  model: "v1.0", //model (optional)
  serialNumber: "A12S345KGB", //serial number (optional)
  channel: "roomlight",
  power: false, //curent power status
  outputLogs: true, //output logs

  setPower: function(status) { //set power of accessory
    if(this.outputLogs) console.log("[HAP] Set: '%s' to %s", this.name, status ? "on" : "off");
    this.power = status;
    var state = status ? "ON" : "OFF";
    restClient.post(this.channel, {state: state}, function(res){});
  },

  getPower: function(callback) { //get power of accessory
    restClient.get(this.channel, function(res){ 
      if(res!=undefined){
        if(this.outputLogs) console.log("[LIGHT] "+ res.state);
        if(res.state == "OFF"){
          this.power = false;
        } else if(res.state== "ON"){
          this.power = true;
        }
      }else{
        if(this.outputLogs) console.log("[LIGHT] ??"); 
      }
      if(this.outputLogs) console.log("[HAP] Get: '%s' is %s.", this.name, this.power ? "on" : "off");
      callback(null, this.power);
    }); // -- end rest
  }
}

var restClient  = new ParsecRESTClient();

// Generate a consistent UUID for our light Accessory that will remain the same even when
// restarting our server. We use the `uuid.generate` helper function to create a deterministic
// UUID based on an arbitrary "namespace" and the word "light".
var lightUUID = uuid.generate('hap-nodejs:accessories:light' + LightController.name);

// This is the Accessory that we'll return to HAP-NodeJS that represents our light.
var lightAccessory = exports.accessory = new Accessory(LightController.name, lightUUID);

// Add properties for publishing (in case we're using Core.js and not BridgedCore.js)
lightAccessory.username = LightController.username;
lightAccessory.pincode = LightController.pincode;
lightAccessory.channel = LightController.channel;


// set some basic properties (these values are arbitrary and setting them is optional)
lightAccessory
  .getService(Service.AccessoryInformation)
    .setCharacteristic(Characteristic.Manufacturer, LightController.manufacturer)
    .setCharacteristic(Characteristic.Model, LightController.model)
    .setCharacteristic(Characteristic.SerialNumber, LightController.serialNumber);

// Add the actual Lightbulb Service and listen for change events from iOS.
// We can see the complete list of Services and Characteristics in `lib/gen/HomeKitTypes.js`
lightAccessory
  .addService(Service.Lightbulb, LightController.name) // services exposed to the user should have "names" like "Light" for this case
  .getCharacteristic(Characteristic.On)
  .on('set', function(value, callback) {
    LightController.setPower(value);
    // Our light is synchronous - this value has been successfully set
    // Invoke the callback when you finished processing the request
    // If it's going to take more than 1s to finish the request, try to invoke the callback
    // after getting the request instead of after finishing it. This avoids blocking other
    // requests from HomeKit.
    callback();
  })
  
  // We want to intercept requests for our current power state so we can query the hardware itself instead of
  // allowing HAP-NodeJS to return the cached Characteristic.value.
  .on('get', function(callback) {
    //callback(null, LightController.getPower());
    LightController.getPower(callback);
  });

// To inform HomeKit about changes occurred outside of HomeKit (like user physically turn on the light)
// Please use Characteristic.updateValue
// 
// lightAccessory
//   .getService(Service.Lightbulb)
//   .getCharacteristic(Characteristic.On)
//   .updateValue(true);
