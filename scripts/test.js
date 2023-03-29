"use strict";

let result = null;

let _dataPromise = getFile("https://www.astronaos.com/astronomy/images/real_data/chandra_114.fits");
if (typeof _dataPromise != 'undefined' && _dataPromise !== null)
	_dataPromise.then(function(value){result = value},function(error){console.log("request failed with error " + error)});


function waiter()
{
	if (result != null)
	{
		console.log("ready");
	}
	else
	{
		window.setTimeout(waiter, 1000.0);
	}		
}
waiter();
