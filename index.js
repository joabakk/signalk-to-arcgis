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


const debug = require('debug')('signalk-arcgis');
const util = require('util');
const moment = require("moment")
const utilSK = require('@signalk/nmea0183-utilities');
const countries = require('i18n-iso-countries')
var obj = require("./schema.json"); //require empty schema
const _ = require('lodash');

function convertVessel(vessel) {
  return {
    attributes: {
      MMSI: parseInt(vessel.mmsi),
      IMO: parseInt(vessel.imo),
      LAT: parseFloat(_.get(vessel, 'navigation.position.value.latitude')),
      LON: parseFloat(_.get(vessel, 'navigation.position.value.longitude')),
      SPEED: parseFloat(utilSK.transform(_.get(vessel, 'navigation.speedOverGround.value'), 'ms', 'knots')),
      HEADING: parseFloat(utilSK.transform(_.get(vessel, 'navigation.headingTrue.value'), 'rad', 'deg')),
      COURSE: parseFloat(utilSK.transform(_.get(vessel, 'navigation.courseOverGroundTrue.value'), 'rad', 'deg')),
      STATUS: _.get(vessel, 'navigation.state.value'),
      TIMESTAMP_: moment(_.get(vessel, 'navigation.position.timestamp')).unix(),
      SOURCE: _.get(vessel, 'navigation.position.$source'),
      SHIPNAME: vessel.name,
      SHIPTYPE: _.get(vessel, 'design.aisShipType.value.name'),
      CALLSIGN: _.get(vessel, 'communication.callsignVhf'),
      FLAG: countries.getName(vessel.flag, "en"),
    }
    geometry: {
      x: attributes.LAT,
      y: attributes.LON,
    }
  }
}
function createArcGis(app) {
  return {
    ...obj,
    features: _.map(app.getPath('vessels'), convertVessel),
  }
}
module.exports = function(app, options) {
  'use strict';
  var client;
  var context = "vessels.*";

  return {
    id: "signalk-to-arcgis",
    name: "arcGIS export API",
    description: "Plugin to respond with arcGIS formatted json containing each vessel's data",

    schema: {
      title: "arcGIS export API",
      type: "object",
      properties: {},
    },

    start: function(options) {},

    registerWithRouter: function(router) {
      // http://localhost:3000/ArcGis/API/getJson
      app.get('/ArcGis/API/getJson', (req, res) => {
        res.contentType('application/json');
        res.send(JSON.stringify(createArcGis(app), null, 4))
      })
    },

    stop: function() {
      debug("Stopped")
    }
  }
}
