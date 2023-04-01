

let theCanvas = document.getElementById("theCanvas");
theCanvas.height = window.innerHeight - 60;
theCanvas.width = window.innerWidth;

let theContext = theCanvas.getContext("2d");



let g_testFits = requestFITS("https://www.astronaos.com/astronomy/images/real_data/chandra_114.fits");

function waiter()
{
	if (g_testFits.ready)
	{
		console.log("ready");
		theCanvas.height = g_testFits.height;
		theCanvas.width = g_testFits.width;
		console.log("creating image");
		let fitsImage = g_testFits.createImage(theContext,"linear",true,null);

		console.log("drawing");
		theContext.clearRect(0, 0, theCanvas.width, theCanvas.height);
		theContext.putImageData(fitsImage, 0, 0);
		
	}
	else
	{
		window.setTimeout(waiter, 1000.0);
	}		
}
waiter();
