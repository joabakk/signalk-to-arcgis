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


const Bacon = require('baconjs');
const debug = require('debug')('signalk-arcgis');
const util = require('util');
const utilSK = require('@signalk/nmea0183-utilities');
//const express = require("express");
//const _ = require('lodash');
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
  var selfContext = "vessels." + app.selfId;

  var unsubscribes = [];
  var shouldStore = function(path) { return true; };

  return {
    id: "signalk-to-arcgis",
    name: "arcGIS export API",
    description: "Plugin to respond with arcGIS formatted json containing each vessel's data",

    schema: {
    },

    start: function(options) {},

    registerWithRouter: function(router) {
      // http://localhost:3000/plugins/signalk-to-arcgis/getJson
      router.get('/getJson', (req, res) => { //list all polar tables (both sqlite and user entered)
        res.contentType('application/json');

        db.serialize(function () {
          db.all("select name from sqlite_master where type='table'", function (err, tables) {
            // error will be an Error if one occurred during the query
            if(err){
              debug("registerWithRouter error: " + err.message);
            }
            res.send(JSON.stringify(tables))
          });
        });

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

