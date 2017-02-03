//Exercise 1: a quick review of crossfilter functionalities and a few other basic data manipulation tasks
var m = {t:85,r:100,b:50,l:100},
	w = document.getElementById('plot1').clientWidth - m.l - m.r,
	h = document.getElementById('plot1').clientHeight - m.t - m.b;
var plots = d3.selectAll('.plot')
	.append('svg')
	.attr('width', w + m.l + m.r)
	.attr('height', h + m.t + m.b)
	.append('g')
	.attr('class','canvas')
	.attr('transform','translate('+m.l+','+m.t+')');
var plot1 = plots.filter(function(d,i){ return i===0;}),
	plot2 = plots.filter(function(d,i){return i===1}).classed('time-series',true);

d3.queue()
	.defer(d3.csv,'../data/hubway_trips_reduced.csv',parseTrips)
	.defer(d3.csv,'../data/hubway_stations.csv',parseStations)
	.await(dataLoaded);

function dataLoaded(err,trips,stations){
	//Create a crossfilter with trips

	var cf = crossfilter(trips);

	//Create a dimension on bike_nr

	var tripsByBike = cf.dimension(function(d){return d.bike_nr});

	//Create a dimension on time of the day
		//Hint: the API for crossfilter dimension requires an accessor function argument
		//crossfilter.dimension(function(d){return ...})
		//Within this accessor function, use Date.getHours() and Date.getMinutes() to convert a Date object to a time of the day

	var tripsByTime = cf.dimension(function(d){return d.startTime.getHours() + d.startTime.getMinutes()/60});

	//Using console.log, log out the answer to the following questions
	//What % of trips take place between 5PM and 8PM?

	tripsByTime.filter([17, 20]);
	var trips1 = tripsByTime.top(Infinity).length;
	tripsByTime.filter(null);

	console.log(trips1, tripsByTime.top(Infinity).length);
	console.log('what percentage of trips take place between 5PM and 8PM', Math.round(trips1/tripsByTime.top(Infinity).length*100), '%');


	//What % of trips take place before 9AM and after 5PM?

	tripsByTime.filter([17, 24]);
	var trips2 = tripsByTime.top(Infinity).length;
	tripsByTime.filter(null);

	tripsByTime.filter([0, 9]);
	var trips3 = tripsByTime.top(Infinity).length;
	tripsByTime.filter(null);

	console.log(trips2, trips3, tripsByTime.top(Infinity).length);
	console.log('what percentage of trips take place before 9AM and after 5PM', Math.round((trips2 + trips3)/tripsByTime.top(Infinity).length*100), '%');


	//How many trips were taken with each unique bike_nr? Which bike has the highest number of trip count?
		//This will require the use dimension.group

	var uniqueTrips = tripsByBike.group();
	console.log('how many trips were taken with each unique bike', tripsByBike.group().top(Infinity));

	console.log('which bike has the highest number trip count',
	d3.max(tripsByBike.group().top(Infinity)).key, 'had',
	d3.max(tripsByBike.group().top(Infinity)).value, 'trips');

	//How much travel time was logged on each unique bike_nr? Which bike has the highest travel time logged?
	//This will require the use dimension.group, but with a different reduce function

	var bikeTime = tripsByBike.group().reduceSum(function(d){return d.duration;});

	console.log('how much travel time was logged on each unique bike', bikeTime.top(Infinity));

	console.log('which bike has the highest travel time logged',
	d3.max(bikeTime.top(Infinity)).key, 'had',
	d3.max(bikeTime.top(Infinity)).value, 'time logged');


}

function parseTrips(d){
	return {
		bike_nr:d.bike_nr,
		duration:+d.duration,
		startStn:d.strt_statn,
		startTime:parseTime(d.start_date),
		endStn:d.end_statn,
		endTime:parseTime(d.end_date),
		userType:d.subsc_type,
		userGender:d.gender?d.gender:undefined,
		userBirthdate:d.birth_date?+d.birth_date:undefined
	}
}

function parseStations(d){
	return {
		id:d.id,
		lngLat:[+d.lng,+d.lat],
		city:d.municipal,
		name:d.station,
		status:d.status,
		terminal:d.terminal
	}
}

function parseTime(timeStr){
	var time = timeStr.split(' ')[1].split(':'),
		hour = +time[0],
		min = +time[1],
		sec = +time[2];

	var	date = timeStr.split(' ')[0].split('/'),
		year = date[2],
		month = date[0],
		day = date[1];

	return new Date(year,month-1,day,hour,min,sec);
}
