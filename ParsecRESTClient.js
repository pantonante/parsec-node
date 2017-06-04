var Client = require('node-rest-client').Client;

var ParsecRESTClient = function () {
    this._baseURL = "http://localhost:8091/";
    this._restRoute = "channel/"
    this._client = new Client();
};


ParsecRESTClient.prototype.get = function (channel, callback) {
    //var self = this;
    this._client.get(this._baseURL+this._restRoute+channel, function (data, response) {
        //console.log(data); // parsed response body as js object 
        //console.log(response); // raw response 
        callback(data);
    });
};

ParsecRESTClient.prototype.post = function (channel, message, callback) {
    var args = {
        data: message,
        headers: { "Content-Type": "application/json" }
    };
 
    this._client.post(this._baseURL+this._restRoute+channel, args, function (data, response) {
        //console.log(data); // parsed response body as js object   
        //console.log(response); // raw response 
        callback(data);
    });
};

module.exports = ParsecRESTClient;