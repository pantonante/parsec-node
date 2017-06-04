PubNub = require('pubnub');
var util = require('util');
var EventEmitter = require('events').EventEmitter;

var Broker = function (cfg) {
    this._pubnub = new PubNub({
        subscribeKey: cfg.subscribeKey,
        publishKey: cfg.publishKey,
        secretKey: cfg.secretKey,
        ssl: cfg.ssl
    });
};

/* Broker extends EventEmitter */
util.inherits(Broker, EventEmitter);

Broker.prototype.init = function (channels) {
    var self = this;
    this._pubnub.addListener({
        message: function(m) {
            // handle message
            var channelName = m.channel; // The channel for which the message belongs
            var channelGroup = m.subscription; // The channel group or wildcard subscription match (if exists)
            var pubTT = m.timetoken; // Publish timetoken
            var msg = m.message; // The Payload
            self.emit('stateChange', channelName, msg);
        },
        status: function(s) {
            // s: status
            self.emit('statusUpdate', s);
        }
    })

    this._pubnub.subscribe({
        channels: channels,
        withPresence: false // also subscribe to presence instances.
    });
};

Broker.prototype.publish = function (channel, message) {
    this._pubnub.publish({
        message: message,
        channel: channel,
    },
    function (status, response) {
        // handle status, response
    }
    );
};

Broker.prototype.getLast = function (channel, callback){
    this._pubnub.history({
        channel: channel,
        count: 1,
        }, 
        function(status,response) {
            if(response.messages.length>0)
                callback(response.messages["0"].entry);
            else
                callback(undefined);
        }
    );
}

module.exports = Broker;
