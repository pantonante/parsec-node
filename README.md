Parsec
==========
Smart Home Server based on PubNub with HomeKit integration. It serves static webpages for web control.

## TOC
* [Features](#features)
* [Installation](#installation)
 * [Usage](#usage)
   * [Accessory](#accessory)
   * [RESTful API](#restful-api)
      * [RESTful API client](#restful-api-client)
   * [Static Web Pages](#static-web-pages)

## Features

- Writtend in Node.js
- Uses PubNub as message broker
- Integrated with HomeKit Protocol
- Servers Static web pages for web control
- Offers RESTul API
- Works on everyting supporting Node.js, e.g. RaspberryPi, Intel Edison etc.

## Installation
To install all the dependencies please run:
```sh
npm install
```
It might require python 2.7.

## Usage
Before running the server, please update your `config.json` file with your PubNub keys.

To run the server:
```sh
node parsec.js
```

### Accessory
You can define accessories in: accessories/name_accessory.js files. All defined accessories are loaded on server start. Remember to add the **channel** property that refers to the PubNub channel of that accessory, to do so add 
```js
lightAccessory.channel = "channelname";
```
in the accessory .js file.

To see examples on several accessory please refer to [HAP-NodeJS accessory examples](https://github.com/KhaosT/HAP-NodeJS/tree/master/accessories).

### RESTful API

To publish a message to a channel you can use the RESTful API. For example to publish to the "roomlight" channel you can run:
```sh
curl -X POST -H "Contentype: application/json" -d '{state:"ON"}' http://localhost:8091/channel/roomlight
```
The message is a raw json strinig. This is the message that will be published.

Similarly you can get the last value with the GET request. Please remember to activate **Storage & Playback** feature on PubNub.
```sh
curl -X GET -H "Contentype: application/json" http://localhost:8091/channel/roomlight
```

#### RESTful API client
If you want to use the RESTful API inside a nodejs project (e.g. an accessory) please use `ParsecRESTClient.js`.

### Static Web Pages
Currently, this implementation does not support automatic web interface generation. You should build your own pages and move them to the http folder. This website will be available on http://localhost:8080/

### HomeKit implementation based on
* [HAP-NodeJS](https://github.com/KhaosT/HAP-NodeJS) - Node.js implementation of HomeKit Accessory Server.