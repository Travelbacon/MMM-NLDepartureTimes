Module.register("MMM-NLDepartureTimes", {
  
  firstRun: true,
  timeTableList: Object,
  
  defaults: {
  },

  start: function(){
    Log.info(`Sarting module ${this.name}`);
  },

  
    getStyles: function() {
        return ["MMM-NLDepartureTimes.css"];
    },
    
  getDom: function(){
    var self = this;
    let wrapper = document.createElement("div");
    if(this.firstRun){
      wrapper.innerHTML = "Loading...";
      this.sendSocketNotification('REQ_TIMETABLE', this.config.ptc);
    } else {
      const table = document.createElement("table");
      table.id = "timeTable";
      for(const stopArea in this.timeTableList){
      //Fetch the Stoparea.
        let row = document.createElement("tr");
        let lineHeader = document.createElement("th");
        lineHeader.innerHTML = stopArea;
        lineHeader.colSpan = 2;
        row.appendChild(lineHeader);
        table.appendChild(row);
        //Fetch direction
        for(const direction in this.timeTableList[stopArea]){
          let row = document.createElement("tr");
          let lineDirection = document.createElement("td");
          lineDirection.innerHTML = direction;
          lineDirection.colSpan = 2;
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
            vehicleTime.innerHTML = new Date(vehicle.DepTime).toLocaleTimeString('nl-NL');// + ' ' + vehicle.Delay;
            vehicleTime.className = "xsmall vehicRow";
            row.appendChild(vehicleTime);
            
            //Create line number + destination
            let vehicleDestination = document.createElement("td");
            vehicleDestination.innerHTML = vehicle.LineName + ' ' + vehicle.Destination;
            vehicleDestination.className = "xsmall vehicRow";
            row.appendChild(vehicleDestination);
            table.appendChild(row);
            console.log(`Max :${this.config.maxVehics}`);
            if(vehicCounter === this.config.maxVehics){
              break;
            }
          }      
        }
      }
      wrapper.appendChild(table);
    }
    
    return wrapper; 
  },

  socketNotificationReceived: function(notification, payload) {
    Log.info('Helper send data.');
    Log.info(notification);
    if(this.firstRun){
      this.firstRun = false;
    }
    this.timeTableList = payload;
    this.updateDom();
    //this.printTimeTable(this.timeTableList);
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
