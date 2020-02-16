Module.register("MMM-NLDepartureTimes", {


	start: function(){
		Log.info(`Sarting module ${this.name}`);
	},
	
	getDom: function(){
		let wrapper = document.createElement("div");
		wrapper.innerHTML = "Joris";
		return wrapper;
	}
	
});
