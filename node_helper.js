//From configuration in the magic mirror.

const axios = require('axios');

var NodeHelper = require("node_helper");
module.exports = NodeHelper.create({

  socketNotificationReceived: function(notification, payload) {
    this.run(payload);
  },
    
  parseData: function(jsonData, stopCodeConfig, timeTableList) {
/* 
  The JSON comes with level 1 with the time table for a stop code.
  This code wants to group the times not on a stop level, but on a direction level.
  A direction A can have multilple stops.
  Best way is to look in the JSON per stop, and find the proper direction.
*/
  //JSON has on level 1 the stop codes.
  //The time tables from different stops must be sorted to a direction.
  //Get the stopCode from the config and check if present in JSON.
  //If present parse the node in the timetable.  
  for(let confHaltGroup in stopCodeConfig){ //Find the haltgroup/area in the group
  //Each direction has multipe physique halts with its own stopcode
    for(let confDirection in stopCodeConfig[confHaltGroup]){ 
      for(let confStopCode of stopCodeConfig[confHaltGroup][confDirection]){
        if(confStopCode in jsonData){
          //Make an object of the vehicle to add in timeTableList
          for(let vehicInfo in jsonData[confStopCode]['Passes']){
            let vehicRaw = jsonData[confStopCode]['Passes'][vehicInfo];
            let vehicle = {
              Journey: vehicRaw.JourneyNumber,
              LineName: vehicRaw.LinePublicNumber,
              TransportType: vehicRaw.TransportType,
              DepTime: new Date(vehicRaw.ExpectedDepartureTime), //
              DepTimeSched: new Date(vehicRaw.TargetDepartureTime),
              Delay: new Date(vehicRaw.ExpectedDepartureTime).getMinutes() - new Date(vehicRaw.TargetDepartureTime).getMinutes(),
              Destination: vehicRaw.DestinationName50
            };
            //Add the object in the list sorted on time.        
            let i = 0;
              for (; i < timeTableList[confHaltGroup][confDirection].length; i++) {
                if (vehicle['DepTime'] <= timeTableList[confHaltGroup][confDirection][i]['DepTime']){
                  break;
                }
              }
              timeTableList[confHaltGroup][confDirection].splice(i,0,vehicle);
            }
          }
        }
      }
    }
    this.sendSocketNotification('TTIMETABLE', timeTableList);
  },

  
  run: function(stopCodeConfig){
    var self = this;
	
		let URLtpc = '';
		let URLovapi;
		
		//Empty timeTableList
		let timeTableList = new Object();
		
    for(let haltGroup in stopCodeConfig){
      timeTableList[haltGroup] = new Object;
      for(let stopCode in stopCodeConfig[haltGroup]){
        timeTableList[haltGroup][stopCode] = new Array();
        URLtpc += stopCodeConfig[haltGroup][stopCode] + ',';
      }
    }

    URLovapi = `http://v0.ovapi.nl/tpc/${URLtpc}/departures/`;

    axios.get(URLovapi)
    .then(function(response) {
      //handle success
      self.parseData(response.data, stopCodeConfig, timeTableList);
      
    })
    .catch(function(error) {
      // handle error
      self.sendSocketNotification('ERROR', error.message);
    });
  }
});
