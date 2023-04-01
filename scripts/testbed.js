

let theCanvas = document.getElementById("theCanvas");
theCanvas.height = window.innerHeight - 60;
theCanvas.width = window.innerWidth;

let theContext = theCanvas.getContext("2d");

let g_testFits = requestFITS("https://www.astronaos.com/astronomy/images/real_data/chandra_114.fits");

function setOutputText(id,value)
{
	let elem = document.getElementById(id);
	if (elem !== null)
		elem.value = value;
}


theCanvas.onmousemove = function(event)
{
	g_MouseX = event.offsetX;
	g_MouseY = event.offsetY;
	if (event.offsetX >= 0 && event.offsetX <= theCanvas.width &&
		event.offsetY >= 0 && event.offsetY <= theCanvas.height &&
		g_testFits.ready)
	{
		const counts = g_testFits.counts(event.offsetX,g_testFits.height - event.offsetY);
		const radec = g_testFits.radec(event.offsetX,g_testFits.height - event.offsetY);
		
		const RAdispl = degreestoHMSDisplayable(radec.ra / 15.0);
		const Decdispl = degreestoDMSDisplayable(radec.dec);

		setOutputText("ra",RAdispl.hr + "h " + RAdispl.min + "m " + RAdispl.sec + "s");
		setOutputText("dec",Decdispl.deg + "° " + Decdispl.min + "' " + Decdispl.sec + "\"");
		setOutputText("x",radec.x);
		setOutputText("y",radec.y);
		setOutputText("counts",counts);
		
	}
}

function waiter()
{
	if (g_testFits.ready)
	{
		console.log("ready");
		theCanvas.height = g_testFits.height;
		theCanvas.width = g_testFits.width;
		console.log("creating image");
		let fitsImage = g_testFits.createImage(theContext,"sqrt",true,null);

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
