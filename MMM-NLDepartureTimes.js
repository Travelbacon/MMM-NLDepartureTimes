Module.register("MMM-NLDepartureTimes", {

	defaults: {
		
	},

	start: function(){
		Log.info(`Sarting module ${this.name}`);
	},
	
	getDom: function(){
		let wrapper = document.createElement("div");
		wrapper.innerHTML = this.naam;
    this.sendSocketNotification('SET_CONFIG', this.config);
		return wrapper;		
	},
	
	socketNotificationReceived: function(notification, payload) {
		Log.info('Helper send data.');
    Log.info(notification);
		this.printTimeTable(payload);
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
  }
  
});
