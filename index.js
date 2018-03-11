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
var obj = require("./schema.json"); //require empty schema 
const _ = require('lodash');


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
    properties: {
    }
  },

    start: function(options) {},

    registerWithRouter: function(router) {
      // http://localhost:3000/plugins/signalk-to-arcgis/getJson
      router.get('/getJson', (req, res) => { 
        res.contentType('application/json');
        obj.features = [] //initialize so it does not grow by each call
         
        var response = {} 
        
        _.values(app.getPath('vessels')).forEach((vessel) => {
            var attributes = {} //initialize each vessel
            attributes.MMSI = parseInt(vessel.mmsi)
            attributes.IMO = parseInt(vessel.imo)
            attributes.LAT = parseFloat(_.get(vessel, 'navigation.position.value.latitude'))
            attributes.LON = parseFloat(_.get(vessel, 'navigation.position.value.longitude'))
            attributes.SPEED = parseFloat(utilSK.transform(_.get(vessel, 'navigation.speedOverGround.value'), 'ms', 'knots'))
            attributes.HEADING = parseFloat(utilSK.transform(_.get(vessel, 'navigation.headingTrue.value'), 'rad', 'deg'))
            attributes.COURSE = parseFloat(utilSK.transform(_.get(vessel, 'navigation.courseOverGroundTrue.value'), 'rad', 'deg'))
            attributes.STATUS = _.get(vessel, 'navigation.state.value')
            attributes.TIMESTAMP_ = moment(_.get(vessel, 'navigation.position.timestamp')).unix()
            attributes.SOURCE = _.get(vessel, 'navigation.position.$source')
            attributes.SHIPNAME = vessel.name
            attributes.SHIPTYPE = _.get(vessel, 'design.aisShipType.value.name')
            attributes.CALLSIGN = _.get(vessel, 'communication.callsignVhf')
            attributes.FLAG = vessel.flag
            
            response.attributes = attributes
        })


        obj.features.push(response)

        res.send(JSON.stringify(obj, null, 4))
      })


    },


    stop: function() {

      debug("Stopped")
    }
  }


}

