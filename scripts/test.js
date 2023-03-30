"use strict";

let g_testFits = requestFITS("https://www.astronaos.com/astronomy/images/real_data/chandra_114.fits");

function waiter()
{
	if (g_testFits.ready)
	{
		console.log("array ready");
	}
	else
	{
		window.setTimeout(waiter, 1000.0);
	}		
}
waiter();
