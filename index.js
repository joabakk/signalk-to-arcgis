/*
* Copyright 2018 Joachim Bakke
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*     http://www.apache.org/licenses/LICENSE-2.0
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/


//const Bacon = require('baconjs');
const debug = require('debug')('signalk-arcgis');
const util = require('util');
const utilSK = require('@signalk/nmea0183-utilities');
var obj = require("./schema.json"); //require empty schema 
//const express = require("express");
const _ = require('lodash');
var db,json;
var pushInterval;

var vmg, rot, stw, awa, twa, aws, tws, eng, sog, cog, tack;



const items = [
  "navigation.speedThroughWater",
  "navigation.courseOverGroundTrue",
  "navigation.speedOverGround"
];
const maxInterval = 2 ;//max interval between updates for all items to avoid updating on stale data

module.exports = function(app, options) {
  'use strict';
  var client;
  var context = "vessels.*";

  var unsubscribes = [];
  var shouldStore = function(path) { return true; };

  return {
    id: "signalk-to-arcgis",
    name: "arcGIS export API",
    description: "Plugin to respond with arcGIS formatted json containing each vessel's data",

    schema: {
    title: "arcGIS export API",
    type: "object",
    properties: {
    }
  },

    start: function(options) {},

    registerWithRouter: function(router) {
      // http://localhost:3000/plugins/signalk-to-arcgis/getJson
      router.get('/getJson', (req, res) => { 
        res.contentType('application/json');
        obj.features = [] //initialize so it does not grow by each call
         
        //var fullSk = app.getPath('vessels')
        var response = {} 
        
        _.values(app.getPath('vessels')).forEach((vessel) => {
            var attributes = {} //initialize each vessel
            attributes.MMSI = parseInt(vessel.mmsi)
            attributes.IMO = parseInt(vessel.imo)
            attributes.LAT = parseFloat(_.get(vessel, 'navigation.position.value.latitude'))
            attributes.LON = parseFloat(_.get(vessel, 'navigation.position.value.longitude'))
            
            response.attributes = attributes
            /*
"LAT": "LAT",
"LON": "LON",
"SPEED": "SPEED",
"HEADING": "HEADING",
"COURSE": "COURSE",
"STATUS": "STATUS",
"TIMESTAMP_": "TIMESTAMP",
"SOURCE": "SOURCE",
"SHIPNAME": "The Shipname of the subject vessel",
"SHIPTYPE": "The Shiptype of the subject vessel according to AIS transmissions",
"CALLSIGN": "CALLSIGN",
"FLAG": "FLAG"
            var position = _.get(vessel, 'navigation.position.value')*/
        })

/*        for(var vessel in fullSk){
          debug('vessel:' + util.inspect(vessel))
          var attributes = {} //initialize each vessel
          attributes.MMSI = app.getPath('vessels' + vessel + '.mmsi')
          response.attributes = attributes
          
        }*/
        obj.features.push(response)

        res.send(JSON.stringify(obj, null, 4))
        //res.send(JSON.stringify(fullSk, null, 4))
      })


    },


    stop: function() {
      debug("Stopping")
      unsubscribes.forEach(f => f());
      items.length = items.length - 1;

      debug("Stopped")
    }
  }


}

