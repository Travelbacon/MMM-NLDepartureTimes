Module.register("MMM-NLDepartureTimes", {
  
  statusDom: undefined,
  timeTableList: Object,
  error: undefined,
  
  defaults: {
  },

  start: function(){
    Log.info(`Sarting module ${this.name}`);
    this.statusDom = 'Loading';
    this.resume();
  },
  
  resume: function() {
    var self = this;
    setInterval(function() {
      self.getTable();}, 
      this.config.updateSpeed * 60000); //minute = 60 * 1000 ms.    
  },

  getTable: function() {
    this.sendSocketNotification('REQ_TIMETABLE', this.config.tpc);
  },
  
  getStyles: function() {
    return ["MMM-NLDepartureTimes.css"];
  },
    
  getDom: function(){
    var self = this;
    let wrapper = document.createElement("div");
    if(this.statusDom === 'Loading'){
      this.sendSocketNotification('REQ_TIMETABLE', this.config.tpc);
      if(this.statusDom === 'Loading'){
        wrapper.innerHTML = "Loading...";
        return wrapper;
      }
    }
    if(this.statusDom === 'error'){
      wrapper.innerHTML = this.error;
      console.log(this.error);
      return wrapper;
    }
    if(this.statusDom === 'newTable'){
      const table = document.createElement("table");
      table.id = "timeTable";
      for(const stopArea in this.timeTableList){
      //Fetch the Stoparea.
        let row = document.createElement("tr");
        let lineHeader = document.createElement("th");
        lineHeader.innerHTML = stopArea;
        lineHeader.className = "bold";
        lineHeader.colSpan = 3;
        row.appendChild(lineHeader);
        table.appendChild(row);
        //Fetch direction
        for(const direction in this.timeTableList[stopArea]){
          let row = document.createElement("tr");
          let lineDirection = document.createElement("td");
          lineDirection.innerHTML = direction;
          lineDirection.colSpan = 3;
          lineDirection.className = "small";
          row.appendChild(lineDirection);
          table.appendChild(row);
          //fetch vehciles
          let vehicCounter = 0;
          for(const vehicle of this.timeTableList[stopArea][direction]){
            vehicCounter++;
            //Create time + delay
            let row = document.createElement("tr");
            let vehicleTime = document.createElement("td");
            vehicleTime.innerHTML = new Date(vehicle.DepTime).toLocaleTimeString(this.config.locale);// + ' ' + vehicle.Delay;
            vehicleTime.className = "xsmall light vehicDepTime";
            row.appendChild(vehicleTime);
            
            //Create line number + destination
            let vehicleLine = document.createElement("td");
            vehicleLine.innerHTML = vehicle.LineName;
            vehicleLine.className = "xsmall light vehicLine";
            row.appendChild(vehicleLine);
            
            let vehicleDestination = document.createElement("td");
            vehicleDestination.innerHTML = vehicle.Destination;
            vehicleDestination.className = "xsmall light vehicleDestination";
            row.appendChild(vehicleDestination);
            
            table.appendChild(row);
            if(vehicCounter === this.config.maxVehics){
              break;
            }
          }      
        }
      }
      wrapper.appendChild(table);
      this.statusDom = 'Request'; //Not used in script. Nice for debugging.
      return wrapper;
    } 
  },

  socketNotificationReceived: function(notification, payload) {
    if(notification === 'TTIMETABLE'){
      this.statusDom = 'newTable';
      this.timeTableList = payload;
      this.updateDom(2000);
      //this.printTimeTable(this.timeTableList);
    }
    if(notification === 'ERROR'){
      this.statusDom = 'error';
      Log.error(payload);
      this.error = payload; 
      this.updateDom(2000);
    }
  },
  
  printTimeTable: function(timeTableList){
    for(const stopArea in timeTableList){
      console.log(`${stopArea}`);
      for(const direction in timeTableList[stopArea]){
        console.log(` ${direction}`);
        for(const vehicle of timeTableList[stopArea][direction]){
          console.log(new Date(vehicle.DepTime).toLocaleTimeString('nl-NL') + ' ( ' + vehicle.Delay + ' ) : ' + vehicle.LineName + ' - ' + vehicle.Destination);  
        }
      }
    }
  },
});
